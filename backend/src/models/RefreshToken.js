import mongoose from 'mongoose';
import crypto from 'crypto';

// ─── RefreshToken model ──────────────────────────────────────────────────────
// Stores hashed refresh tokens for session rotation, revocation, and reuse detection.
// Raw tokens are NEVER stored in the database.

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      userAgent: { type: String, default: null },
      ip: { type: String, default: null },
      platform: {
        type: String,
        enum: ['web', 'ios', 'android', 'unknown'],
        default: 'unknown',
      },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-cleanup
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

// ─── Static methods ───────────────────────────────────────────────────────────
refreshTokenSchema.statics.hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

// ─── Instance methods ─────────────────────────────────────────────────────────
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isActive = function () {
  return !this.isRevoked && !this.isExpired();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
