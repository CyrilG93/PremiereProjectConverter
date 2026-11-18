/* Verify format conversion and file URL handling for local and network paths. */
'use strict';
const assert = require('assert');
const zlib = require('zlib');
const converter = require('../client/converter');
const xml = '<?xml version="1.0"?><PremiereData Version="3"><Project ObjectRef="1"/><Project ObjectID="1" ClassID="abc" Version="46"><MZ.BuildVersion.Modified>27.0.0x88</MZ.BuildVersion.Modified><Clip Version="19"/></Project></PremiereData>';
const input = zlib.gzipSync(Buffer.from(xml));
const info = converter.inspect(input);
assert.strictEqual(info.projectVersion, 46);
assert.strictEqual(info.build, '27.0.0x88');
for (const target of [45, 43, 1]) {
  const output = zlib.gunzipSync(converter.convert(info, target)).toString();
  assert.strictEqual(output, xml.replace('Version="46"', 'Version="' + target + '"'));
}
for (const target of [46, 47, 0, -1, 2.5, NaN]) assert.throws(() => converter.convert(info, target));
assert.throws(() => converter.inspect(Buffer.from('bad')));
assert.throws(() => converter.inspect(zlib.gzipSync(Buffer.from('<PremiereData><Project ObjectRef="1"/></PremiereData>'))));
assert.strictEqual(converter.nativePath('file://Volumes/EDITING%202026/test%20%C3%A9.prproj', 'darwin'), '/Volumes/EDITING 2026/test é.prproj');
assert.strictEqual(converter.nativePath('file:///Volumes/EDITING%202026/test.prproj', 'darwin'), '/Volumes/EDITING 2026/test.prproj');
assert.strictEqual(converter.nativePath('file://localhost/Volumes/test.prproj', 'darwin'), '/Volumes/test.prproj');
assert.strictEqual(converter.nativePath('/Volumes/a%20b.prproj', 'darwin'), '/Volumes/a%20b.prproj');
assert.strictEqual(converter.nativePath('file:///C:/My%20Files/test.prproj', 'win32'), 'C:\\My Files\\test.prproj');
assert.strictEqual(converter.nativePath('file://NAS/Share%20Name/test.prproj', 'win32'), '\\\\NAS\\Share Name\\test.prproj');
assert.strictEqual(converter.nativePath('\\\\NAS\\Share\\test.prproj', 'win32'), '\\\\NAS\\Share\\test.prproj');
console.log('Converter and file URL tests passed.');
