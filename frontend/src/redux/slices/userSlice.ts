import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/api';

export interface OptionItem { id: number; name: string }

export interface UserFormInit {
  code: string;
  previewUsername: string;
  departments: OptionItem[];
  majors: OptionItem[];
  defaultValues: {
    campus: string;
    trainingType: string;
    degreeLevel: string;
    academicYear?: string;
    enrollmentDate: string;
    title?: string;
  };
}

export interface UserState {
  previewCode: string;
  previewUsername: string;
  departments: OptionItem[];
  majors: OptionItem[];
  defaultValues: {
    campus: string;
    trainingType: string;
    degreeLevel: string;
    academicYear?: string;
    enrollmentDate: string;
    title?: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  previewCode: '',
  previewUsername: '',
  departments: [],
  majors: [],
  defaultValues: {
    campus: '',
    trainingType: '',
    degreeLevel: '',
    academicYear: '',
    enrollmentDate: '',
    title: ''
  },
  isLoading: false,
  error: null
};

export const fetchFormInit = createAsyncThunk(
  'user/fetchFormInit',
  async (role: 'teacher' | 'student', { rejectWithValue }) => {
    try {
      const res = await userService.getNextCode(role);
      if (!res.success || !res.data) {
        return rejectWithValue(res.message || 'Không thể tải dữ liệu khởi tạo');
      }
      return res.data as UserFormInit;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Không thể tải dữ liệu khởi tạo');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'user/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getDepartments();
      if (!res.success || !res.data) {
        return rejectWithValue(res.message || 'Không thể tải khoa');
      }
      return res.data as OptionItem[];
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Không thể tải khoa');
    }
  }
);

export const fetchMajors = createAsyncThunk(
  'user/fetchMajors',
  async (params: { departmentId?: number }, { rejectWithValue }) => {
    try {
      const res = await userService.getMajors(params?.departmentId);
      if (!res.success || !res.data) {
        return rejectWithValue(res.message || 'Không thể tải chuyên ngành');
      }
      return res.data as OptionItem[];
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Không thể tải chuyên ngành');
    }
  }
);

export const createUserThunk = createAsyncThunk(
  'user/create',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await userService.createUser(payload);
      if (!res.success) {
        return rejectWithValue(res.message || 'Tạo người dùng thất bại');
      }
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Tạo người dùng thất bại');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormInit.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchFormInit.fulfilled, (state, action: PayloadAction<UserFormInit>) => {
        state.isLoading = false;
        state.previewCode = action.payload.code;
        state.previewUsername = action.payload.previewUsername;
        state.departments = action.payload.departments || [];
        state.majors = action.payload.majors || [];
        state.defaultValues = action.payload.defaultValues || {
          campus: '',
          trainingType: '',
          degreeLevel: '',
          academicYear: '',
          enrollmentDate: '',
          title: ''
        };
      })
      .addCase(fetchFormInit.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string;
        state.previewCode = ''; state.previewUsername = ''; state.departments = []; state.majors = [];
        state.defaultValues = {
          campus: '',
          trainingType: '',
          degreeLevel: '',
          academicYear: '',
          enrollmentDate: '',
          title: ''
        };
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<OptionItem[]>) => {
        state.departments = action.payload;
      })
      .addCase(fetchMajors.fulfilled, (state, action: PayloadAction<OptionItem[]>) => {
        state.majors = action.payload;
      });
  }
});

export const { clearUserError } = userSlice.actions;

export default userSlice.reducer;


