import mongoose from 'mongoose';

const fundRequestDetailSchema = new mongoose.Schema({
  itemName: String,
  amount: Number,
  purpose: String
});

const fundRequestSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    totalAmountRequested: {
      type: Number,
      required: true
    },
    justification: {
      type: String,
      required: true
    },
    breakdown: [fundRequestDetailSchema],
    submittedBy: {
      type: String,
      required: true // Officer name
    },
    supportDocumentsUrls: [
      {
        type: String // Cloudinary URLs
      }
    ],
    requestedTimeline: {
      type: Date,
      required: true
    },
    budgetLineItem: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'DISBURSED', 'UTILIZED'],
      default: 'REQUESTED'
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

const FundRequest = mongoose.model('FundRequest', fundRequestSchema);
export default FundRequest;
