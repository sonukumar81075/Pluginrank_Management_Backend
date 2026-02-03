export declare const config: {
    readonly nodeEnv: string;
    readonly port: number;
    readonly mongoUri: string;
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly apiKey: {
        readonly rateLimitPerMin: number;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
    readonly wpOrg: {
        readonly apiBase: "https://api.wordpress.org/plugins/info/1.2/";
        readonly svnReadmeBase: "https://plugins.svn.wordpress.org";
        readonly cacheTtlDays: number;
    };
    readonly plans: {
        readonly free: {
            readonly projects: 1;
            readonly keywordsPerProject: 5;
            readonly countries: 1;
            readonly competitorsPerProject: 1;
            readonly rankUpdateFrequency: "weekly";
            readonly alerts: false;
            readonly exports: false;
        };
        readonly paid: {
            readonly projects: 100;
            readonly keywordsPerProject: 50;
            readonly countries: 5;
            readonly competitorsPerProject: 10;
            readonly rankUpdateFrequency: "daily";
            readonly alerts: true;
            readonly exports: true;
        };
    };
};
//# sourceMappingURL=index.d.ts.map