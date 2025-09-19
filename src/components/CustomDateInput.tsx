import React, { useState, useRef, useEffect } from 'react';
import './CustomDateInput.css';

interface CustomDateInputProps {
  value: string;
  onChange: (date: string) => void;
  onBlur?: () => void;
  label: string;
  error?: string;
  minDate?: string;
  required?: boolean;
  disabled?: boolean;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  minDate,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Navigate month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (minDate) {
      const minDateTime = new Date(minDate);
      minDateTime.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate < minDateTime;
    }
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="date-input-container" ref={containerRef}>
      <label className="date-input-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div 
        className={`date-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${label}${value ? `, selected date: ${formatDisplayDate(value)}` : ''}`}
      >
        <span className={`date-display ${!value ? 'placeholder' : ''}`}>
          {value ? formatDisplayDate(value) : 'Select a date'}
        </span>
        <span className="date-icon">📅</span>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      {isOpen && !disabled && (
        <div className="calendar-popup" role="dialog" aria-label="Calendar">
          <div className="calendar-header">
            <button
              type="button"
              className="nav-button"
              onClick={() => navigateMonth('prev')}
              aria-label="Previous month"
            >
              &#8249;
            </button>
            
            <div className="month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            
            <button
              type="button"
              className="nav-button"
              onClick={() => navigateMonth('next')}
              aria-label="Next month"
            >
              &#8250;
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
            
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={index} className="empty-day"></div>;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);

              return (
                <button
                  key={index}
                  type="button"
                  className={`calendar-day ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && handleDateSelect(date)}
                  disabled={disabled}
                  aria-label={`${date.toLocaleDateString()}`}
                  aria-selected={selected}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;