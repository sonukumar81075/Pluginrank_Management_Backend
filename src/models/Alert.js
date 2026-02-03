const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: {
      type: String,
      enum: ['rank_drop', 'rank_improvement', 'competitor_outrank'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['unread', 'read', 'dismissed'], default: 'unread' },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AlertSchema.index({ userId: 1, createdAt: -1 });
AlertSchema.index({ projectId: 1, status: 1 });

const Alert = mongoose.model('Alert', AlertSchema);
module.exports = { Alert };
