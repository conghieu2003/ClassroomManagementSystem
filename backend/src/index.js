require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db.config');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('🚀 Khởi động Classroom Management System Backend...');
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔌 Port: ${PORT}`);
        console.log(`🗄️ Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '1433'}`);
        console.log('');

        // Kiểm tra kết nối database
        console.log('⏳ Đang kết nối database...');
        await prisma.$connect();
        console.log('✅ Kết nối database thành công.');

        app.listen(PORT, () => {
            console.log(`🎉 Server đang chạy trên cổng ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Không thể kết nối đến database:', error);
        process.exit(1);
    }
}

startServer();

// Cleanup khi tắt server
process.on('beforeExit', async () => {
    console.log('🛑 Đang đóng kết nối database...');
    await prisma.$disconnect();
    console.log('✅ Đã đóng kết nối database.');
});

// Xử lý graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Nhận tín hiệu SIGTERM, đang tắt server...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Nhận tín hiệu SIGINT, đang tắt server...');
    await prisma.$disconnect();
    process.exit(0);
}); 