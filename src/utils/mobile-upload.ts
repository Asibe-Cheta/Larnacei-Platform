// Mobile upload utility to handle blob URL issues
export const mobileUploadHandler = {
  // Check if running on mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Validate file for mobile upload
  validateFile: (file: File, type: 'image' | 'video') => {
    const errors: string[] = [];

    // Check file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      errors.push(`${file.name} is not a valid image file.`);
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      errors.push(`${file.name} is not a valid video file.`);
    }

    // Check file size
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      errors.push(`${file.name} is too large. Maximum size is ${type === 'image' ? '5MB' : '50MB'}.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Create mobile-compatible FormData
  createFormData: (files: File[], type: 'image' | 'video') => {
    const formData = new FormData();

    files.forEach((file) => {
      // Add files with multiple keys for mobile compatibility
      if (type === 'image') {
        formData.append('images', file);
        formData.append('files', file);
        formData.append('image', file); // Mobile fallback
      } else {
        formData.append('videos', file);
        formData.append('files', file);
        formData.append('video', file); // Mobile fallback
      }
    });

    return formData;
  },

  // Handle upload with mobile-specific error handling
  uploadFiles: async (files: File[], type: 'image' | 'video') => {
    try {
      // Validate all files first
      const validationResults = files.map(file => mobileUploadHandler.validateFile(file, type));
      const allErrors = validationResults.flatMap(result => result.errors);

      if (allErrors.length > 0) {
        throw new Error(allErrors.join('\n'));
      }

      const formData = mobileUploadHandler.createFormData(files, type);
      const endpoint = type === 'image' ? '/api/upload-images' : '/api/upload-videos';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${type}s. Please try again.`);
      }

      const result = await response.json();
      return result.urls;
    } catch (error: any) {
      // Enhanced error handling for mobile blob issues
      if (error.message?.includes('blob') || error.message?.includes('Blob')) {
        throw new Error(`Mobile upload issue detected. Please try again or use a different ${type}.`);
      }
      throw error;
    }
  },

  // Get mobile-friendly file input attributes
  getFileInputProps: (type: 'image' | 'video') => ({
    accept: type === 'image' ? 'image/*' : 'video/*',
    capture: type === 'image' ? 'environment' : undefined, // Use camera for images on mobile
    multiple: true,
    className: 'hidden'
  })
};
