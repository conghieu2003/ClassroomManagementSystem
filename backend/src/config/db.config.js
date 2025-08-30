const { PrismaClient } = require('@prisma/client');
const config = require('./env.config');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.getDatabaseUrl()
        }
    },
    log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma; 