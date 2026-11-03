import mongoose from 'mongoose';

const actionPointSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    actionDate: {
      type: Date,
      required: true
    },
    actionDescription: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['INSPECTION', 'REPAIR', 'PLANNING', 'COORDINATION', 'LEGAL_ACTION', 'OTHER'],
      default: 'OTHER'
    },
    performedBy: {
      type: String,
      required: true // Officer name
    },
    timeDuration: {
      type: Number, // in minutes
      default: 0
    },
    resourcesUsed: {
      type: String,
      default: ''
    },
    locationDetails: {
      type: String,
      default: ''
    },
    cloudinaryPhotoUrls: [
      {
        type: String,
        required: true
      }
    ],
    costIncurred: {
      type: Number,
      default: 0
    },
    statusAfterAction: {
      type: String,
      enum: ['IN_PROGRESS', 'PENDING_APPROVAL', 'BLOCKED', 'COMPLETED'],
      default: 'IN_PROGRESS'
    },
    notes: {
      type: String,
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

const ActionPoint = mongoose.model('ActionPoint', actionPointSchema);
export default ActionPoint;
