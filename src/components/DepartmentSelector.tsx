import React, { useState, useRef, useEffect } from 'react';
import { DEPARTMENT_OPTIONS } from '../types';
import './DepartmentSelector.css';

interface DepartmentSelectorProps {
  value: string[];
  onChange: (departments: string[]) => void;
  onBlur?: () => void;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Handle department toggle
  const handleDepartmentToggle = (department: string) => {
    const newValue = value.includes(department)
      ? value.filter(d => d !== department)
      : [...value, department];
    onChange(newValue);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (value.length === DEPARTMENT_OPTIONS.length) {
      onChange([]);
    } else {
      onChange([...DEPARTMENT_OPTIONS]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) setIsOpen(!isOpen);
    } else if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  const displayText = () => {
    if (value.length === 0) return 'Select departments';
    if (value.length === 1) return value[0];
    if (value.length === DEPARTMENT_OPTIONS.length) return 'All departments selected';
    return `${value.length} departments selected`;
  };

  return (
    <div className="department-selector-container" ref={containerRef}>
      <label className="department-selector-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div 
        className={`department-selector ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}${value.length > 0 ? `, ${value.length} selected` : ''}`}
      >
        <span className={`department-display ${value.length === 0 ? 'placeholder' : ''}`}>
          {displayText()}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      {isOpen && !disabled && (
        <div className="department-dropdown" role="listbox" aria-multiselectable="true">
          <div className="dropdown-header">
            <button
              type="button"
              className="select-all-button"
              onClick={handleSelectAll}
            >
              {value.length === DEPARTMENT_OPTIONS.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selected-count">
              {value.length} of {DEPARTMENT_OPTIONS.length} selected
            </span>
          </div>
          
          <div className="department-list">
            {DEPARTMENT_OPTIONS.map(department => {
              const isSelected = value.includes(department);
              return (
                <label
                  key={department}
                  className={`department-option ${isSelected ? 'selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleDepartmentToggle(department)}
                    className="department-checkbox"
                    aria-label={`Select ${department}`}
                  />
                  <span className="checkmark">
                    {isSelected && '✓'}
                  </span>
                  <span className="department-name">
                    {department}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;