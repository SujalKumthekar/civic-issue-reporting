import mongoose from 'mongoose';

const fundApprovalSchema = new mongoose.Schema(
  {
    fundRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundRequest',
      required: true
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    approvedAmount: {
      type: Number,
      required: true
    },
    approvalStatus: {
      type: String,
      enum: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'],
      required: true
    },
    remarks: {
      type: String,
      default: ''
    },
    approvedBy: {
      type: String,
      required: true // District Authority officer name
    },
    disbursementTimestamp: {
      type: Date,
      required: true
    },
    approvalCertificateUrl: {
      type: String, // Cloudinary URL
      default: ''
    },
    blockchainHash: {
      type: String,
      default: ''
    },
    blockchainTransactionHash: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

const FundApproval = mongoose.model('FundApproval', fundApprovalSchema);
export default FundApproval;
