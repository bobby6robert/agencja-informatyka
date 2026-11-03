# Rysuje ikonę aplikacji (lupa na granatowym tle) i zapisuje aplikacja\zrodlo\ikona.ico
Add-Type -AssemblyName System.Drawing
$cel = Join-Path $PSScriptRoot '..\aplikacja\zrodlo\ikona.ico'
$rozmiary = 256, 64, 48, 32, 16
$pngi = foreach ($r in $rozmiary) {
    $bmp = New-Object System.Drawing.Bitmap $r, $r
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $s = $r / 256.0
    $tlo = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = 80 * $s; $m = 8 * $s; $w = $r - 2 * $m
    $tlo.AddArc($m, $m, $d, $d, 180, 90); $tlo.AddArc($m + $w - $d, $m, $d, $d, 270, 90)
    $tlo.AddArc($m + $w - $d, $m + $w - $d, $d, $d, 0, 90); $tlo.AddArc($m, $m + $w - $d, $d, $d, 90, 90)
    $tlo.CloseFigure()
    $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 33, 61))), $tlo)
    $zloty = [System.Drawing.Color]::FromArgb(252, 163, 17)
    $raczka = New-Object System.Drawing.Pen $zloty, ([single](34 * $s))
    $raczka.StartCap = 'Round'; $raczka.EndCap = 'Round'
    $g.DrawLine($raczka, [single](150 * $s), [single](150 * $s), [single](205 * $s), [single](205 * $s))
    $g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 255, 255, 255))), [single](58 * $s), [single](58 * $s), [single](110 * $s), [single](110 * $s))
    $g.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([single](22 * $s))), [single](58 * $s), [single](58 * $s), [single](110 * $s), [single](110 * $s))
    $g.Dispose()
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    , $ms.ToArray()
}
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
[System.IO.File]::WriteAllBytes($cel, $f.ToArray())
Write-Host "Zapisano $cel"
