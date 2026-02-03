import mongoose from 'mongoose';
export declare function listProjects(userId: string): Promise<{
    id: string;
    slug: string;
    primary_keywords: string[];
    country: string;
    device: "desktop" | "mobile";
    userId: string;
    keywords: {
        id: string;
        projectId: string;
        keyword: string;
    }[];
    competitorCount: number;
    createdAt: string | undefined;
}[]>;
export declare function createProject(userId: string, slug: string, primary_keywords: string[], country: string, device: 'desktop' | 'mobile'): Promise<mongoose.Document<unknown, {}, import("../models/Project").IProject, {}, {}> & import("../models/Project").IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function getProject(userId: string, projectId: string): Promise<{
    id: string;
    slug: string;
    primary_keywords: string[];
    country: string;
    device: "desktop" | "mobile";
    userId: string;
    keywords: {
        id: string;
        projectId: string;
        keyword: string;
    }[];
    competitorCount: number;
    createdAt: string | undefined;
} | null>;
export declare function updateProject(userId: string, projectId: string, updates: {
    slug?: string;
    primary_keywords?: string[];
    country?: string;
    device?: string;
}): Promise<{
    id: string;
    slug: string;
    primary_keywords: string[];
    country: string;
    device: "desktop" | "mobile";
    userId: string;
    keywords: {
        id: string;
        projectId: string;
        keyword: string;
    }[];
    competitorCount: number;
    createdAt: string | undefined;
} | null>;
export declare function deleteProject(userId: string, projectId: string): Promise<boolean>;
export declare function addKeywords(userId: string, projectId: string, keywords: string[]): Promise<{
    id: string;
    keyword: string;
}[] | null>;
export declare function removeKeyword(userId: string, projectId: string, keywordId: string): Promise<boolean>;
//# sourceMappingURL=projectService.d.ts.map