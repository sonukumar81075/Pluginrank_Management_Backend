const mongoose = require('mongoose');
const { Schema } = mongoose;

const KeywordSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    keyword: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

KeywordSchema.index({ projectId: 1 });
KeywordSchema.index({ projectId: 1, keyword: 1 }, { unique: true });

const Keyword = mongoose.model('Keyword', KeywordSchema);
module.exports = { Keyword };
