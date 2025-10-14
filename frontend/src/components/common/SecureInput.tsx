import React, { useState, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Box,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { securityUtils } from '@/utils/security';

interface SecureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  validateOnChange?: boolean;
  showStrengthIndicator?: boolean;
  sanitize?: boolean;
}

const SecureInput: React.FC<SecureInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  type = 'text',
  required = false,
  disabled = false,
  autoComplete,
  placeholder,
  maxLength,
  validateOnChange = false,
  showStrengthIndicator = false,
  sanitize = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    score: number;
    feedback: string[];
  } | null>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;

    // Sanitize input if enabled
    if (sanitize) {
      inputValue = securityUtils.sanitizeInput(inputValue);
    }

    // Validate based on type
    let fieldError = '';
    if (validateOnChange && touched) {
      switch (type) {
        case 'email':
          if (inputValue && !securityUtils.isValidEmail(inputValue)) {
            fieldError = 'Correo electrónico inválido';
          }
          break;
        case 'url':
          if (inputValue && !securityUtils.isValidUrl(inputValue)) {
            fieldError = 'URL inválida';
          }
          break;
        case 'password':
          if (showStrengthIndicator && inputValue) {
            const strength = securityUtils.validatePasswordStrength(inputValue);
            setPasswordStrength(strength);
            if (!strength.isValid) {
              fieldError = strength.feedback.join('. ');
            }
          }
          break;
      }
    }

    setValidationError(fieldError);
    onChange(inputValue);
  }, [onChange, sanitize, type, validateOnChange, touched, showStrengthIndicator]);

  const handleBlur = useCallback(() => {
    setTouched(true);

    // Final validation on blur
    let fieldError = '';
    if (value) {
      switch (type) {
        case 'email':
          if (!securityUtils.isValidEmail(value)) {
            fieldError = 'Correo electrónico inválido';
          }
          break;
        case 'url':
          if (!securityUtils.isValidUrl(value)) {
            fieldError = 'URL inválida';
          }
          break;
        case 'password':
          if (showStrengthIndicator) {
            const strength = securityUtils.validatePasswordStrength(value);
            setPasswordStrength(strength);
            if (!strength.isValid) {
              fieldError = strength.feedback.join('. ');
            }
          }
          break;
      }
    }

    setValidationError(fieldError);
    onBlur?.();
  }, [value, type, showStrengthIndicator, onBlur]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 4) return 'success.main';
    if (score >= 3) return 'warning.main';
    return 'error.main';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score >= 4) return 'Fuerte';
    if (score >= 3) return 'Buena';
    if (score >= 2) return 'Regular';
    return 'Débil';
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        type={inputType}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!error || !!validationError}
        disabled={disabled}
        required={required}
        {...(autoComplete && { autoComplete })}
        {...(placeholder && { placeholder })}
        inputProps={{
          maxLength,
        }}
        InputProps={{
          endAdornment: type === 'password' ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Password Strength Indicator */}
      {type === 'password' && showStrengthIndicator && passwordStrength && value && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: '100%',
                height: 4,
                bgcolor: 'grey.200',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  height: '100%',
                  bgcolor: getPasswordStrengthColor(passwordStrength.score),
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {passwordStrength.isValid ? (
                <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
              ) : (
                <Error sx={{ color: 'error.main', fontSize: 16 }} />
              )}
              <Box
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: getPasswordStrengthColor(passwordStrength.score),
                }}
              >
                {getPasswordStrengthLabel(passwordStrength.score)}
              </Box>
            </Box>
          </Box>
          {passwordStrength.feedback.length > 0 && (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {passwordStrength.feedback.map((item, index) => (
                <Box
                  key={index}
                  component="li"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mb: 0.25,
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Error and Helper Text */}
      <FormHelperText error={!!error || !!validationError}>
        {error || validationError || helperText}
      </FormHelperText>
    </Box>
  );
};

export default SecureInput;