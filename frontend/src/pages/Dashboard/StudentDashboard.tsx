import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, scheduleService } from '../../services/api';
import { Toolbar, Item } from 'devextreme-react/toolbar';
import { Button } from 'devextreme-react/button';
import { DateBox } from 'devextreme-react/date-box';
import { LoadPanel } from 'devextreme-react/load-panel';
import notify from 'devextreme/ui/notify';
import { Schedule, User } from '../../types';
import 'devextreme/dist/css/dx.light.css';

interface StudentSchedule extends Schedule {
  type?: 'class' | 'exam' | 'practice';
  timeSlot?: 'morning' | 'afternoon' | 'evening';
  startPeriod?: string;
  endPeriod?: string;
  note?: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'all' | 'class' | 'exam'>('all');
  const currentUser: User | null = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      fetchSchedules();
    }
  }, [currentDate, currentUser]);

  const fetchSchedules = async (): Promise<void> => {
    if (!currentUser) return;
    
    try {
      const response = await scheduleService.getStudentSchedule(String(currentUser.id));
      setSchedules(response.data || []);
    } catch (error) {
      notify('Lỗi khi tải lịch học', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleCurrentWeek = (): void => {
    setCurrentDate(new Date());
  };

  const renderTimeCell = (time: string): string => {
    switch(time) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Chiều';
      case 'evening': return 'Tối';
      default: return '';
    }
  };

  const getScheduleBackground = (schedule: StudentSchedule): string => {
    // Ưu tiên theo status từ backend
    if ((schedule as any).status === 'exam') return '#FFF9C4';
    if ((schedule as any).status === 'paused') return '#FFE0B2'; // Tạm ngưng - cam nhạt
    if ((schedule as any).status === 'cancelled') return '#FFCDD2'; // Hủy - đỏ nhạt

    // Không phải exam/paused/cancelled → phân biệt practice theo classGroupId/classType nếu được trả về
    const isPractice = (schedule as any).classGroupId != null || (schedule as any).classType === 'practice';
    if (isPractice) return '#C8E6C9';
    return '#FFFFFF';
  };

  const renderScheduleCell = (schedule: StudentSchedule): React.ReactNode => {
    return (
      <div style={{
        backgroundColor: getScheduleBackground(schedule),
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        height: '100%',
        fontSize: '13px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {schedule.subjectName || 'Không có tên môn học'}
        </div>
        <div>
          <div>Mã lớp: {schedule.classId}</div>
          <div>Tiết: {schedule.startPeriod} - {schedule.endPeriod}</div>
          <div>Phòng: {schedule.roomName || 'Chưa xác định'}</div>
          <div>GV: {schedule.teacherName || 'Chưa xác định'}</div>
          {schedule.note && <div>Ghi chú: {schedule.note}</div>}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return <div>Không thể tải thông tin người dùng</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Lịch học, lịch thi theo tuần</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Button
              icon="chevronleft"
              text="Trở về"
              stylingMode="contained"
              onClick={handlePreviousWeek}
            />
            <DateBox
              value={currentDate}
              type="date"
              displayFormat="dd/MM/yyyy"
              onValueChanged={(e: any) => setCurrentDate(e.value)}
            />
            <Button
              text="Hiện tại"
              stylingMode="contained"
              onClick={handleCurrentWeek}
            />
            <Button
              icon="chevronright"
              text="Tiếp"
              stylingMode="contained"
              onClick={handleNextWeek}
            />
            <Button
              icon="print"
              text="In lịch"
              stylingMode="contained"
            />
            <Button
              icon="refresh"
              stylingMode="contained"
              onClick={fetchSchedules}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <Button
            text="Tất cả"
            type={viewType === 'all' ? 'default' : 'normal'}
            onClick={() => setViewType('all')}
          />
          <Button
            text="Lịch học"
            type={viewType === 'class' ? 'default' : 'normal'}
            onClick={() => setViewType('class')}
          />
          <Button
            text="Lịch thi"
            type={viewType === 'exam' ? 'default' : 'normal'}
            onClick={() => setViewType('exam')}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr>
                <th style={{ width: '80px', padding: '12px', border: '1px solid #e0e0e0', backgroundColor: '#3F51B5', color: '#fff' }}>Ca học</th>
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, index) => {
                  const date = new Date(currentDate);
                  date.setDate(date.getDate() - date.getDay() + index + 1);
                  return (
                    <th key={index} style={{ padding: '12px', border: '1px solid #e0e0e0', backgroundColor: '#3F51B5', color: '#fff' }}>
                      <div>{day}</div>
                      <div>{date.toLocaleDateString('vi-VN')}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {['morning', 'afternoon', 'evening'].map((time) => (
                <tr key={time}>
                  <td style={{ padding: '12px', border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    {renderTimeCell(time)}
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() - date.getDay() + day + 1);
                    const daySchedules = schedules.filter(s => 
                      new Date(s.startDate).toDateString() === date.toDateString() && 
                      s.timeSlot === time &&
                      (viewType === 'all' || 
                       (viewType === 'exam' && (s as any).status === 'exam') ||
                       (viewType === 'class' && (s as any).status !== 'exam'))
                    );
                    return (
                      <td key={day} style={{ padding: '8px', border: '1px solid #e0e0e0', minHeight: '120px', verticalAlign: 'top' }}>
                        {daySchedules.map((schedule, idx) => (
                          <div key={idx} style={{ marginBottom: '8px' }}>
                            {renderScheduleCell(schedule)}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', border: '1px solid #e0e0e0' }}></div>
            <span>Lịch học lý thuyết</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#C8E6C9', border: '1px solid #e0e0e0' }}></div>
            <span>Lịch học thực hành</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFF9C4', border: '1px solid #e0e0e0' }}></div>
            <span>Lịch thi</span>
          </div>
        </div>
      </div>

      <LoadPanel
        visible={loading}
        message="Đang tải..."
        showIndicator={true}
        shading={true}
      />
    </div>
  );
};

export default StudentDashboard;
