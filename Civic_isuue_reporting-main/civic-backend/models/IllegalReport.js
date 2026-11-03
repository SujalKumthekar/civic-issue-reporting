import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  status: { type: String },
  note: { type: String },
  transactionHash: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const legalActionSchema = new mongoose.Schema({
  actionType: { type: String }, // e.g., 'FIR Filed', 'Notice Issued', 'Demolition Order', etc.
  ipcSection: { type: String }, // e.g., 'IPC Section 268'
  firNumber: { type: String, default: '' },
  actionDescription: { type: String },
  actionDate: { type: Date },
  officerName: { type: String },
  penaltyAmount: { type: Number, default: 0 },
  additionalRemarks: { type: String, default: '' },
  blockchainTransactionHash: { type: String, default: '' },
});

const illegalReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      // corruption, encroachment, illegal_construction, public_nuisance, environmental, other
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    taluka: { type: String, required: true },
    nagarpalika: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrls: [{ type: String }],
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'],
      default: 'SUBMITTED',
    },
    supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    updates: [updateSchema],
    legalAction: legalActionSchema,
  },
  { timestamps: true }
);

const IllegalReport = mongoose.model('IllegalReport', illegalReportSchema);
export default IllegalReport;
