import mongoose from 'mongoose';
import Issue from '../models/Issue.js';
import BlockchainRecord from '../models/BlockchainRecord.js';
import ActionPoint from '../models/ActionPoint.js';
import Expense from '../models/Expense.js';
import Completion from '../models/Completion.js';
import { recordAcknowledgmentOnBlockchain, generateDataHash } from '../utils/blockchainService.js';

/**
 * Acknowledge an issue (Nagarpalika officer)
 */
export const acknowledgeIssue = async (req, res) => {
  try {
    const { issueId, acknowledgmentNote, priorityLevel, expectedResolutionDate } = req.body;
    const { user } = req;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.status !== 'SUBMITTED') {
      return res.status(400).json({ message: 'Issue already acknowledged' });
    }

    // Record on blockchain
    const blockchainResult = await recordAcknowledgmentOnBlockchain(
      issueId.toString(),
      user.name || 'Unknown Officer'
    );

    // Update issue
    issue.acknowledgedBy = user.name || 'Unknown Officer';
    issue.acknowledgedAt = new Date();
    issue.acknowledgmentNote = acknowledgmentNote;
    issue.priorityLevel = priorityLevel || 'MEDIUM';
    issue.expectedResolutionDate = expectedResolutionDate ? new Date(expectedResolutionDate) : null;
    issue.status = 'ACKNOWLEDGED';

    if (blockchainResult.success) {
      issue.blockchainHash = generateDataHash(issue);
      issue.blockchainTransactionHash = blockchainResult.transactionHash;
      issue.blockchainVerified = true;

      // Record in blockchain records
      await BlockchainRecord.create({
        issueId,
        recordType: 'ACKNOWLEDGED',
        blockchainHash: issue.blockchainHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
        gasUsed: blockchainResult.gasUsed,
        dataHash: generateDataHash(issue),
        verified: true,
        verificationTimestamp: new Date()
      });
    }

    await issue.save();

    res.json({
      message: 'Issue acknowledged successfully',
      issue,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        verified: blockchainResult.success
      }
    });
  } catch (error) {
    console.error('acknowledgeIssue error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get issue with complete details (timeline, actions, expenses, completion)
 */
export const getIssueFullDetails = async (req, res) => {
  try {
    const { issueId } = req.params;

    // Get issue
    let issue = await Issue.findById(issueId).populate('citizenId', 'name email taluka area');
    let isIllegal = false;

    if (!issue) {
      // Fallback to IllegalReport
      const { default: IllegalReport } = await import('../models/IllegalReport.js');
      issue = await IllegalReport.findById(issueId).populate('citizenId', 'name email taluka area');
      if (!issue) {
        return res.status(404).json({ message: 'Issue or Report not found' });
      }
      isIllegal = true;
    }

    let actionPoints = [];
    let expenses = [];
    let completion = null;
    let blockchainRecords = [];

    if (isIllegal) {
      // Map IllegalReport updates to action points structure for timeline
      actionPoints = issue.updates.map(update => ({
        _id: update._id || new mongoose.Types.ObjectId(),
        actionDescription: update.note || 'Status updated',
        category: 'Update',
        performedBy: 'System/Admin',
        actionDate: update.timestamp,
        statusAfterAction: update.status,
        blockchainTransactionHash: update.transactionHash || ''
      }));

      // Fetch blockchain records for illegal reports too
      blockchainRecords = await BlockchainRecord.find({ issueId }).sort({ createdAt: 1 });
    } else {
      actionPoints = await ActionPoint.find({ issueId }).sort({ createdAt: 1 });
      expenses = await Expense.find({ issueId }).sort({ createdAt: 1 });
      completion = await Completion.findOne({ issueId });
      blockchainRecords = await BlockchainRecord.find({ issueId }).sort({ createdAt: 1 });
    }

    // Calculate cost summary
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amountSpent, 0);
    const expensesByCategory = {};
    expenses.forEach(exp => {
      if (!expensesByCategory[exp.category]) {
        expensesByCategory[exp.category] = 0;
      }
      expensesByCategory[exp.category] += exp.amountSpent;
    });

    res.json({
      issue,
      actionPoints,
      expenses,
      completion,
      blockchainRecords,
      isIllegal,
      legalAction: isIllegal ? (issue.legalAction || null) : null,
      costSummary: {
        allocatedBudget: issue.allocatedBudget || 0,
        totalExpenses,
        remaining: (issue.allocatedBudget || 0) - totalExpenses,
        byCategory: expensesByCategory
      }
    });
  } catch (error) {
    console.error('getIssueFullDetails error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get issues filtered by status
 */
export const getIssuesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { nagarpalika } = req.query;

    let query = { status };
    if (nagarpalika) {
      query.nagarpalika = nagarpalika;
    }

    const issues = await Issue.find(query).sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error('getIssuesByStatus error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const completedIssues = await Issue.countDocuments({ status: 'COMPLETED' });
    const pendingIssues = await Issue.countDocuments({ status: { $in: ['SUBMITTED', 'ACKNOWLEDGED'] } });
    const inProgressIssues = await Issue.countDocuments({ status: 'IN_PROGRESS' });

    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const issuesByNagarpalika = await Issue.aggregate([
      { $group: { _id: '$nagarpalika', count: { $sum: 1 } } }
    ]);

    const totalBudgetAllocated = await Issue.aggregate([
      { $group: { _id: null, total: { $sum: '$allocatedBudget' } } }
    ]);

    const totalBudgetUtilized = await Issue.aggregate([
      { $group: { _id: null, total: { $sum: '$utilizedBudget' } } }
    ]);

    res.json({
      summary: {
        totalIssues,
        completedIssues,
        pendingIssues,
        inProgressIssues,
        completionRate: totalIssues > 0 ? ((completedIssues / totalIssues) * 100).toFixed(2) : 0
      },
      byStatus: issuesByStatus,
      byNagarpalika: issuesByNagarpalika,
      budget: {
        allocated: totalBudgetAllocated[0]?.total || 0,
        utilized: totalBudgetUtilized[0]?.total || 0,
        remaining: (totalBudgetAllocated[0]?.total || 0) - (totalBudgetUtilized[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get blockchain records for an issue
 */
export const getIssueBlockchainHistory = async (req, res) => {
  try {
    const { issueId } = req.params;

    const records = await BlockchainRecord.find({ issueId }).sort({ createdAt: 1 });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No blockchain records found for this issue' });
    }

    res.json(records);
  } catch (error) {
    console.error('getIssueBlockchainHistory error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
