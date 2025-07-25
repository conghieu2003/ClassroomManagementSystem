const sql = require('mssql');
const dbConfig = require('../config/db.config');
const smsService = require('./sms.service');
const Account = require('../models/account');
const User = require('../models/User');

class AuthService {
    async login(accountId, password) {
        try {
            console.log('Login attempt:', { accountId, password });
            
            const pool = await sql.connect(dbConfig);
            console.log('Connected to database');
            
            // Query to join Account and User tables
            const query = `
                SELECT a.*, u.*
                FROM Account a
                LEFT JOIN [User] u ON a.accountId = u.accountId
                WHERE a.accountId = @accountId 
                AND a.password = @password 
                AND a.isActive = 1
            `;
            console.log('Executing query:', query);
            
            const result = await pool.request()
                .input('accountId', sql.Char(8), accountId)
                .input('password', sql.VarChar(50), password)
                .query(query);
            
            console.log('Query result count:', result.recordset.length);
            
            if (result.recordset.length === 0) {
                console.log('No matching records found');
                throw new Error('Thông tin đăng nhập không chính xác');
            }

            const user = result.recordset[0];
            console.log('User found:', user);
            
            return {
                accountId: user.accountId,
                role: user.role,
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                department: user.department,
                avatar: user.avatar
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Check if phone number already exists
    async checkPhoneExists(phone) {
        try {
            const pool = await sql.connect(dbConfig);
            const query = `SELECT COUNT(*) as count FROM [User] WHERE phone = @phone`;
            const result = await pool.request()
                .input('phone', sql.VarChar(15), phone)
                .query(query);
            
            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error checking phone existence:', error);
            throw error;
        }
    }

    // Check if account ID already exists
    async checkAccountExists(accountId) {
        try {
            console.log('Kiểm tra tài khoản tồn tại:', accountId);
            const pool = await sql.connect(dbConfig);
            const query = `SELECT COUNT(*) as count FROM Account WHERE accountId = @accountId`;
            console.log('Truy vấn SQL:', query);
            const result = await pool.request()
                .input('accountId', sql.Char(8), accountId)
                .query(query);
            
            console.log('Kết quả kiểm tra tài khoản:', result.recordset[0]);
            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error checking account existence:', error);
            throw error;
        }
    }

    // Register step 1: Validate and send OTP
    async registerStep1(accountId, password, phone) {
        try {
            console.log('Bắt đầu đăng ký với dữ liệu:', { accountId, phone });
            
            // Check if account already exists
            const accountExists = await this.checkAccountExists(accountId);
            console.log('Tài khoản đã tồn tại?', accountExists);
            if (accountExists) {
                throw new Error('Tài khoản đã tồn tại trong hệ thống');
            }

            // Check if phone already exists
            const phoneExists = await this.checkPhoneExists(phone);
            console.log('Số điện thoại đã tồn tại?', phoneExists);
            if (phoneExists) {
                throw new Error('Số điện thoại đã được đăng ký');
            }

            // Store registration data temporarily (in production, use Redis or similar)
            this.tempRegistrationData = {
                accountId,
                password,
                phone,
                role: 'student' // Default role for new registrations
            };
            console.log('Đã lưu dữ liệu đăng ký tạm thời');

            // Send OTP to phone number
            console.log('Bắt đầu gửi OTP đến:', phone);
            const otpResult = await smsService.sendOTP(phone);
            console.log('Kết quả gửi OTP:', otpResult);
            if (!otpResult.success) {
                throw new Error(otpResult.message);
            }

            return { success: true, message: 'Mã OTP đã được gửi đến số điện thoại của bạn' };
        } catch (error) {
            console.error('Registration step 1 error:', error);
            throw error;
        }
    }

    // Register step 2: Verify OTP
    async verifyOTP(phone, otp) {
        try {
            const verificationResult = smsService.verifyOTP(phone, otp);
            
            if (!verificationResult.success) {
                throw new Error(verificationResult.message);
            }

            // Return registration data for the next step
            return {
                success: true,
                message: 'Xác thực OTP thành công',
                data: {
                    accountId: this.tempRegistrationData.accountId,
                    phone: this.tempRegistrationData.phone
                }
            };
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }

    // Register step 3: Complete profile and create account
    async completeRegistration(userData) {
        try {
            const { accountId, fullName, gender, birthday, email, phone, department } = userData;
            
            // Check if we have the temp registration data
            if (!this.tempRegistrationData || this.tempRegistrationData.accountId !== accountId) {
                throw new Error('Dữ liệu đăng ký không hợp lệ hoặc đã hết hạn');
            }
            
            const pool = await sql.connect(dbConfig);
            
            // Start a transaction
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            
            try {
                // Insert into Account table
                const accountQuery = `
                    INSERT INTO Account (accountId, password, role, isActive)
                    VALUES (@accountId, @password, @role, 1)
                `;
                
                await transaction.request()
                    .input('accountId', sql.Char(8), accountId)
                    .input('password', sql.VarChar(50), this.tempRegistrationData.password)
                    .input('role', sql.VarChar(20), this.tempRegistrationData.role)
                    .query(accountQuery);
                
                // Insert into User table
                const userQuery = `
                    INSERT INTO [User] (accountId, fullName, gender, birthday, email, phone, department)
                    VALUES (@accountId, @fullName, @gender, @birthday, @email, @phone, @department)
                `;
                
                await transaction.request()
                    .input('accountId', sql.Char(8), accountId)
                    .input('fullName', sql.NVarChar(100), fullName)
                    .input('gender', sql.Bit, gender)
                    .input('birthday', sql.Date, birthday)
                    .input('email', sql.VarChar(100), email)
                    .input('phone', sql.VarChar(15), phone)
                    .input('department', sql.NVarChar(100), department)
                    .query(userQuery);
                
                // Commit the transaction
                await transaction.commit();
                
                // Clear temporary registration data
                delete this.tempRegistrationData;
                
                return { 
                    success: true, 
                    message: 'Đăng ký tài khoản thành công'
                };
            } catch (error) {
                // Rollback in case of error
                await transaction.rollback();
                console.error('Transaction error:', error);
                throw error;
            }
        } catch (error) {
            console.error('Complete registration error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService(); 