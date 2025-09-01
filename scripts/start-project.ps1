# Classroom Management System - Start Project Script
# Tác giả: Hướng dẫn Docker deployment

Write-Host "Classroom Management System - Start Project Script" -ForegroundColor Green
Write-Host ""

Write-Host "Chọn chức năng:" -ForegroundColor Cyan
Write-Host "1. Docker với Environment Variables" -ForegroundColor White
Write-Host "2. Docker với giá trị mặc định" -ForegroundColor White
Write-Host "3. Local Development" -ForegroundColor White
Write-Host "4. Dừng Docker services" -ForegroundColor White
Write-Host "5. Xem trạng thái Docker" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1-5)"

switch ($choice) {
    "1" { Start-DockerWithEnv }
    "2" { Start-DockerDefault }
    "3" { Start-LocalDevelopment }
    "4" { Stop-DockerServices }
    "5" { Show-DockerStatus }
    default { 
        Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
}

# ===== DOCKER FUNCTIONS =====

function Start-DockerWithEnv {
    Write-Host ""
    Write-Host "Khởi động với Docker và Environment Variables..." -ForegroundColor Green
    
    # Kiểm tra Docker
    Test-DockerAvailability
    
    # Kiểm tra file .env
    $envFile = "..\backend\.env"
    if (Test-Path $envFile) {
        Write-Host "Tìm thấy file .env" -ForegroundColor Green
        
        # Load environment variables
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim('"')
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "   $name = $value" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "Không tìm thấy file .env, sử dụng giá trị mặc định từ docker-compose.yml" -ForegroundColor Yellow
    }

    Start-DockerServices
}

function Start-DockerDefault {
    Write-Host ""
    Write-Host "Khởi động với Docker (giá trị mặc định)..." -ForegroundColor Yellow
    
    # Kiểm tra Docker
    Test-DockerAvailability
    
    Start-DockerServices
}

function Start-DockerServices {
    Write-Host ""
    Write-Host "Đang build và khởi động các services..." -ForegroundColor Yellow

    # Build và khởi động services
    docker-compose up --build -d

    Write-Host "Đang chờ các services khởi động..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    # Kiểm tra trạng thái
    Show-DockerStatus
    
    # Test health endpoint
    Test-HealthEndpoint
    
    Show-SuccessMessage
}

function Stop-DockerServices {
    Write-Host ""
    Write-Host "Dừng Classroom Management System Docker services..." -ForegroundColor Red

    # Kiểm tra Docker có đang chạy không
    try {
        docker info | Out-Null
    } catch {
        Write-Host "Docker không chạy hoặc chưa được cài đặt." -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        return
    }

    # Dừng và xóa containers
    Write-Host "Đang dừng các services..." -ForegroundColor Yellow
    docker-compose down

    Write-Host "Đang dọn dẹp..." -ForegroundColor Yellow

    # Xóa các images không sử dụng (tùy chọn)
    $cleanup = Read-Host "Bạn có muốn xóa các Docker images không sử dụng? (y/n)"
    if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
        Write-Host "Đang xóa images không sử dụng..." -ForegroundColor Yellow
        docker image prune -f
    }

    Write-Host ""
    Write-Host "Đã dừng thành công tất cả Docker services!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Để khởi động lại, chạy script này và chọn option 1 hoặc 2" -ForegroundColor Cyan
}

function Show-DockerStatus {
    Write-Host ""
    Write-Host "Kiểm tra trạng thái các services..." -ForegroundColor Cyan
    docker-compose ps

    # Kiểm tra health status
    Write-Host ""
    Write-Host "Kiểm tra health status..." -ForegroundColor Cyan
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
}

function Test-HealthEndpoint {
    Write-Host ""
    Write-Host "Kiểm tra health endpoint..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 10
        Write-Host "Backend health check: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "Backend health check chưa sẵn sàng, có thể cần đợi thêm..." -ForegroundColor Yellow
    }
}

function Show-SuccessMessage {
    Write-Host ""
    Write-Host "Classroom Management System đã được khởi động thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Các services đang chạy:" -ForegroundColor Cyan
    Write-Host "   • Database (SQL Server): http://localhost:1433" -ForegroundColor White
    Write-Host "   • Backend API: http://localhost:5000" -ForegroundColor White
    Write-Host "   • Health Check: http://localhost:5000/health" -ForegroundColor White
    Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Lệnh hữu ích:" -ForegroundColor Yellow
    Write-Host "   • Xem logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   • Dừng services: docker-compose down" -ForegroundColor White
    Write-Host "   • Restart services: docker-compose restart" -ForegroundColor White
    Write-Host "   • Xem logs backend: docker-compose logs -f backend" -ForegroundColor White
    Write-Host "   • Xem logs database: docker-compose logs -f sqlserver" -ForegroundColor White
    Write-Host "   • Kiểm tra health: docker-compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Health}}'" -ForegroundColor White
}

# ===== LOCAL DEVELOPMENT FUNCTION =====

function Start-LocalDevelopment {
    Write-Host ""
    Write-Host "Khởi động Local Development..." -ForegroundColor Yellow
    
    # Bước 1: Kiểm tra Docker
    Write-Host "Bước 1: Kiểm tra Docker..." -ForegroundColor Cyan
    try {
        docker version | Out-Null
        Write-Host "Docker đang chạy" -ForegroundColor Green
    } catch {
        Write-Host "Docker không chạy. Hãy mở Docker Desktop trước!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        return
    }
    Write-Host ""

    # Bước 2: Khởi động database
    Write-Host "Bước 2: Khởi động database..." -ForegroundColor Cyan
    docker-compose up -d sqlserver
    Write-Host "Database container đã được khởi động" -ForegroundColor Green
    Write-Host ""

    # Bước 3: Đợi database sẵn sàng
    Write-Host "Bước 3: Đợi database sẵn sàng (3 phút)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 180
    Write-Host "Đã đợi 3 phút" -ForegroundColor Green
    Write-Host ""

    # Bước 4: Kiểm tra database
    Write-Host "Bước 4: Kiểm tra database..." -ForegroundColor Cyan
    try {
        docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT name FROM sys.databases" | Out-Null
        Write-Host "Database đã sẵn sàng!" -ForegroundColor Green
    } catch {
        Write-Host "Database chưa sẵn sàng, đợi thêm..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
    }
    Write-Host ""

    # Bước 5: Khởi động backend
    Write-Host "Bước 5: Khởi động backend..." -ForegroundColor Cyan
    Set-Location "..\backend"

    # Kiểm tra dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Cài đặt dependencies..." -ForegroundColor Yellow
        npm install
    }

    # Generate Prisma client
    Write-Host "Generate Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate

    Write-Host ""
    Write-Host "Thông tin services:" -ForegroundColor Cyan
    Write-Host "   • Backend: http://localhost:5000" -ForegroundColor White
    Write-Host "   • Prisma Studio: http://localhost:5555" -ForegroundColor White
    Write-Host "   • Database: localhost:1433" -ForegroundColor White
    Write-Host ""

    # Mở Prisma Studio trong background
    Write-Host "Mở Prisma Studio..." -ForegroundColor Yellow
    Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run", "prisma:studio"

    # Khởi động backend
    Write-Host "Khởi động backend..." -ForegroundColor Green
    npm run dev
}

# ===== UTILITY FUNCTIONS =====

function Test-DockerAvailability {
    # Kiểm tra Docker có được cài đặt không
    try {
        docker --version | Out-Null
        Write-Host "Docker đã được cài đặt" -ForegroundColor Green
    } catch {
        Write-Host "Docker chưa được cài đặt. Vui lòng cài đặt Docker Desktop trước." -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }

    # Kiểm tra Docker có đang chạy không
    try {
        docker info | Out-Null
        Write-Host "Docker đang chạy" -ForegroundColor Green
    } catch {
        Write-Host "Docker không chạy. Vui lòng khởi động Docker Desktop." -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
}
