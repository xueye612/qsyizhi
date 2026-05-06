Add-Type -AssemblyName System.IO.Compression.FileSystem
$src  = 'E:\code\qsyizhi\vue-arco-admin\dist'
$dest = 'E:\code\qsyizhi\dist-deploy.zip'
if (Test-Path $dest) { Remove-Item $dest }
$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')
Get-ChildItem -Recurse -File $src | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1) -replace '\\','/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, 'Optimal') | Out-Null
    Write-Host $rel
}
$zip.Dispose()
Write-Host "=== Done: $dest ==="
