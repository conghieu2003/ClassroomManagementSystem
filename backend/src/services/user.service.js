const prisma = require('../config/db.config');
const bcryptConfig = require('../config/bcrypt.config');
const emailService = require('./email.service');

function mapAccountRow(account) {
    return {
        id: account.user?.id || null,
        accountId: account.id,
        username: account.username,
        fullName: account.user?.fullName || '',
        email: account.user?.email || '',
        role: account.role,
        status: account.isActive ? 'active' : 'inactive',
        teacherCode: account.user?.teacher?.teacherCode || null,
        studentCode: account.user?.student?.studentCode || null,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
    };
}

class UserService {
    async getDepartments() {
        const rows = await prisma.$queryRaw`SELECT id, name FROM Department ORDER BY name ASC`;
        return Array.isArray(rows) ? rows.map(r => ({ id: r.id, name: r.name })) : [];
    }

    async getMajors(departmentId) {
        if (departmentId) {
            const rows = await prisma.$queryRaw`SELECT id, name FROM Major WHERE departmentId = ${Number(departmentId)} ORDER BY name ASC`;
            return Array.isArray(rows) ? rows.map(r => ({ id: r.id, name: r.name })) : [];
        }
        const rows = await prisma.$queryRaw`SELECT id, name FROM Major ORDER BY name ASC`;
        return Array.isArray(rows) ? rows.map(r => ({ id: r.id, name: r.name })) : [];
    }
    async getNextCode(role) {
        const isTeacher = role === 'teacher';
        const prefix = isTeacher ? '10' : '20';

        // Query max numeric 8-digit code with proper prefix, ignore non-numeric legacy codes (e.g., TC001)
        const tableName = isTeacher ? 'Teacher' : 'Student';
        const columnName = isTeacher ? 'teacherCode' : 'studentCode';
        const rows = await prisma.$queryRawUnsafe(
            `SELECT MAX(CAST(${columnName} AS BIGINT)) AS maxCode
             FROM ${tableName}
             WHERE TRY_CONVERT(BIGINT, ${columnName}) IS NOT NULL
               AND LEN(${columnName}) = 8
               AND LEFT(${columnName}, 2) = '${prefix}'`
        );

        let nextNumber;
        if (Array.isArray(rows) && rows.length > 0 && rows[0].maxCode) {
            const maxCode = Number(rows[0].maxCode);
            nextNumber = maxCode + 1;
        } else {
            // Start base: 10000000 or 20000000
            nextNumber = Number(prefix + '000000');
        }

        const next = String(nextNumber).padStart(8, '0');
        return next;
    }

    async getFormInit(role) {
        // Get next code based on role
        const code = await this.getNextCode(role);

        // Build departments and majors from new catalog tables (id + name)
        const departmentsRows = await prisma.$queryRaw`SELECT id, name FROM Department ORDER BY name ASC`;
        const majorsRows = await prisma.$queryRaw`SELECT id, name FROM Major ORDER BY name ASC`;

        const departments = Array.isArray(departmentsRows)
            ? departmentsRows.map((r) => ({ id: r.id, name: r.name })).filter((r) => r.name)
            : [];
        const majors = Array.isArray(majorsRows)
            ? majorsRows.map((r) => ({ id: r.id, name: r.name })).filter((r) => r.name)
            : [];

        // For teacher/student, username shown on FE equals login code (numeric, 8 chars)
        const previewUsername = code;

        return { code, previewUsername, departments, majors };
    }
    async listUsers(role) {
        const whereClause = role ? { role } : {};
        const accounts = await prisma.account.findMany({
            where: whereClause,
            include: {
                user: {
                    include: {
                        teacher: true,
                        student: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return accounts.map(mapAccountRow);
    }

    async createUser(userData) {
        const {
            fullName,
            email,
            phone,
            address,
            avatar,
            gender,
            dateOfBirth,
            role,
            teacherCode,
            studentCode,
            title,
            departmentId,
            majorId,
            // Optional from FE but ignored per policy
            username: _ignoredUsername,
            password: _ignoredPassword,
            // Deprecated
            department: _ignoredDepartment,
            major: _ignoredMajor,
            classId: _ignoredClassId,
            sendEmail,
            emailSubject,
            emailContent
        } = userData;

        try {
            // Kiểm tra email đã tồn tại
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                throw new Error('Email đã tồn tại trong hệ thống');
            }

            // Kiểm tra mã giảng viên/sinh viên đã tồn tại
            if (role === 'teacher' && teacherCode) {
                const existingTeacher = await prisma.teacher.findUnique({
                    where: { teacherCode }
                });
                if (existingTeacher) {
                    throw new Error('Mã giảng viên đã tồn tại');
                }
            }

            if (role === 'student' && studentCode) {
                const existingStudent = await prisma.student.findUnique({
                    where: { studentCode }
                });
                if (existingStudent) {
                    throw new Error('Mã sinh viên đã tồn tại');
                }
            }

            // Xác định username và password (hash bằng bcrypt)
            // Always generate login code (8 digits) based on role
            const codeForLogin = await this.getNextCode(role);

            // Generate internal username (not used for teacher/student login)
            const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const username = `${role.slice(0, 3)}_${uniqueSuffix}`; // e.g., tea_..., stu_...

            // Fixed default password policy
            const plainPassword = '123456';
            const hashedPassword = await bcryptConfig.hashPassword(plainPassword);

            // Tạo transaction để đảm bảo tính nhất quán
            const result = await prisma.$transaction(async (tx) => {
                // Tạo account
                const account = await tx.account.create({
                    data: {
                        username,
                        password: hashedPassword,
                        role,
                        isActive: true
                    }
                });

                // Tạo user
                const user = await tx.user.create({
                    data: {
                        accountId: account.id,
                        fullName,
                        email,
                        phone: phone || null,
                        address: address || null,
                        avatar: avatar || 'https://via.placeholder.com/150/CCCCCC/666666?text=' + encodeURIComponent(fullName.charAt(0).toUpperCase()),
                        gender: gender || null,
                        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
                    }
                });

                // Tạo thêm bản ghi teacher hoặc student
                if (role === 'teacher') {
                    await tx.teacher.create({
                        data: {
                            userId: user.id,
                            teacherCode: codeForLogin,
                            departmentId: departmentId || null,
                            majorId: majorId || null,
                            title: title || 'Giảng viên'
                        }
                    });
                    const enrollDate = userData.enrollmentDate ? new Date(userData.enrollmentDate) : null;
                    const enrollDateStr = enrollDate ? enrollDate.toISOString().slice(0, 10) : null;
                    const dateSqlTeacher = enrollDateStr ? `'${enrollDateStr}'` : 'NULL';
                    await tx.$executeRawUnsafe(
                        `INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode, title)
                         VALUES (${user.id}, 'teacher', ${userData.campus ? `'${userData.campus}'` : 'NULL'}, ${userData.trainingType ? `'${userData.trainingType}'` : 'NULL'}, ${userData.degreeLevel ? `'${userData.degreeLevel}'` : 'NULL'}, ${userData.academicYear ? `'${userData.academicYear}'` : 'NULL'}, ${dateSqlTeacher}, NULL, ${title ? `'${title}'` : `'Giảng viên'`})`
                    );
                } else if (role === 'student') {
                    await tx.student.create({
                        data: {
                            userId: user.id,
                            studentCode: codeForLogin,
                            departmentId: departmentId || null,
                            majorId: majorId || null
                        }
                    });
                    const enrollDateStu = userData.enrollmentDate ? new Date(userData.enrollmentDate) : null;
                    const enrollDateStuStr = enrollDateStu ? enrollDateStu.toISOString().slice(0, 10) : null;
                    const dateSqlStudent = enrollDateStuStr ? `'${enrollDateStuStr}'` : 'NULL';
                    await tx.$executeRawUnsafe(
                        `INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode, title)
                         VALUES (${user.id}, 'student', ${userData.campus ? `'${userData.campus}'` : 'NULL'}, ${userData.trainingType ? `'${userData.trainingType}'` : 'NULL'}, ${userData.degreeLevel ? `'${userData.degreeLevel}'` : 'NULL'}, ${userData.academicYear ? `'${userData.academicYear}'` : 'NULL'}, ${dateSqlStudent}, ${userData.classCode ? `'${userData.classCode}'` : 'NULL'}, NULL)`
                    );
                }

                return { account, user };
            });

            // Gửi email thông báo nếu được yêu cầu
            if (sendEmail && email) {
                try {
                    const finalEmailContent = (emailContent || '')
                        .replace('{username}', username)
                        .replace('{password}', plainPassword);

                    await emailService.sendEmail({
                        to: email,
                        subject: emailSubject || 'Thông báo tài khoản mới',
                        content: finalEmailContent
                    });
                } catch (emailError) {
                    console.error('Lỗi gửi email:', emailError);
                    // Không throw error vì tài khoản đã được tạo thành công
                }
            }

            return {
                success: true,
                message: 'Tạo tài khoản thành công',
                data: {
                    id: result.user.id,
                    username,
                    fullName,
                    email,
                    role,
                    teacherCode: role === 'teacher' ? codeForLogin : null,
                    studentCode: role === 'student' ? codeForLogin : null
                }
            };
        } catch (error) {
            throw new Error(`Lỗi tạo tài khoản: ${error.message}`);
        }
    }
}

module.exports = new UserService();
