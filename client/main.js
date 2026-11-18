/* Coordinate project selection, format detection and Premiere's host bridge. */
'use strict';
(function () {
  const fs = require('fs');
  const path = require('path');
  const converter = window.ProjectConverter;
  const $ = id => document.getElementById(id);
  let selection = null;
  let hostVersion = '';
  let targetTouched = false;
  let targetFromProject = false;
  const status = (message, error) => { $('status').textContent = message; $('status').className = error ? 'error' : ''; };
  // CEP may return an encoded file URI for either dialog; normalize both.
  function local(value) { return converter.nativePath(value, process.platform); }
  function host(script, callback) { window.__adobe_cep__.evalScript(script, callback); }
  function targetVersion() { const value = $('target').value; return /^\d+$/.test(value) ? Number(value) : NaN; }
  function refresh() { $('convert').disabled = !(selection && Number.isSafeInteger(targetVersion()) && targetVersion() > 0 && targetVersion() < selection.info.projectVersion); }
  function chooseProject(title) {
    const result = window.cep.fs.showOpenDialog(false, false, title, '', ['prproj']);
    if (result.err) throw new Error('File selection failed (code ' + result.err + ').');
    return result.data && result.data.length ? local(result.data[0]) : '';
  }
  host('converterHostVersion()', function (value) {
    hostVersion = value && value !== 'EvalScript error.' ? value : '';
    $('host').textContent = hostVersion ? 'Current Premiere: ' + hostVersion : 'Current Premiere version unavailable.';
    // Known format mappings are suggestions; a saved reference is more reliable.
    const known = { 24: 42, 25: 43, 26: 45, 27: 46 };
    const suggested = known[parseInt(hostVersion, 10)];
    if (suggested && !targetTouched && !targetFromProject) {
      $('target').value = String(suggested);
      $('target-hint').textContent = 'Suggested for this Premiere version; verify with a reference project.';
      refresh();
    }
  });
  // Prefer an actual project saved in the host to avoid guessing format mappings.
  host('converterActivePath()', function (value) {
    if (!value || value === 'EvalScript error.' || targetTouched) return;
    try {
      const format = converter.inspect(fs.readFileSync(local(value))).projectVersion;
      targetFromProject = true;
      $('target').value = String(format);
      $('target-hint').textContent = 'Detected from the active saved project. You can change it.';
      refresh();
    } catch (_) { /* An unsaved or inaccessible project requires a reference. */ }
  });
  $('target').addEventListener('input', function () { targetTouched = true; refresh(); });
  $('reference').addEventListener('click', function () {
    try {
      const selected = chooseProject('Choose a project saved in your current Premiere version');
      if (!selected) return;
      $('target').value = String(converter.inspect(fs.readFileSync(selected)).projectVersion);
      targetTouched = true;
      $('target-hint').textContent = 'Detected from reference: ' + path.basename(selected);
      refresh();
    } catch (error) { status('Could not read reference project: ' + error.message, true); }
  });
  $('choose').addEventListener('click', function () {
    try {
      const selected = chooseProject('Choose a Premiere project');
      if (!selected) return;
      selection = null; refresh(); $('details').hidden = true;
      const info = converter.inspect(fs.readFileSync(selected));
      selection = { path: selected, info: info };
      $('name').textContent = path.basename(selected);
      $('source').textContent = info.build || 'Unknown';
      $('format').textContent = String(info.projectVersion);
      $('details').hidden = false;
      status('Choose a lower target format, then convert the copy.');
      refresh();
    } catch (error) { selection = null; refresh(); status('Could not read project: ' + error.message, true); }
  });
  $('convert').addEventListener('click', function () {
    if (!selection || $('convert').disabled) return;
    try {
      const original = fs.readFileSync(selection.path);
      if (converter.inspect(original).hash !== selection.info.hash) throw new Error('The source project changed. Please select it again.');
      const parsed = path.parse(selection.path);
      const suggested = parsed.name + '_converted.prproj';
      const result = window.cep.fs.showSaveDialogEx('Save converted copy', parsed.dir, ['prproj'], suggested);
      if (result.err) throw new Error('Save dialog failed (code ' + result.err + ').');
      if (!result.data) return;
      let destination = local(result.data);
      if (!/\.prproj$/i.test(destination)) destination += '.prproj';
      // Exclusive creation protects the original and all existing files.
      fs.writeFileSync(destination, converter.convert(selection.info, targetVersion()), { flag: 'wx' });
      status('Copy created: ' + destination + '\nOpening in Premiere…');
      $('convert').disabled = true;
      host('converterOpen(' + JSON.stringify(destination).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ')', function (answer) {
        refresh();
        if (answer === 'OK') status('Copy created and opened: ' + destination);
        else status('Copy created, but automatic opening was not confirmed. Open it manually:\n' + destination + '\n' + (answer || ''), true);
      });
    } catch (error) { status('Conversion failed: ' + (error.code === 'EEXIST' ? 'This file already exists. Choose another name.' : error.message), true); }
  });
}());
