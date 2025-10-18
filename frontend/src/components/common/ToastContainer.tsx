import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const ToastContainer: React.FC = () => {
  const theme = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000, // 3 segundos por defecto
        style: {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[4],
          fontFamily: theme.typography.fontFamily,
        },
        success: {
          duration: 3000, // 3 segundos para mensajes de éxito
          style: {
            background: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            border: `1px solid ${theme.palette.success.dark}`,
          },
          icon: '✅',
        },
        error: {
          duration: 4000, // 4 segundos para errores
          style: {
            background: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            border: `1px solid ${theme.palette.error.dark}`,
          },
          icon: '❌',
        },
        // Note: react-hot-toast doesn't have a built-in 'warning' type
        // We'll handle warnings through custom toasts
        loading: {
          style: {
            background: theme.palette.info.main,
            color: theme.palette.info.contrastText,
            border: `1px solid ${theme.palette.info.dark}`,
          },
        },
      }}
    />
  );
};

export default ToastContainer;