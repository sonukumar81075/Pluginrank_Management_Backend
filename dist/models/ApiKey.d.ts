import mongoose, { Document, Model } from 'mongoose';
export interface IApiKey extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    keyHash: string;
    keyPrefix: string;
    scopes: string[];
    rateLimitPerMin?: number;
    lastUsedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ApiKey: Model<IApiKey>;
//# sourceMappingURL=ApiKey.d.ts.map