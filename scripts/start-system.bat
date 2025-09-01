@echo off
echo Starting Classroom Management System...

cd /d "E:\KLTN-2025\ClassroomManagementSystem"

echo Cleaning up existing containers...
docker-compose down

echo Removing existing images...
docker-compose down --rmi all

echo Building and starting services...
docker-compose up -d --build

echo Waiting for services to start...
timeout /t 30 /nobreak

echo Checking container status...
docker-compose ps

echo Testing backend health...
timeout /t 10 /nobreak
curl -f http://localhost:5000/health
if %errorlevel% equ 0 (
    echo Backend is running!
) else (
    echo Backend health check failed
    echo Checking backend logs...
    docker-compose logs backend
)

echo Testing database connection...
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Ach0101@" -C -Q "SELECT 1"
if %errorlevel% equ 0 (
    echo Database is running!
) else (
    echo Database connection failed
)

echo System startup completed!
echo Backend URL: http://localhost:5000
echo Database Port: localhost:1437

pause
