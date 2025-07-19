import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

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
  businessName: '여우스킨',
  businessPhone: '',
  businessAddress: '',
  businessHours: '',
  appointmentTimeInterval: 30,
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // user가 변경될 때마다 설정 초기화
  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      if (!user) {
        console.log('사용자가 없어서 설정 로드를 건너뜁니다.');
        return;
      }

      console.log('설정 로드 시작 - 사용자 ID:', user.id);

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('사용자 설정이 없습니다. 기본 설정을 사용합니다.');
        } else {
          console.error('설정 로드 실패:', error);
        }
        return;
      }

      if (data) {
        console.log('설정 데이터 로드됨:', data);
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
      console.error('설정 로드 실패:', error);
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

      console.log('설정 저장 시작 - 사용자 ID:', user.id);
      console.log('저장할 설정:', settings);

      // 먼저 기존 설정이 있는지 확인
      const { data: existingSettings, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('기존 설정 확인 실패:', checkError);
        throw checkError;
      }

      const settingsData: any = {
        business_name: settings.businessName,
        business_phone: settings.businessPhone,
        business_address: settings.businessAddress,
        business_hours: settings.businessHours,
        language: settings.language,
        updated_at: new Date().toISOString()
      };

      // appointment_time_interval 컬럼이 있는지 확인하고 추가
      try {
        const { data: columnCheck } = await supabase
          .from('settings')
          .select('appointment_time_interval')
          .limit(1);
        
        if (columnCheck !== null) {
          settingsData.appointment_time_interval = settings.appointmentTimeInterval;
        }
      } catch (error) {
        console.log('appointment_time_interval 컬럼이 없습니다.');
      }

      console.log('Supabase에 저장할 데이터:', settingsData);

      let error;
      if (existingSettings) {
        // 기존 설정이 있으면 업데이트
        console.log('기존 설정 업데이트 - ID:', existingSettings.id);
        const { error: updateError } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', existingSettings.id);
        error = updateError;
      } else {
        // 기존 설정이 없으면 새로 생성
        console.log('새 설정 생성');
        const { error: insertError } = await supabase
          .from('settings')
          .insert([{
            user_id: user.id,
            ...settingsData
          }]);
        error = insertError;
      }

      if (error) {
        console.error('설정 저장 실패:', error);
        throw error;
      }

      console.log('설정 저장 성공');
      // 저장 후 설정 다시 로드
      await loadSettings();
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