const mongoose = require('mongoose');
const { Schema } = mongoose;

const CompetitorSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    slug: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CompetitorSchema.index({ projectId: 1 });
CompetitorSchema.index({ projectId: 1, slug: 1 }, { unique: true });

const Competitor = mongoose.model('Competitor', CompetitorSchema);
module.exports = { Competitor };
