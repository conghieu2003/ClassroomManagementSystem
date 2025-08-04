import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// Thunk action để đăng nhập
export const login = createAsyncThunk(
    'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
        try {
      const response = await authService.login(username, password);
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Đăng nhập thất bại');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng nhập thất bại'
      );
    }
  }
);

// Thunk action để đăng xuất
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

// Thunk action để lấy thông tin hồ sơ người dùng
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Không thể lấy thông tin người dùng');
      }
      
                return response.data;
        } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy thông tin người dùng'
      );
        }
    }
);

// Khởi tạo state
const initialState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')) || null,
  role: localStorage.getItem('role') || null,
  isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
    clearErrors: (state) => {
            state.error = null;
        },
    setCredentials: (state, action) => {
      const { token, user, role } = action.payload;
      state.token = token;
      state.user = user;
      state.role = role;
      state.isAuthenticated = true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
        }
    },
    extraReducers: (builder) => {
        builder
      // Xử lý login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.token) {
                state.isAuthenticated = true;
        state.token = action.payload.token;
                state.user = action.payload.user;
        state.role = action.payload.role;
                    
                    // Lưu thông tin vào localStorage
                    localStorage.setItem('token', action.payload.token);
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                    localStorage.setItem('role', action.payload.role);
                } else {
                    state.error = 'Invalid response from server';
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
        state.error = action.payload;
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                state.role = null;
                
                // Xóa thông tin khỏi localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
      })
      
      // Xử lý logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })
      
      // Xử lý getProfile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
            });
    }
});

export const { clearErrors, setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer; 