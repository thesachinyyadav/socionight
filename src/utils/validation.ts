import { FormErrors, FestFormData, VALIDATION_CONSTRAINTS, FILE_CONSTRAINTS } from '../types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (10-14 digits)
const PHONE_REGEX = /^\d{10,14}$/;

// Validate individual fields
export const validateField = (name: keyof FestFormData, value: any, formData?: FestFormData): string => {
  switch (name) {
    case 'title':
      if (!value || !value.trim()) return 'Fest title is required';
      if (value.length > VALIDATION_CONSTRAINTS.title.maxLength) {
        return `Title must be less than ${VALIDATION_CONSTRAINTS.title.maxLength} characters`;
      }
      return '';

    case 'openingDate':
      if (!value) return 'Opening date is required';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const openingDate = new Date(value);
      if (openingDate < today && !formData?.id) {
        return 'Opening date must be today or later for new fests';
      }
      return '';

    case 'closingDate':
      if (!value) return 'Closing date is required';
      if (formData?.openingDate && value < formData.openingDate) {
        return 'Closing date must be on or after opening date';
      }
      return '';

    case 'description':
      if (!value || !value.trim()) return 'Description is required';
      if (value.length > VALIDATION_CONSTRAINTS.description.maxLength) {
        return `Description must be less than ${VALIDATION_CONSTRAINTS.description.maxLength} characters`;
      }
      return '';

    case 'departments':
      if (!Array.isArray(value) || value.length === 0) {
        return 'At least one department must be selected';
      }
      return '';

    case 'category':
      if (!value || !value.trim()) return 'Category is required';
      return '';

    case 'organizingDepartment':
      if (!value || !value.trim()) return 'Organizing department is required';
      if (value.length > VALIDATION_CONSTRAINTS.organizingDepartment.maxLength) {
        return `Organizing department must be less than ${VALIDATION_CONSTRAINTS.organizingDepartment.maxLength} characters`;
      }
      return '';

    case 'contactEmail':
      if (!value || !value.trim()) return 'Contact email is required';
      if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
      return '';

    case 'contactPhone':
      if (!value || !value.trim()) return 'Contact phone is required';
      if (!PHONE_REGEX.test(value.replace(/\D/g, ''))) {
        return `Phone number must be ${VALIDATION_CONSTRAINTS.phoneLength.min}-${VALIDATION_CONSTRAINTS.phoneLength.max} digits`;
      }
      return '';

    case 'eventHeads':
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (value[i] && !EMAIL_REGEX.test(value[i])) {
            return `Event head ${i + 1} email is invalid`;
          }
        }
        if (value.filter(email => email && email.trim()).length > VALIDATION_CONSTRAINTS.maxEventHeads) {
          return `Maximum ${VALIDATION_CONSTRAINTS.maxEventHeads} event heads allowed`;
        }
      }
      return '';

    case 'image':
      if (!value && !formData?.id) return 'Fest image is required for new fests';
      if (value instanceof File) {
        if (!FILE_CONSTRAINTS.allowedTypes.includes(value.type)) {
          return 'Only JPG and PNG files are allowed';
        }
        if (value.size > FILE_CONSTRAINTS.maxSize) {
          return 'File size must be less than 3MB';
        }
      }
      return '';

    default:
      return '';
  }
};

// Validate all form fields
export const validateForm = (formData: FestFormData): FormErrors => {
  const errors: FormErrors = {};

  // Validate all fields
  Object.keys(formData).forEach(key => {
    const fieldName = key as keyof FestFormData;
    const error = validateField(fieldName, formData[fieldName], formData);
    if (error) {
      if (fieldName === 'eventHeads') {
        errors[fieldName] = [error];
      } else {
        (errors as any)[fieldName] = error;
      }
    }
  });

  return errors;
};

// Format date for display
export const formatDate = (date: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if date is today or later
export const isDateTodayOrLater = (date: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  return checkDate >= today;
};

// Clean phone number (remove non-digits)
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};