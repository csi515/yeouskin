import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';
import { getSettingsColumns, checkColumnExists, checkTableExists } from '../utils/tableSchema';

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

      // 간단한 쿼리로 테이블 존재 여부 확인
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // 테이블이 없거나 오류가 발생하면 기본 설정 사용
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('사용자 설정이 없어 기본 설정을 사용합니다.');
        } else {
          console.log('settings 테이블에 접근할 수 없어 기본 설정을 사용합니다.');
        }
        return;
      }

      // 설정이 있으면 상세 정보 로드
      if (data && data.length > 0) {
        try {
          const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (settingsError) {
            console.log('설정 상세 로드 실패, 기본 설정 사용:', settingsError.message);
            return;
          }

          if (settingsData) {
            setSettings(prev => ({
              ...prev,
              businessName: settingsData.business_name || prev.businessName,
              businessPhone: settingsData.business_phone || prev.businessPhone,
              businessAddress: settingsData.business_address || prev.businessAddress,
              businessHours: settingsData.business_hours || prev.businessHours,
              appointmentTimeInterval: settingsData.appointment_time_interval || 30,
              language: settingsData.language || prev.language
            }));
          }
        } catch (detailError) {
          console.log('설정 상세 로드 중 오류, 기본 설정 사용:', detailError);
        }
      }
    } catch (error) {
      console.log('설정 로드 중 오류, 기본 설정 사용:', error);
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