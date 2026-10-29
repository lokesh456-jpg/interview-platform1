const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - MongoDB removes expired docs automatically
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Static: generate and hash a token
passwordResetSchema.statics.generateToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

passwordResetSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
module.exports = PasswordReset;
