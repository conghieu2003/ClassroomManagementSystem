import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { User, ApiResponse } from '../types';

export const API_URL = 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
  (response: AxiosResponse) => {
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
  // Đăng nhập với identifier (admin: userId, teacher: teacherCode, student: studentCode, hoặc username) và password
  login: async (identifier: string, password: string): Promise<ApiResponse<any>> => {
    try {
      console.log('Gọi API login với:', { identifier, password });
      const response = await api.post('/auth/login', { identifier, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        const role = user.role;
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
    } catch (error: any) {
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
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Đăng ký tài khoản
  register: async (userData: any): Promise<any> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Lấy thông tin hồ sơ người dùng
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Cập nhật thông tin hồ sơ
  updateProfile: async (userData: Partial<User>): Promise<any> => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<any> => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Lấy vai trò người dùng
  getUserRole: (): string | null => {
    return localStorage.getItem('role');
  },

  // Lấy thông tin người dùng
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Schedule Service
export const scheduleService = {
  getRoomSchedule: async (roomId: string): Promise<any> => {
    const response = await api.get(`/schedules/room/${roomId}`);
    return response.data;
  },

  getTeacherSchedule: async (teacherId: string): Promise<any> => {
    const response = await api.get(`/schedules/teacher/${teacherId}`);
    return response.data;
  },

  getStudentSchedule: async (studentId: string): Promise<any> => {
    const response = await api.get(`/schedules/student/${studentId}`);
    return response.data;
  },

  createSchedule: async (scheduleData: any): Promise<any> => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },
};

// Room Service
export const roomService = {
  getAllRooms: async (): Promise<any> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoomById: async (roomId: string): Promise<any> => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  createRoomRequest: async (requestData: any): Promise<any> => {
    const response = await api.post('/room-requests', requestData);
    return response.data;
  },
};

// User Service
export const userService = {
  getCurrentUser: (): User | null => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  },

  listUsers: async (role?: 'admin' | 'teacher' | 'student' | 'all', username?: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/users/list', {
      role: role && role !== 'all' ? role : undefined,
      username
    });
    return response.data;
  },

  // Lấy data form init: next code + preview username + departments + majors
  getNextCode: async (role: 'teacher' | 'student'): Promise<ApiResponse<{ code: string; previewUsername: string; departments: { id: number; name: string }[]; majors: { id: number; name: string }[] }>> => {
    const response = await api.get(`/users/next-code`, { params: { role } });
    return response.data;
  },

  getDepartments: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    const response = await api.get('/users/departments');
    return response.data;
  },

  getMajors: async (departmentId?: number): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    const response = await api.get('/users/majors', { params: { departmentId } });
    return response.data;
  },

  createUser: async (userData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/users/create', userData);
      return response.data;
    } catch (error: any) {
      console.error('Create user error:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  },
};

export default api;
