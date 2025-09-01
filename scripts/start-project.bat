@echo off
chcp 65001 >nul
echo 🚀 Khởi động Classroom Management System...
echo.

echo 📋 Chọn phương thức khởi động:
echo 1. 🐳 Docker với Environment Variables (Khuyến nghị)
echo 2. 🐳 Docker với giá trị mặc định
echo 3. 💻 Local Development (Thủ công)
echo 4. 🛑 Dừng Docker services
echo 5. 🔍 Xem trạng thái Docker
echo.
set /p choice="Nhập lựa chọn (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🐳 Khởi động với Docker và Environment Variables...
    call :StartDockerWithEnv
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 🐳 Khởi động với Docker (giá trị mặc định)...
    call :StartDockerDefault
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo 💻 Khởi động Local Development...
    call :StartLocalDev
    goto :end
)

if "%choice%"=="4" (
    echo.
    echo 🛑 Dừng Docker services...
    call :StopDockerServices
    goto :end
)

if "%choice%"=="5" (
    echo.
    echo 🔍 Xem trạng thái Docker...
    call :ShowDockerStatus
    goto :end
)

echo ❌ Lựa chọn không hợp lệ!
pause
exit /b 1

:StartDockerWithEnv
REM Kiểm tra Docker
call :TestDocker
if %errorlevel% neq 0 goto :end

REM Kiểm tra file .env
if exist "..\backend\.env" (
    echo ✅ Tìm thấy file .env
    echo 📝 Loading environment variables...
) else (
    echo ⚠️ Không tìm thấy file .env, sử dụng giá trị mặc định
)

call :StartDockerServices
goto :end

:StartDockerDefault
REM Kiểm tra Docker
call :TestDocker
if %errorlevel% neq 0 goto :end

call :StartDockerServices
goto :end

:StartDockerServices
echo.
echo 📦 Đang build và khởi động các services...
docker-compose up --build -d

echo ⏳ Đang chờ các services khởi động...
timeout /t 15 /nobreak >nul

call :ShowDockerStatus
call :ShowSuccessMessage
goto :end

:StopDockerServices
echo 🛑 Dừng Classroom Management System Docker services...

REM Kiểm tra Docker có đang chạy không
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker không chạy hoặc chưa được cài đặt.
    pause
    goto :end
)

REM Dừng và xóa containers
echo ⏹️ Đang dừng các services...
docker-compose down

echo 🧹 Đang dọn dẹp...

REM Xóa các images không sử dụng (tùy chọn)
set /p cleanup="Bạn có muốn xóa các Docker images không sử dụng? (y/n): "
if /i "%cleanup%"=="y" (
    echo 🗑️ Đang xóa images không sử dụng...
    docker image prune -f
)

echo.
echo ✅ Đã dừng thành công tất cả Docker services!
echo.
echo 📝 Để khởi động lại, chạy script này và chọn option 1 hoặc 2
pause
goto :end

:ShowDockerStatus
echo.
echo 🔍 Kiểm tra trạng thái các services...
docker-compose ps

echo.
echo 🏥 Kiểm tra health status...
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
goto :end

:ShowSuccessMessage
echo.
echo 🎉 Classroom Management System đã được khởi động thành công!
echo.
echo 📊 Các services đang chạy:
echo    • Database (SQL Server): http://localhost:1433
echo    • Backend API: http://localhost:3001
echo    • Health Check: http://localhost:3001/health
echo    • Frontend: http://localhost:3000
echo.
echo 📝 Lệnh hữu ích:
echo    • Xem logs: docker-compose logs -f
echo    • Dừng services: docker-compose down
echo    • Restart services: docker-compose restart
echo    • Xem logs backend: docker-compose logs -f backend
echo    • Xem logs database: docker-compose logs -f sqlserver
echo    • Kiểm tra health: docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
goto :end

:StartLocalDev
REM Bước 1: Kiểm tra Docker
echo Bước 1: Kiểm tra Docker...
call :TestDocker
if %errorlevel% neq 0 goto :end

REM Bước 2: Khởi động database
echo Bước 2: Khởi động database...
docker-compose up -d sqlserver
echo ✅ Database container đã được khởi động
echo.

REM Bước 3: Đợi database sẵn sàng
echo Bước 3: Đợi database sẵn sàng (3 phút)...
timeout /t 180 /nobreak >nul
echo ✅ Đã đợi 3 phút
echo.

REM Bước 4: Kiểm tra database
echo Bước 4: Kiểm tra database...
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "sapassword" -C -Q "SELECT name FROM sys.databases" >nul 2>&1
if %errorlevel% neq 0 (
    echo Database chưa sẵn sàng, đợi thêm...
    timeout /t 60 /nobreak >nul
)
echo ✅ Database đã sẵn sàng!
echo.

REM Bước 5: Khởi động backend
echo Bước 5: Khởi động backend...
cd ..\backend

REM Kiểm tra dependencies
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies...
    npm install
)

REM Generate Prisma client
echo 🔧 Generate Prisma client...
npm run prisma:generate

echo.
echo 📊 Thông tin services:
echo    • Backend: http://localhost:3001
echo    • Prisma Studio: http://localhost:5555
echo    • Database: localhost:1433
echo.

REM Mở Prisma Studio trong background
echo 🌐 Mở Prisma Studio...
start "Prisma Studio" npm run prisma:studio

REM Khởi động backend
echo 🚀 Khởi động backend...
npm run dev
goto :end

:TestDocker
REM Kiểm tra Docker có được cài đặt không
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker Desktop trước.
    pause
    exit /b 1
)

REM Kiểm tra Docker có đang chạy không
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker không chạy. Vui lòng khởi động Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker đã sẵn sàng
exit /b 0

:end
echo.
echo ✅ Hoàn thành!
pause
