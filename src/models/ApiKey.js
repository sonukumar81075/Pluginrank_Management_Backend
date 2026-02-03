const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApiKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    scopes: { type: [String], default: [] },
    rateLimitPerMin: { type: Number },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

ApiKeySchema.index({ userId: 1 });
ApiKeySchema.index({ keyHash: 1 }, { unique: true, sparse: true });
ApiKeySchema.index({ revokedAt: 1 });

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);
module.exports = { ApiKey };
