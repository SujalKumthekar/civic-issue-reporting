import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  status: { type: String },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema(
  {
    issueType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    taluka: { type: String, required: true },
    nagarpalika: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['SUBMITTED', 'IN_PROGRESS', 'PENDING_FUNDS', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED'],
      default: 'SUBMITTED',
    },
    supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAnonymous: { type: Boolean, default: false },
    category: { type: String, enum: ['civic', 'illegal'], default: 'civic' },
    updates: [updateSchema],

    // Acknowledgment details
    acknowledgedBy: {
      type: String,
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    acknowledgmentNote: {
      type: String,
      default: ''
    },
    priorityLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    expectedResolutionDate: {
      type: Date,
      default: null
    },

    // Fund allocation
    fundRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundRequest',
      default: null
    },
    fundApprovalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundApproval',
      default: null
    },
    allocatedBudget: {
      type: Number,
      default: 0
    },
    utilizedBudget: {
      type: Number,
      default: 0
    },

    // Completion details
    completionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Completion',
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },

    // Blockchain
    blockchainHash: {
      type: String,
      default: ''
    },
    blockchainTransactionHash: {
      type: String,
      default: ''
    },
    blockchainVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
