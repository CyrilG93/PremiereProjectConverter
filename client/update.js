/* Check the latest stable GitHub release without blocking the panel. */
'use strict';
(function (root) {
  const VERSION = '1.0.0';
  const RELEASE_URL = 'https://github.com/CyrilG93/PremiereProjectConverter/releases/latest';
  function parseVersion(value) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value || '');
    return match ? match.slice(1).map(Number) : null;
  }
  function isNewer(remote, local) {
    const a = parseVersion(remote), b = parseVersion(local);
    if (!a || !b) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
    return false;
  }
  function check(https, callback) {
    try {
      const req = https.request({ hostname: 'api.github.com', path: '/repos/CyrilG93/PremiereProjectConverter/releases/latest', method: 'GET', headers: { 'User-Agent': 'PremiereProjectConverter', Accept: 'application/vnd.github+json' } }, function (res) {
        let body = '';
        res.on('data', function (chunk) { body += chunk; if (body.length > 1024 * 1024) req.destroy(); });
        res.on('end', function () {
          if (res.statusCode !== 200) return;
          try { const release = JSON.parse(body); if (!release.draft && !release.prerelease && isNewer(release.tag_name, VERSION)) callback(release.tag_name, RELEASE_URL); } catch (_) { /* Ignore malformed or unavailable release data. */ }
        });
        res.on('error', function () {});
      });
      req.on('error', function () {});
      req.setTimeout(6000, function () { req.destroy(); });
      req.end();
    } catch (_) { /* Offline operation must remain available. */ }
  }
  const api = { VERSION, RELEASE_URL, isNewer, check };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ProjectUpdate = api;
}(typeof window !== 'undefined' ? window : null));
