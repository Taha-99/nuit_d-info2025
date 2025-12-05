import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  const showNotification = useCallback((message, severity = 'info', duration = 4000) => {
    const notification = {
      id: Date.now(),
      message,
      severity, // 'success', 'error', 'warning', 'info'
      duration,
    };
    
    setNotifications(prev => [...prev, notification]);
    
    if (!open) {
      setCurrent(notification);
      setOpen(true);
    }
  }, [open]);

  const success = useCallback((message, duration) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const error = useCallback((message, duration) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const warning = useCallback((message, duration) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const info = useCallback((message, duration) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    setNotifications(prev => {
      const remaining = prev.filter(n => n.id !== current?.id);
      if (remaining.length > 0) {
        setCurrent(remaining[0]);
        setOpen(true);
      } else {
        setCurrent(null);
      }
      return remaining;
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={current?.duration || 4000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={current?.severity || 'info'}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
