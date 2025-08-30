# 🚀 QUICK START GUIDE - Windows + Docker Desktop

**Hướng dẫn nhanh deploy database trong 5 phút!**

---

## ⚡ BƯỚC 1: Cài đặt Docker Desktop

### 1.1 Tải Docker Desktop
- **Link**: https://www.docker.com/products/docker-desktop/
- **Click**: "Download for Windows"
- **Chọn**: Windows 10/11 version

### 1.2 Cài đặt
1. **Chạy file .exe** đã tải
2. **Chọn "Use WSL 2"** ✅
3. **Click "OK"** và đợi cài đặt
4. **Restart máy** nếu được yêu cầu

### 1.3 Khởi động
1. **Tìm icon Docker** ở system tray (góc phải dưới)
2. **Click đúp** để mở Docker Desktop
3. **Đợi icon chuyển sang màu xanh** ✅

---

## 🎯 BƯỚC 2: Chạy Database

### 2.1 Mở PowerShell (Admin)
- Nhấn `Windows + X`
- Chọn "Windows PowerShell (Admin)"

### 2.2 Di chuyển đến dự án
```powershell
cd "D:\KhoaLuan\ClassroomManagementSystem"
```

### 2.3 Chạy script tự động
```powershell
.\init-database.ps1
```

**Đợi khoảng 2-3 phút** để script hoàn thành!

---

## ✅ BƯỚC 3: Kiểm tra hoạt động

### 3.1 Kiểm tra container
```powershell
docker ps
```
**Kết quả mong đợi:**
```
CONTAINER ID   IMAGE                                    STATUS                   PORTS                    NAMES
abc123def456   mcr.microsoft.com/mssql/server:2022     Up 2 minutes (healthy)   0.0.0.0:1433->1433/tcp   classroom_db
```

### 3.2 Kiểm tra database
```powershell
docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT name FROM sys.databases"
```

---

## 🔧 BƯỚC 4: Cấu hình Backend

### 4.1 Tạo file .env
```powershell
cd backend
copy env.example .env
```

### 4.2 Cài đặt dependencies
```powershell
npm install
```

### 4.3 Setup Prisma
```powershell
npm run prisma:generate
npm run prisma:migrate
```

---

## 🚀 BƯỚC 5: Khởi động Backend

```powershell
npm run dev
```

**Backend sẽ chạy tại:** `http://localhost:3000`

---

## 🎉 HOÀN THÀNH!

**Database đã sẵn sàng!** Mọi người trong team có thể kết nối bằng:

- **Host**: `localhost`
- **Port**: `1433`
- **Database**: `ClassroomDB`
- **Username**: `sa`
- **Password**: `YourStrong@Passw0rd`

---

## 🆘 Nếu gặp lỗi

### ❌ "Docker is not running"
- Mở Docker Desktop
- Đợi icon chuyển sang màu xanh

### ❌ "Port 1433 is already in use"
```powershell
netstat -ano | findstr :1433
```
- Dừng service đang sử dụng port đó

### ❌ Script không chạy
- Chạy từng bước thủ công:
```powershell
docker-compose up -d sqlserver
Start-Sleep -Seconds 30
docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i /docker-entrypoint-initdb.d/init-database.sql
```

---

## 📞 Cần giúp đỡ?

1. **Kiểm tra logs**: `docker-compose logs sqlserver`
2. **Kiểm tra status**: `docker ps`
3. **Restart Docker Desktop** nếu cần

**Chúc bạn thành công! 🎯**

