-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ClassroomDB')
BEGIN
    CREATE DATABASE ClassroomDB;
END
GO

USE ClassroomDB;
GO

-- Create tables based on Prisma schema
-- Note: This is a basic initialization script
-- You may need to adjust based on your specific requirements

-- Create Account table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Account]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Account] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(255) UNIQUE NOT NULL,
        [password] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(255) NOT NULL,
        [isActive] BIT DEFAULT 1,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Create User table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND type in (N'U'))
BEGIN
    CREATE TABLE [User] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [accountId] INT UNIQUE NOT NULL,
        [fullName] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255) UNIQUE NOT NULL,
        [phone] NVARCHAR(20),
        [address] NVARCHAR(500),
        [avatar] NVARCHAR(500),
        [gender] NVARCHAR(10),
        [dateOfBirth] DATE,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([accountId]) REFERENCES [Account]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Create PersonalProfile table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PersonalProfile]') AND type in (N'U'))
BEGIN
    CREATE TABLE [PersonalProfile] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT UNIQUE NOT NULL,
        [idCardNumber] NVARCHAR(20),
        [idCardIssueDate] DATE,
        [idCardIssuePlace] NVARCHAR(255),
        [placeOfBirth] NVARCHAR(255),
        [permanentAddress] NVARCHAR(500),
        [phoneEmergency] NVARCHAR(20),
        [bankName] NVARCHAR(255),
        [bankBranch] NVARCHAR(255),
        [bankAccountNumber] NVARCHAR(50),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Create FamilyInfo table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FamilyInfo]') AND type in (N'U'))
BEGIN
    CREATE TABLE [FamilyInfo] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT UNIQUE NOT NULL,
        [fatherFullName] NVARCHAR(255),
        [fatherYearOfBirth] INT,
        [fatherPhone] NVARCHAR(20),
        [motherFullName] NVARCHAR(255),
        [motherYearOfBirth] INT,
        [motherPhone] NVARCHAR(20),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Create AcademicProfile table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AcademicProfile]') AND type in (N'U'))
BEGIN
    CREATE TABLE [AcademicProfile] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT UNIQUE NOT NULL,
        [role] NVARCHAR(255) NOT NULL,
        [campus] NVARCHAR(255),
        [trainingType] NVARCHAR(255),
        [degreeLevel] NVARCHAR(255),
        [academicYear] NVARCHAR(20),
        [enrollmentDate] DATE,
        [classCode] NVARCHAR(50),
        [title] NVARCHAR(255),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Create Teacher table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Teacher]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Teacher] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT UNIQUE NOT NULL,
        [teacherCode] NVARCHAR(50) UNIQUE NOT NULL,
        [departmentId] INT,
        [majorId] INT,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Create Student table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Student]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Student] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [userId] INT UNIQUE NOT NULL,
        [studentCode] NVARCHAR(50) UNIQUE NOT NULL,
        [classId] INT,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE
    );
END
GO

-- Insert default admin user
IF NOT EXISTS (SELECT * FROM [Account] WHERE username = 'admin')
BEGIN
    INSERT INTO [Account] (username, password, role, isActive)
    VALUES ('admin', '$2b$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', 'admin', 1);
    
    INSERT INTO [User] (accountId, fullName, email)
    VALUES (SCOPE_IDENTITY(), 'Administrator', 'admin@classroom.com');
END
GO

PRINT 'Database initialization completed successfully!';
GO

