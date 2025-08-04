import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import vi from 'date-fns/locale/vi';

const WeeklySchedule = ({ schedules, onRoomRequestClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const timeSlots = [
    { label: 'Sáng', start: '07:00', end: '11:30' },
    { label: 'Chiều', start: '13:00', end: '17:30' },
    { label: 'Tối', start: '18:00', end: '21:30' },
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: vi }),
      dayMonth: format(date, 'dd/MM/yyyy'),
    };
  });

  const getScheduleForSlot = (date, timeSlot) => {
    return schedules?.find(
      (schedule) =>
        format(new Date(schedule.date), 'dd/MM/yyyy') === date &&
        schedule.startTime >= timeSlot.start &&
        schedule.endTime <= timeSlot.end
    );
  };

  const renderScheduleCell = (schedule) => {
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