# Publikuje poprawki: przelicza manifest.json (lista plików + sumy kontrolne),
# podbija numer wersji i wysyła wszystko na GitHub. Uczniowie dostaną zmiany przy następnym uruchomieniu.
param([string]$Opis, [switch]$BezWysylania)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Blad($tekst) { Write-Host ""; Write-Host "BŁĄD: $tekst" -ForegroundColor Red; exit 1 }
function J($s) { $s | ConvertTo-Json -Compress }

# 1. Kontrola menu.json
try { $menuTekst = [IO.File]::ReadAllText((Join-Path $root 'menu.json'), [Text.Encoding]::UTF8); $menu = $menuTekst | ConvertFrom-Json }
catch { Blad "plik menu.json ma błąd składni (brakujący przecinek, cudzysłów lub nawias?)." }
foreach ($k in $menu.klasy) { foreach ($p in $k.pozycje) {
    $sc = if ($p.typ -eq 'folder') { $p.folder } else { $p.plik }
    if (-not (Test-Path (Join-Path $root $sc))) { Blad "menu.json wskazuje na '$sc', a takiego pliku/folderu nie ma." }
} }

# 2. Zabezpieczenie: materiały nauczyciela nie mogą trafić na GitHub
$podejrzane = Get-ChildItem tresc -Recurse -File | Where-Object { $_.Name -match 'hasl|\.gs$|DLA-NAUCZYCIELA' -or $_.FullName -match 'DLA-NAUCZYCIELA' }
if ($podejrzane) { Blad ("w folderze 'tresc' są pliki wyglądające na materiały nauczyciela:`n" + ($podejrzane.FullName -join "`n")) }

if (-not $Opis) { $Opis = Read-Host 'Co zmieniłeś? (krótko – uczniowie zobaczą ten opis)' }
if (-not $Opis) { $Opis = 'poprawki' }

# 3. Manifest
$stary = $null
if (Test-Path manifest.json) { $stary = [IO.File]::ReadAllText((Join-Path $root 'manifest.json'), [Text.Encoding]::UTF8) | ConvertFrom-Json }
$wersja = if ($stary) { [int]$stary.wersja + 1 } else { 1 }

$exe = 'aplikacja/Agencja Cyfrowych Detektywów.exe'
if (-not (Test-Path $exe)) { Blad "brak pliku $exe – uruchom narzedzia\zbuduj-aplikacje.bat" }
$kod = [IO.File]::ReadAllText((Join-Path $root 'aplikacja\zrodlo\Program.cs'), [Text.Encoding]::UTF8)
$wersjaAplikacji = [regex]::Match($kod, 'WersjaAplikacji\s*=\s*(\d+)').Groups[1].Value
$hashExe = (Get-FileHash -Algorithm SHA256 $exe).Hash.ToLower()

Write-Host "Liczę sumy kontrolne plików..."
$pliki = Get-ChildItem tresc -Recurse -File | Sort-Object FullName | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
    $h = (Get-FileHash -Algorithm SHA256 $_.FullName).Hash.ToLower()
    '    {"p":' + (J $rel) + ',"h":"' + $h + '","r":' + $_.Length + '}'
}

$json = "{`n" +
    '  "wersja": ' + $wersja + ",`n" +
    '  "data": ' + (J (Get-Date -Format 'yyyy-MM-dd HH:mm')) + ",`n" +
    '  "opis": ' + (J $Opis) + ",`n" +
    '  "wersjaAplikacji": ' + $wersjaAplikacji + ",`n" +
    '  "plikAplikacji": ' + (J $exe) + ",`n" +
    '  "hashAplikacji": "' + $hashExe + "`",`n" +
    '  "menu": ' + $menuTekst.Trim() + ",`n" +
    "  `"pliki`": [`n" + ($pliki -join ",`n") + "`n  ]`n}`n"
$null = $json | ConvertFrom-Json  # sprawdzenie poprawności
[IO.File]::WriteAllText((Join-Path $root 'manifest.json'), $json, (New-Object Text.UTF8Encoding $false))
Write-Host "manifest.json: wersja $wersja, plików: $(@($pliki).Count)"

if ($BezWysylania) { exit 0 }

# 4. Wysyłka na GitHub
git add -A
if ($LASTEXITCODE) { Blad "git add nie powiódł się." }
git commit -q -m "Wersja ${wersja}: $Opis"
if ($LASTEXITCODE) { Blad "git commit nie powiódł się." }
Write-Host "Wysyłam na GitHub (przy pierwszym razie może pojawić się okno logowania)..."
git push -q
if ($LASTEXITCODE) { Blad "wysyłka na GitHub nie powiodła się – sprawdź internet i spróbuj ponownie (PUBLIKUJ.bat)." }
Write-Host ""
Write-Host "GOTOWE – wersja $wersja opublikowana. Uczniowie dostaną ją przy następnym uruchomieniu aplikacji." -ForegroundColor Green
Write-Host "(GitHub może potrzebować do 5 minut, zanim zmiana będzie widoczna.)"
