import mongoose, { Document, Model } from 'mongoose';
export interface IProject extends Document {
    userId: mongoose.Types.ObjectId;
    slug: string;
    primary_keywords: string[];
    country: string;
    device: 'desktop' | 'mobile';
    lastRankRun?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: Model<IProject>;
//# sourceMappingURL=Project.d.ts.map