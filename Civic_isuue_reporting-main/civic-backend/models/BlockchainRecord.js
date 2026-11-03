import mongoose from 'mongoose';

const blockchainRecordSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    recordType: {
      type: String,
      required: true
    },
    blockchainHash: {
      type: String,
      default: ''
    },
    transactionHash: {
      type: String,
      default: ''
    },
    blockNumber: {
      type: Number,
      default: 0
    },
    contractAddress: {
      type: String,
      default: ''
    },
    gasUsed: {
      type: Number,
      default: 0
    },
    dataHash: {
      type: String,
      default: ''
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationTimestamp: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const BlockchainRecord = mongoose.model('BlockchainRecord', blockchainRecordSchema);
export default BlockchainRecord;
