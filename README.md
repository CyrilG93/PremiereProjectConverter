# Premiere Project Converter

A CEP extension that creates a copy of a newer Premiere Pro project for opening in an older version. The original file is preserved.

The extension changes the project's format number; it does not translate features or effects. Conversions may fail or lose functionality, especially across major versions. Check the sequences, media, titles and effects after opening. One project saved in Premiere 27.0 was successfully opened in Premiere 26.5.2 using this method; other projects and versions may behave differently.

## Install

Download the latest release ZIP from the [GitHub releases page](https://github.com/CyrilG93/PremiereProjectConverter/releases/latest) and extract it. Close Premiere Pro, then run the signed `ProjectConverter.pkg` on macOS or `install_windows.bat` on Windows. Restart Premiere and open **Window > Extensions > Project Converter**.

The installer enables CEP developer mode to load the extension. On Mac, the included `install_mac.sh` can also launch the installer from Terminal. Python and other external dependencies are not required.

## Use

1. Open the panel in the Premiere version you want to use, and choose the newer `.prproj` file.
2. Check the **Target Premiere version**. The panel reads it from the active saved project when possible, or suggests a version based on Premiere. To verify it, choose a reference `.prproj` saved in your current Premiere version. For unlisted versions, choose **Other format** and enter the project format number.
3. Click **Convert and open** and select a new name and location. Existing files cannot be overwritten.
4. Reconnect media if Premiere asks, and check your edit. If automatic opening fails, open the saved copy shown in the panel manually.

When a newer GitHub release is available, a banner links to its release page. The version number opens cyrilplugin.com.

The target format must be lower than the source format. The extension uses Premiere's CEP interface, so it requires a Premiere version that supports CEP extensions.

## Changelog

### 1.0.0 — 18 November 2026

- First public release: convert a project copy for an earlier version of Premiere, then open it directly.
- Identify the source and target versions, and check for new releases from the panel.
