import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessHours: string;
  defaultAppointmentDuration: number;
  language: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  businessName: '여우스킨',
  businessPhone: '',
  businessAddress: '',
  businessHours: '',
  defaultAppointmentDuration: 60,
  language: 'ko'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('crm-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('crm-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('설정 저장 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    saveSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 