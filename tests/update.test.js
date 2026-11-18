/* Verify release comparison, update responses and unsupported versions. */
'use strict';
const assert = require('assert');
const EventEmitter = require('events');
const update = require('../client/update');
const versions = require('../client/versions');
assert.strictEqual(update.isNewer('v0.1.10', '0.1.3'), true);
assert.strictEqual(update.isNewer('v0.1.2', '0.1.3'), false);
assert.strictEqual(update.isNewer('v0.1.3', '0.1.3'), false);
assert.strictEqual(update.isNewer('v2.0.0-beta', '0.1.3'), false);
assert.strictEqual(versions.sourceLabel({ projectVersion: 46, build: '27.0.0x88' }), 'Premiere Pro 2027');
assert.strictEqual(versions.sourceLabel({ projectVersion: 45, build: '' }), 'Premiere Pro 2026');
assert.strictEqual(versions.sourceLabel({ projectVersion: 99, build: '' }), 'Unknown (format 99)');
assert.strictEqual(versions.yearForFormat(43), '2025');
function fakeHttps(status, payload) {
  return { request(options, handler) {
    const request = new EventEmitter();
    request.setTimeout = function () {};
    request.destroy = function () {};
    request.end = function () {
      const response = new EventEmitter(); response.statusCode = status; handler(response);
      response.emit('data', JSON.stringify(payload)); response.emit('end');
    };
    return request;
  } };
}
let result = '';
update.check(fakeHttps(200, { tag_name: 'v1.0.1', draft: false, prerelease: false }), (tag, url) => { result = tag + ' ' + url; });
assert.strictEqual(result, 'v1.0.1 ' + update.RELEASE_URL);
result = '';
update.check(fakeHttps(404, {}), () => { result = 'unexpected'; });
update.check(fakeHttps(200, { tag_name: 'v1.0.1', prerelease: true }), () => { result = 'unexpected'; });
assert.strictEqual(result, '');
console.log('Update and release version tests passed.');
