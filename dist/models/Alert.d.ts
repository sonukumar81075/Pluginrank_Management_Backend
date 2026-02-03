import mongoose, { Document, Model } from 'mongoose';
export interface IAlert extends Document {
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    type: 'rank_drop' | 'rank_improvement' | 'competitor_outrank';
    title: string;
    message: string;
    payload: Record<string, unknown>;
    status: 'unread' | 'read' | 'dismissed';
    createdAt: Date;
    readAt?: Date;
}
export declare const Alert: Model<IAlert>;
//# sourceMappingURL=Alert.d.ts.map