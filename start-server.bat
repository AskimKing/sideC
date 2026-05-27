@echo off
title Oasis Media Productions — Lokaler Server
color 0E
echo.
echo  =========================================
echo   OASIS MEDIA PRODUCTIONS
echo   Lokaler Webserver wird gestartet...
echo  =========================================
echo.
echo  Browser wird automatisch geoeffnet...
echo  Zum Beenden: Strg + C druecken
echo.
cd /d "%~dp0"

:: Browser automatisch öffnen (nach kurzer Verzögerung)
start "" cmd /c "timeout /t 2 >nul && start http://localhost:8000"

:: Versuche Python 3
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    :: Versuche Python 2
    python -m SimpleHTTPServer 8000 2>nul
    if %errorlevel% neq 0 (
        :: Versuche Node.js
        npx serve . -p 8000 2>nul
        if %errorlevel% neq 0 (
            echo.
            echo  FEHLER: Python oder Node.js nicht gefunden.
            echo  Bitte installiere Python: https://python.org
            echo.
            pause
        )
    )
)
