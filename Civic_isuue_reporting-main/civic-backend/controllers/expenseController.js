import Expense from '../models/Expense.js';
import Issue from '../models/Issue.js';
import BlockchainRecord from '../models/BlockchainRecord.js';
import { recordExpenseOnBlockchain, generateDataHash } from '../utils/blockchainService.js';

/**
 * Record expense for issue
 */
export const recordExpense = async (req, res) => {
  try {
    const { issueId, expenseDate, category, description, amountSpent, vendorSupplier, itemQuantity, itemUnit, invoiceReference, paymentMethod, proofDocumentUrls, approvedBy, remarks, fundApprovalId } = req.body;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Validate proof documents
    if (!proofDocumentUrls || proofDocumentUrls.length === 0) {
      return res.status(400).json({ message: 'At least one proof document is required' });
    }

    // Create expense record
    const expense = new Expense({
      issueId,
      fundApprovalId: fundApprovalId || null,
      expenseDate: new Date(expenseDate),
      category,
      description,
      amountSpent,
      vendorSupplier,
      itemQuantity,
      itemUnit,
      invoiceReference,
      paymentMethod,
      proofDocumentUrls,
      approvedBy,
      remarks
    });

    await expense.save();

    // Record on blockchain
    const dataHash = generateDataHash(expense);
    const blockchainResult = await recordExpenseOnBlockchain(
      issueId.toString(),
      description,
      amountSpent,
      vendorSupplier,
      proofDocumentUrls
    );

    if (blockchainResult.success) {
      expense.blockchainHash = dataHash;
      expense.blockchainTransactionHash = blockchainResult.transactionHash;
      await expense.save();

      // Record in blockchain records
      await BlockchainRecord.create({
        issueId,
        recordType: 'EXPENSE_RECORDED',
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

    // Update issue utilized budget
    issue.utilizedBudget = (issue.utilizedBudget || 0) + amountSpent;
    await issue.save();

    res.status(201).json({
      message: 'Expense recorded successfully',
      expense,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        verified: blockchainResult.success
      }
    });
  } catch (error) {
    console.error('recordExpense error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get all expenses
 */
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('getAllExpenses error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get expenses for an issue
 */
export const getExpensesByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const expenses = await Expense.find({ issueId }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('getExpensesByIssue error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get expense details
 */
export const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('getExpenseById error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get expense summary for an issue
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const { issueId } = req.params;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Get all expenses
    const expenses = await Expense.find({ issueId });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amountSpent, 0);
    const byCategory = {};
    
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amountSpent;
    });

    const approvedBudget = issue.allocatedBudget || 0;
    const remaining = approvedBudget - totalExpenses;
    const percentage = approvedBudget > 0 ? ((totalExpenses / approvedBudget) * 100).toFixed(2) : 0;

    res.json({
      approvedBudget,
      totalExpenses,
      remaining,
      percentageUsed: percentage,
      byCategory,
      expenseCount: expenses.length
    });
  } catch (error) {
    console.error('getExpenseSummary error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Update expense
 */
export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const updates = req.body;

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      updates,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated', expense });
  } catch (error) {
    console.error('updateExpense error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
