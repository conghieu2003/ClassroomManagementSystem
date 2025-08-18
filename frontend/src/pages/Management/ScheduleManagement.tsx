import React, { useState, useEffect } from 'react';
import { Button } from 'devextreme-react/button';
import { LoadPanel } from 'devextreme-react/load-panel';
import { DateBox } from 'devextreme-react/date-box';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TimeSlot {
  id: number;
  start: string;
  end: string;
}

interface ScheduleItem {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  date: Date;
  timeSlot: number;
  type: 'theory' | 'practice' | 'exam';
}

const ScheduleManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [viewType, setViewType] = useState<'all' | 'class' | 'exam'>('all');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Tạo mảng thời gian học
  const timeSlots: TimeSlot[] = [
    { id: 1, start: '07:00', end: '09:30' },
    { id: 2, start: '09:45', end: '11:30' },
    { id: 3, start: '13:00', end: '15:30' },
    { id: 4, start: '15:45', end: '17:30' },
    { id: 5, start: '17:45', end: '21:00' }
  ];

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async (): Promise<void> => {
    try {
      setLoading(true);
      // TODO: Thay thế bằng API call thực tế
      // Lấy dữ liệu cho cả tuần hiện tại
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Tuần bắt đầu từ thứ 2
      const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      // Mô phỏng dữ liệu
      const mockData: ScheduleItem[] = [
        {
          id: 1,
          subject: 'Lập trình Web',
          teacher: 'Nguyễn Văn A',
          room: 'A101',
          date: addDays(startDate, 0), // Thứ 2
          timeSlot: 1,
          type: 'theory'
        },
        {
          id: 2,
          subject: 'Cơ sở dữ liệu',
          teacher: 'Trần Thị B',
          room: 'B203',
          date: addDays(startDate, 1), // Thứ 3
          timeSlot: 3,
          type: 'practice'
        },
        {
          id: 3,
          subject: 'Kiểm thử phần mềm',
          teacher: 'Lê Văn C',
          room: 'C305',
          date: addDays(startDate, 2), // Thứ 4
          timeSlot: 2,
          type: 'exam'
        },
        {
          id: 4,
          subject: 'Trí tuệ nhân tạo',
          teacher: 'Phạm Thị D',
          room: 'D405',
          date: addDays(startDate, 4), // Thứ 6
          timeSlot: 4,
          type: 'theory'
        }
      ];
      
      setSchedules(mockData);
    } catch (error) {
      console.error('Lỗi khi tải lịch học:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = (): void => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleNextWeek = (): void => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleCurrentWeek = (): void => {
    setCurrentDate(new Date());
  };

  const handlePrint = (): void => {
    window.print();
  };

  // Tạo mảng ngày trong tuần
  const getDaysOfWeek = (): Date[] => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Tuần bắt đầu từ thứ 2
    const days: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(day);
    }
    
    return days;
  };

  const getScheduleBackground = (type: string): string => {
    switch (type) {
      case 'theory':
        return '#ffffff'; // Lý thuyết - màu trắng
      case 'practice':
        return '#e8f5e9'; // Thực hành - màu xanh lá nhạt
      case 'exam':
        return '#fff8e1'; // Thi - màu vàng nhạt
      default:
        return '#ffffff';
    }
  };

  const renderScheduleCell = (day: Date, timeSlot: TimeSlot): React.ReactNode => {
    // Lọc các lịch học/thi vào ngày và khung giờ cụ thể
    const daySchedules = schedules.filter(s => 
      isSameDay(new Date(s.date), day) && 
      s.timeSlot === timeSlot.id &&
      (viewType === 'all' || 
       (viewType === 'exam' && s.type === 'exam') ||
       (viewType === 'class' && s.type !== 'exam'))
    );
    
    if (daySchedules.length === 0) {
      return <td key={`${day}-${timeSlot.id}`} style={{ border: '1px solid #e0e0e0', height: '100px' }}></td>;
    }
    
    return (
      <td key={`${day}-${timeSlot.id}`} style={{ border: '1px solid #e0e0e0', padding: '8px', verticalAlign: 'top' }}>
        {daySchedules.map(schedule => (
          <div 
            key={schedule.id}
            style={{
              backgroundColor: getScheduleBackground(schedule.type),
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
              marginBottom: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{schedule.subject}</div>
            <div>Phòng: {schedule.room}</div>
            <div>GV: {schedule.teacher}</div>
            <div style={{ 
              fontSize: '12px', 
              backgroundColor: schedule.type === 'exam' ? '#ffd54f' : schedule.type === 'practice' ? '#81c784' : '#bbdefb',
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '4px'
            }}>
              {schedule.type === 'theory' ? 'Lý thuyết' : schedule.type === 'practice' ? 'Thực hành' : 'Thi'}
            </div>
          </div>
        ))}
      </td>
    );
  };

  const daysOfWeek = getDaysOfWeek();

  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={loading}
        showIndicator={true}
        shading={true}
        showPane={true}
        shadingColor="rgba(0,0,0,0.4)"
      />

      {/* Thanh điều khiển */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            text="Trở về"
            icon="chevronleft"
            onClick={handlePreviousWeek}
            stylingMode="contained"
            type="normal"
          />
          <Button
            text="Hiện tại"
            onClick={handleCurrentWeek}
            stylingMode="contained"
            type="normal"
          />
          <Button
            text="Tiếp"
            icon="chevronright"
            onClick={handleNextWeek}
            stylingMode="contained"
            type="normal"
          />
        </div>
        
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Tuần: {format(daysOfWeek[0], 'dd/MM/yyyy', { locale: vi })} - {format(daysOfWeek[6], 'dd/MM/yyyy', { locale: vi })}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            text="Tất cả"
            onClick={() => setViewType('all')}
            stylingMode="contained"
            type={viewType === 'all' ? 'default' : 'normal'}
          />
          <Button
            text="Lịch học"
            onClick={() => setViewType('class')}
            stylingMode="contained"
            type={viewType === 'class' ? 'default' : 'normal'}
          />
          <Button
            text="Lịch thi"
            onClick={() => setViewType('exam')}
            stylingMode="contained"
            type={viewType === 'exam' ? 'default' : 'normal'}
          />
          <Button
            icon="print"
            hint="In lịch"
            onClick={handlePrint}
            stylingMode="contained"
            type="normal"
          />
        </div>
      </div>

      {/* Bảng lịch học */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', border: '1px solid #e0e0e0', backgroundColor: '#3F51B5', color: '#fff', width: '80px' }}>Thời gian</th>
              {daysOfWeek.map((day, index) => (
                <th key={index} style={{ padding: '12px', border: '1px solid #e0e0e0', backgroundColor: '#3F51B5', color: '#fff' }}>
                  <div>{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][index]}</div>
                  <div>{format(day, 'dd/MM', { locale: vi })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot.id}>
                <td style={{ padding: '8px', border: '1px solid #e0e0e0', backgroundColor: '#e3f2fd', textAlign: 'center', fontWeight: 'bold' }}>
                  {timeSlot.start} - {timeSlot.end}
                </td>
                {daysOfWeek.map(day => renderScheduleCell(day, timeSlot))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CSS cho chế độ in */}
      <style type="text/css" media="print">{`
        @page { size: landscape; }
        body { margin: 0; padding: 20px; }
        button { display: none; }
      `}</style>
    </div>
  );
};

export default ScheduleManagement;
