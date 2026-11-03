import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      unique: true
    },
    completionDate: {
      type: Date,
      required: true
    },
    workSummary: {
      type: String,
      required: true
    },
    qualityCheckStatus: {
      type: String,
      enum: ['PASSED', 'FAILED'],
      required: true
    },
    qualityOfficer: {
      type: String,
      required: true
    },
    qualityCheckDate: {
      type: Date,
      required: true
    },
    qualityCheckReportUrl: {
      type: String, // Cloudinary URL
      default: ''
    },
    preWorkPhotoUrl: {
      type: String, // Cloudinary URL
      required: true
    },
    duringWorkPhotoUrl: {
      type: String, // Cloudinary URL
      default: ''
    },
    postCompletionPhotoUrl: {
      type: String, // Cloudinary URL
      required: true
    },
    completionCertificateUrl: {
      type: String, // Cloudinary URL
      default: ''
    },
    responsibleOfficer: {
      type: String,
      required: true
    },
    approvedBy: {
      type: String,
      required: true // District Authority officer
    },
    citizenFeedback: {
      type: String,
      default: ''
    },
    citizenRating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 5
    },
    approvedBudget: {
      type: Number,
      required: true
    },
    actualCost: {
      type: Number,
      required: true
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

const Completion = mongoose.model('Completion', completionSchema);
export default Completion;
