Write-Host "Killing existing Node processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting MongoDB..."
Start-Process mongod -WindowStyle Hidden

Write-Host "Waiting for MongoDB to start..."
Start-Sleep -Seconds 5

Write-Host "Starting backend server..."
npm run dev 