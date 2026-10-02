param(
    [string]$projectId = "YOUR_PROJECT_ID",
    [string]$secretName = "OPENAI_API_KEY"
)

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "gcloud CLI is required. Install and authenticate first." -ForegroundColor Red
    exit 1
}

Write-Host "Fetching secret '$secretName' from project '$projectId'..."
$val = gcloud secrets versions access latest --secret=$secretName --project=$projectId 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to fetch secret. Ensure gcloud is authenticated and the secret exists." -ForegroundColor Red
    exit $LASTEXITCODE
}

$envPath = "Wealth-Bridge/.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "Creating $envPath" -ForegroundColor Yellow
    New-Item -ItemType File -Path $envPath -Force | Out-Null
}

# Replace or append the OPENAI_API_KEY line
$content = Get-Content $envPath -Raw
if ($content -match '^OPENAI_API_KEY=') {
    $content = $content -replace '^OPENAI_API_KEY=.*', "OPENAI_API_KEY=$val"
} else {
    $content = ($content.TrimEnd() + "`nOPENAI_API_KEY=$val`n")
}

Set-Content -Path $envPath -Value $content -NoNewline
Write-Host "Wrote OPENAI_API_KEY into $envPath (local only). Do not commit this file." -ForegroundColor Green
