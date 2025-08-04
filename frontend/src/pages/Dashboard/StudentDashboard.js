import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, scheduleService } from '../../services/api';
import { Toolbar, Item } from 'devextreme-react/toolbar';
import { Button } from 'devextreme-react/button';
import { DateBox } from 'devextreme-react/date-box';
import { LoadPanel } from 'devextreme-react/load-panel';
import notify from 'devextreme/ui/notify';
import 'devextreme/dist/css/dx.light.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('all'); // 'all', 'class', 'exam'
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]); // Thêm currentDate vào dependencies

  const fetchSchedules = async () => {
    try {
      const response = await scheduleService.getStudentSchedule(currentUser.id);
      setSchedules(response.data);
    } catch (error) {
      notify('Lỗi khi tải lịch học', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  const renderTimeCell = (time) => {
    switch(time) {
      case 'morning': return 'Sáng';
      case 'afternoon': return 'Chiều';
      case 'evening': return 'Tối';
      default: return '';
    }
  };

  const getScheduleBackground = (schedule) => {
    if (schedule.type === 'exam') return '#FFF9C4'; // Lịch thi - màu vàng nhạt
    if (schedule.type === 'practice') return '#C8E6C9'; // Thực hành - màu xanh lá
    return '#FFFFFF'; // Lịch học lý thuyết - màu trắng
  };

  const renderScheduleCell = (schedule) => {
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
          {schedule.subjectName}
        </div>
        <div>
          <div>Mã lớp: {schedule.classId}</div>
          <div>Tiết: {schedule.startPeriod} - {schedule.endPeriod}</div>
          <div>Phòng: {schedule.roomName}</div>
          <div>GV: {schedule.teacherName}</div>
          {schedule.note && <div>Ghi chú: {schedule.note}</div>}
        </div>
      </div>
    );
  };

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
              onValueChanged={(e) => setCurrentDate(e.value)}
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
                      new Date(s.date).toDateString() === date.toDateString() && 
                      s.timeSlot === time &&
                      (viewType === 'all' || 
                       (viewType === 'exam' && s.type === 'exam') ||
                       (viewType === 'class' && s.type !== 'exam'))
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