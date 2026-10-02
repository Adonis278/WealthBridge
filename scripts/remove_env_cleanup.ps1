# PowerShell helper to stop tracking Wealth-Bridge/.env.local
# Keeps local file, removes it from git index and commits the removal.

param()

Write-Host "Stopping tracking of Wealth-Bridge/.env.local and committing the change..." -ForegroundColor Yellow

git rm --cached Wealth-Bridge/.env.local
if ($LASTEXITCODE -ne 0) {
    Write-Host "git rm failed. Ensure you're in the repo root and git is installed." -ForegroundColor Red
    exit $LASTEXITCODE
}

git commit -m "chore: remove committed env file"
if ($LASTEXITCODE -ne 0) {
    Write-Host "git commit failed. Check git status." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Push to origin? (y/N)" -NoNewline
$ans = Read-Host
if ($ans -match '^[yY]') {
    git push origin HEAD
}

Write-Host "Done. If you want to purge history, follow scripts/remove_committed_env.md" -ForegroundColor Green
