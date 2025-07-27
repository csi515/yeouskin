import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';
import { getSettingsColumns, checkColumnExists } from '../utils/tableSchema';

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

      // 안전한 컬럼 목록 가져오기
      const selectColumns = await getSettingsColumns();
      
      // appointment_time_interval 컬럼 존재 여부 확인
      const hasAppointmentInterval = await checkColumnExists('settings', 'appointment_time_interval');

      const { data, error } = await supabase
        .from('settings')
        .select(selectColumns)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // 406 오류는 무시하고 기본 설정 사용
        if (error.code === 'PGRST116' || error.code === '406') {
          console.log('사용자 설정이 없어 기본 설정을 사용합니다.');
        } else {
          console.error('설정 로드 실패:', error);
        }
        return;
      }

      if (data && typeof data === 'object') {
        setSettings(prev => ({
          ...prev,
          businessName: (data as any).business_name || prev.businessName,
          businessPhone: (data as any).business_phone || prev.businessPhone,
          businessAddress: (data as any).business_address || prev.businessAddress,
          businessHours: (data as any).business_hours || prev.businessHours,
          appointmentTimeInterval: hasAppointmentInterval ? ((data as any).appointment_time_interval || 30) : 30,
          language: (data as any).language || prev.language
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

      // appointment_time_interval 컬럼 존재 여부 확인
      const hasAppointmentInterval = await checkColumnExists('settings', 'appointment_time_interval');

      const settingsData: any = {
        user_id: user.id,
        business_name: settings.businessName,
        business_phone: settings.businessPhone,
        business_address: settings.businessAddress,
        business_hours: settings.businessHours,
        language: settings.language,
        updated_at: new Date().toISOString()
      };

      // 컬럼이 존재할 때만 추가
      if (hasAppointmentInterval) {
        settingsData.appointment_time_interval = settings.appointmentTimeInterval;
      }

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