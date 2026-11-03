import FundRequest from '../models/FundRequest.js';
import FundApproval from '../models/FundApproval.js';
import Issue from '../models/Issue.js';
import BlockchainRecord from '../models/BlockchainRecord.js';
import { generateDataHash } from '../utils/blockchainService.js';

/**
 * Request funds for issue
 */
export const requestFunds = async (req, res) => {
  try {
    const { issueId, totalAmountRequested, justification, breakdown, submittedBy, requestedTimeline, budgetLineItem, supportDocumentsUrls, blockchainTransactionHash } = req.body;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Validate breakdown items
    if (!breakdown || breakdown.length === 0) {
      return res.status(400).json({ message: 'Fund breakdown is required' });
    }

    // Create fund request
    const fundRequest = new FundRequest({
      issueId,
      totalAmountRequested,
      justification,
      breakdown,
      submittedBy,
      requestedTimeline: new Date(requestedTimeline),
      budgetLineItem,
      supportDocumentsUrls: supportDocumentsUrls || [],
      status: 'REQUESTED',
      blockchainTransactionHash: blockchainTransactionHash || ''
    });

    await fundRequest.save();

    // Update issue
    issue.fundRequestId = fundRequest._id;
    issue.status = 'PENDING_FUNDS';
    await issue.save();

    // Record in blockchain records
    const dataHash = generateDataHash(fundRequest);
    await BlockchainRecord.create({
      issueId,
      recordType: 'FUND_REQUESTED',
      blockchainHash: dataHash,
      transactionHash: blockchainTransactionHash || '',
      contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
      dataHash,
      verified: !!blockchainTransactionHash,
      verificationTimestamp: blockchainTransactionHash ? new Date() : null
    });

    res.status(201).json({
      message: 'Fund request submitted successfully',
      fundRequest
    });
  } catch (error) {
    console.error('requestFunds error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Approve or reject fund request
 */
export const approveFundRequest = async (req, res) => {
  try {
    const { fundRequestId, approvedAmount, approvalStatus, remarks, approvedBy, disbursementTimestamp, approvalCertificateUrl } = req.body;

    // Validate fund request exists
    const fundRequest = await FundRequest.findById(fundRequestId);
    if (!fundRequest) {
      return res.status(404).json({ message: 'Fund request not found' });
    }

    if (fundRequest.status !== 'REQUESTED') {
      return res.status(400).json({ message: 'Fund request already processed' });
    }

    // Create fund approval
    const fundApproval = new FundApproval({
      fundRequestId,
      issueId: fundRequest.issueId,
      approvedAmount,
      approvalStatus,
      remarks,
      approvedBy,
      disbursementTimestamp: new Date(disbursementTimestamp),
      approvalCertificateUrl
    });

    await fundApproval.save();

    // Update fund request status
    fundRequest.status = approvalStatus === 'APPROVED' ? 'APPROVED' : 
                         approvalStatus === 'PARTIALLY_APPROVED' ? 'PARTIALLY_APPROVED' : 'REJECTED';
    await fundRequest.save();

    // Update issue
    const issue = await Issue.findById(fundRequest.issueId);
    if (issue) {
      issue.fundApprovalId = fundApproval._id;
      issue.allocatedBudget = approvedAmount;
      if (approvalStatus !== 'REJECTED') {
        issue.status = 'IN_PROGRESS';
      }
      await issue.save();
    }

    // Record in blockchain records
    const dataHash = generateDataHash(fundApproval);
    await BlockchainRecord.create({
      issueId: fundRequest.issueId,
      recordType: 'FUND_APPROVED',
      blockchainHash: dataHash,
      transactionHash: '',
      contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
      dataHash,
      verified: false
    });

    res.status(201).json({
      message: 'Fund request processed',
      fundApproval
    });
  } catch (error) {
    console.error('approveFundRequest error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get fund request details
 */
export const getFundRequest = async (req, res) => {
  try {
    const { fundRequestId } = req.params;

    const fundRequest = await FundRequest.findById(fundRequestId);
    if (!fundRequest) {
      return res.status(404).json({ message: 'Fund request not found' });
    }

    res.json(fundRequest);
  } catch (error) {
    console.error('getFundRequest error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get fund requests by issue
 */
export const getFundRequestsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const fundRequests = await FundRequest.find({ issueId }).sort({ createdAt: -1 });

    res.json(fundRequests);
  } catch (error) {
    console.error('getFundRequestsByIssue error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get all pending fund requests (for admins)
 */
export const getPendingFundRequests = async (req, res) => {
  try {
    const fundRequests = await FundRequest.find({ status: 'REQUESTED' })
      .populate('issueId')
      .sort({ createdAt: -1 });

    res.json(fundRequests);
  } catch (error) {
    console.error('getPendingFundRequests error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get fund approval details
 */
export const getFundApproval = async (req, res) => {
  try {
    const { fundApprovalId } = req.params;

    const fundApproval = await FundApproval.findById(fundApprovalId);
    if (!fundApproval) {
      return res.status(404).json({ message: 'Fund approval not found' });
    }

    res.json(fundApproval);
  } catch (error) {
    console.error('getFundApproval error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
