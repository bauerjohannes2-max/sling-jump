param([string]$targetDir); Get-ChildItem -Path $targetDir -File | ForEach-Object { $_.CreationTime = Get-Date; $_.LastWriteTime = Get-Date }
