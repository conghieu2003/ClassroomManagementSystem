# Script khac phuc loi authentication database
Write-Host "Kha phuc loi authentication database..." -ForegroundColor Yellow

# Buoc 1: Kiem tra Docker
Write-Host "Buoc 1: Kiem tra Docker..." -ForegroundColor Cyan
try {
    docker version | Out-Null
    Write-Host "Docker dang chay" -ForegroundColor Green
} catch {
    Write-Host "Docker khong chay. Hay mo Docker Desktop truoc!" -ForegroundColor Red
    exit 1
}

# Buoc 2: Dung va xoa container cu
Write-Host "Buoc 2: Dung container cu..." -ForegroundColor Cyan
docker-compose down -v
Write-Host "Da dung va xoa container cu" -ForegroundColor Green

# Buoc 3: Khoi dong lai database
Write-Host "Buoc 3: Khoi dong database..." -ForegroundColor Cyan
docker-compose up -d sqlserver
Write-Host "Da khoi dong database container" -ForegroundColor Green

# Buoc 4: Doi database khoi dong hoan toan
Write-Host "Buoc 4: Doi database khoi dong (3 phut)..." -ForegroundColor Cyan
Write-Host "Dang doi..." -ForegroundColor Yellow
Start-Sleep -Seconds 180
Write-Host "Da doi 3 phut" -ForegroundColor Green

# Buoc 5: Kiem tra container status
Write-Host "Buoc 5: Kiem tra container status..." -ForegroundColor Cyan
$containers = docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
Write-Host $containers -ForegroundColor White

# Buoc 6: Test ket noi database
Write-Host "Buoc 6: Test ket noi database..." -ForegroundColor Cyan
try {
    $result = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Ket noi database thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "Ket noi database that bai" -ForegroundColor Red
        Write-Host "Ket qua: $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Loi khi test ket noi: $_" -ForegroundColor Red
}

# Buoc 7: Kiem tra logs
Write-Host "Buoc 7: Kiem tra database logs..." -ForegroundColor Cyan
Write-Host "10 dong log cuoi cung:" -ForegroundColor Yellow
docker-compose logs --tail=10 sqlserver

# Buoc 8: Chay script khoi tao
Write-Host "Buoc 8: Chay script khoi tao database..." -ForegroundColor Cyan
try {
    $initResult = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -i /docker-entrypoint-initdb.d/init-database.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Khoi tao database thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "Khoi tao database co the da that bai" -ForegroundColor Yellow
        Write-Host "Ket qua: $initResult" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Loi khi khoi tao database: $_" -ForegroundColor Red
}

# Buoc 9: Test ket noi cuoi cung
Write-Host "Buoc 9: Test ket noi cuoi cung..." -ForegroundColor Cyan
try {
    $finalTest = docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT name FROM sys.databases" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database da san sang!" -ForegroundColor Green
        Write-Host "Danh sach databases:" -ForegroundColor Cyan
        Write-Host $finalTest -ForegroundColor White
    } else {
        Write-Host "Van khong the ket noi database" -ForegroundColor Red
        Write-Host "Ket qua: $finalTest" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Loi cuoi cung: $_" -ForegroundColor Red
}

Write-Host "`nKet qua:" -ForegroundColor Cyan
Write-Host "Neu thay 'Database da san sang!' thi ban co the tiep tuc voi backend." -ForegroundColor Green
Write-Host "Neu van loi, hay kiem tra logs va thu lai." -ForegroundColor Yellow

Write-Host "`nCan giup do them?" -ForegroundColor Cyan
Write-Host "1. Kiem tra logs: docker-compose logs sqlserver" -ForegroundColor White
Write-Host "2. Kiem tra status: docker ps" -ForegroundColor White
Write-Host "3. Restart Docker Desktop neu can" -ForegroundColor White
