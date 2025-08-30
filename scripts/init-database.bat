@echo off
echo Starting Classroom Management System Database Setup...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo Docker is running
echo.

REM Start the database container
echo Starting SQL Server container...
docker-compose up -d sqlserver

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 30 /nobreak >nul

REM Check if database is accessible
echo Testing database connection...
docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Could not connect to database. Please check if container is running.
    pause
    exit /b 1
)
echo Database connection successful!
echo.

REM Run the initialization script
echo Running database initialization script...
docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i /docker-entrypoint-initdb.d/init-database.sql
if %errorlevel% neq 0 (
    echo Warning: Could not run initialization script. Database may already be initialized.
)
echo.

REM Navigate to backend directory and run Prisma commands
echo Setting up Prisma...
cd ..\backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Generate Prisma client
echo Generating Prisma client...
npm run prisma:generate

REM Run migrations
echo Running Prisma migrations...
npm run prisma:migrate

echo.
echo Database setup completed successfully!
echo You can now start your backend application.
echo Database connection string: sqlserver://localhost:1433;database=ClassroomDB;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true
echo.
pause

