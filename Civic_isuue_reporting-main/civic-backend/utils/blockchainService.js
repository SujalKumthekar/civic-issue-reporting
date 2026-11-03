import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/blockchainConfig.js';

// The backend no longer interacts with the blockchain directly.
// The frontend handles MetaMask transactions.

export const initializeBlockchain = async () => {
  console.log('Backend blockchain integration disabled. Frontend will handle MetaMask transactions.');
  return true;
};

export const createIssueOnBlockchain = async (citizenAddress, issueId, title, description, location, nagarpalika) => {
  return { success: true, transactionHash: "frontend-handled" };
};

export const recordAcknowledgmentOnBlockchain = async (issueId, officerName) => {
  return { success: true, transactionHash: "frontend-handled", blockNumber: 0, gasUsed: "0" };
};

export const addActionPointOnBlockchain = async (issueId, description, officerName, photoUrls) => {
  return { success: true, transactionHash: "frontend-handled", blockNumber: 0, gasUsed: "0" };
};

export const recordExpenseOnBlockchain = async (issueId, description, amount, vendor, proofDocUrls) => {
  return { success: true, transactionHash: "frontend-handled", blockNumber: 0, gasUsed: "0" };
};

export const completeIssueOnBlockchain = async (issueId, summary, beforePhotoUrl, afterPhotoUrl) => {
  return { success: true, transactionHash: "frontend-handled", blockNumber: 0, gasUsed: "0" };
};

export const getIssueFromBlockchain = async (issueId) => { return { success: true, data: null }; };
export const getActionPointsFromBlockchain = async (issueId) => { return { success: true, data: [] }; };
export const getExpensesFromBlockchain = async (issueId) => { return { success: true, data: [] }; };
export const getCompletionFromBlockchain = async (issueId) => { return { success: true, data: null }; };


// Generate hash for data
export const generateDataHash = (data) => {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
};
