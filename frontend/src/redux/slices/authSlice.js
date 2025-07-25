import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async ({ account, password }, { rejectWithValue }) => {
        try {
            console.log('Sending login request to:', `${API_URL}/auth/login`);
            console.log('With data:', { account, password });
            
            const response = await axios.post(`${API_URL}/auth/login`, {
                account,
                password
            });
            
            console.log('Login response:', response.data);
            
            // Check if response is successful
            if (response.data && response.data.success) {
                return response.data;
            } else {
                return rejectWithValue({ message: response.data.message || 'Đăng nhập thất bại' });
            }
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            return rejectWithValue({
                message: error.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại'
            });
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Đăng nhập thất bại';
            });
    }
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer; 