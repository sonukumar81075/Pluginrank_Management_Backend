const mongoose = require('mongoose');
const { Schema } = mongoose;

const UsageLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    apiKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey' },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UsageLogSchema.index({ userId: 1, createdAt: -1 });
UsageLogSchema.index({ apiKeyId: 1, createdAt: -1 });
UsageLogSchema.index({ createdAt: 1 });

const UsageLog = mongoose.model('UsageLog', UsageLogSchema);
module.exports = { UsageLog };
