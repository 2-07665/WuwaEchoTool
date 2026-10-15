$ErrorActionPreference = 'Stop'
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$artifactRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$boundary = $artifactRoot.TrimEnd('\') + '\'
$tracked = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
git -C $workspaceRoot -c core.quotepath=false ls-files -- artifacts | ForEach-Object { [void]$tracked.Add($_) }
if ($LASTEXITCODE -ne 0) { throw '无法读取Git跟踪清单，停止清理' }
$allFiles = @(Get-ChildItem -LiteralPath $artifactRoot -Recurse -File -Force)
$beforeBytes = ($allFiles | Measure-Object -Property Length -Sum).Sum
$candidates = [Collections.Generic.List[object]]::new()
foreach ($file in $allFiles) {
    $absolute = [IO.Path]::GetFullPath($file.FullName)
    if (-not $absolute.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase)) { throw '目标越出artifacts，停止' }
    if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
    $relative = $absolute.Substring($workspaceRoot.Length + 1).Replace('\', '/')
    if ($tracked.Contains($relative)) { continue }
    $isCopy = $relative -match '/(?:WuwaEchoTool|extracted)/'
    # 保留旧封装脚本会读取的轻量工具、锁文件和交接说明。
    $keepTool = $relative -match '/WuwaEchoTool/handoff/' -and $file.Extension -in @('.cjs', '.js', '.json', '.md', '.txt', '.patch')
    $isGeneratedImage = $relative -match '/(?:preview|qa)/' -and $relative -notmatch '(?i)baseline' -and $file.Extension -in @('.png', '.jpg', '.jpeg', '.webp')
    if (($isCopy -and -not $keepTool) -or $file.Extension -eq '.zip' -or ($isGeneratedImage -and -not $isCopy)) {
        $candidates.Add([pscustomobject]@{ Path = $absolute; Relative = $relative; Bytes = $file.Length; Kind = $(if ($file.Extension -eq '.zip') { '重复ZIP' } elseif ($isCopy) { '重复打包或解压副本' } else { '未跟踪生成截图' }) })
    }
}
# 先记录精确目标；文件逐个删除，不使用跨Shell操作或递归删除。
$reportPath = Join-Path $artifactRoot 'cleanup-20261015.json'
$report = [ordered]@{ Date = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'); Workspace = $workspaceRoot; BeforeBytes = $beforeBytes; Files = @($candidates.ToArray()); DeletedFiles = 0; FreedBytes = 0 }
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding utf8
foreach ($candidate in $candidates) {
    $resolved = (Resolve-Path -LiteralPath $candidate.Path).Path
    if (-not $resolved.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase)) { throw '删除前路径校验失败' }
    Remove-Item -LiteralPath $resolved -Force
    $report.DeletedFiles++
    $report.FreedBytes += $candidate.Bytes
}
# 只移除已空的目录，不递归删除任何剩余内容。
Get-ChildItem -LiteralPath $artifactRoot -Recurse -Directory -Force | Sort-Object { $_.FullName.Length } -Descending | ForEach-Object {
    $absolute = [IO.Path]::GetFullPath($_.FullName)
    if ($absolute.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase) -and -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        if (@(Get-ChildItem -LiteralPath $absolute -Force).Count -eq 0) { Remove-Item -LiteralPath $absolute -Force }
    }
}
$remaining = @(Get-ChildItem -LiteralPath $artifactRoot -Recurse -File -Force)
$report.AfterBytes = ($remaining | Measure-Object -Property Length -Sum).Sum
$report.RemainingZipFiles = @($remaining | Where-Object Extension -eq '.zip').Count
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding utf8
[pscustomobject]@{ DeletedFiles = $report.DeletedFiles; FreedMiB = [Math]::Round($report.FreedBytes / 1MB, 2); BeforeMiB = [Math]::Round($beforeBytes / 1MB, 2); AfterMiB = [Math]::Round($report.AfterBytes / 1MB, 2); RemainingZipFiles = $report.RemainingZipFiles } | ConvertTo-Json
