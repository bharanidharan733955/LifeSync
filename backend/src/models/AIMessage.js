import mongoose from 'mongoose';

// ─── AIMessage model ───────────────────────────────────────────────────────────

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    // For structured AI responses (meal plans, recommendations)
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Token usage for cost tracking
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    model: { type: String, default: null },
    isError: { type: Boolean, default: false },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

aiMessageSchema.index({ conversation: 1, createdAt: 1 });
aiMessageSchema.index({ user: 1, role: 1 });

const AIMessage = mongoose.model('AIMessage', aiMessageSchema);
export default AIMessage;

