import mongoose from 'mongoose';

// ─── Notification model ───────────────────────────────────────────────────────

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'budget_alert', 'savings_milestone', 'meal_reminder', 'water_reminder',
        'weight_log_reminder', 'weekly_report', 'ai_recommendation',
        'system', 'account',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    // Push notification status
    isPushSent: { type: Boolean, default: false },
    pushSentAt: { type: Date, default: null },
    scheduledFor: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isPushSent: 1 }, { sparse: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

