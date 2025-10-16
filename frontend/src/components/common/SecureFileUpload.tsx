import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image,
  VideoFile,
  PictureAsPdf,
} from '@mui/icons-material';
import { securityUtils } from '@/utils/security';

interface SecureFileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  showPreview?: boolean;
  multiple?: boolean;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  disabled = false,
  label = 'Seleccionar archivo',
  helperText,
  error,
  showPreview = true,
  multiple = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    return securityUtils.validateFileUpload(file, {
      maxSize,
      allowedTypes: acceptedTypes,
      allowedExtensions: acceptedTypes.map(type => {
        const ext = type.split('/')[1];
        return ext === 'jpeg' ? '.jpg' : `.${ext}`;
      }),
    });
  }, [maxSize, acceptedTypes]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (!multiple && fileArray.length > 1) {
      errors.push('Solo se permite seleccionar un archivo');
      return;
    }

    if (multiple && selectedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    setValidationErrors(errors);

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
      setSelectedFiles(newFiles);

      // Call onFileSelect for each valid file
      validFiles.forEach(file => {
        onFileSelect(file);
      });
    }
  }, [multiple, selectedFiles, maxFiles, validateFile, onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileRemove?.();
  }, [selectedFiles, onFileRemove]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image />;
    if (file.type.startsWith('video/')) return <VideoFile />;
    if (file.type === 'application/pdf') return <PictureAsPdf />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box component={"div" as any}>
      {/* Upload Area */}
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : error ? 'error.main' : 'grey.300',
          bgcolor: dragOver ? 'primary.50' : 'grey.50',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'grey.50' : 'primary.50',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
          id="file-upload"
        />

        <label htmlFor="file-upload" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <Box
            component={"div" as any}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pointerEvents: disabled ? 'none' : 'auto',
            }}
          >
            <CloudUpload
              sx={{
                fontSize: 48,
                color: disabled ? 'grey.400' : dragOver ? 'primary.main' : 'grey.500',
              }}
            />
            <Box component={"div" as any} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color={disabled ? 'text.disabled' : 'text.primary'}>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Arrastra y suelta archivos aquí, o haz clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Tipos permitidos: {acceptedTypes.join(', ')}
                <br />
                Tamaño máximo: {formatFileSize(maxSize)}
                {multiple && ` (máximo ${maxFiles} archivos)`}
              </Typography>
            </Box>
          </Box>
        </label>
      </Paper>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box component={"div" as any} sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Subiendo archivo...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <ul style={{ margin: 0, paddingLeft: '1.5em' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Selected Files Preview */}
      {showPreview && selectedFiles.length > 0 && (
        <Box component={"div" as any} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Archivos seleccionados:
          </Typography>
          <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedFiles.map((file, index) => (
              <Chip
                key={index}
                icon={getFileIcon(file)}
                label={`${file.name} (${formatFileSize(file.size)})`}
                onDelete={() => handleRemoveFile(index)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* File Preview for Images */}
      {showPreview && selectedFiles.some(file => file.type.startsWith('image/')) && (
        <Box component={"div" as any} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vista previa:
          </Typography>
          <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {selectedFiles
              .filter(file => file.type.startsWith('image/'))
              .map((file, index) => (
                <Box
                  key={index}
                  component="img"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SecureFileUpload;