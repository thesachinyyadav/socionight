import React, { useState, useEffect, useCallback } from 'react';
import CustomDateInput from './CustomDateInput';
import DepartmentSelector from './DepartmentSelector';
import CategoryDropdown from './CategoryDropdown';
import FileUploader from './FileUploader';
import FullPageSpinner from './FullPageSpinner';
import SuccessModal from './SuccessModal';
import { FestFormData, FormErrors } from '../types';
import { validateField, validateForm } from '../utils/validation';
import { createFest, updateFest, getFest, deleteFest } from '../api/festApi';
import './CreateFestForm.css';

interface CreateFestFormProps {
  festId?: string; // For edit mode
  onClose?: () => void;
  onSuccess?: (fest: FestFormData) => void;
}

const CreateFestForm: React.FC<CreateFestFormProps> = ({
  festId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FestFormData>({
    title: '',
    openingDate: '',
    closingDate: '',
    description: '',
    departments: [],
    category: '',
    organizingDepartment: '',
    contactEmail: '',
    contactPhone: '',
    eventHeads: ['', '', '', '', ''],
    image: undefined
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const isEditMode = Boolean(festId);

  // Load existing fest data for edit mode
  useEffect(() => {
    if (festId) {
      setInitialLoading(true);
      getFest(festId)
        .then((response) => {
          if (response.success && response.data) {
            const data = response.data;
            setFormData({
              ...data,
              eventHeads: [
                ...(data.eventHeads || []),
                ...Array(5 - (data.eventHeads?.length || 0)).fill('')
              ].slice(0, 5)
            });
          } else {
            console.error('Failed to load fest data:', response.error);
          }
        })
        .catch(error => {
          console.error('Error loading fest:', error);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [festId]);

  // Handle field changes with validation
  const handleFieldChange = useCallback((
    fieldName: keyof FestFormData,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error for this field
    if (errors[fieldName as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  }, [errors]);

  // Handle field blur with validation
  const handleFieldBlur = useCallback((fieldName: keyof FestFormData) => {
    const error = validateField(fieldName, formData[fieldName], formData);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [formData]);

  // Handle event heads change
  const handleEventHeadChange = (index: number, value: string) => {
    const newEventHeads = [...formData.eventHeads];
    newEventHeads[index] = value;
    handleFieldChange('eventHeads', newEventHeads);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
      }
      return;
    }

    setLoading(true);

    try {
      // Filter out empty event heads
      const submitData = {
        ...formData,
        eventHeads: formData.eventHeads.filter(email => email.trim())
      };

      const response = isEditMode
        ? await updateFest(festId!, submitData)
        : await createFest(submitData);

      if (response.success) {
        setSuccessModal({
          isOpen: true,
          title: isEditMode ? 'Fest Updated!' : 'Fest Created!',
          message: response.message || `Fest has been ${isEditMode ? 'updated' : 'created'} successfully.`
        });

        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
      } else {
        console.error('Submit failed:', response.error);
        // Handle API errors - you might want to show these in the UI
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete fest
  const handleDeleteFest = async () => {
    if (!festId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this fest? This action cannot be undone.');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await deleteFest(festId);
      if (response.success) {
        setSuccessModal({
          isOpen: true,
          title: 'Fest Deleted!',
          message: 'The fest has been successfully deleted.'
        });
      } else {
        console.error('Delete failed:', response.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    if (onClose) {
      onClose();
    }
  };

  if (initialLoading) {
    return <FullPageSpinner message="Loading fest data..." />;
  }

  return (
    <>
      <div className="create-fest-form-container">
        <form onSubmit={handleSubmit} className="create-fest-form" noValidate>
          <div className="form-header">
            <h1 className="form-title">
              {isEditMode ? 'Edit Fest Details' : 'Create New Fest'}
            </h1>
            {onClose && (
              <button
                type="button"
                className="form-close-btn"
                onClick={onClose}
                aria-label="Close form"
              >
                ✕
              </button>
            )}
          </div>

          <div className="form-sections">
            {/* Basic Information Section */}
            <section className="form-section">
              <h2 className="section-title">Basic Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Fest Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    placeholder="Enter fest title"
                    maxLength={100}
                    required
                  />
                  {errors.title && (
                    <div className="error-message" role="alert">
                      {errors.title}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <CustomDateInput
                    label="Opening Date"
                    value={formData.openingDate}
                    onChange={(date) => handleFieldChange('openingDate', date)}
                    onBlur={() => handleFieldBlur('openingDate')}
                    error={errors.openingDate}
                    minDate={isEditMode ? undefined : new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <CustomDateInput
                    label="Closing Date"
                    value={formData.closingDate}
                    onChange={(date) => handleFieldChange('closingDate', date)}
                    onBlur={() => handleFieldBlur('closingDate')}
                    error={errors.closingDate}
                    minDate={formData.openingDate}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-input ${errors.description ? 'error' : ''}`}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    placeholder="Enter detailed description"
                    maxLength={1000}
                    rows={4}
                    required
                  />
                  <div className="char-count">
                    {formData.description.length}/1000 characters
                  </div>
                  {errors.description && (
                    <div className="error-message" role="alert">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Department and Category Section */}
            <section className="form-section">
              <h2 className="section-title">Department & Category</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <DepartmentSelector
                    label="Department Accessibility"
                    value={formData.departments}
                    onChange={(departments) => handleFieldChange('departments', departments)}
                    onBlur={() => handleFieldBlur('departments')}
                    error={errors.departments}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <CategoryDropdown
                    label="Category"
                    value={formData.category}
                    onChange={(category) => handleFieldChange('category', category)}
                    onBlur={() => handleFieldBlur('category')}
                    error={errors.category}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="organizingDepartment">
                    Organizing Department *
                  </label>
                  <input
                    id="organizingDepartment"
                    name="organizingDepartment"
                    type="text"
                    className={`form-input ${errors.organizingDepartment ? 'error' : ''}`}
                    value={formData.organizingDepartment}
                    onChange={(e) => handleFieldChange('organizingDepartment', e.target.value)}
                    onBlur={() => handleFieldBlur('organizingDepartment')}
                    placeholder="Enter organizing department"
                    maxLength={100}
                    required
                  />
                  {errors.organizingDepartment && (
                    <div className="error-message" role="alert">
                      {errors.organizingDepartment}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="form-section">
              <h2 className="section-title">Contact Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">
                    Contact Email *
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                    value={formData.contactEmail}
                    onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                    onBlur={() => handleFieldBlur('contactEmail')}
                    placeholder="Enter contact email"
                    required
                  />
                  {errors.contactEmail && (
                    <div className="error-message" role="alert">
                      {errors.contactEmail}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPhone">
                    Contact Phone *
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                    value={formData.contactPhone}
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    onBlur={() => handleFieldBlur('contactPhone')}
                    placeholder="Enter contact phone (10-14 digits)"
                    required
                  />
                  {errors.contactPhone && (
                    <div className="error-message" role="alert">
                      {errors.contactPhone}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">
                    Event Heads (Optional)
                    <span className="helper-text">Up to 5 email addresses</span>
                  </label>
                  {formData.eventHeads.map((email, index) => (
                    <div key={index} className="event-head-input">
                      <input
                        type="email"
                        className={`form-input ${
                          errors.eventHeads && errors.eventHeads[index] ? 'error' : ''
                        }`}
                        value={email}
                        onChange={(e) => handleEventHeadChange(index, e.target.value)}
                        placeholder={`Event head ${index + 1} email (optional)`}
                      />
                      {errors.eventHeads && errors.eventHeads[index] && (
                        <div className="error-message" role="alert">
                          {errors.eventHeads[index]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* File Upload Section */}
            <section className="form-section">
              <h2 className="section-title">Fest Image</h2>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <FileUploader
                    label="Fest Image"
                    value={formData.image}
                    onChange={(file) => handleFieldChange('image', file)}
                    onBlur={() => handleFieldBlur('image')}
                    error={errors.image}
                    required={!isEditMode}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="action-buttons">
              {onClose && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              
              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteFest}
                  disabled={loading}
                >
                  Delete Fest
                </button>
              )}
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Fest' : 'Create Fest'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <FullPageSpinner
          message={isEditMode ? 'Updating fest...' : 'Creating fest...'}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleSuccessModalClose}
        title={successModal.title}
        message={successModal.message}
      />
    </>
  );
};

export default CreateFestForm;