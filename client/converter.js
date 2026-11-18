/* Convert supported Premiere projects while preserving all other XML bytes. */
'use strict';
const zlib = require('zlib');
const crypto = require('crypto');

// Locate the main project definition, never a nested Project reference.
function inspect(input) {
  const data = zlib.gunzipSync(input);
  const xml = data.toString('utf8');
  if (!Buffer.from(xml, 'utf8').equals(data) || !/^\s*(?:<\?xml[^?]*\?>\s*)?<PremiereData\b/.test(xml)) throw new Error('Format de projet XML non reconnu.');
  const matches = [...xml.matchAll(/<Project\s+[^>]*\bObjectID\s*=\s*(["'])1\1[^>]*>/g)];
  if (matches.length !== 1) throw new Error('Impossible de trouver le projet principal de manière unique.');
  const tag = matches[0][0];
  const version = /\bVersion\s*=\s*(["'])(\d+)\1/.exec(tag);
  if (!version) throw new Error('Version du projet introuvable.');
  const build = /<MZ\.BuildVersion\.Modified>([^<]*)<\/MZ\.BuildVersion\.Modified>/.exec(xml);
  return { xml, tag, projectVersion: Number(version[2]), build: build ? build[1].trim() : '', hash: crypto.createHash('sha256').update(input).digest('hex') };
}

// Only the empirically tested 2027-to-2026 route is currently enabled.
function convert(info) {
  if (info.projectVersion !== 46) throw new Error('Seuls les projets au format 46 sont pris en charge.');
  const modified = info.tag.replace(/(\bVersion\s*=\s*["'])46(["'])/, '$145$2');
  if (modified === info.tag) throw new Error('Modification de version impossible.');
  return zlib.gzipSync(Buffer.from(info.xml.replace(info.tag, modified), 'utf8'));
}
if (typeof module !== 'undefined' && module.exports) module.exports = { inspect, convert };
if (typeof window !== 'undefined') window.ProjectConverter = { inspect, convert };
