$ErrorActionPreference = 'Stop'
$artifactRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $artifactRoot '..')).Path
$boundary = $artifactRoot.TrimEnd('\') + '\'
$outputRoots = @('ui-ux-v2', 'ui-ux-correction', 'share-equipment-20261015', 'operation-optimization', 'official-import', 'register-heading', 'register-tools', 'register-readability', 'register-search', 'register-integration', 'register-overview', 'register-share', 'register-overview-tabs', 'register-tabs', 'role-workspace-redesign')
$allArtifactFiles = @(Get-ChildItem -LiteralPath $artifactRoot -Recurse -File -Force)
$beforeBytes = ($allArtifactFiles | Measure-Object -Property Length -Sum).Sum
$candidates = @($allArtifactFiles | Where-Object {
    $relative = $_.FullName.Substring($artifactRoot.Length + 1).Replace('\', '/')
    $group = $relative.Split('/')[0]
    $outputRoots -contains $group -and $_.Extension -in @('.png', '.jpg', '.jpeg', '.webp', '.gif') -and $relative -notmatch '(?i)baseline' -and $_.BaseName -notmatch '(?i)(?:^|[-_])(?:before|original)(?:$|[-_])' -and -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint)
})
$deleting = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $candidates) {
    $absolute = [IO.Path]::GetFullPath($file.FullName)
    if (-not $absolute.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase)) { throw '目标越出artifacts，停止' }
    [void]$deleting.Add($absolute)
}
# 对目录外文件只读校验，不创建、修改或删除目录外文件。
$outsideFiles = @(Get-ChildItem -LiteralPath $workspaceRoot -Force | Where-Object { $_.Name -notin @('artifacts', '.git', '.idea', 'node_modules') } | ForEach-Object {
    if ($_.PSIsContainer) { Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Force } else { $_ }
})
# 运行中预览服务持有日志句柄，日志不删除、不校验内容快照。
$protected = @($outsideFiles + @($allArtifactFiles | Where-Object { -not $deleting.Contains($_.FullName) -and $_.Extension -ne '.log' }))
$hashes = @{}
foreach ($file in $protected) { $hashes[$file.FullName] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash }
$tracked = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
git -C $workspaceRoot -c core.quotepath=false ls-files -- artifacts | ForEach-Object { [void]$tracked.Add($_) }
if ($LASTEXITCODE -ne 0) { throw '无法读取跟踪清单' }
$entries = @($candidates | ForEach-Object {
    $relative = $_.FullName.Substring($workspaceRoot.Length + 1).Replace('\', '/')
    [pscustomobject]@{ Path = $_.FullName; Relative = $relative; Bytes = $_.Length; Tracked = $tracked.Contains($relative); Sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
})
$reportPath = Join-Path $artifactRoot 'cleanup-png-20261015.json'
if (Test-Path -LiteralPath $reportPath) { throw '已有本轮记录，不覆盖；请先检查执行状态' }
$report = [ordered]@{ Date = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'); Scope = $artifactRoot; BeforeBytes = $beforeBytes; Files = $entries; DeletedFiles = 0; FreedBytes = 0; ProtectedFiles = $hashes.Count; OutsideFilesVerified = $false; RetainedFilesVerified = $false; Note = '只删除确认可重建的历史截图；保留基准、OCR目录、源代码与结果记录。旧文档中的截图链接可能失效。' }
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding utf8
# 原生PowerShell逐文件删除，禁止递归删除整个历史目录。
foreach ($entry in $entries) {
    $resolved = (Resolve-Path -LiteralPath $entry.Path).Path
    if (-not $resolved.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase)) { throw '删除前路径校验失败' }
    Remove-Item -LiteralPath $resolved -Force
    $report.DeletedFiles++
    $report.FreedBytes += $entry.Bytes
}
foreach ($entry in $hashes.GetEnumerator()) {
    if (-not (Test-Path -LiteralPath $entry.Key)) { throw ('受保护文件缺失：' + $entry.Key) }
    if ((Get-FileHash -LiteralPath $entry.Key -Algorithm SHA256).Hash -ne $entry.Value) { throw ('受保护文件被修改：' + $entry.Key) }
}
$report.OutsideFilesVerified = $true
$report.RetainedFilesVerified = $true
$report.AfterBytes = (Get-ChildItem -LiteralPath $artifactRoot -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding utf8
[pscustomobject]@{ DeletedFiles = $report.DeletedFiles; TrackedDeletedFiles = @($entries | Where-Object Tracked).Count; FreedMiB = [Math]::Round($report.FreedBytes / 1MB, 2); BeforeMiB = [Math]::Round($beforeBytes / 1MB, 2); AfterMiB = [Math]::Round($report.AfterBytes / 1MB, 2); ProtectedFilesVerified = $hashes.Count; OutsideFilesUnchanged = $true } | ConvertTo-Json
