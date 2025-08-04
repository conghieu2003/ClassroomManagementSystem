require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db.config');

const PORT = 5000;

async function startServer() {
    try {
        // Kiểm tra kết nối database
        await prisma.$connect();
        console.log('Kết nối database thành công.');

        app.listen(PORT, () => {
            console.log(`Server đang chạy trên cổng ${PORT}`);
        });
    } catch (error) {
        console.error('Không thể kết nối đến database:', error);
        process.exit(1);
    }
}

startServer();

// Cleanup khi tắt server
process.on('beforeExit', async () => {
    await prisma.$disconnect();
}); 