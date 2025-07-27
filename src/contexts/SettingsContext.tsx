import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';

interface Settings {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessHours: string;
  appointmentTimeInterval: number;
  language: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  businessName: '에스테틱 샵',
  businessPhone: '02-1234-5678',
  businessAddress: '서울시 강남구 테헤란로 123',
  businessHours: '09:00-18:00',
  appointmentTimeInterval: 30,
  language: 'ko'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      if (!user) {
        return;
      }

      // 406 오류 방지를 위해 더 안전한 쿼리 사용
      const { data, error } = await supabase
        .from('settings')
        .select('business_name, business_phone, business_address, business_hours, language, appointment_time_interval')
        .eq('user_id', user.id)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      if (error) {
        // 406 오류는 무시하고 기본 설정 사용
        if (error.code === 'PGRST116' || error.code === '406') {
          console.log('사용자 설정이 없어 기본 설정을 사용합니다.');
        } else {
          console.error('설정 로드 실패:', error);
        }
        return;
      }

      if (data) {
        setSettings(prev => ({
          ...prev,
          businessName: data.business_name || prev.businessName,
          businessPhone: data.business_phone || prev.businessPhone,
          businessAddress: data.business_address || prev.businessAddress,
          businessHours: data.business_hours || prev.businessHours,
          appointmentTimeInterval: data.appointment_time_interval || 30,
          language: data.language || prev.language
        }));
      }
    } catch (error) {
      console.error('설정 로드 중 오류 발생:', error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const settingsData = {
        user_id: user.id,
        business_name: settings.businessName,
        business_phone: settings.businessPhone,
        business_address: settings.businessAddress,
        business_hours: settings.businessHours,
        language: settings.language,
        appointment_time_interval: settings.appointmentTimeInterval,
        updated_at: new Date().toISOString()
      };

      // UPSERT 방식으로 저장 (INSERT 또는 UPDATE)
      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('설정 저장 실패:', error);
        throw error;
      }

    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
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