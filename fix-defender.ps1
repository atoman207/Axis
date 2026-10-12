# Run this file as Administrator (right-click → "Run with PowerShell")
# Adds Windows Defender exclusions so Next.js can write build files without EBUSY errors.

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "Adding Windows Defender exclusion for:" -ForegroundColor Cyan
Write-Host "  $projectPath" -ForegroundColor White
Write-Host ""

try {
    Add-MpPreference -ExclusionPath $projectPath -ErrorAction Stop
    Write-Host "Done. Exclusion added successfully." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run  npm run dev  without EBUSY errors." -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host "Make sure you are running this as Administrator." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to close"
