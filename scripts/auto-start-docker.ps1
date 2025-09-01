# Auto-start Classroom Management System Backend
Write-Host "Starting Classroom Management System..." -ForegroundColor Green

# Change to project directory
Set-Location "E:\KLTN-2025\ClassroomManagementSystem"

# Start backend container
docker-compose up -d backend

# Check status
Write-Host "Checking container status..." -ForegroundColor Yellow
docker-compose ps

# Test health endpoint
Write-Host "Testing backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
    Write-Host "✅ Backend is running! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
