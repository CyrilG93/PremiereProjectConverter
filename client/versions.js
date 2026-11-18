/* Map recognized Premiere releases to their project formats. */
'use strict';
(function (root) {
  const formats = { 2023: 41, 2024: 42, 2025: 43, 2026: 45, 2027: 46 };
  function yearForFormat(format) {
    const year = Object.keys(formats).find(key => formats[key] === Number(format));
    return year || '';
  }
  // The saving build is more informative than a format number shared by builds.
  function sourceLabel(info) {
    const match = /^(\d+)\./.exec(info.build || '');
    const year = match ? Number(match[1]) + 2000 : 0;
    if (year >= 2015 && year <= 2100) return 'Premiere Pro ' + year;
    const known = yearForFormat(info.projectVersion);
    return known ? 'Premiere Pro ' + known : 'Unknown (format ' + info.projectVersion + ')';
  }
  const api = { formats, yearForFormat, sourceLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ProjectVersions = api;
}(typeof window !== 'undefined' ? window : null));
