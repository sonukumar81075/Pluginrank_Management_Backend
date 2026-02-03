import mongoose, { Document, Model } from 'mongoose';
export interface IUsageLog extends Document {
    userId: mongoose.Types.ObjectId;
    apiKeyId?: mongoose.Types.ObjectId;
    endpoint: string;
    method: string;
    statusCode: number;
    createdAt: Date;
}
export declare const UsageLog: Model<IUsageLog>;
//# sourceMappingURL=UsageLog.d.ts.map