import mongoose from 'mongoose';

// ─── WeightLog model ──────────────────────────────────────────────────────────

const weightLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [10, 'Weight must be at least 10 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    bmi: {
      type: Number,
      min: 0,
      default: null,
    },
    logDate: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 300, default: null },
    // Body measurements (optional)
    measurements: {
      waistCm: { type: Number, min: 0, default: null },
      hipCm: { type: Number, min: 0, default: null },
      chestCm: { type: Number, min: 0, default: null },
      bodyFatPercent: { type: Number, min: 0, max: 70, default: null },
    },
  },
  { timestamps: true }
);

weightLogSchema.index({ user: 1, logDate: -1 });

const WeightLog = mongoose.model('WeightLog', weightLogSchema);
export default WeightLog;

