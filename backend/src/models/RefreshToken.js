import mongoose from 'mongoose';

// ─── RefreshToken model ──────────────────────────────────────────────────────
// Stores hashed refresh tokens for token rotation and revocation.
// One document per device/session. Tokens are rotated on each refresh.

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
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

// ─── Instance methods ─────────────────────────────────────────────────────────
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isActive = function () {
  return !this.isRevoked && !this.isExpired();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;

