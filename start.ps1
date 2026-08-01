param(
  [switch]$NoAi,
  [switch]$NoExpo
)

$root = "C:\Users\ACER\sadakSewa"

Write-Host "=== Starting SadakSewa ===" -ForegroundColor Cyan

if (-not $NoAi) {
  Write-Host "[1/5] Starting AI Service (port 8000)..." -ForegroundColor Yellow
  Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\ai-service'; .\.venv\Scripts\Activate.ps1; uvicorn app:app --host 0.0.0.0 --port 8000"
  Start-Sleep 5
}

Write-Host "[2/5] Starting Express Server (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\server'; npm start"
Start-Sleep 5

Write-Host "[3/5] Starting Ngrok..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "ngrok http 5000"
Start-Sleep 3

Write-Host "[4/5] Starting Expo (port 8081)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\mobile'; npx expo start"

if (-not $NoExpo) {
  Write-Host "[5/5] Starting Vite (port 5173)..." -ForegroundColor Yellow
  Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\client'; npm run dev"
}

Write-Host "`n=== All services started ===" -ForegroundColor Green
Write-Host "Update mobile/src/constants/index.js if ngrok URL changed (add /api suffix)." -ForegroundColor Cyan
