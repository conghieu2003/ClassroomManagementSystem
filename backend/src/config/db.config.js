const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "sqlserver://CONGHIEU:1433;database=ClassroomManagement;user=sa;password=sapassword;encrypt=true;trustServerCertificate=true;connection_limit=20;pool_timeout=0"
        }
    },
    log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma; 