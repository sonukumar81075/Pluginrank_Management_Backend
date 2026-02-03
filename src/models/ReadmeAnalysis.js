const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReadmeAnalysisSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    slug: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    keywordInTitle: { type: Boolean, default: false },
    keywordInFirst100: { type: Boolean, default: false },
    keywordFrequency: { type: Number, default: 0 },
    sectionsPresent: { type: [String], default: [] },
    sectionsMissing: { type: [String], default: [] },
    sectionOrder: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    analyzedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReadmeAnalysisSchema.index({ projectId: 1 });
ReadmeAnalysisSchema.index({ projectId: 1, analyzedAt: -1 });

const ReadmeAnalysis = mongoose.model('ReadmeAnalysis', ReadmeAnalysisSchema);
module.exports = { ReadmeAnalysis };
