// Types for the fest form
export interface FestFormData {
  id?: string;
  title: string;
  openingDate: string;
  closingDate: string;
  description: string;
  departments: string[];
  category: string;
  organizingDepartment: string;
  contactEmail: string;
  contactPhone: string;
  eventHeads: string[];
  image?: File | string;
}

// Validation errors interface
export interface FormErrors {
  title?: string;
  openingDate?: string;
  closingDate?: string;
  description?: string;
  departments?: string;
  category?: string;
  organizingDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  eventHeads?: string[];
  image?: string;
}

// Department options
export const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Economics',
  'Business Administration',
  'Commerce',
  'Psychology',
  'Sociology',
  'Political Science',
  'History',
  'Geography',
  'Philosophy',
  'Fine Arts',
  'Music',
  'Physical Education',
  'Library Science'
];

// Category options
export const CATEGORY_OPTIONS = [
  'Technology',
  'Academic',
  'Sports',
  'Cultural',
  'Workshop'
];

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// File validation constraints
export const FILE_CONSTRAINTS = {
  maxSize: 3 * 1024 * 1024, // 3MB in bytes
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png']
};

// Form validation constraints
export const VALIDATION_CONSTRAINTS = {
  title: { maxLength: 100 },
  description: { maxLength: 1000 },
  organizingDepartment: { maxLength: 100 },
  phoneLength: { min: 10, max: 14 },
  maxEventHeads: 5
};