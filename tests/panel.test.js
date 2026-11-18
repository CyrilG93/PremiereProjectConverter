/* Exercise selection, saving, and opening with CEP-style encoded paths. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const converter = require('../client/converter');
const versions = require('../client/versions');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project converter '));
const source = path.join(dir, 'source project.prproj');
const output = path.join(dir, 'converted project.prproj');
const xml = '<PremiereData Version="3"><Project ObjectID="1" Version="46"/></PremiereData>';
fs.writeFileSync(source, zlib.gzipSync(Buffer.from(xml)));
// The mock matches the macOS file://Volumes style that caused the regression.
function cepUrl(file) { return 'file://' + file.split('/').filter(Boolean).map(encodeURIComponent).join('/'); }
const elements = {};
['version', 'update-banner', 'custom-target', 'status', 'target', 'target-hint', 'host', 'convert', 'choose', 'reference', 'details', 'name', 'source', 'format'].forEach(id => {
  elements[id] = { value: '', textContent: '', hidden: false, disabled: false, handlers: {}, addEventListener(event, fn) { this.handlers[event] = fn; } };
});
let opened = '';
let external = '';
const windowMock = { ProjectConverter: converter, ProjectVersions: versions, ProjectUpdate: { check(https, callback) { callback('v1.0.1', 'https://github.com/CyrilG93/PremiereProjectConverter/releases/latest'); } }, cep: { util: { openURLInDefaultBrowser(url) { external = url; } }, fs: {
  showOpenDialog() { return { err: 0, data: [cepUrl(source)] }; },
  showSaveDialogEx() { return { err: 0, data: cepUrl(output) }; }
} }, __adobe_cep__: { evalScript(script, callback) {
  if (script === 'converterHostVersion()') callback('26.5.2');
  else if (script === 'converterActivePath()') callback('');
  else { opened = script; callback('OK'); }
} } };
try {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../client/main.js'), 'utf8'), { window: windowMock, document: { getElementById(id) { return elements[id]; } }, require, process });
  elements.choose.handlers.click();
  assert.strictEqual(elements.name.textContent, 'source project.prproj');
  assert.strictEqual(elements.format.textContent, 'Premiere Pro 2027');
  assert.strictEqual(elements['update-banner'].hidden, false);
  elements['update-banner'].handlers.click();
  assert.strictEqual(external, 'https://github.com/CyrilG93/PremiereProjectConverter/releases/latest');
  elements.version.handlers.click();
  assert.strictEqual(external, 'https://www.cyrilplugin.com/');
  assert.strictEqual(elements.target.value, '45');
  assert.strictEqual(elements.convert.disabled, false);
  elements.convert.handlers.click();
  assert.strictEqual(converter.inspect(fs.readFileSync(output)).projectVersion, 45);
  assert.ok(opened.includes('converterOpen(') && opened.includes('converted project.prproj'));
  assert.strictEqual(converter.inspect(fs.readFileSync(source)).projectVersion, 46);
  console.log('Panel URL and conversion flow passed.');
} finally {
  if (fs.existsSync(output)) fs.unlinkSync(output);
  fs.unlinkSync(source);
  fs.rmdirSync(dir);
}
