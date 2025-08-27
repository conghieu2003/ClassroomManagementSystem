const prisma = require('../config/db.config');

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
}

module.exports = new UserService();
