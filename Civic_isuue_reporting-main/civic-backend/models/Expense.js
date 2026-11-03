import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    fundApprovalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundApproval',
      default: null
    },
    expenseDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      enum: ['MATERIALS', 'LABOR', 'EQUIPMENT', 'PERMITS', 'OTHER'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amountSpent: {
      type: Number,
      required: true
    },
    vendorSupplier: {
      type: String,
      required: true
    },
    itemQuantity: {
      type: Number,
      default: 1
    },
    itemUnit: {
      type: String,
      default: ''
    },
    invoiceReference: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD'],
      required: true
    },
    proofDocumentUrls: [
      {
        type: String // Cloudinary URLs (receipt, delivery proof, etc.)
      }
    ],
    approvedBy: {
      type: String,
      required: true // Nagarpalika officer name
    },
    remarks: {
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

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
