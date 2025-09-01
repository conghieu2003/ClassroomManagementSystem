# Database Management Scripts - Gộp tất cả chức năng
# Tác giả: Hướng dẫn Docker deployment

Write-Host "Database Management Tools" -ForegroundColor Green
Write-Host ""

Write-Host "Chọn chức năng:" -ForegroundColor Cyan
Write-Host "1. Khởi tạo Database (Lần đầu)" -ForegroundColor White
Write-Host "2. Sửa lỗi Database" -ForegroundColor White
Write-Host "3. Reset Database" -ForegroundColor White
Write-Host "4. Kiểm tra trạng thái Database" -ForegroundColor White
Write-Host "5. Dọn dẹp Database" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1-5)"

switch ($choice) {
    "1" { Initialize-Database }
    "2" { Fix-Database }
    "3" { Reset-Database }
    "4" { Check-DatabaseStatus }
    "5" { Cleanup-Database }
    default { 
        Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
}

# DATABASE FUNCTIONS

function Initialize-Database {
    Write-Host ""
    Write-Host "Khởi tạo Database..." -ForegroundColor Green
    
    # Kiểm tra Docker
    Test-DockerAvailability
    
    # Khởi động database container
    Write-Host "Khởi động SQL Server container..." -ForegroundColor Yellow
    docker-compose up -d sqlserver
    
    # Đợi database sẵn sàng
    Write-Host "Đợi database sẵn sàng..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Kiểm tra kết nối database
    Write-Host "Kiểm tra kết nối database..." -ForegroundColor Yellow
    try {
        docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT 1" | Out-Null
        Write-Host "Kết nối database thành công!" -ForegroundColor Green
    } catch {
        Write-Host "Không thể kết nối database. Kiểm tra container." -ForegroundColor Red
        return
    }
    
    # Chạy script khởi tạo
    Write-Host "Chạy script khởi tạo database..." -ForegroundColor Yellow
    try {
        docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -i /docker-entrypoint-initdb.d/init-database.sql
        Write-Host "Khởi tạo database hoàn thành!" -ForegroundColor Green
    } catch {
        Write-Host "Không thể chạy script khởi tạo. Database có thể đã được khởi tạo." -ForegroundColor Yellow
    }
    
    # Setup Prisma
    Setup-Prima
    
    Write-Host ""
    Write-Host "Khởi tạo database hoàn thành!" -ForegroundColor Green
    Write-Host "Connection string: sqlserver://localhost:1433;database=ClassroomManagement;user=sa;password=sapassword;trustServerCertificate=true" -ForegroundColor Cyan
}

function Fix-Database {
    Write-Host ""
    Write-Host "Sửa lỗi Database..." -ForegroundColor Yellow
    
    # Kiểm tra Docker
    Test-DockerAvailability
    
    # Dừng và xóa container cũ
    Write-Host "Dừng container cũ..." -ForegroundColor Cyan
    docker-compose down -v
    Write-Host "Đã dừng và xóa container cũ" -ForegroundColor Green
    
    # Khởi động lại database
    Write-Host "Khởi động database..." -ForegroundColor Cyan
    docker-compose up -d sqlserver
    Write-Host "Đã khởi động database container" -ForegroundColor Green
    
    # Đợi database khởi động hoàn toàn
    Write-Host "Đợi database khởi động (3 phút)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 180
    Write-Host "Đã đợi 3 phút" -ForegroundColor Green
    
    # Kiểm tra container status
    Write-Host "Kiểm tra container status..." -ForegroundColor Cyan
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host $containers -ForegroundColor White
    
    # Test kết nối database
    Write-Host "Test kết nối database..." -ForegroundColor Cyan
    try {
        $result = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT 1" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Kết nối database thành công!" -ForegroundColor Green
        } else {
            Write-Host "Kết nối database thất bại" -ForegroundColor Red
            Write-Host "Kết quả: $result" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Lỗi khi test kết nối: $_" -ForegroundColor Red
    }
    
    # Chạy script khởi tạo
    Write-Host "Chạy script khởi tạo database..." -ForegroundColor Cyan
    try {
        $initResult = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -i /docker-entrypoint-initdb.d/init-database.sql 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Khởi tạo database thành công!" -ForegroundColor Green
        } else {
            Write-Host "Khởi tạo database có thể đã thất bại" -ForegroundColor Yellow
            Write-Host "Kết quả: $initResult" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Lỗi khi khởi tạo database: $_" -ForegroundColor Red
    }
    
    # Test kết nối cuối cùng
    Write-Host "Test kết nối cuối cùng..." -ForegroundColor Cyan
    try {
        $finalTest = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT name FROM sys.databases" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database đã sẵn sàng!" -ForegroundColor Green
            Write-Host "Danh sách databases:" -ForegroundColor Cyan
            Write-Host $finalTest -ForegroundColor White
        } else {
            Write-Host "Vẫn không thể kết nối database" -ForegroundColor Red
            Write-Host "Kết quả: $finalTest" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Lỗi cuối cùng: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Kết quả:" -ForegroundColor Cyan
    Write-Host "Nếu thấy 'Database đã sẵn sàng!' thì bạn có thể tiếp tục với backend." -ForegroundColor Green
    Write-Host "Nếu vẫn lỗi, hãy kiểm tra logs và thử lại." -ForegroundColor Yellow
}

function Reset-Database {
    Write-Host ""
    Write-Host "Reset Database..." -ForegroundColor Red
    
    $confirm = Read-Host "Bạn có chắc muốn xóa toàn bộ dữ liệu database? (y/n)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Hủy bỏ reset database." -ForegroundColor Yellow
        return
    }
    
    # Kiểm tra Docker
    Test-DockerAvailability
    
    # Dừng và xóa tất cả
    Write-Host "Xóa tất cả containers và volumes..." -ForegroundColor Red
    docker-compose down -v
    docker volume prune -f
    
    # Khởi động lại từ đầu
    Write-Host "Khởi động lại từ đầu..." -ForegroundColor Green
    Initialize-Database
}

function Check-DatabaseStatus {
    Write-Host ""
    Write-Host "Kiểm tra trạng thái Database..." -ForegroundColor Cyan
    
    # Kiểm tra Docker
    try {
        docker version | Out-Null
    } catch {
        Write-Host "Docker không chạy." -ForegroundColor Red
        return
    }
    
    # Kiểm tra containers
    Write-Host "Containers:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Kiểm tra volumes
    Write-Host ""
    Write-Host "Volumes:" -ForegroundColor Yellow
    docker volume ls
    
    # Kiểm tra kết nối database
    Write-Host ""
    Write-Host "Test kết nối database..." -ForegroundColor Yellow
    try {
        $result = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT name FROM sys.databases" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database hoạt động bình thường!" -ForegroundColor Green
            Write-Host "Databases:" -ForegroundColor Cyan
            Write-Host $result -ForegroundColor White
        } else {
            Write-Host "Database không hoạt động" -ForegroundColor Red
        }
    } catch {
        Write-Host "Không thể kết nối database" -ForegroundColor Red
    }
    
    # Kiểm tra logs
    Write-Host ""
    Write-Host "Logs cuối cùng:" -ForegroundColor Yellow
    docker-compose logs --tail=5 sqlserver
}

function Cleanup-Database {
    Write-Host ""
    Write-Host "Dọn dẹp Database..." -ForegroundColor Yellow
    
    $confirm = Read-Host "Bạn có muốn dọn dẹp tất cả? (y/n)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Hủy bỏ dọn dẹp." -ForegroundColor Yellow
        return
    }
    
    # Kiểm tra Docker
    try {
        docker version | Out-Null
    } catch {
        Write-Host "Docker không chạy." -ForegroundColor Red
        return
    }
    
    # Dừng containers
    Write-Host "Dừng containers..." -ForegroundColor Yellow
    docker-compose down
    
    # Xóa volumes
    Write-Host "Xóa volumes..." -ForegroundColor Yellow
    docker volume prune -f
    
    # Xóa images không sử dụng
    Write-Host "Xóa images không sử dụng..." -ForegroundColor Yellow
    docker image prune -f
    
    Write-Host "Dọn dẹp hoàn thành!" -ForegroundColor Green
}

function Setup-Prima {
    Write-Host ""
    Write-Host "Setup Prisma..." -ForegroundColor Yellow
    Set-Location ../backend
    
    # Cài đặt dependencies nếu chưa có
    if (-not (Test-Path "node_modules")) {
        Write-Host "Cài đặt dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Generate Prisma client
    Write-Host "Generate Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
    
    # Chạy migrations
    Write-Host "Chạy Prisma migrations..." -ForegroundColor Yellow
    npm run prisma:migrate
    
    Write-Host "Setup Prisma hoàn thành!" -ForegroundColor Green
}

function Test-DockerAvailability {
    # Kiểm tra Docker có được cài đặt không
    try {
        docker version | Out-Null
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
