import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  // Đăng nhập với username và password
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const { token, user, role } = response.data;
        // Lưu thông tin vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', role);
        
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại',
        errorCode: response.data.errorCode || 'LOGIN_FAILED'
      };
    } catch (error) {
      // Xóa thông tin đăng nhập nếu có lỗi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Trả về thông báo lỗi từ backend nếu có
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Thông tin đăng nhập không chính xác',
          errorCode: error.response.data.errorCode || 'INVALID_CREDENTIALS'
        };
      }
      
      // Nếu không có phản hồi từ server
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Kết nối đến server quá thời gian chờ',
          errorCode: 'TIMEOUT_ERROR'
        };
      }

      if (!error.response) {
        return {
          success: false,
          message: 'Không thể kết nối đến server',
          errorCode: 'CONNECTION_ERROR'
        };
      }
      
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng nhập',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Đăng ký tài khoản
  register: async (userData) => {
    try {
    const response = await api.post('/auth/register', userData);
    return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Cập nhật thông tin hồ sơ
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Lấy vai trò người dùng
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  // Lấy thông tin người dùng
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Schedule Service
export const scheduleService = {
  getRoomSchedule: async (roomId) => {
    const response = await api.get(`/schedules/room/${roomId}`);
    return response.data;
  },

  getTeacherSchedule: async (teacherId) => {
    const response = await api.get(`/schedules/teacher/${teacherId}`);
    return response.data;
  },

  getStudentSchedule: async (studentId) => {
    const response = await api.get(`/schedules/student/${studentId}`);
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },
};

// Room Service
export const roomService = {
  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoomById: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },
};

// User Service
export const userService = {
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
};

export default api; 