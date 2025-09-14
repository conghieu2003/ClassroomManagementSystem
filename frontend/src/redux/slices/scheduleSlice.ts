import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { scheduleService, ScheduleItem, ScheduleFilter, Department, Class, Teacher } from '../../services/scheduleService';

// Interface cho state
interface ScheduleState {
  schedules: ScheduleItem[];
  departments: Department[];
  classes: Class[];
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  filters: ScheduleFilter;
}

// Initial state
const initialState: ScheduleState = {
  schedules: [],
  departments: [],
  classes: [],
  teachers: [],
  loading: false,
  error: null,
  filters: {}
};

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (filters: ScheduleFilter = {}) => {
    const response = await scheduleService.getSchedules(filters);
    return response;
  }
);

export const fetchWeeklySchedule = createAsyncThunk(
  'schedule/fetchWeeklySchedule',
  async ({ weekStartDate, filters }: { weekStartDate: string; filters: ScheduleFilter }) => {
    const response = await scheduleService.getWeeklySchedule(weekStartDate, filters);
    return response;
  }
);

export const fetchDepartments = createAsyncThunk(
  'schedule/fetchDepartments',
  async () => {
    const response = await scheduleService.getDepartments();
    return response;
  }
);

export const fetchClasses = createAsyncThunk(
  'schedule/fetchClasses',
  async (departmentId?: number) => {
    const response = await scheduleService.getClasses(departmentId);
    return response;
  }
);

export const fetchTeachers = createAsyncThunk(
  'schedule/fetchTeachers',
  async (departmentId?: number) => {
    const response = await scheduleService.getTeachers(departmentId);
    return response;
  }
);

export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData: Partial<ScheduleItem>) => {
    const response = await scheduleService.createSchedule(scheduleData);
    return response;
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ id, scheduleData }: { id: number; scheduleData: Partial<ScheduleItem> }) => {
    const response = await scheduleService.updateSchedule(id, scheduleData);
    return response;
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (id: number) => {
    await scheduleService.deleteSchedule(id);
    return id;
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ScheduleFilter>) => {
      state.filters = action.payload;
    },
    clearSchedules: (state) => {
      state.schedules = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch schedules';
      });

    // Fetch weekly schedule
    builder
      .addCase(fetchWeeklySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchWeeklySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch weekly schedule';
      });

    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch departments';
      });

    // Fetch classes
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch classes';
      });

    // Fetch teachers
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch teachers';
      });

    // Create schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create schedule';
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update schedule';
      });

    // Delete schedule
    builder
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete schedule';
      });
  }
});

// Export actions
export const { setFilters, clearSchedules, clearError } = scheduleSlice.actions;

// Selectors
export const selectSchedules = (state: { schedule: ScheduleState }) => state.schedule.schedules;
export const selectDepartments = (state: { schedule: ScheduleState }) => state.schedule.departments;
export const selectClasses = (state: { schedule: ScheduleState }) => state.schedule.classes;
export const selectTeachers = (state: { schedule: ScheduleState }) => state.schedule.teachers;
export const selectScheduleLoading = (state: { schedule: ScheduleState }) => state.schedule.loading;
export const selectScheduleError = (state: { schedule: ScheduleState }) => state.schedule.error;
export const selectScheduleFilters = (state: { schedule: ScheduleState }) => state.schedule.filters;

export default scheduleSlice.reducer;
