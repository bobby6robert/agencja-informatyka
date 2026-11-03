# Rysuje ikonę aplikacji (lupa na granatowym tle):
#  - aplikacja\zrodlo\ikona.ico (program na Windows)
#  - ikony\*.png (wersja na telefony / PWA)
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Rysuj([int]$r, [bool]$pelne) {
    $bmp = New-Object System.Drawing.Bitmap $r, $r
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $granat = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 33, 61))
    if ($pelne) {
        # Pełne tło (iPhone i Android same zaokrąglają rogi), lupa mniejsza – w „bezpiecznej strefie”.
        $g.FillRectangle($granat, 0, 0, $r, $r)
        $s = $r / 256.0 * 0.78; $o = $r * 0.11
    } else {
        $s = $r / 256.0; $o = 0
        $tlo = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = 80 * $s; $m = 8 * $s; $w = $r - 2 * $m
        $tlo.AddArc($m, $m, $d, $d, 180, 90); $tlo.AddArc($m + $w - $d, $m, $d, $d, 270, 90)
        $tlo.AddArc($m + $w - $d, $m + $w - $d, $d, $d, 0, 90); $tlo.AddArc($m, $m + $w - $d, $d, $d, 90, 90)
        $tlo.CloseFigure()
        $g.FillPath($granat, $tlo)
    }
    $zloty = [System.Drawing.Color]::FromArgb(252, 163, 17)
    $raczka = New-Object System.Drawing.Pen $zloty, ([single](34 * $s))
    $raczka.StartCap = 'Round'; $raczka.EndCap = 'Round'
    $g.DrawLine($raczka, [single]($o + 150 * $s), [single]($o + 150 * $s), [single]($o + 205 * $s), [single]($o + 205 * $s))
    $g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 255, 255, 255))), [single]($o + 58 * $s), [single]($o + 58 * $s), [single](110 * $s), [single](110 * $s))
    $g.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([single](22 * $s))), [single]($o + 58 * $s), [single]($o + 58 * $s), [single](110 * $s), [single](110 * $s))
    $g.Dispose()
    return $bmp
}

function Png($bmp) {
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    return , $ms.ToArray()
}

# --- ikona.ico ---
$rozmiary = 256, 64, 48, 32, 16
$pngi = foreach ($r in $rozmiary) { , (Png (Rysuj $r $false)) }
$f = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $f
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$rozmiary.Count)
$offset = 6 + 16 * $rozmiary.Count
for ($i = 0; $i -lt $rozmiary.Count; $i++) {
    $r = $rozmiary[$i]; $b = if ($r -ge 256) { 0 } else { $r }
    $bw.Write([byte]$b); $bw.Write([byte]$b); $bw.Write([byte]0); $bw.Write([byte]0)
    $bw.Write([uint16]1); $bw.Write([uint16]32); $bw.Write([uint32]$pngi[$i].Length); $bw.Write([uint32]$offset)
    $offset += $pngi[$i].Length
}
foreach ($p in $pngi) { $bw.Write($p) }
[System.IO.File]::WriteAllBytes((Join-Path $root 'aplikacja\zrodlo\ikona.ico'), $f.ToArray())

# --- ikony PWA ---
$ikony = Join-Path $root 'ikony'
New-Item -ItemType Directory -Force $ikony | Out-Null
(Rysuj 192 $false).Save((Join-Path $ikony 'ikona-192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(Rysuj 512 $false).Save((Join-Path $ikony 'ikona-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(Rysuj 512 $true).Save((Join-Path $ikony 'ikona-maskable-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(Rysuj 180 $true).Save((Join-Path $ikony 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Zapisano ikona.ico oraz ikony PWA w folderze ikony"
