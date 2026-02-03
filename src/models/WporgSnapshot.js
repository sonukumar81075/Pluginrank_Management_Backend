const mongoose = require('mongoose');
const { Schema } = mongoose;

const WporgSnapshotSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    version: { type: String, default: '' },
    author: { type: String, default: '' },
    active_installs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    num_ratings: { type: Number, default: 0 },
    support_threads: { type: Number, default: 0 },
    support_threads_resolved: { type: Number, default: 0 },
    tested: { type: String, default: '' },
    last_updated: { type: String, default: '' },
    downloaded: { type: Number, default: 0 },
    short_description: { type: String, default: '' },
    tags: { type: Schema.Types.Mixed, default: {} },
    icons: { type: Schema.Types.Mixed, default: {} },
    fetchedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

WporgSnapshotSchema.index({ expiresAt: 1 });

const WporgSnapshot = mongoose.model('WporgSnapshot', WporgSnapshotSchema);
module.exports = { WporgSnapshot };
