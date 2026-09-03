# Run all three G.2 protocols sequentially (single GPU). Long-running.
param(
    [string]$RepoRoot = "",
    [string]$Device = "cuda"
)
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
if (-not $RepoRoot) {
    $RepoRoot = (Resolve-Path (Join-Path $here "..\..\..")).Path
}
$script = Join-Path $here "run_g2_bci_iv2a.ps1"
foreach ($s in @("population", "leave-one-out-finetuning", "per-subject")) {
    Write-Host "========== $s ==========" -ForegroundColor Cyan
    & $script -Scheme $s -Device $Device -RepoRoot $RepoRoot
}
