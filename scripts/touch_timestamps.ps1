param([string]$targetDir, [string]$filter = "*")
if (Test-Path $targetDir) {
  Get-ChildItem -Path $targetDir -Filter $filter -File | ForEach-Object { $_.CreationTime = Get-Date; $_.LastWriteTime = Get-Date }
}
