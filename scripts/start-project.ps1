# Script khởi động project Classroom Management System
Write-Host "Khởi động Classroom Management System..." -ForegroundColor Green

# Bước 1: Kiểm tra Docker
Write-Host "Bước 1: Kiểm tra Docker..." -ForegroundColor Cyan
try {
    docker version | Out-Null
    Write-Host "Docker đang chạy" -ForegroundColor Green
} catch {
    Write-Host "Docker không chạy. Hãy mở Docker Desktop trước!" -ForegroundColor Red
    exit 1
}

# Bước 2: Khởi động database
Write-Host "Bước 2: Khởi động database..." -ForegroundColor Cyan
docker-compose up -d sqlserver
Write-Host "Database container đã được khởi động" -ForegroundColor Green

# Bước 3: Đợi database sẵn sàng
Write-Host "Bước 3: Đợi database sẵn sàng (3 phút)..." -ForegroundColor Cyan
Write-Host "Đang đợi..." -ForegroundColor Yellow
Start-Sleep -Seconds 180
Write-Host "Đã đợi 3 phút" -ForegroundColor Green

# Bước 4: Kiểm tra database
Write-Host "Bước 4: Kiểm tra database..." -ForegroundColor Cyan
try {
    $result = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT name FROM sys.databases" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database đã sẵn sàng!" -ForegroundColor Green
        Write-Host "Danh sách databases:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "Database chưa sẵn sàng, đợi thêm..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
    }
} catch {
    Write-Host "Lỗi khi kiểm tra database: $_" -ForegroundColor Red
}

# Bước 5: Khởi động backend
Write-Host "Bước 5: Khởi động backend..." -ForegroundColor Cyan
Set-Location ../backend

# Kiểm tra dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client
Write-Host "Generate Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

# Khởi động backend
Write-Host "Khởi động backend..." -ForegroundColor Yellow
Write-Host "Backend sẽ chạy tại: http://localhost:3000" -ForegroundColor Green
Write-Host "Prisma Studio sẽ chạy tại: http://localhost:5555" -ForegroundColor Green
Write-Host "Database đã sẵn sàng tại: localhost:1433" -ForegroundColor Green

# Mở Prisma Studio trong background
Start-Process "npm" -ArgumentList "run", "prisma:studio" -WindowStyle Hidden

# Khởi động backend
npm run dev
