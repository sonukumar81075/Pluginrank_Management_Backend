import mongoose from 'mongoose';
export declare function addCompetitor(userId: string, projectId: string, slug: string): Promise<(mongoose.Document<unknown, {}, import("../models/Competitor").ICompetitor, {}, {}> & import("../models/Competitor").ICompetitor & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare function listCompetitors(userId: string, projectId: string): Promise<{
    id: string;
    projectId: string;
    slug: string;
    addedAt: string | undefined;
    active_installs: number | undefined;
    rating: number | undefined;
    readmeScore: number;
}[] | null>;
export declare function removeCompetitor(userId: string, projectId: string, competitorId: string): Promise<boolean>;
export declare function compareCompetitors(userId: string, projectId: string): Promise<{
    project: {
        slug: string;
        readmeScore: number | undefined;
        activeInstalls: number | undefined;
    };
    competitors: {
        slug: string;
        active_installs: number | undefined;
        rating: number | undefined;
        readmeScore: number;
    }[];
} | null>;
//# sourceMappingURL=competitorService.d.ts.map