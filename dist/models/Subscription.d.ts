import mongoose, { Document, Model } from 'mongoose';
export interface ISubscriptionLimits {
    projects: number;
    keywordsPerProject: number;
    countries: number;
    competitorsPerProject: number;
    rankUpdateFrequency: 'weekly' | 'daily';
    alerts: boolean;
    exports: boolean;
}
export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: 'free' | 'paid';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    limits: ISubscriptionLimits;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Subscription: Model<ISubscription>;
//# sourceMappingURL=Subscription.d.ts.map