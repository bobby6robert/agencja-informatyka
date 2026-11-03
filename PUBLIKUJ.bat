@echo off
chcp 65001 >nul
title Publikowanie poprawek - Agencja Cyfrowych Detektywow
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0narzedzia\publikuj.ps1"
echo.
pause
