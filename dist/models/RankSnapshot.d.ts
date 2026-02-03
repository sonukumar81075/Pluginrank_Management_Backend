import mongoose, { Document, Model } from 'mongoose';
export interface IRankSnapshot extends Document {
    projectId: mongoose.Types.ObjectId;
    keywordId: mongoose.Types.ObjectId;
    country: string;
    device: string;
    date: Date;
    granularity: 'daily' | 'weekly' | 'monthly';
    position: number;
    url?: string;
    serpFeatures: string[];
    createdAt: Date;
}
export declare const RankSnapshot: Model<IRankSnapshot>;
//# sourceMappingURL=RankSnapshot.d.ts.map