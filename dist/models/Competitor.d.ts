import mongoose, { Document, Model } from 'mongoose';
export interface ICompetitor extends Document {
    projectId: mongoose.Types.ObjectId;
    slug: string;
    addedAt: Date;
}
export declare const Competitor: Model<ICompetitor>;
//# sourceMappingURL=Competitor.d.ts.map