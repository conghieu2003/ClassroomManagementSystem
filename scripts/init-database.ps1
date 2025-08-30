# PowerShell script to initialize database and run migrations
Write-Host "Starting Classroom Management System Database Setup..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start the database container
Write-Host "Starting SQL Server container..." -ForegroundColor Yellow
docker-compose up -d sqlserver

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if database is accessible
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1" | Out-Null
    Write-Host "Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "Error: Could not connect to database. Please check if container is running." -ForegroundColor Red
    exit 1
}

# Run the initialization script
Write-Host "Running database initialization script..." -ForegroundColor Yellow
try {
    docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -i /docker-entrypoint-initdb.d/init-database.sql
    Write-Host "Database initialization completed!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not run initialization script. Database may already be initialized." -ForegroundColor Yellow
}

# Navigate to backend directory and run Prisma commands
Write-Host "Setting up Prisma..." -ForegroundColor Yellow
Set-Location ../backend

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

# Run migrations
Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
npm run prisma:migrate

Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "You can now start your backend application." -ForegroundColor Green
Write-Host "Database connection string: sqlserver://localhost:1433;database=ClassroomDB;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true" -ForegroundColor Cyan

