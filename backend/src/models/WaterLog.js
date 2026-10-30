import mongoose from 'mongoose';

// ─── WaterLog model ───────────────────────────────────────────────────────────

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logDate: { type: Date, required: true },
    amountMl: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 ml'],
      max: [5000, 'Single entry cannot exceed 5000 ml'],
    },
    source: {
      type: String,
      enum: ['water', 'tea', 'coffee', 'juice', 'milk', 'other'],
      default: 'water',
    },
    loggedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 200, default: null },
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, logDate: -1 });
waterLogSchema.index({ user: 1, logDate: 1 });

const WaterLog = mongoose.model('WaterLog', waterLogSchema);
export default WaterLog;

