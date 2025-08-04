const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

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
            const hashedPassword = await bcrypt.hash(password, 10);

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

    async login(username, password) {
        try {
            // Tìm account và include các quan hệ
            const account = await prisma.account.findUnique({
                where: { username },
                include: {
                    user: {
                        include: {
                            teacher: true,
                            student: true
                        }
                    }
                }
            });

            if (!account) {
                throw new Error('Tài khoản không tồn tại');
            }

            if (!account.isActive) {
                throw new Error('Tài khoản đã bị khóa');
            }

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, account.password);
            if (!isValidPassword) {
                throw new Error('Mật khẩu không chính xác');
            }

            // Tạo JWT token
            const token = jwt.sign(
                { 
                    id: account.id,
                    username: account.username,
                    role: account.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return {
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token,
                    user: {
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
            const isValidPassword = await bcrypt.compare(oldPassword, account.password);
            if (!isValidPassword) {
                throw new Error('Mật khẩu cũ không chính xác');
            }

            // Hash mật khẩu mới
            const hashedPassword = await bcrypt.hash(newPassword, 10);

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