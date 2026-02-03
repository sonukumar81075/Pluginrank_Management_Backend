const { config } = require('../config');
const { WporgSnapshot } = require('../models/WporgSnapshot');

const CACHE_DAYS = config.wpOrg.cacheTtlDays;
const WP_API = config.wpOrg.apiBase;
const WP_ICON_BASE = 'https://ps.w.org';

/** Pick first usable icon URL from WordPress icons object (keys: 1x, 2x, default, 128, 256). */
function getIconUrl(icons) {
  if (!icons || typeof icons !== 'object') return null;
  const keys = ['128', '256', 'default', '2x', '1x'];
  for (const k of keys) {
    const url = icons[k];
    if (typeof url === 'string' && url.startsWith('http')) return url;
  }
  const first = Object.values(icons).find((v) => typeof v === 'string' && v.startsWith('http'));
  return first || null;
}

/** Fallback icon URL from slug when API returns no icons (WordPress.org asset path). */
function getIconUrlFromSlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const s = slug.trim().toLowerCase();
  return s ? `${WP_ICON_BASE}/${s}/assets/icon-128x128.png` : null;
}

/** Ensure icon URL is valid (fix malformed e.g. "ttps://" -> "https://"). */
function normalizeIconUrl(url) {
  if (url == null || typeof url !== 'string') return null;
  const u = url.trim();
  if (!u) return null;
  if (u.startsWith('https://') || u.startsWith('http://')) return u;
  if (u.startsWith('ttps://')) return 'h' + u;
  if (u.startsWith('tps://')) return 'ht' + u;
  if (u.startsWith('ps://')) return 'htt' + u;
  return u;
}

function mapPlugin(p) {
  const icons = p.icons ?? {};
  return {
    slug: p.slug,
    name: p.name,
    version: p.version ?? '',
    author: p.author ?? '',
    active_installs: p.active_installs ?? 0,
    rating: p.rating ?? 0,
    num_ratings: p.num_ratings ?? 0,
    support_threads: p.support_threads ?? 0,
    support_threads_resolved: p.support_threads_resolved ?? 0,
    tested: p.tested ?? '',
    last_updated: p.last_updated ?? '',
    downloaded: p.downloaded ?? 0,
    short_description: (p.short_description ?? '').slice(0, 300),
    tags: p.tags ?? {},
    icons,
    icon_url: normalizeIconUrl(getIconUrl(icons) || getIconUrlFromSlug(p.slug)),
  };
}

function snapshotToPlugin(snap) {
  if (!snap) return null;
  const icons = snap.icons ?? {};
  return {
    slug: snap.slug,
    name: snap.name ?? '',
    version: snap.version ?? '',
    author: snap.author ?? '',
    active_installs: snap.active_installs ?? 0,
    rating: snap.rating ?? 0,
    num_ratings: snap.num_ratings ?? 0,
    support_threads: snap.support_threads ?? 0,
    support_threads_resolved: snap.support_threads_resolved ?? 0,
    tested: snap.tested ?? '',
    last_updated: snap.last_updated ?? '',
    downloaded: snap.downloaded ?? 0,
    short_description: (snap.short_description ?? '').slice(0, 300),
    tags: snap.tags ?? {},
    icons,
    icon_url: normalizeIconUrl(getIconUrl(icons) || getIconUrlFromSlug(snap.slug)),
  };
}

function upsertWporgSnapshot(p, expiresAt) {
  return WporgSnapshot.findOneAndUpdate(
    { slug: p.slug },
    {
      slug: p.slug,
      name: p.name ?? '',
      version: p.version ?? '',
      author: p.author ?? '',
      active_installs: p.active_installs ?? 0,
      rating: p.rating ?? 0,
      num_ratings: p.num_ratings ?? 0,
      support_threads: p.support_threads ?? 0,
      support_threads_resolved: p.support_threads_resolved ?? 0,
      tested: p.tested ?? '',
      last_updated: p.last_updated ?? '',
      downloaded: p.downloaded ?? 0,
      short_description: (p.short_description ?? '').slice(0, 500),
      tags: p.tags ?? {},
      icons: p.icons ?? {},
      fetchedAt: new Date(),
      expiresAt,
    },
    { upsert: true, new: true }
  );
}

async function searchPlugins(q, page, perPage) {
  const params = new URLSearchParams({
    action: 'query_plugins',
    search: q.trim(),
    page: String(page),
    per_page: String(Math.min(perPage, 24)),
  });
  const url = `${WP_API}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('WP_ORG_API_ERROR');
  const json = await res.json();
  const plugins = json.plugins ?? [];
  const total = json.info?.results ?? plugins.length;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DAYS);

  for (const p of plugins) {
    await WporgSnapshot.findOneAndUpdate(
      { slug: p.slug },
      {
        slug: p.slug,
        name: p.name,
        version: p.version ?? '',
        active_installs: p.active_installs ?? 0,
        rating: p.rating ?? 0,
        num_ratings: p.num_ratings ?? 0,
        short_description: (p.short_description ?? '').slice(0, 500),
        fetchedAt: new Date(),
        expiresAt,
      },
      { upsert: true }
    );
  }

  return {
    data: plugins.map((p) => mapPlugin(p)),
    meta: { total, page, per_page: Math.min(perPage, 24) },
  };
}

async function getPopularPlugins(perPage = 10) {
  const params = new URLSearchParams({
    action: 'query_plugins',
    browse: 'popular',
    page: '1',
    per_page: String(Math.min(perPage, 24)),
  });
  const url = `${WP_API}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('WP_ORG_API_ERROR');
  const json = await res.json();
  const plugins = json.plugins ?? [];
  const total = json.info?.results ?? plugins.length;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DAYS);

  for (const p of plugins) {
    await WporgSnapshot.findOneAndUpdate(
      { slug: p.slug },
      {
        slug: p.slug,
        name: p.name,
        version: p.version ?? '',
        active_installs: p.active_installs ?? 0,
        rating: p.rating ?? 0,
        num_ratings: p.num_ratings ?? 0,
        short_description: (p.short_description ?? '').slice(0, 500),
        fetchedAt: new Date(),
        expiresAt,
      },
      { upsert: true }
    );
  }

  return {
    data: plugins.map((p) => mapPlugin(p)),
    meta: { total, page: 1, per_page: Math.min(perPage, 24) },
  };
}

async function fetchPluginFromWp(slug) {
  const trimmed = String(slug || '').trim();
  if (!trimmed) return null;
  const url = `${WP_API}?action=plugin_information&slug=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const p = await res.json();
  if (!p || !p.slug) return null;
  return p;
}

/**
 * Fetch plugin from WordPress.org API and save full details to DB.
 * Returns mapped plugin object or null if slug not found.
 */
async function fetchAndSavePluginBySlug(slug) {
  const p = await fetchPluginFromWp(slug);
  if (!p) return null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DAYS);
  await upsertWporgSnapshot(p, expiresAt);
  return mapPlugin(p);
}

/**
 * Get plugin by slug: prefer DB snapshot, else fetch from WP and save.
 */
async function getPluginBySlug(slug) {
  const trimmed = String(slug || '').trim();
  if (!trimmed) return null;
  const snap = await WporgSnapshot.findOne({ slug: trimmed }).lean();
  if (snap) return snapshotToPlugin(snap);
  const p = await fetchPluginFromWp(trimmed);
  if (!p) return null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DAYS);
  await upsertWporgSnapshot(p, expiresAt);
  return mapPlugin(p);
}

module.exports = { searchPlugins, getPopularPlugins, getPluginBySlug, fetchAndSavePluginBySlug, getIconUrl, getIconUrlFromSlug, normalizeIconUrl };
