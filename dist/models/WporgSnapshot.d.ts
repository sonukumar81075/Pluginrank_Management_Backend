import { Document, Model } from 'mongoose';
export interface IWporgSnapshot extends Document {
    slug: string;
    name: string;
    version: string;
    active_installs: number;
    rating: number;
    num_ratings: number;
    short_description: string;
    last_updated: Date;
    fetchedAt: Date;
    expiresAt: Date;
}
export declare const WporgSnapshot: Model<IWporgSnapshot>;
//# sourceMappingURL=WporgSnapshot.d.ts.map