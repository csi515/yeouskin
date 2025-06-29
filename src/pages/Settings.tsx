import React, { useState, useEffect } from 'react';

interface Settings {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessHours: string;
  defaultAppointmentDuration: number;
  autoBackup: boolean;
  backupInterval: number;
  language: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    businessPhone: '',
    businessAddress: '',
    businessHours: '',
    defaultAppointmentDuration: 60,
    autoBackup: true,
    backupInterval: 7,
    language: 'ko'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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

  const saveSettings = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('crm-settings', JSON.stringify(settings));
      setMessage('설정이 성공적으로 저장되었습니다.');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('설정 저장에 실패했습니다.');
      console.error('설정 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportData = () => {
    try {
      const data = {
        customers: localStorage.getItem('crm-customers'),
        appointments: localStorage.getItem('crm-appointments'),
        products: localStorage.getItem('crm-products'),
        finance: localStorage.getItem('crm-finance'),
        settings: localStorage.getItem('crm-settings')
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('데이터가 성공적으로 내보내졌습니다.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('데이터 내보내기에 실패했습니다.');
      console.error('데이터 내보내기 실패:', error);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.customers) localStorage.setItem('crm-customers', data.customers);
        if (data.appointments) localStorage.setItem('crm-appointments', data.appointments);
        if (data.products) localStorage.setItem('crm-products', data.products);
        if (data.finance) localStorage.setItem('crm-finance', data.finance);
        if (data.settings) localStorage.setItem('crm-settings', data.settings);

        setMessage('데이터가 성공적으로 가져와졌습니다. 페이지를 새로고침하세요.');
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        setMessage('데이터 가져오기에 실패했습니다.');
        console.error('데이터 가져오기 실패:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">시스템 설정을 관리하세요.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('성공') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* 사업장 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">사업장 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업장명
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="사업장명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처
              </label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="연락처를 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                value={settings.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="주소를 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                영업시간
              </label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => handleInputChange('businessHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 평일 09:00-18:00, 토요일 09:00-15:00"
              />
            </div>
          </div>
        </div>

        {/* 예약 기본 설정 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 기본 설정</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기본 예약 시간 (분)
            </label>
            <select
              value={settings.defaultAppointmentDuration}
              onChange={(e) => handleInputChange('defaultAppointmentDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30분</option>
              <option value={60}>1시간</option>
              <option value={90}>1시간 30분</option>
              <option value={120}>2시간</option>
            </select>
          </div>
        </div>

        {/* 데이터 백업 및 복원 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">데이터 백업 및 복원</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBackup"
                checked={settings.autoBackup}
                onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">
                자동 백업 사용
              </label>
            </div>
            
            {settings.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  백업 주기 (일)
                </label>
                <select
                  value={settings.backupInterval}
                  onChange={(e) => handleInputChange('backupInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>매일</option>
                  <option value={7}>매주</option>
                  <option value={30}>매월</option>
                </select>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                데이터 내보내기
              </button>
              <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                데이터 가져오기
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 기타 설정 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">기타 설정</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
