"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPlugins = searchPlugins;
const config_1 = require("../config");
const WporgSnapshot_1 = require("../models/WporgSnapshot");
const CACHE_DAYS = config_1.config.wpOrg.cacheTtlDays;
const WP_API = config_1.config.wpOrg.apiBase;
async function searchPlugins(q, page, perPage) {
    const params = new URLSearchParams({
        action: 'query_plugins',
        search: q.trim(),
        page: String(page),
        per_page: String(Math.min(perPage, 24)),
    });
    const url = `${WP_API}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error('WP_ORG_API_ERROR');
    const json = (await res.json());
    const plugins = json.plugins ?? [];
    const total = json.info?.results ?? plugins.length;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_DAYS);
    for (const p of plugins) {
        await WporgSnapshot_1.WporgSnapshot.findOneAndUpdate({ slug: p.slug }, {
            slug: p.slug,
            name: p.name,
            version: p.version ?? '',
            active_installs: p.active_installs ?? 0,
            rating: p.rating ?? 0,
            num_ratings: p.num_ratings ?? 0,
            short_description: (p.short_description ?? '').slice(0, 500),
            fetchedAt: new Date(),
            expiresAt,
        }, { upsert: true });
    }
    return {
        data: plugins.map((p) => ({
            slug: p.slug,
            name: p.name,
            version: p.version ?? '',
            active_installs: p.active_installs ?? 0,
            rating: p.rating ?? 0,
            num_ratings: p.num_ratings ?? 0,
            short_description: (p.short_description ?? '').slice(0, 300),
        })),
        meta: { total, page, per_page: Math.min(perPage, 24) },
    };
}
//# sourceMappingURL=pluginSearchService.js.map