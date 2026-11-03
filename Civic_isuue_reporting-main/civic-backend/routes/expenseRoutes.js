import express from 'express';
import {
  recordExpense,
  getAllExpenses,
  getExpensesByIssue,
  getExpenseById,
  getExpenseSummary,
  updateExpense
} from '../controllers/expenseController.js';
import auth from '../middleware/auth.js';
import { anyAdminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Record expense (protected - any admin can record)
router.post('/', anyAdminAuth, recordExpense);

// Get all expenses
router.get('/', getAllExpenses);

// Get expenses by issue
router.get('/issue/:issueId', getExpensesByIssue);

// Get expense summary
router.get('/summary/:issueId', getExpenseSummary);

// Get specific expense
router.get('/:expenseId', getExpenseById);

// Update expense (admin only)
router.put('/:expenseId', anyAdminAuth, updateExpense);

export default router;
