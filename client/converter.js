/* Inspect and adjust the primary project format while preserving other XML bytes. */
'use strict';
const zlib = require('zlib');
const crypto = require('crypto');

// Convert CEP file URLs to native paths, including macOS volumes and Windows UNC shares.
function nativePath(value, platform) {
  if (!/^file:\/\//i.test(value)) return value;
  let rest = value.replace(/^file:\/\//i, '');
  rest = decodeURIComponent(rest);
  if (platform === 'win32') {
    if (/^localhost\//i.test(rest)) rest = rest.replace(/^localhost/i, '');
    if (/^\/[a-z]:\//i.test(rest)) rest = rest.slice(1);
    else if (/^[a-z]:\//i.test(rest)) { /* Already a drive path. */ }
    else if (/^\//.test(rest)) rest = rest.replace(/^\/+/, '//');
    else rest = '//' + rest;
    return rest.replace(/\//g, '\\');
  }
  if (/^localhost\//i.test(rest)) rest = rest.slice('localhost'.length);
  return rest.charAt(0) === '/' ? rest : '/' + rest;
}

// Locate the main project definition, never a nested Project reference.
function inspect(input) {
  const data = zlib.gunzipSync(input);
  const xml = data.toString('utf8');
  if (!Buffer.from(xml, 'utf8').equals(data) || !/^\s*(?:<\?xml[^?]*\?>\s*)?<PremiereData\b/.test(xml)) throw new Error('Unrecognized project XML format.');
  const matches = [...xml.matchAll(/<Project\s+[^>]*\bObjectID\s*=\s*(["'])1\1[^>]*>/g)];
  if (matches.length !== 1) throw new Error('Could not uniquely identify the main project.');
  const tag = matches[0][0];
  const version = /\bVersion\s*=\s*(["'])(\d+)\1/.exec(tag);
  if (!version) throw new Error('Project format version not found.');
  const build = /<MZ\.BuildVersion\.Modified>([^<]*)<\/MZ\.BuildVersion\.Modified>/.exec(xml);
  return { xml, tag, projectVersion: Number(version[2]), build: build ? build[1].trim() : '', hash: crypto.createHash('sha256').update(input).digest('hex') };
}

// Change only the main format number; other compatibility changes are not inferred.
function convert(info, target) {
  if (!Number.isSafeInteger(target) || target < 1 || target >= info.projectVersion) throw new Error('The target format must be a positive number lower than the source format.');
  const modified = info.tag.replace(/(\bVersion\s*=\s*["'])(\d+)(["'])/, function (_, prefix, value, suffix) { return prefix + target + suffix; });
  if (modified === info.tag) throw new Error('Could not change the project format.');
  return zlib.gzipSync(Buffer.from(info.xml.replace(info.tag, modified), 'utf8'));
}
if (typeof module !== 'undefined' && module.exports) module.exports = { inspect, convert, nativePath };
if (typeof window !== 'undefined') window.ProjectConverter = { inspect, convert, nativePath };
