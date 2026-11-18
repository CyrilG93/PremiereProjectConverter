/* Coordinate file selection, safe conversion and Premiere's host bridge. */
'use strict';
(function () {
  const fs = require('fs');
  const path = require('path');
  const converter = window.ProjectConverter;
  const $ = id => document.getElementById(id);
  let selection = null;
  let hostVersion = '';
  const status = (message, error) => { $('status').textContent = message; $('status').className = error ? 'error' : ''; };
  // Send an expression to ExtendScript and collect its string response.
  function host(script, callback) { window.__adobe_cep__.evalScript(script, callback); }
  function refresh() { $('convert').disabled = !(selection && selection.info.projectVersion === 46 && /^26\./.test(hostVersion)); }
  host('converterHostVersion()', function (value) { hostVersion = value || ''; $('target').textContent = /^26\./.test(hostVersion) ? 'Premiere ' + hostVersion + ' · format 45' : 'Premiere 2026 requis'; refresh(); });
  $('choose').addEventListener('click', function () {
    try {
      const result = window.cep.fs.showOpenDialog(false, false, 'Choisir un projet Premiere', '', ['prproj']);
      if (result.err) throw new Error('Sélection impossible (code ' + result.err + ').');
      if (!result.data || !result.data.length) return;
      selection = null; refresh(); $('details').hidden = true;
      const selectedPath = result.data[0];
      const info = converter.inspect(fs.readFileSync(selectedPath));
      selection = { path: selectedPath, info: info };
      $('name').textContent = path.basename(selectedPath);
      $('source').textContent = info.build || 'Version inconnue';
      $('format').textContent = String(info.projectVersion);
      $('details').hidden = false;
      status(info.projectVersion === 46 ? 'Prêt à convertir une copie.' : 'Ce format n’est pas pris en charge. Seul le format 46 est disponible.', info.projectVersion !== 46);
      refresh();
    } catch (error) { selection = null; refresh(); status('Lecture impossible : ' + error.message, true); }
  });
  $('convert').addEventListener('click', function () {
    if (!selection || $('convert').disabled) return;
    try {
      const original = fs.readFileSync(selection.path);
      if (converter.inspect(original).hash !== selection.info.hash) throw new Error('Le projet a changé depuis sa sélection. Sélectionnez-le à nouveau.');
      const parsed = path.parse(selection.path);
      const suggested = parsed.name + '_Premiere_2026.prproj';
      const result = window.cep.fs.showSaveDialogEx('Enregistrer la copie convertie', parsed.dir, ['prproj'], suggested);
      if (result.err) throw new Error('Enregistrement impossible (code ' + result.err + ').');
      if (!result.data) return;
      let destination = result.data;
      if (!/\.prproj$/i.test(destination)) destination += '.prproj';
      // Exclusive creation protects both the source and any existing project.
      fs.writeFileSync(destination, converter.convert(selection.info), { flag: 'wx' });
      status('Copie créée : ' + destination + '\nOuverture dans Premiere…');
      $('convert').disabled = true;
      host('converterOpen(' + JSON.stringify(destination).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ')', function (answer) {
        refresh();
        if (answer === 'OK') status('Copie créée et demande d’ouverture envoyée :\n' + destination);
        else status('Copie créée, mais l’ouverture automatique n’a pas été confirmée. Ouvrez ce fichier manuellement :\n' + destination + '\n' + (answer || ''), true);
      });
    } catch (error) { status('Conversion impossible : ' + (error.code === 'EEXIST' ? 'Ce fichier existe déjà. Choisissez un autre nom.' : error.message), true); }
  });
}());
