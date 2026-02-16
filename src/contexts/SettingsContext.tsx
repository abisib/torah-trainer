import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Nusach } from '../types';

export type StamFont = 'StamAshkenaz' | 'StamSefarad';

interface SettingsContextType {
  nusach: Nusach;
  setNusach: (nusach: Nusach) => void;
  stamFont: StamFont;
  setStamFont: (font: StamFont) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const NUSACH_KEY = 'torah_trainer_nusach';
const FONT_KEY = 'torah_trainer_font';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nusach, setNusachState] = useState<Nusach>(() => {
    const saved = localStorage.getItem(NUSACH_KEY);
    return (saved === 'standard' || saved === 'yemenite') ? saved : 'standard';
  });

  const [stamFont, setStamFontState] = useState<StamFont>(() => {
    const saved = localStorage.getItem(FONT_KEY);
    // Default logic: if no saved font, match nusach if possible, else Ashkenaz
    if (saved === 'StamAshkenaz' || saved === 'StamSefarad') return saved;
    // Initial default fallback
    return 'StamAshkenaz'; 
  });

  // When nusach changes, if the user hasn't explicitly set a font preference (or we want to be helpful),
  // we could auto-switch, but the user requested explicit selection. 
  // Let's keep them independent for now, or just initialize smart defaults.
  // Actually, to make it seamless, let's auto-switch font ONLY if the user switches Nusach 
  // AND hasn't manually overridden it? 
  // Simpler approach: Just keep them independent. User selects Nusach, User selects Font.
  // But maybe update the default if it matches the Nusach change?
  // Let's stick to independent for "User selects" requirement.

  const setNusach = (newNusach: Nusach) => {
    setNusachState(newNusach);
    localStorage.setItem(NUSACH_KEY, newNusach);
  };

  const setStamFont = (newFont: StamFont) => {
    setStamFontState(newFont);
    localStorage.setItem(FONT_KEY, newFont);
  };

  return (
    <SettingsContext.Provider value={{ nusach, setNusach, stamFont, setStamFont }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
