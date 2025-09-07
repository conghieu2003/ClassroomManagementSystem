import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Schedule } from '../../types';

interface WeeklyScheduleProps {
  schedules?: Schedule[];
  onRoomRequestClick?: (schedule: Schedule) => void;
}

interface TimeSlot {
  label: string;
  start: string;
  end: string;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayMonth: string;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ schedules, onRoomRequestClick }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const timeSlots: TimeSlot[] = [
    { label: 'Sáng', start: '06:30', end: '11:40' },
    { label: 'Chiều', start: '12:30', end: '17:40' },
    { label: 'Tối', start: '18:00', end: '20:30' },
  ];

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: vi }),
      dayMonth: format(date, 'dd/MM/yyyy'),
    };
  });

  const getScheduleForSlot = (date: string, timeSlot: TimeSlot): Schedule | undefined => {
    return schedules?.find(
      (schedule) =>
        schedule.startDate && 
        format(new Date(schedule.startDate), 'dd/MM/yyyy') === date &&
        schedule.startTime >= timeSlot.start &&
        schedule.endTime <= timeSlot.end
    );
  };

  const renderScheduleCell = (schedule: Schedule | undefined): React.ReactNode => {
    if (!schedule) return null;

    return (
      <div className={`schedule-cell ${schedule.status || 'active'}`}>
        <div className="subject-name">{schedule.subjectName}</div>
        <div className="room-info">
          <span>Phòng: {schedule.roomName}</span>
          {schedule.teacherName && (
            <span>GV: {schedule.teacherName}</span>
          )}
        </div>
        <div className="time-info">
          {schedule.startTime} - {schedule.endTime}
        </div>
        {onRoomRequestClick && (
          <button
            onClick={() => onRoomRequestClick(schedule)}
            className="room-request-btn"
          >
            Yêu cầu đổi phòng
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="weekly-schedule">
      <div className="schedule-header">
        <div className="time-column">Ca học</div>
        {weekDays.map((day) => (
          <div key={day.dayMonth} className="day-column">
            <div className="day-name">{day.dayName}</div>
            <div className="day-date">{day.dayMonth}</div>
          </div>
        ))}
      </div>
      <div className="schedule-body">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot.label} className="schedule-row">
            <div className="time-slot">{timeSlot.label}</div>
            {weekDays.map((day) => (
              <div key={`${day.dayMonth}-${timeSlot.label}`} className="schedule-cell-wrapper">
                {renderScheduleCell(getScheduleForSlot(day.dayMonth, timeSlot))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedule;
