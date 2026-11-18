@echo off
setlocal
REM Install for the current user without administrator privileges.
set "TARGET=%APPDATA%\Adobe\CEP\extensions\com.cyrilplugin.PremiereProjectConverter"
if not defined APPDATA goto failed
if not exist "%TARGET%" mkdir "%TARGET%"
if errorlevel 1 goto failed
for %%D in (CSXS client host) do (
  xcopy "%~dp0%%D" "%TARGET%\%%D\" /E /I /Y /Q >nul
  if errorlevel 1 goto failed
)
REM Enable CEP developer mode for recent Adobe releases.
for /L %%V in (7,1,20) do (
  reg add "HKCU\Software\Adobe\CSXS.%%V" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
  if errorlevel 1 goto failed
)
echo Installation terminee. Redemarrez Premiere 2026 puis ouvrez Fenetre ^> Extensions ^> Project Converter.
if /I not "%~1"=="--no-pause" pause
exit /b 0
:failed
echo Echec de l'installation.
if /I not "%~1"=="--no-pause" pause
exit /b 1
