interface WpPluginInfo {
    slug: string;
    name: string;
    version?: string;
    active_installs?: number;
    rating?: number;
    num_ratings?: number;
    short_description?: string;
}
export declare function searchPlugins(q: string, page: number, perPage: number): Promise<{
    data: WpPluginInfo[];
    meta: {
        total: number;
        page: number;
        per_page: number;
    };
}>;
export {};
//# sourceMappingURL=pluginSearchService.d.ts.map