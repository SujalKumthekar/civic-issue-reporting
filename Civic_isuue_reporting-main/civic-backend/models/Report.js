import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // Who filed it
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null when anonymous
    },

    // What kind of report
    reportType: {
      type: String,
      enum: ['civic', 'illegal'],
      required: true,
    },

    // Civic issue fields
    issueType: {
      type: String, // road, garbage, water, streetlight, drainage, other
    },

    // Illegal activity fields
    title: {
      type: String,
    },
    category: {
      type: String, // corruption, encroachment, illegal_construction, etc.
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Common fields
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    taluka: {
      type: String,
      required: true,
    },
    nagarpalika: {
      type: String,
      required: true,
    },

    // Media attachments (Cloudinary URLs)
    media: [
      {
        url: String,
        publicId: String,
        resourceType: String, // 'image' or 'video'
      },
    ],

    // Status tracking
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },

    // Admin notes when updating status
    adminNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
