import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, saveSettings, isLoading } = useSettings();
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      await saveSettings();
      setMessage('설정이 성공적으로 저장되었습니다.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('설정 저장에 실패했습니다.');
      console.error('설정 저장 실패:', error);
    }
  };

  const handleInputChange = (key: keyof typeof settings, value: string | number) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">시스템 설정을 관리하세요.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.includes('성공') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`mr-3 text-lg ${
              message.includes('성공') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.includes('성공') ? '✅' : '❌'}
            </div>
            <div className="font-medium">{message}</div>
          </div>
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
              예약 시간 단위 (분)
            </label>
            <select
              value={settings.appointmentTimeInterval}
              onChange={(e) => handleInputChange('appointmentTimeInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15분</option>
              <option value={30}>30분</option>
              <option value={45}>45분</option>
              <option value={60}>60분</option>
            </select>
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
            onClick={handleSave}
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
