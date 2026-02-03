const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, trim: true },
    primary_keywords: { type: [String], default: [] },
    country: { type: String, required: true, trim: true, uppercase: true, maxlength: 2 },
    device: { type: String, enum: ['desktop', 'mobile'], default: 'desktop' },
    lastRankRun: { type: Date },
    /** Full plugin details from WordPress.org API (name, tags, icons, rating, active_installs, etc.) */
    pluginData: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ userId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ slug: 1 });

const Project = mongoose.model('Project', ProjectSchema);
module.exports = { Project };
