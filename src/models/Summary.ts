import mongoose, { Schema, models } from 'mongoose';

const SummarySchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  processingMethod: {
    type: String,
    enum: [
      'PDF.co API text extraction',
      'Basic PDF text extraction (fallback)',
      'Manual text input',
      'User guidance (extraction failed)',
    ],
    default: 'Manual text input',
  },
  documentType: {
    type: String,
    enum: [
      'Invoice/Bill',
      'Contract/Agreement', 
      'Resume/CV',
      'Financial Report',
      'Technical Report',
      'Legal Document',
      'Medical Document',
      'Academic Paper',
      'Manual/Guide',
      'Presentation',
      'Marketing Material',
      'Policy Document',
      'Change Order',
      'Estimate/Quote',
      'Schedule/Timeline',
      'Other',
    ],
    default: 'Other',
  },
  fileSize: {
    type: Number, // Size in bytes
    default: 0,
  },
  textLength: {
    type: Number, // Length of extracted/input text
    default: 0,
  },
  processingTimeMs: {
    type: Number, // Processing time in milliseconds
    default: 0,
  },
  success: {
    type: Boolean,
    default: true,
  },
  errorType: {
    type: String,
    enum: [
      'PDF_EXTRACTION_FAILED',
      'PDF_TEXT_QUALITY_POOR',
      'PDF_CONTENT_INSUFFICIENT',
      'SUMMARY_GENERATION_FAILED',
      'PROCESSING_FAILED',
      null,
    ],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for analytics queries
SummarySchema.index({ createdAt: -1 });
SummarySchema.index({ processingMethod: 1 });
SummarySchema.index({ documentType: 1 });
SummarySchema.index({ success: 1 });

export default models.Summary || mongoose.model('Summary', SummarySchema);
