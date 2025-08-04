BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Account_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Account_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [accountId] INT NOT NULL,
    [fullName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_accountId_key] UNIQUE NONCLUSTERED ([accountId]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Teacher] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [teacherCode] NVARCHAR(1000) NOT NULL,
    [department] NVARCHAR(1000),
    CONSTRAINT [Teacher_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Teacher_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [Teacher_teacherCode_key] UNIQUE NONCLUSTERED ([teacherCode])
);

-- CreateTable
CREATE TABLE [dbo].[Student] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [studentCode] NVARCHAR(1000) NOT NULL,
    [major] NVARCHAR(1000),
    CONSTRAINT [Student_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Student_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [Student_studentCode_key] UNIQUE NONCLUSTERED ([studentCode])
);

-- CreateTable
CREATE TABLE [dbo].[Subject] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [credits] INT NOT NULL,
    [description] NVARCHAR(1000),
    CONSTRAINT [Subject_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Subject_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Class] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [subjectId] INT NOT NULL,
    [teacherId] INT NOT NULL,
    [semester] NVARCHAR(1000) NOT NULL,
    [academicYear] NVARCHAR(1000) NOT NULL,
    [maxStudents] INT NOT NULL,
    CONSTRAINT [Class_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Class_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[ClassRegistration] (
    [id] INT NOT NULL IDENTITY(1,1),
    [classId] INT NOT NULL,
    [studentId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ClassRegistration_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ClassRegistration_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ClassRoom] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [building] NVARCHAR(1000) NOT NULL,
    [floor] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    CONSTRAINT [ClassRoom_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ClassRoom_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Schedule] (
    [id] INT NOT NULL IDENTITY(1,1),
    [classId] INT NOT NULL,
    [classRoomId] INT NOT NULL,
    [teacherId] INT NOT NULL,
    [dayOfWeek] INT NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [endTime] DATETIME2 NOT NULL,
    CONSTRAINT [Schedule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RoomRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [classRoomId] INT NOT NULL,
    [requesterId] INT NOT NULL,
    [purpose] NVARCHAR(1000) NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [endTime] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoomRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RoomRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_accountId_fkey] FOREIGN KEY ([accountId]) REFERENCES [dbo].[Account]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Teacher] ADD CONSTRAINT [Teacher_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [Student_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [Class_subjectId_fkey] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[Subject]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [Class_teacherId_fkey] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[Teacher]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ClassRegistration] ADD CONSTRAINT [ClassRegistration_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[Class]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ClassRegistration] ADD CONSTRAINT [ClassRegistration_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_classId_fkey] FOREIGN KEY ([classId]) REFERENCES [dbo].[Class]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_teacherId_fkey] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[Teacher]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RoomRequest] ADD CONSTRAINT [RoomRequest_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
