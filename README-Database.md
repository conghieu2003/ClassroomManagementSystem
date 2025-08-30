# 🚀 Classroom Management System - Database Deployment

**Hướng dẫn chi tiết deploy database SQL Server bằng Docker Desktop trên Windows**

## 📋 Yêu cầu hệ thống

- **Windows 10/11** (64-bit)
- **Docker Desktop for Windows** 
- **Node.js** (version 16 trở lên)
- **Git Bash** hoặc **PowerShell** hoặc **Command Prompt**

## 🎯 Mục tiêu
- Deploy database SQL Server bằng Docker
- Mọi người trong team có thể dùng chung database
- Dễ dàng backup và restore
- Không cần cài đặt SQL Server trực tiếp trên máy

---

## 🔧 BƯỚC 1: Cài đặt Docker Desktop

### 1.1 Tải Docker Desktop
- Truy cập: https://www.docker.com/products/docker-desktop/
- Click "Download for Windows"
- Chọn phiên bản phù hợp (Windows 10/11)

### 1.2 Cài đặt Docker Desktop
1. **Chạy file .exe** đã tải về
2. **Chọn "Use WSL 2"** khi được hỏi (khuyến nghị)
3. **Đợi cài đặt hoàn tất**
4. **Restart máy tính** nếu được yêu cầu

### 1.3 Khởi động Docker Desktop
1. **Tìm icon Docker** ở system tray (góc phải dưới)
2. **Click đúp** để mở Docker Desktop
3. **Đợi Docker khởi động** (icon chuyển từ đỏ sang xanh)
4. **Sign in** vào Docker Hub (tùy chọn)

### 1.4 Kiểm tra Docker
Mở **PowerShell** hoặc **Command Prompt** và chạy:
```powershell
docker --version
docker-compose --version
```
Nếu hiện version number là OK!

---

## ⚙️ BƯỚC 2: Chuẩn bị dự án

### 2.1 Mở thư mục dự án
```powershell
# Mở PowerShell ở thư mục dự án
cd "D:\KhoaLuan\ClassroomManagementSystem"
```

### 2.2 Kiểm tra cấu trúc file
Bạn sẽ thấy các file sau:
```
📁 ClassroomManagementSystem/
├── 📄 docker-compose.yml
├── 📁 init-scripts/
│   └── 📄 init-database.sql
├── 📄 init-database.ps1
├── 📄 init-database.bat
├── 📁 backend/
│   ├── 📄 env.example
│   └── 📁 prisma/
└── 📄 README-Database.md
```

---

## 🗄️ BƯỚC 3: Khởi tạo Database

### 3.1 Cách 1: Sử dụng PowerShell (Khuyến nghị)
1. **Mở PowerShell với quyền Administrator**
   - Nhấn `Windows + X`
   - Chọn "Windows PowerShell (Admin)" hoặc "Terminal (Admin)"

2. **Di chuyển đến thư mục dự án**
   ```powershell
   cd "D:\KhoaLuan\ClassroomManagementSystem"
   ```

3. **Chạy script khởi tạo**
   ```powershell
   .\init-database.ps1
   ```

### 3.2 Cách 2: Sử dụng Command Prompt
1. **Mở Command Prompt**
   - Nhấn `Windows + R`
   - Gõ `cmd` và nhấn Enter

2. **Di chuyển đến thư mục dự án**
   ```cmd
   cd /d "D:\KhoaLuan\ClassroomManagementSystem"
   ```

3. **Chạy script khởi tạo**
   ```cmd
   init-database.bat
   ```

### 3.3 Cách 3: Thủ công từng bước
Nếu scripts không hoạt động, làm theo các bước sau:

1. **Khởi động database container**
   ```powershell
   docker-compose up -d sqlserver
   ```

2. **Đợi database sẵn sàng** (khoảng 30 giây)
   ```powershell
   Start-Sleep -Seconds 30
   ```

3. **Kiểm tra database đang chạy**
   ```powershell
   docker ps
   ```
   Bạn sẽ thấy container `classroom_db` đang chạy

4. **Chạy script khởi tạo database**
   ```powershell
   docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i /docker-entrypoint-initdb.d/init-database.sql
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

### 4.3 Generate Prisma client
```powershell
npm run prisma:generate
```

### 4.4 Chạy migrations
```powershell
npm run prisma:migrate
```

---

## 🚀 BƯỚC 5: Khởi động Backend

```powershell
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

---

## ✅ KIỂM TRA HOẠT ĐỘNG

### 5.1 Kiểm tra Docker containers
```powershell
docker ps
```
Kết quả mong đợi:
```
CONTAINER ID   IMAGE                                    COMMAND                  CREATED         STATUS                   PORTS                    NAMES
abc123def456   mcr.microsoft.com/mssql/server:2022     "/opt/mssql/bin/perm…"   2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:1433->1433/tcp   classroom_db
```

### 5.2 Kiểm tra database logs
```powershell
docker-compose logs sqlserver
```

### 5.3 Kiểm tra kết nối database
```powershell
docker exec classroom_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT name FROM sys.databases"
```

---

## 🛠️ QUẢN LÝ DATABASE

### Dừng database
```powershell
docker-compose down
```

### Dừng và xóa data (cẩn thận!)
```powershell
docker-compose down -v
```

### Khởi động lại database
```powershell
docker-compose up -d sqlserver
```

### Xem logs real-time
```powershell
docker-compose logs -f sqlserver
```

---

## 🔍 TROUBLESHOOTING

### ❌ Lỗi: "Docker is not running"
**Giải pháp:**
1. Mở Docker Desktop
2. Đợi icon Docker chuyển sang màu xanh
3. Chạy lại script

### ❌ Lỗi: "Port 1433 is already in use"
**Giải pháp:**
1. Kiểm tra port đang được sử dụng:
   ```powershell
   netstat -ano | findstr :1433
   ```
2. Dừng service đang sử dụng port đó
3. Hoặc thay đổi port trong `docker-compose.yml`:
   ```yaml
   ports:
     - "1434:1433"  # Thay đổi từ 1433 sang 1434
   ```

### ❌ Lỗi: "Could not connect to database"
**Giải pháp:**
1. Đợi thêm thời gian (database cần 1-2 phút để khởi động)
2. Kiểm tra logs:
   ```powershell
   docker-compose logs sqlserver
   ```
3. Restart container:
   ```powershell
   docker-compose restart sqlserver
   ```

### ❌ Lỗi: "Prisma generate failed"
**Giải pháp:**
1. Xóa thư mục `node_modules`:
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   ```
2. Cài đặt lại:
   ```powershell
   npm install
   npm run prisma:generate
   ```

---

## 📊 THÔNG TIN KẾT NỐI

| Thông tin | Giá trị |
|-----------|---------|
| **Database Type** | SQL Server 2022 |
| **Host** | `localhost` |
| **Port** | `1433` |
| **Database Name** | `ClassroomDB` |
| **Username** | `sa` |
| **Password** | `YourStrong@Passw0rd` |
| **Connection String** | `sqlserver://localhost:1433;database=ClassroomDB;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true` |

---

## 🔐 BẢO MẬT

### ⚠️ Lưu ý quan trọng:
1. **Thay đổi password mặc định** trong production
2. **Không commit file `.env`** vào git
3. **Sử dụng strong password** cho JWT_SECRET
4. **Backup database** thường xuyên

### 🔑 Thay đổi password database:
1. Sửa file `docker-compose.yml`:
   ```yaml
   environment:
     - MSSQL_SA_PASSWORD=YourNewStrongPassword123!
   ```
2. Sửa file `backend/.env`:
   ```
   DATABASE_URL="sqlserver://localhost:1433;database=ClassroomDB;user=sa;password=YourNewStrongPassword123!;trustServerCertificate=true"
   ```
3. Restart database:
   ```powershell
   docker-compose down
   docker-compose up -d sqlserver
   ```

---

## 🎉 HOÀN THÀNH!

Sau khi hoàn thành tất cả các bước:
- ✅ Database SQL Server đang chạy trên Docker
- ✅ Backend có thể kết nối database
- ✅ Mọi người trong team có thể dùng chung database
- ✅ Dễ dàng backup/restore và quản lý

### 🚀 Bước tiếp theo:
1. **Test API endpoints** của backend
2. **Tạo dữ liệu mẫu** trong database
3. **Kết nối frontend** với backend
4. **Deploy lên server** (nếu cần)

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. **Kiểm tra logs**: `docker-compose logs sqlserver`
2. **Kiểm tra status**: `docker ps`
3. **Restart Docker Desktop** nếu cần
4. **Kiểm tra Windows Defender** có chặn Docker không

**Chúc bạn thành công! 🎯**

