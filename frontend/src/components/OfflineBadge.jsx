import React from 'react';
import { Chip } from '@mui/material';
import { useOffline } from '../contexts/OfflineContext';
import { useLanguage } from '../contexts/LanguageContext';

const OfflineBadge = () => {
  const { isOnline, isSyncing } = useOffline();
  const { t } = useLanguage();
  return (
    <Chip
      size="small"
      color={isOnline ? 'success' : 'warning'}
      label={isSyncing ? 'Sync…' : t(`common.${isOnline ? 'online' : 'offline'}`)}
    />
  );
};

export default OfflineBadge;
