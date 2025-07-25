require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sapassword',
    server: process.env.DB_SERVER || 'CONGHIEU',
    database: process.env.DB_DATABASE || 'ClassroomManagement',
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        encrypt: false
    }
};

module.exports = config; 