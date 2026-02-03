import mongoose, { Document, Model } from 'mongoose';
export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
}
export declare const RefreshToken: Model<IRefreshToken>;
//# sourceMappingURL=RefreshToken.d.ts.map