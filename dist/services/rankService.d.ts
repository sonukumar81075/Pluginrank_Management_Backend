export declare function getRankings(projectId: string, userId: string, opts: {
    from?: string;
    to?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
    keywordId?: string;
}): Promise<{
    projectId: string;
    granularity: "weekly" | "daily" | "monthly";
    data: {
        keywordId: string;
        keyword: string;
        points: {
            date: string;
            position: number;
            url?: string;
        }[];
    }[];
} | null>;
//# sourceMappingURL=rankService.d.ts.map