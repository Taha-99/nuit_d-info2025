import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

describe('LanguageContext', () => {
  it('toggles between fr and ar', () => {
    const wrapper = ({ children }) => <LanguageProvider>{children}</LanguageProvider>;
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('fr');
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe('ar');
  });
});
