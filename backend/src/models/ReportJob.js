import mongoose from 'mongoose';

// ─── ReportJob model ───────────────────────────────────────────────────────────

const reportJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['finance_monthly', 'finance_yearly', 'nutrition_weekly', 'nutrition_monthly', 'combined'],
      required: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'csv'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    errorMessage: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  { timestamps: true }
);

reportJobSchema.index({ user: 1, status: 1, createdAt: -1 });
reportJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

const ReportJob = mongoose.model('ReportJob', reportJobSchema);
export default ReportJob;

