const mongoose = require('mongoose');
const { Schema } = mongoose;

const RankSnapshotSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    keywordId: { type: Schema.Types.ObjectId, ref: 'Keyword', required: true },
    country: { type: String, required: true, trim: true },
    device: { type: String, enum: ['desktop', 'mobile'], required: true },
    date: { type: Date, required: true },
    granularity: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    position: { type: Number, required: true },
    url: { type: String },
    serpFeatures: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RankSnapshotSchema.index(
  { projectId: 1, keywordId: 1, country: 1, device: 1, date: 1, granularity: 1 },
  { unique: true }
);
RankSnapshotSchema.index({ projectId: 1, date: 1, granularity: 1 });
RankSnapshotSchema.index({ date: 1, granularity: 1 });

const RankSnapshot = mongoose.model('RankSnapshot', RankSnapshotSchema);
module.exports = { RankSnapshot };
