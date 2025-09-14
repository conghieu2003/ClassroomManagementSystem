import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roomReducer from './slices/roomSlice';
import scheduleReducer from './slices/scheduleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    room: roomReducer,
    schedule: scheduleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
