export declare function getUsage(userId: string): Promise<{
    plan: "free" | "paid";
    projects: number;
    projectsLimit: number;
    keywords: number;
    keywordsLimit: number;
    competitors: number;
    competitorsLimit: number;
}>;
//# sourceMappingURL=usageService.d.ts.map