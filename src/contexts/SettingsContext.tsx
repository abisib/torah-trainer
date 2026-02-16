import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Nusach } from '../types';

interface SettingsContextType {
  nusach: Nusach;
  setNusach: (nusach: Nusach) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'torah_trainer_nusach';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nusach, setNusachState] = useState<Nusach>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'standard' || saved === 'yemenite') ? saved : 'standard';
  });

  const setNusach = (newNusach: Nusach) => {
    setNusachState(newNusach);
    localStorage.setItem(STORAGE_KEY, newNusach);
  };

  useEffect(() => {
    // Sync with other tabs if needed, or just initial load check
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'standard' || e.newValue === 'yemenite')) {
        setNusachState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SettingsContext.Provider value={{ nusach, setNusach }}>
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
