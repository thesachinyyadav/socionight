import React, { useState, useRef, useEffect } from 'react';
import { CATEGORY_OPTIONS } from '../types';
import './CategoryDropdown.css';

interface CategoryDropdownProps {
  value: string;
  onChange: (category: string) => void;
  onBlur?: () => void;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
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

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    if (onBlur) onBlur();
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

  // Handle option key navigation
  const handleOptionKeyDown = (event: React.KeyboardEvent, category: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategorySelect(category);
    }
  };

  const displayText = value || 'Select a category';

  return (
    <div className="category-dropdown-container" ref={containerRef}>
      <label className="category-dropdown-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div 
        className={`category-dropdown ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}${value ? `, selected: ${value}` : ''}`}
      >
        <span className={`category-display ${!value ? 'placeholder' : ''}`}>
          {displayText}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}

      {isOpen && !disabled && (
        <div className="category-options" role="listbox">
          {CATEGORY_OPTIONS.map(category => {
            const isSelected = value === category;
            return (
              <div
                key={category}
                className={`category-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category)}
                onKeyDown={(e) => handleOptionKeyDown(e, category)}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
              >
                <span className="category-name">{category}</span>
                {isSelected && <span className="selected-icon">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;