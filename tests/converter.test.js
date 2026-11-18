/* Verify safe conversion of the format and preservation of unrelated XML. */
'use strict';
const assert = require('assert');
const zlib = require('zlib');
const converter = require('../client/converter');
const xml = '<?xml version="1.0"?><PremiereData Version="3"><Project ObjectRef="1"/><Project ObjectID="1" ClassID="abc" Version="46"><MZ.BuildVersion.Modified>27.0.0x88</MZ.BuildVersion.Modified><Clip Version="19"/></Project></PremiereData>';
const input = zlib.gzipSync(Buffer.from(xml));
const info = converter.inspect(input);
assert.strictEqual(info.projectVersion, 46);
assert.strictEqual(info.build, '27.0.0x88');
const output = zlib.gunzipSync(converter.convert(info)).toString();
assert.strictEqual(output, xml.replace('Version="46"', 'Version="45"'));
assert.throws(() => converter.convert(converter.inspect(zlib.gzipSync(Buffer.from(output)))), /format 46/);
assert.throws(() => converter.inspect(Buffer.from('bad')));
assert.throws(() => converter.inspect(zlib.gzipSync(Buffer.from('<PremiereData><Project ObjectRef="1"/></PremiereData>'))));
console.log('Converter tests passed.');
