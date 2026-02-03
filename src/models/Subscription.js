const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'paid'], required: true },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodEnd: { type: Date },
    limits: {
      projects: { type: Number, required: true },
      keywordsPerProject: { type: Number, required: true },
      countries: { type: Number, required: true },
      competitorsPerProject: { type: Number, required: true },
      rankUpdateFrequency: { type: String, enum: ['weekly', 'daily'], required: true },
      alerts: { type: Boolean, required: true },
      exports: { type: Boolean, required: true },
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ plan: 1 });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = { Subscription };
