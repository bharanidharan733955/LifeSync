import mongoose from 'mongoose';

// ─── DeviceToken model ─────────────────────────────────────────────────────────

const deviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    deviceId: { type: String, default: null },
    deviceName: { type: String, trim: true, maxlength: 100, default: null },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deviceTokenSchema.index({ user: 1, platform: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ user: 1, isActive: 1 });

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
export default DeviceToken;

