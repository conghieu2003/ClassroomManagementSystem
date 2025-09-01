# Auto-start Classroom Management System
Write-Host "Starting Classroom Management System..." -ForegroundColor Green

# Change to project directory
Set-Location "E:\KLTN-2025\ClassroomManagementSystem"

# Stop and remove existing containers
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove existing images to rebuild
Write-Host "Removing existing images..." -ForegroundColor Yellow
docker-compose down --rmi all

# Build and start all services
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker-compose up -d --build

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check status
Write-Host "Checking container status..." -ForegroundColor Yellow
docker-compose ps

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
    Write-Host "✅ Backend is running! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
    Write-Host "Checking backend logs..." -ForegroundColor Yellow
    docker-compose logs backend
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Ach0101@" -C -Q "SELECT 1"
    Write-Host "✅ Database is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
}

Write-Host "System startup completed!" -ForegroundColor Green
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Database Port: localhost:1437" -ForegroundColor Cyan

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
