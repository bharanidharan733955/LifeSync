import mongoose from 'mongoose';

// ─── UserConsent model ────────────────────────────────────────────────────────
// Tracks user consent for data sharing (especially with AI features).
// Financial data must only be shared with AI after explicit user consent.

const userConsentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consentType: {
      type: String,
      enum: [
        'ai_diet_analysis',       // AI can access nutrition/diet data
        'ai_finance_insights',     // AI can access finance data
        'ai_combined_insights',    // AI can access both finance + nutrition
        'data_analytics',          // Internal analytics processing
        'marketing_emails',        // Marketing communications
        'third_party_sharing',     // Third-party data sharing
      ],
      required: true,
    },
    granted: {
      type: Boolean,
      required: true,
    },
    grantedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    version: {
      type: String,
      default: '1.0',
    },
  },
  { timestamps: true }
);

// Compound index: one active consent record per user per type
userConsentSchema.index({ user: 1, consentType: 1 });
userConsentSchema.index({ user: 1 });

const UserConsent = mongoose.model('UserConsent', userConsentSchema);
export default UserConsent;

