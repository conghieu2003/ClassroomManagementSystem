# 🚀 Classroom Management System - Hướng dẫn sử dụng

**Hệ thống quản lý lớp học với database SQL Server trên Docker**

---

## 📋 **Mục lục**

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt ban đầu](#cài-đặt-ban-đầu)
- [Khởi động project](#khởi-động-project)
- [Quản lý database](#quản-lý-database)
- [Quy trình hàng ngày](#quy-trình-hàng-ngày)
- [Troubleshooting](#troubleshooting)
- [Thông tin kết nối](#thông-tin-kết-nối)

---

## 🖥️ **Yêu cầu hệ thống**

- **Windows 10/11** (64-bit)
- **Docker Desktop for Windows**
- **Node.js** (version 16 trở lên)
- **Git Bash** hoặc **PowerShell** hoặc **Command Prompt**

---

## 🔧 **Cài đặt ban đầu**

### **Bước 1: Cài đặt Docker Desktop**
1. Tải từ: https://www.docker.com/products/docker-desktop/
2. Chọn "Use WSL 2" khi cài đặt
3. Restart máy tính nếu được yêu cầu
4. Khởi động Docker Desktop và đợi icon chuyển sang màu xanh

### **Bước 2: Clone project**
```bash
git clone <repository-url>
cd ClassroomManagementSystem
```

### **Bước 3: Cài đặt dependencies**
```bash
cd backend
npm install
```

### **Bước 4: Cấu hình môi trường**
```bash
# Tạo file .env từ env.example
copy env.example .env
```

---

## 🚀 **Khởi động project**

### **Cách 1: Sử dụng script tự động (Khuyến nghị)**

#### **Command Prompt:**
```cmd
# Mở Command Prompt
cd "D:\KhoaLuan\ClassroomManagementSystem"
scripts\start-project.bat
```

#### **PowerShell (nếu có file .ps1):**
```powershell
# Mở PowerShell với quyền Administrator
cd "D:\KhoaLuan\ClassroomManagementSystem"
.\scripts\start-project.ps1
```

### **Cách 2: Làm thủ công**

#### **Bước 1: Khởi động database**
```powershell
# Khởi động SQL Server container
docker-compose up -d sqlserver

# Đợi database sẵn sàng (3 phút)
Start-Sleep -Seconds 180
```

#### **Bước 2: Kiểm tra database**
```powershell
# Kiểm tra container status
docker ps

# Test kết nối database
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1"
```

#### **Bước 3: Khởi động backend**
```powershell
cd backend
npm run prisma:generate
npm run dev
```

---

## 🗄️ **Quản lý database**

### **1. Prisma Studio (Giao diện web)**
```bash
cd backend
npm run prisma:studio
```
- **URL**: http://localhost:5555
- **Chức năng**: Xem, thêm, sửa, xóa dữ liệu trực quan
- **Ưu điểm**: Giao diện đẹp, dễ sử dụng

### **2. Docker Commands**
```bash
# Xem logs database
docker-compose logs sqlserver

# Xem logs real-time
docker-compose logs -f sqlserver

# Dừng database
docker-compose down

# Khởi động lại database
docker-compose up -d sqlserver

# Vào database trực tiếp
docker exec -it classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d ClassroomDB
```

### **3. SQL Server Management Studio (SSMS)**
- **Host**: `localhost`
- **Port**: `1433`
- **Database**: `ClassroomDB`
- **Username**: `sa`
- **Password**: `YourStrong@Passw0rd`
- **Trust Server Certificate**: `true`

### **4. Backup và Restore**
```bash
# Backup database
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "BACKUP DATABASE ClassroomDB TO DISK = '/var/opt/mssql/backup/ClassroomDB.bak'"

# Restore database
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "RESTORE DATABASE ClassroomDB FROM DISK = '/var/opt/mssql/backup/ClassroomDB.bak'"
```

---

## 📅 **Quy trình hàng ngày**

### **Khi bắt đầu code:**
1. **Mở Docker Desktop**
   - Đợi icon chuyển sang màu xanh
   - Đảm bảo Docker đang chạy

2. **Khởi động project**
   ```bash
   .\scripts\start-project.ps1
   ```

3. **Đợi script hoàn thành**
   - Database khởi động (3 phút)
   - Backend khởi động
   - Prisma Studio mở tự động

4. **Bắt đầu code!**
   - Backend: http://localhost:3000
   - Prisma Studio: http://localhost:5555

### **Khi kết thúc:**
1. **Dừng backend**
   - Nhấn `Ctrl + C` trong terminal backend

2. **Dừng database (tùy chọn)**
   ```bash
   docker-compose down
   ```

3. **Tắt Docker Desktop**
   - Click chuột phải vào icon Docker
   - Chọn "Quit Docker Desktop"

---

## 🔍 **Troubleshooting**

### **Lỗi thường gặp:**

#### **1. "Docker is not running"**
**Giải pháp:**
- Mở Docker Desktop
- Đợi icon chuyển sang màu xanh

#### **2. "Port 1433 is already in use"**
**Giải pháp:**
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :1433

# Dừng service đang sử dụng port đó
# Hoặc thay đổi port trong docker-compose.yml
```

#### **3. "Authentication failed"**
**Giải pháp:**
```bash
# Restart container
docker-compose down
docker-compose up -d sqlserver

# Đợi 3 phút
Start-Sleep -Seconds 180

# Test kết nối
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1"
```

#### **4. "Database does not exist"**
**Giải pháp:**
```bash
# Tạo database
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "CREATE DATABASE ClassroomDB"

# Chạy script khởi tạo
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d ClassroomDB -i /docker-entrypoint-initdb.d/init-database.sql
```

#### **5. "Prisma migrate failed"**
**Giải pháp:**
```bash
# Reset database
npx prisma migrate reset

# Tạo migration mới
npx prisma migrate dev --name init

# Generate client
npm run prisma:generate
```

---

## 📊 **Thông tin kết nối**

### **Database:**
- **Type**: SQL Server 2022
- **Host**: `localhost`
- **Port**: `1433`
- **Database**: `ClassroomDB`
- **Username**: `sa`
- **Password**: `YourStrong@Passw0rd`
- **Connection String**: `sqlserver://localhost:1433;database=ClassroomDB;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true`

### **Backend:**
- **URL**: http://localhost:3000
- **Environment**: Development
- **Database ORM**: Prisma

### **Prisma Studio:**
- **URL**: http://localhost:5555
- **Chức năng**: Database management interface

---

## 🛠️ **Các lệnh hữu ích**

### **Docker:**
```bash
# Kiểm tra containers
docker ps

# Xem logs
docker-compose logs sqlserver

# Restart container
docker-compose restart sqlserver

# Xem thông tin container
docker inspect classroom_db
```

### **Database:**
```bash
# Test kết nối
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT 1"

# Xem databases
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -Q "SELECT name FROM sys.databases"

# Xem tables
docker exec classroom_db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C -d ClassroomDB -Q "SELECT name FROM sys.tables"
```

### **Prisma:**
```bash
# Generate client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate

# Reset database
npx prisma migrate reset

# Mở Prisma Studio
npm run prisma:studio
```

---

## 📁 **Cấu trúc project**

```
ClassroomManagementSystem/
├── docker-compose.yml          # Docker configuration
├── scripts/                    # Project management scripts
│   ├── start-project.ps1      # PowerShell startup script
│   ├── start-project.bat      # Batch startup script
│   ├── init-database.ps1      # Database initialization
│   ├── init-database.bat      # Batch initialization
│   └── init-scripts/          # Database initialization
│       └── init-database.sql  # SQL script
├── backend/                    # Backend application
│   ├── .env                   # Environment variables
│   ├── prisma/                # Prisma configuration
│   └── src/                   # Source code
├── frontend/                   # Frontend application
├── USAGE-GUIDE.md             # File này
└── README-Database.md         # Database documentation
```

---

## 🎯 **Lợi ích của setup này**

- ✅ **Tự động hóa** - Khởi động project bằng 1 script
- ✅ **Persistent data** - Dữ liệu được lưu trữ lâu dài
- ✅ **Cross-platform** - Hoạt động trên Windows, Mac, Linux
- ✅ **Team sharing** - Mọi người dùng chung database
- ✅ **Easy management** - Prisma Studio giao diện đẹp
- ✅ **Backup/Restore** - Dễ dàng quản lý dữ liệu
- ✅ **No installation** - Không cần cài SQL Server trực tiếp

---

## 📞 **Hỗ trợ**

### **Nếu gặp vấn đề:**
1. **Kiểm tra logs**: `docker-compose logs sqlserver`
2. **Kiểm tra status**: `docker ps`
3. **Restart Docker Desktop** nếu cần
4. **Kiểm tra Windows Defender** có chặn Docker không

### **Tài liệu tham khảo:**
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)

---

## 🎉 **Kết luận**

Với setup này, bạn có thể:
- **Quản lý database** một cách dễ dàng
- **Khởi động project** nhanh chóng
- **Chia sẻ database** với team
- **Phát triển ứng dụng** hiệu quả

**Chúc bạn thành công! 🚀**

---

*Lưu ý: Đây là development environment. Trong production, hãy thay đổi password và cài đặt bảo mật phù hợp.*
