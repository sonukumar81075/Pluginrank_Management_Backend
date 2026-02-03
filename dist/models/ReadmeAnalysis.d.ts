import mongoose, { Document, Model } from 'mongoose';
export interface IReadmeAnalysis extends Document {
    projectId: mongoose.Types.ObjectId;
    slug: string;
    score: number;
    keywordInTitle: boolean;
    keywordInFirst100: boolean;
    keywordFrequency: number;
    sectionsPresent: string[];
    sectionsMissing: string[];
    sectionOrder: string[];
    recommendations: string[];
    analyzedAt: Date;
    createdAt: Date;
}
export declare const ReadmeAnalysis: Model<IReadmeAnalysis>;
//# sourceMappingURL=ReadmeAnalysis.d.ts.map