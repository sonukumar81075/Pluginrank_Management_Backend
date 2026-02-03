export declare function analyzeReadme(projectId: string): Promise<{
    score: number;
    insights: Record<string, unknown>;
} | null>;
export declare function getLatestReadmeAnalysis(projectId: string): Promise<{
    projectId: string;
    slug: string;
    score: number;
    lastAnalyzedAt: string;
    insights: {
        keywordInTitle: boolean;
        keywordInFirst100: boolean;
        keywordFrequency: number;
        sectionsPresent: string[];
        sectionsMissing: string[];
        sectionOrder: string[];
        recommendations: string[];
    };
} | null>;
//# sourceMappingURL=readmeService.d.ts.map