const prisma = require('../config/db.config');

class UserService {
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    account: true,
                    teacher: true,
                    student: true
                }
            });

            if (!user) {
                throw new Error('Không tìm thấy người dùng');
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thông tin người dùng: ${error.message}`);
        }
    }

    async updateUser(userId, updateData) {
        try {
            const { email, phone, address, ...otherData } = updateData;

            // Kiểm tra email đã tồn tại
            if (email) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        email,
                        NOT: {
                            id: userId
                        }
                    }
                });

                if (existingUser) {
                    throw new Error('Email đã được sử dụng');
                }
            }

            // Cập nhật thông tin người dùng
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    email,
                    phone,
                    address,
                    ...otherData
                },
                include: {
                    account: true,
                    teacher: true,
                    student: true
                }
            });

            return {
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedUser
            };
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật thông tin người dùng: ${error.message}`);
        }
    }

    async getTeacherSchedule(teacherId, startDate, endDate) {
        try {
            const schedules = await prisma.schedule.findMany({
                where: {
                    teacherId,
                    startTime: {
                        gte: new Date(startDate)
                    },
                    endTime: {
                        lte: new Date(endDate)
                    }
                },
                include: {
                    class: {
                        include: {
                            subject: true
                        }
                    },
                    classRoom: true
                },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            return {
                success: true,
                data: schedules
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy lịch dạy: ${error.message}`);
        }
    }

    async getStudentSchedule(studentId, startDate, endDate) {
        try {
            const schedules = await prisma.schedule.findMany({
                where: {
                    class: {
                        registrations: {
                            some: {
                                studentId,
                                status: 'active'
                            }
                        }
                    },
                    startTime: {
                        gte: new Date(startDate)
                    },
                    endTime: {
                        lte: new Date(endDate)
                    }
                },
                include: {
                    class: {
                        include: {
                            subject: true,
                            teacher: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    classRoom: true
                },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            return {
                success: true,
                data: schedules
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy lịch học: ${error.message}`);
        }
    }
}

module.exports = new UserService();
