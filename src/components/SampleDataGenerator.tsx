import React, { useState, useEffect } from 'react';
import { SampleDataGenerator } from '../utils/sampleDataGenerator';

const SampleDataGeneratorComponent: React.FC = () => {
  const [existingData, setExistingData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const data = await SampleDataGenerator.checkExistingData();
      setExistingData(data);
    } catch (error) {
      console.error('기존 데이터 확인 실패:', error);
    }
  };

  const handleGenerateAll = async () => {
    if (!window.confirm('샘플 데이터를 생성하시겠습니까? 기존 데이터가 있을 수 있습니다.')) {
      return;
    }

    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await SampleDataGenerator.generateAllSampleData();
      setResult('샘플 데이터가 성공적으로 생성되었습니다!');
      await checkExistingData(); // 데이터 재확인
    } catch (error) {
      setError(error instanceof Error ? error.message : '샘플 데이터 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustomers = async () => {
    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await SampleDataGenerator.generateCustomers();
      setResult('고객 샘플 데이터가 생성되었습니다!');
      await checkExistingData();
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 데이터 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProducts = async () => {
    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await SampleDataGenerator.generateProducts();
      setResult('상품 샘플 데이터가 생성되었습니다!');
      await checkExistingData();
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 데이터 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAppointments = async () => {
    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await SampleDataGenerator.generateAppointments();
      setResult('예약 샘플 데이터가 생성되었습니다!');
      await checkExistingData();
    } catch (error) {
      setError(error instanceof Error ? error.message : '예약 데이터 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFinance = async () => {
    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await SampleDataGenerator.generateFinance();
      setResult('재무 샘플 데이터가 생성되었습니다!');
      await checkExistingData();
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 데이터 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">샘플 데이터 생성</h2>
      
      <div className="space-y-6">
        {/* 기존 데이터 상태 */}
        {existingData && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">현재 데이터 상태</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">고객</p>
                <p className="font-semibold">{existingData.customers}개</p>
              </div>
              <div>
                <p className="text-gray-600">상품</p>
                <p className="font-semibold">{existingData.products}개</p>
              </div>
              <div>
                <p className="text-gray-600">예약</p>
                <p className="font-semibold">{existingData.appointments}개</p>
              </div>
              <div>
                <p className="text-gray-600">재무</p>
                <p className="font-semibold">{existingData.finance}개</p>
              </div>
            </div>
          </div>
        )}

        {/* 전체 데이터 생성 */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">전체 샘플 데이터 생성</h3>
          <p className="text-sm text-gray-600 mb-4">
            모든 테이블에 5개의 샘플 데이터를 생성합니다.
          </p>
          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isGenerating ? '생성 중...' : '전체 데이터 생성'}
          </button>
        </div>

        {/* 개별 데이터 생성 */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">개별 데이터 생성</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGenerateCustomers}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              고객 데이터 생성
            </button>
            <button
              onClick={handleGenerateProducts}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              상품 데이터 생성
            </button>
            <button
              onClick={handleGenerateAppointments}
              disabled={isGenerating}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              예약 데이터 생성
            </button>
            <button
              onClick={handleGenerateFinance}
              disabled={isGenerating}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              재무 데이터 생성
            </button>
          </div>
        </div>

        {/* 결과 메시지 */}
        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {result}
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>오류:</strong> {error}
          </div>
        )}

        {/* 새로고침 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={checkExistingData}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            상태 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleDataGeneratorComponent; 