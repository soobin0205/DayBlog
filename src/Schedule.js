import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Schedule.css';
import Header from './common/Header'; // Header 컴포넌트 가져오기

const ScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [newSchedule, setNewSchedule] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const addSchedule = () => {
    const dateKey = formatDate(selectedDate);
    if (newSchedule.trim() !== '') {
      setSchedules({
        ...schedules,
        [dateKey]: [...(schedules[dateKey] || []), newSchedule],
      });
      setNewSchedule(''); // 입력창 초기화
    }
  };

  // 엔터 키로 추가할 수 있도록 하는 함수
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addSchedule();
    }
  };

  const deleteSchedule = (dateKey, index) => {
    const updatedSchedules = schedules[dateKey].filter((_, i) => i !== index);
    setSchedules({
      ...schedules,
      [dateKey]: updatedSchedules,
    });
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <Header />
      <div className="schedule-container">
        
        <div className="calendar-section">
          <h2>스케줄 관리</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
          />
        </div>

        <div className="schedule-section">
          <h3>선택된 날짜: {formatDate(selectedDate)}</h3>

          {/* 입력된 스케줄 목록 (채팅 형식) */}
          <ul className="schedule-list">
            {schedules[formatDate(selectedDate)]?.map((schedule, index) => (
              <li key={index}>
                {schedule}
                <button onClick={() => deleteSchedule(formatDate(selectedDate), index)} className="delete-btn">삭제</button>
              </li>
            ))}
          </ul>

          {/* 스케줄 입력 폼 (오른쪽 아래 고정) */}
          <div className="schedule-form">
            <input
              type="text"
              value={newSchedule}
              onChange={(e) => setNewSchedule(e.target.value)}
              onKeyPress={handleKeyPress} // 엔터 키를 눌렀을 때 호출
              placeholder="새로운 스케줄 입력"
            />
            <button onClick={addSchedule}>추가</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
