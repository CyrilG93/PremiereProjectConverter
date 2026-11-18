// Return the running Premiere version to the panel.
function converterHostVersion() {
    try { return String(app.version); } catch (error) { return ''; }
}
// Open the converted copy and report Premiere's result without suppressing dialogs.
function converterOpen(path) {
    try { return app.openDocument(path) ? 'OK' : 'FAILED'; }
    catch (error) { return 'ERROR: ' + String(error); }
}
