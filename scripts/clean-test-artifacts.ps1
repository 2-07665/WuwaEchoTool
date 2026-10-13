# Generated outputs only; keep QA programs, seeds, baselines and image fixtures.
[CmdletBinding(SupportsShouldProcess = $true)]
param([switch]$RunTests)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$outputRoot = Join-Path $projectRoot 'artifacts'
$fixturePaths = @(
    'screenshot-recognition\blurred.png',
    'screenshot-recognition\incomplete.png',
    'screenshot-recognition\english-ocr-fixture.png'
)
$reportNames = @(
    'results.json', 'summary.json', 'browser-results.json',
    'acceptance-summary.json', 'actual-results.json',
    'browser-test-result.json', 'user-images-results.json',
    'layout-checks.json', 'screenshots.md'
)
# Audited output directories. New directories/fixtures require review first.
$outputDirectories = @(
    'official-import', 'operation-optimization', 'register-2-0',
    'register-heading', 'register-integration', 'register-inventory',
    'register-overview', 'register-overview-frame', 'register-overview-tabs',
    'register-readability', 'register-search', 'register-share',
    'register-tabs', 'register-tools', 'screenshot-recognition',
    'secondary-workspace'
)

function Assert-OutputPath([string]$Path) {
    $absolutePath = [IO.Path]::GetFullPath($Path)
    if (-not $absolutePath.StartsWith($outputRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing path outside test outputs: $Path"
    }
    # Never traverse a junction or symbolic link, including the artifacts root.
    $currentPath = $absolutePath
    while ($currentPath -ne $projectRoot) {
        $item = Get-Item -LiteralPath $currentPath -Force
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw "Refusing linked output path: $currentPath"
        }
        $currentPath = Split-Path -Parent $currentPath
    }
}

function Clear-TestOutputs {
    $removedCount = 0
    [long]$removedBytes = 0
    if (-not (Test-Path -LiteralPath $outputRoot)) { return }
    # Validate the root before enumerating any children.
    if ((Get-Item -LiteralPath $outputRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw 'Refusing linked artifacts directory.'
    }
    foreach ($directory in $outputDirectories) {
        $directoryPath = Join-Path $outputRoot $directory
        if (-not (Test-Path -LiteralPath $directoryPath)) { continue }
        Assert-OutputPath $directoryPath
        $files = @(Get-ChildItem -LiteralPath $directoryPath -Recurse -Force -File)
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($outputRoot.Length + 1)
            if ($relativePath -in $fixturePaths) { continue }
            $generated = ($file.Extension -in '.png', '.txt', '.webm', '.mp4') -or
                ($file.Name -in $reportNames) -or
                ($file.Extension -eq '.zip' -and $file.BaseName -like 'trace*')
            if (-not $generated) { continue }
            Assert-OutputPath $file.FullName
            if ($PSCmdlet.ShouldProcess($file.FullName, 'Delete generated test output')) {
                Remove-Item -LiteralPath $file.FullName -Force
                $removedCount++
                $removedBytes += $file.Length
            }
        }
    }
    Write-Host ("Removed {0} generated files ({1:N2} MB)." -f $removedCount, ($removedBytes / 1000000))
}

Clear-TestOutputs
if ($RunTests -and -not $WhatIfPreference) {
    $testExitCode = 1
    Push-Location -LiteralPath $projectRoot
    try {
        $testFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tests') -Filter '*.test.cjs' -File | Sort-Object Name | ForEach-Object FullName)
        & node --test @testFiles
        $testExitCode = $LASTEXITCODE
    } finally {
        Pop-Location
        Clear-TestOutputs
    }
    exit $testExitCode
}
