@echo off
echo Khởi động Classroom Management System...
echo.

REM Bước 1: Kiểm tra Docker
echo Bước 1: Kiểm tra Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker không chạy. Hãy mở Docker Desktop trước!
    pause
    exit /b 1
)
echo Docker đang chạy
echo.

REM Bước 2: Khởi động database
echo Bước 2: Khởi động database...
docker-compose up -d sqlserver
echo Database container đã được khởi động
echo.

REM Bước 3: Đợi database sẵn sàng
echo Bước 3: Đợi database sẵn sàng (3 phút)...
timeout /t 180 /nobreak >nul
echo Đã đợi 3 phút
echo.

REM Bước 4: Kiểm tra database
echo Bước 4: Kiểm tra database...
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT name FROM sys.databases" >nul 2>&1
if %errorlevel% neq 0 (
    echo Database chưa sẵn sàng, đợi thêm...
    timeout /t 60 /nobreak >nul
)
echo Database đã sẵn sàng!
echo.

REM Bước 5: Khởi động backend
echo Bước 5: Khởi động backend...
cd ..\backend

REM Kiểm tra dependencies
if not exist "node_modules" (
    echo Cài đặt dependencies...
    npm install
)

REM Generate Prisma client
echo Generate Prisma client...
npm run prisma:generate

echo.
echo Backend sẽ chạy tại: http://localhost:3000
echo Prisma Studio sẽ chạy tại: http://localhost:5555
echo Database đã sẵn sàng tại: localhost:1433
echo.

REM Mở Prisma Studio trong background
start "Prisma Studio" npm run prisma:studio

REM Khởi động backend
npm run dev
