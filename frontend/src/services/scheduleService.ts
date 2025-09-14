import api from './api';

// Interface cho lịch học
export interface ScheduleItem {
  id: number;
  classId: number;
  className: string;
  classCode: string;
  subjectCode: string;
  teacherId: number;
  teacherName: string;
  roomId?: number;
  roomName?: string;
  dayOfWeek: number; // 2 = Thứ 2, 3 = Thứ 3, ..., 8 = Chủ nhật
  timeSlot: string;
  timeRange: string;
  shift: 'morning' | 'afternoon' | 'evening';
  type: 'theory' | 'practice' | 'online' | 'exam' | 'cancelled';
  status: 'pending' | 'assigned' | 'active' | 'cancelled' | 'paused' | 'exam';
  weekPattern: string;
  startWeek: number;
  endWeek: number;
}

// Interface cho filter
export interface ScheduleFilter {
  departmentId?: number;
  classId?: number;
  teacherId?: number;
  scheduleType?: 'all' | 'study' | 'exam';
  startDate?: string;
  endDate?: string;
}

// Interface cho khoa
export interface Department {
  id: number;
  code: string;
  name: string;
}

// Interface cho lớp học
export interface Class {
  id: number;
  code: string;
  className: string;
  departmentId: number;
}

// Interface cho giảng viên
export interface Teacher {
  id: number;
  name: string;
  code: string;
  departmentId: number;
}

class ScheduleService {
  // Lấy danh sách lịch học theo filter
  async getSchedules(filter: ScheduleFilter = {}): Promise<ScheduleItem[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter.departmentId) params.append('departmentId', filter.departmentId.toString());
      if (filter.classId) params.append('classId', filter.classId.toString());
      if (filter.teacherId) params.append('teacherId', filter.teacherId.toString());
      if (filter.scheduleType) params.append('scheduleType', filter.scheduleType);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/schedules?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  // Lấy danh sách khoa
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  // Lấy danh sách lớp học
  async getClasses(departmentId?: number): Promise<Class[]> {
    try {
      const params = departmentId ? `?departmentId=${departmentId}` : '';
      const response = await api.get(`/classes${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  // Lấy danh sách giảng viên
  async getTeachers(departmentId?: number): Promise<Teacher[]> {
    try {
      const params = departmentId ? `?departmentId=${departmentId}` : '';
      const response = await api.get(`/teachers${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  }

  // Lấy lịch học theo tuần
  async getWeeklySchedule(weekStartDate: string, filter: ScheduleFilter = {}): Promise<ScheduleItem[]> {
    try {
      const params = new URLSearchParams();
      params.append('weekStartDate', weekStartDate);
      
      if (filter.departmentId) params.append('departmentId', filter.departmentId.toString());
      if (filter.classId) params.append('classId', filter.classId.toString());
      if (filter.teacherId) params.append('teacherId', filter.teacherId.toString());
      if (filter.scheduleType) params.append('scheduleType', filter.scheduleType);

      const response = await api.get(`/schedules/weekly?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      throw error;
    }
  }

  // Tạo lịch học mới
  async createSchedule(scheduleData: Partial<ScheduleItem>): Promise<ScheduleItem> {
    try {
      const response = await api.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Cập nhật lịch học
  async updateSchedule(id: number, scheduleData: Partial<ScheduleItem>): Promise<ScheduleItem> {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Xóa lịch học
  async deleteSchedule(id: number): Promise<void> {
    try {
      await api.delete(`/schedules/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  // In lịch học
  async printSchedule(filter: ScheduleFilter = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filter.departmentId) params.append('departmentId', filter.departmentId.toString());
      if (filter.classId) params.append('classId', filter.classId.toString());
      if (filter.teacherId) params.append('teacherId', filter.teacherId.toString());
      if (filter.scheduleType) params.append('scheduleType', filter.scheduleType);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await api.get(`/schedules/print?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error printing schedule:', error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService();
