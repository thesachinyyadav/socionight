import React, { useState, useRef, useCallback } from 'react';
import { FILE_CONSTRAINTS } from '../types';
import './FileUploader.css';

interface FileUploaderProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  onBlur,
  label,
  error,
  required = false,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file validation
  const validateFile = (file: File): string | null => {
    if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      return 'Only JPG and PNG files are allowed';
    }
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      return `File size must be less than ${formatFileSize(FILE_CONSTRAINTS.maxSize)}`;
    }
    return null;
  };

  // Handle file selection
  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      // You might want to show this error through a callback or state
      console.error(validationError);
      return;
    }

    onChange(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (onBlur) onBlur();
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
    if (onBlur) onBlur();
  };

  // Handle click to select file
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle remove file
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Get current file info
  const getCurrentFileInfo = () => {
    if (value instanceof File) {
      return {
        name: value.name,
        size: value.size,
        type: value.type
      };
    } else if (typeof value === 'string' && value) {
      // For existing files (edit mode)
      return {
        name: value.split('/').pop() || 'Existing file',
        size: null,
        type: null,
        isExisting: true
      };
    }
    return null;
  };

  const fileInfo = getCurrentFileInfo();
  const hasFile = value instanceof File || (typeof value === 'string' && value);

  return (
    <div className="file-uploader-container">
      <label className="file-uploader-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div
        className={`file-uploader ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${hasFile ? 'has-file' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${label}${hasFile ? `, current file: ${fileInfo?.name}` : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_CONSTRAINTS.allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="file-input-hidden"
          disabled={disabled}
        />

        {hasFile ? (
          <div className="file-preview">
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" className="preview-image" />
              </div>
            )}
            {typeof value === 'string' && value && !preview && (
              <div className="existing-file-preview">
                <div className="file-icon">🖼️</div>
                <span className="existing-label">Current Image</span>
              </div>
            )}
            <div className="file-info">
              <div className="file-name">{fileInfo?.name}</div>
              {fileInfo?.size && (
                <div className="file-size">{formatFileSize(fileInfo.size)}</div>
              )}
              {fileInfo?.isExisting && (
                <div className="file-existing">Click to replace</div>
              )}
            </div>
            <button
              type="button"
              className="remove-file-btn"
              onClick={handleRemoveFile}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <div className="primary-text">
                {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
              </div>
              <div className="secondary-text">
                JPG, PNG up to {formatFileSize(FILE_CONSTRAINTS.maxSize)}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
    </div>
  );
};

export default FileUploader;