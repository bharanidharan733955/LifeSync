import mongoose from 'mongoose';

// ─── ActivityLog model ────────────────────────────────────────────────────────

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityName: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'sports', 'walking', 'cycling', 'swimming', 'yoga', 'other'],
      default: 'other',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours'],
    },
    caloriesBurned: {
      type: Number,
      min: 0,
      default: null, // null = not calculated / unknown
    },
    intensityLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      default: 'moderate',
    },
    logDate: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 300, default: null },
    heartRate: {
      average: { type: Number, min: 0, default: null },
      max: { type: Number, min: 0, default: null },
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, logDate: -1 });
activityLogSchema.index({ user: 1, category: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;

