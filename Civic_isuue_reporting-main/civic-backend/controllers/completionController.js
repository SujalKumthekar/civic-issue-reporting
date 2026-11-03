import Completion from '../models/Completion.js';
import Issue from '../models/Issue.js';
import BlockchainRecord from '../models/BlockchainRecord.js';
import { completeIssueOnBlockchain, generateDataHash } from '../utils/blockchainService.js';

/**
 * Complete an issue
 */
export const completeIssue = async (req, res) => {
  try {
    const { issueId, completionDate, workSummary, qualityCheckStatus, qualityOfficer, qualityCheckDate, qualityCheckReportUrl, preWorkPhotoUrl, duringWorkPhotoUrl, postCompletionPhotoUrl, completionCertificateUrl, responsibleOfficer, approvedBy, citizenFeedback, citizenRating, approvedBudget, actualCost } = req.body;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Validate photos
    if (!preWorkPhotoUrl || !postCompletionPhotoUrl) {
      return res.status(400).json({ message: 'Before and after photos are required' });
    }

    // Check if completion already exists
    const existingCompletion = await Completion.findOne({ issueId });
    if (existingCompletion) {
      return res.status(400).json({ message: 'Issue already completed' });
    }

    // Validate rating
    if (citizenRating < 1 || citizenRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create completion record
    const completion = new Completion({
      issueId,
      completionDate: new Date(completionDate),
      workSummary,
      qualityCheckStatus,
      qualityOfficer,
      qualityCheckDate: new Date(qualityCheckDate),
      qualityCheckReportUrl,
      preWorkPhotoUrl,
      duringWorkPhotoUrl,
      postCompletionPhotoUrl,
      completionCertificateUrl,
      responsibleOfficer,
      approvedBy,
      citizenFeedback,
      citizenRating,
      approvedBudget,
      actualCost
    });

    await completion.save();

    // Record on blockchain
    const dataHash = generateDataHash(completion);
    const blockchainResult = await completeIssueOnBlockchain(
      issueId.toString(),
      workSummary,
      preWorkPhotoUrl,
      postCompletionPhotoUrl
    );

    if (blockchainResult.success) {
      completion.blockchainHash = dataHash;
      completion.blockchainTransactionHash = blockchainResult.transactionHash;
      await completion.save();

      // Record in blockchain records
      await BlockchainRecord.create({
        issueId,
        recordType: 'COMPLETED',
        blockchainHash: dataHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
        gasUsed: blockchainResult.gasUsed,
        dataHash,
        verified: true,
        verificationTimestamp: new Date()
      });
    }

    // Update issue
    issue.status = 'COMPLETED';
    issue.completionId = completion._id;
    issue.completedAt = new Date();
    await issue.save();

    res.status(201).json({
      message: 'Issue completed successfully',
      completion,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        verified: blockchainResult.success
      }
    });
  } catch (error) {
    console.error('completeIssue error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get completion details
 */
export const getCompletion = async (req, res) => {
  try {
    const { issueId } = req.params;

    const completion = await Completion.findOne({ issueId });
    if (!completion) {
      return res.status(404).json({ message: 'Issue not completed yet' });
    }

    res.json(completion);
  } catch (error) {
    console.error('getCompletion error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get completed issues
 */
export const getCompletedIssues = async (req, res) => {
  try {
    const completions = await Completion.find().sort({ createdAt: -1 }).limit(50);

    res.json(completions);
  } catch (error) {
    console.error('getCompletedIssues error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Update completion record
 */
export const updateCompletion = async (req, res) => {
  try {
    const { issueId } = req.params;
    const updates = req.body;

    const completion = await Completion.findOneAndUpdate(
      { issueId },
      updates,
      { new: true }
    );

    if (!completion) {
      return res.status(404).json({ message: 'Completion record not found' });
    }

    res.json({ message: 'Completion updated', completion });
  } catch (error) {
    console.error('updateCompletion error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get completion stats
 */
export const getCompletionStats = async (req, res) => {
  try {
    const totalCompleted = await Completion.countDocuments();
    const avgRating = await Completion.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$citizenRating' }
        }
      }
    ]);

    const budgetAnalysis = await Completion.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$approvedBudget' },
          totalActualCost: { $sum: '$actualCost' },
          avgCostOverrun: { $avg: { $subtract: ['$actualCost', '$approvedBudget'] } }
        }
      }
    ]);

    const qualityStats = await Completion.aggregate([
      {
        $group: {
          _id: '$qualityCheckStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalCompleted,
      averageRating: avgRating[0]?.avgRating || 0,
      budgetAnalysis: budgetAnalysis[0] || {},
      qualityStats
    });
  } catch (error) {
    console.error('getCompletionStats error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
