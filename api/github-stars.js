/**
 * API Handler: /api/github-stars
 * Real-time GitHub Stars Aggregator & Edge Caching Gateway
 * Memberikan sinkronisasi bintang repo GitHub Raflyf secara realtime dan bebas dari batasan rate-limit IP browser.
 */

const FALLBACK_GROUND_TRUTH = {
  'openplagiarismchecker': 4,
  'spam-email': 3,
  'laser_pointer_ppt': 2,
  'fotokitablur': 2,
  'web-portofolio': 2,
  'project-landing-page-hari-senin': 0,
  'raflyf': 0
};

// In-memory memory cache di instance serverless
let memoryCache = {
  data: null,
  timestamp: 0
};
const SERVER_CACHE_TTL_MS = 60 * 1000; // 60 detik fresh cache di server

export default async function handler(req, res) {
  // Hanya izinkan metode GET dan HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Set header caching publik untuk Vercel Edge Network
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();
  if (memoryCache.data && (now - memoryCache.timestamp < SERVER_CACHE_TTL_MS)) {
    return res.status(200).json({
      success: true,
      source: 'server_memory_cache',
      timestamp: memoryCache.timestamp,
      stars: memoryCache.data
    });
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Raflyf-Portfolio-Stars-Gateway/1.0'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const ghRes = await fetch('https://api.github.com/users/Raflyf/repos?per_page=100', {
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (ghRes.ok) {
      const repos = await ghRes.json();
      if (Array.isArray(repos)) {
        const starsMap = {};
        for (const repo of repos) {
          if (repo && repo.name && typeof repo.stargazers_count === 'number') {
            starsMap[repo.name.toLowerCase()] = repo.stargazers_count;
          }
        }

        memoryCache = {
          data: starsMap,
          timestamp: now
        };

        return res.status(200).json({
          success: true,
          source: 'live_github_api',
          timestamp: now,
          stars: starsMap
        });
      }
    }

    // Jika GitHub API mengembalikan rate-limit 403 atau error lain
    const safeData = memoryCache.data || FALLBACK_GROUND_TRUTH;
    return res.status(200).json({
      success: true,
      source: 'fallback_ground_truth',
      timestamp: now,
      stars: safeData
    });
  } catch {
    const safeData = memoryCache.data || FALLBACK_GROUND_TRUTH;
    return res.status(200).json({
      success: true,
      source: 'fallback_error',
      timestamp: now,
      stars: safeData
    });
  }
}
