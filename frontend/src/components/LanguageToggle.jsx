import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <ToggleButtonGroup
      color="primary"
      exclusive
      size="small"
      value={language}
      onChange={(_, value) => value && setLanguage(value)}
    >
      <ToggleButton value="fr">FR</ToggleButton>
      <ToggleButton value="ar">AR</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageToggle;
