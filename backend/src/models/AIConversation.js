import mongoose from 'mongoose';

// ─── AIConversation model ──────────────────────────────────────────────────────

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: 'New Conversation',
    },
    assistantType: {
      type: String,
      enum: ['diet', 'finance', 'general'],
      default: 'diet',
    },
    // Track what data was used (for audit/consent purposes)
    dataContextUsed: {
      nutritionData: { type: Boolean, default: false },
      financeData: { type: Boolean, default: false },
      profileData: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

aiConversationSchema.index({ user: 1, assistantType: 1, updatedAt: -1 });
aiConversationSchema.index({ user: 1, isActive: 1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;

