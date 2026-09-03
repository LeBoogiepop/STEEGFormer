# BCI-IV2a ST-EEGFormer (vit_large_patch16) — Figure G.2 style protocols.
# Usage (from anywhere):
#   powershell -ExecutionPolicy Bypass -File "...\benchmark\neural_networks\scripts\run_g2_bci_iv2a.ps1" -Scheme population
# Schemes: population | leave-one-out-finetuning | per-subject
#
# Requires: torch+cu128 for RTX 50-series; set $Device to "cpu" if needed.

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("population", "leave-one-out-finetuning", "per-subject")]
    [string]$Scheme,

    [string]$Device = "cuda",

    [string]$RepoRoot = "",

    [int]$TrainEpochs = 100,
    [int]$FinetuneEpochs = 50,

    [double]$Lr = 0.0003,

    [string]$OptimizerSpec = "finetune",

    [int]$TrainBatchSize = 16,
    [int]$FinetuneBatchSize = 8
)

$ErrorActionPreference = "Stop"
if (-not $RepoRoot) {
    $RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
}
$NN = Join-Path $RepoRoot "benchmark\neural_networks"
$DataYaml = Join-Path $RepoRoot "benchmark\neural_networks\util\dataset_specs_local_bci_iv2a.yaml"
$TaskYaml = Join-Path $RepoRoot "benchmark\neural_networks\util\downstream_task_specs.yaml"
$Ckpt = Join-Path $RepoRoot "g2_transfer\STEEGFormer_large_weights_only_196.pth"
$LogRoot = Join-Path $RepoRoot "outputs\g2_full_$($Scheme -replace '[^a-zA-Z0-9]+', '_')"

$env:WANDB_DISABLED = "true"
$env:WANDB_MODE = "disabled"
$env:PYTHONUNBUFFERED = "1"

if (-not (Test-Path -LiteralPath $Ckpt)) { throw "Missing checkpoint: $Ckpt" }
if (-not (Test-Path -LiteralPath $DataYaml)) { throw "Missing dataset yaml: $DataYaml" }

New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
$logFile = Join-Path $LogRoot "console.log"
Write-Host "Logging to $logFile"

$argList = @(
    "wandb_downstream_evaluation.py",
    "--disable_wandb",
    "--device", $Device,
    "--downstream_task", "bci_iv2a",
    "--evaluation_scheme", $Scheme,
    "--model", "vit_large_patch16",
    "--vit_pretrained_model_dir", $Ckpt,
    "--dataset_yaml", $DataYaml,
    "--downstream_task_yaml", $TaskYaml,
    "--log_dir", $LogRoot,
    "--optimizer_spec", $OptimizerSpec,
    "--lr", "$Lr",
    "--train_epochs", "$TrainEpochs",
    "--finetune_epochs", "$FinetuneEpochs",
    "--train_batch_size", "$TrainBatchSize",
    "--finetune_batch_size", "$FinetuneBatchSize",
    "--num_workers", "0"
)

Push-Location $NN
try {
    & python @argList 2>&1 | Tee-Object -FilePath $logFile
}
finally {
    Pop-Location
}
