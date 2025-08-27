const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const bcryptConfig = require('../config/bcrypt.config');

const prisma = new PrismaClient();

class AuthService {
    async register(userData) {
        const { username, password, role, fullName, email, phone, address } = userData;

        try {
            // Kiểm tra username đã tồn tại
            const existingAccount = await prisma.account.findUnique({
                where: { username }
            });

            if (existingAccount) {
                throw new Error('Username đã tồn tại');
            }

            // Kiểm tra email đã tồn tại
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                throw new Error('Email đã tồn tại');
            }

            // Hash password
            const hashedPassword = await bcryptConfig.hashPassword(password);

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
                        phone,
                        address
                    }
                });

                // Tạo thêm bản ghi teacher hoặc student tùy theo role
                if (role === 'teacher') {
                    await tx.teacher.create({
                        data: {
                            userId: user.id,
                            teacherCode: `TC${user.id}`,
                            department: 'Chưa phân công'
                        }
                    });
                } else if (role === 'student') {
                    await tx.student.create({
                        data: {
                            userId: user.id,
                            studentCode: `ST${user.id}`,
                            major: 'Chưa phân ngành'
                        }
                    });
                }

                return { account, user };
            });

            return {
                success: true,
                message: 'Đăng ký thành công',
                data: result
            };
        } catch (error) {
            throw new Error(`Lỗi đăng ký: ${error.message}`);
        }
    }

    async login(identifier, password) {
        try {
            let account = null;

            // 1) Teacher login via teacherCode
            if (!account) {
                const teacherRecord = await prisma.teacher.findUnique({
                    where: { teacherCode: identifier },
                    include: {
                        user: { include: { account: true, teacher: true, student: true } }
                    }
                });
                if (teacherRecord?.user?.account && teacherRecord.user.account.role === 'teacher') {
                    account = { ...teacherRecord.user.account, user: teacherRecord.user };
                }
            }

            // 2) Student login via studentCode
            if (!account) {
                const studentRecord = await prisma.student.findUnique({
                    where: { studentCode: identifier },
                    include: {
                        user: { include: { account: true, teacher: true, student: true } }
                    }
                });
                if (studentRecord?.user?.account && studentRecord.user.account.role === 'student') {
                    account = { ...studentRecord.user.account, user: studentRecord.user };
                }
            }

            // 3) Admin login via userId (numeric)
            if (!account) {
                const userIdAsInt = Number(identifier);
                if (!Number.isNaN(userIdAsInt)) {
                    const adminUser = await prisma.user.findUnique({
                        where: { id: userIdAsInt },
                        include: { account: true, teacher: true, student: true }
                    });
                    if (adminUser && adminUser.account && adminUser.account.role === 'admin') {
                        account = { ...adminUser.account, user: adminUser };
                    }
                }
            }

            // 4) Backward compatibility: login via account.username
            if (!account) {
                const acc = await prisma.account.findUnique({
                    where: { username: identifier },
                    include: {
                        user: { include: { teacher: true, student: true } }
                    }
                });
                if (acc) account = acc;
            }

            if (!account) {
                throw new Error('Tài khoản không tồn tại');
            }

            if (!account.isActive) {
                throw new Error('Tài khoản đã bị khóa');
            }

            // Kiểm tra password
            const isValidPassword = await bcryptConfig.comparePassword(password, account.password);
            if (!isValidPassword) {
                throw new Error('Mật khẩu không chính xác');
            }

            const token = jwt.sign(
                {
                    id: account.id,
                    username: account.username,
                    role: account.role
                },
                process.env.JWT_SECRET || 'classroom_management_secret_key',
                { expiresIn: '24h' }
            );

            return {
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token,
                    user: {
                        username: account.username,
                        id: account.user.id,
                        fullName: account.user.fullName,
                        email: account.user.email,
                        role: account.role,
                        teacherCode: account.user.teacher?.teacherCode,
                        studentCode: account.user.student?.studentCode
                    }
                }
            };
        } catch (error) {
            throw new Error(`Lỗi đăng nhập: ${error.message}`);
        }
    }

    async changePassword(userId, oldPassword, newPassword) {
        try {
            const account = await prisma.account.findFirst({
                where: {
                    user: {
                        id: userId
                    }
                }
            });

            if (!account) {
                throw new Error('Tài khoản không tồn tại');
            }

            // Kiểm tra mật khẩu cũ
            const isValidPassword = await bcryptConfig.comparePassword(oldPassword, account.password);
            if (!isValidPassword) {
                throw new Error('Mật khẩu cũ không chính xác');
            }

            // Hash mật khẩu mới
            const hashedPassword = await bcryptConfig.hashPassword(newPassword);

            // Cập nhật mật khẩu
            await prisma.account.update({
                where: { id: account.id },
                data: { password: hashedPassword }
            });

            return {
                success: true,
                message: 'Đổi mật khẩu thành công'
            };
        } catch (error) {
            throw new Error(`Lỗi đổi mật khẩu: ${error.message}`);
        }
    }
}

module.exports = new AuthService(); 