@echo off
rem Kompiluje "Agencja Cyfrowych Detektywow.exe" kompilatorem wbudowanym w Windows (.NET Framework 4).
rem Uruchamiaj tylko po zmianie aplikacja\zrodlo\Program.cs (pamietaj zwiekszyc WersjaAplikacji).
chcp 65001 >nul
setlocal
set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist "%CSC%" set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
set "SRC=%~dp0..\aplikacja\zrodlo"
"%CSC%" /nologo /codepage:65001 /optimize+ /target:winexe /platform:anycpu ^
  /win32icon:"%SRC%\ikona.ico" /win32manifest:"%SRC%\app.manifest" ^
  /r:System.Web.Extensions.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll ^
  /out:"%~dp0..\aplikacja\Agencja Cyfrowych Detektywów.exe" "%SRC%\Program.cs"
if errorlevel 1 (echo. & echo BLAD KOMPILACJI & exit /b 1)
echo Zbudowano: aplikacja\Agencja Cyfrowych Detektywów.exe
