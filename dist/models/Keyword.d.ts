import mongoose, { Document, Model } from 'mongoose';
export interface IKeyword extends Document {
    projectId: mongoose.Types.ObjectId;
    keyword: string;
    createdAt: Date;
}
export declare const Keyword: Model<IKeyword>;
//# sourceMappingURL=Keyword.d.ts.map