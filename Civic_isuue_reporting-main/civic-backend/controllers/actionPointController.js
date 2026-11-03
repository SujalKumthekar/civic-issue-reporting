import ActionPoint from '../models/ActionPoint.js';
import Issue from '../models/Issue.js';
import BlockchainRecord from '../models/BlockchainRecord.js';
import { addActionPointOnBlockchain, generateDataHash } from '../utils/blockchainService.js';

/**
 * Add action point to issue
 */
export const addActionPoint = async (req, res) => {
  try {
    const { issueId, actionDescription, category, performedBy, timeDuration, resourcesUsed, locationDetails, cloudinaryPhotoUrls, costIncurred, statusAfterAction, notes } = req.body;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Validate photos
    if (!cloudinaryPhotoUrls || cloudinaryPhotoUrls.length === 0) {
      return res.status(400).json({ message: 'At least one photo is required' });
    }

    // Create action point
    const actionPoint = new ActionPoint({
      issueId,
      actionDate: new Date(),
      actionDescription,
      category,
      performedBy,
      timeDuration,
      resourcesUsed,
      locationDetails,
      cloudinaryPhotoUrls,
      costIncurred,
      statusAfterAction,
      notes
    });

    await actionPoint.save();

    // Record on blockchain
    const dataHash = generateDataHash(actionPoint);
    const blockchainResult = await addActionPointOnBlockchain(
      issueId.toString(),
      actionDescription,
      performedBy,
      cloudinaryPhotoUrls
    );

    if (blockchainResult.success) {
      actionPoint.blockchainHash = dataHash;
      actionPoint.blockchainTransactionHash = blockchainResult.transactionHash;
      await actionPoint.save();

      // Record in blockchain records
      await BlockchainRecord.create({
        issueId,
        recordType: 'ACTION_ADDED',
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

    // Update issue status
    if (issue.status === 'ACKNOWLEDGED') {
      issue.status = 'IN_PROGRESS';
      await issue.save();
    }

    res.status(201).json({
      message: 'Action point added successfully',
      actionPoint,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        verified: blockchainResult.success
      }
    });
  } catch (error) {
    console.error('addActionPoint error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get action points for an issue
 */
export const getActionPoints = async (req, res) => {
  try {
    const { issueId } = req.params;

    const actionPoints = await ActionPoint.find({ issueId }).sort({ createdAt: -1 });

    res.json(actionPoints);
  } catch (error) {
    console.error('getActionPoints error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Get single action point
 */
export const getActionPointById = async (req, res) => {
  try {
    const { actionPointId } = req.params;

    const actionPoint = await ActionPoint.findById(actionPointId);
    if (!actionPoint) {
      return res.status(404).json({ message: 'Action point not found' });
    }

    res.json(actionPoint);
  } catch (error) {
    console.error('getActionPointById error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/**
 * Update action point
 */
export const updateActionPoint = async (req, res) => {
  try {
    const { actionPointId } = req.params;
    const updates = req.body;

    const actionPoint = await ActionPoint.findByIdAndUpdate(
      actionPointId,
      updates,
      { new: true }
    );

    if (!actionPoint) {
      return res.status(404).json({ message: 'Action point not found' });
    }

    res.json({ message: 'Action point updated', actionPoint });
  } catch (error) {
    console.error('updateActionPoint error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
