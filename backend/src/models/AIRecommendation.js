import mongoose from 'mongoose';

// ─── AIRecommendation model ────────────────────────────────────────────────────

const aiRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['meal_suggestion', 'weekly_plan', 'food_alternative', 'budget_insight', 'general_health'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    structuredData: { type: mongoose.Schema.Types.Mixed, default: null },
    isSaved: { type: Boolean, default: false },
    isApplied: { type: Boolean, default: false },
    appliedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    generatedByConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      default: null,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, trim: true, maxlength: 300, default: null },
      givenAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

aiRecommendationSchema.index({ user: 1, type: 1, createdAt: -1 });
aiRecommendationSchema.index({ user: 1, isSaved: 1 });

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
export default AIRecommendation;

