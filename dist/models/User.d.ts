import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: 'user' | 'admin';
    plan: 'free' | 'paid';
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: Model<IUser>;
//# sourceMappingURL=User.d.ts.map