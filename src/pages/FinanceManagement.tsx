import React, { useState, useEffect } from 'react';
import { FinanceRecord } from '../types';
import { CsvManager } from '../utils/csvHandler';
import { 
  calculateMonthlyStats, 
  formatAmount,
  loadAndValidateFinanceData
} from '../utils/finance';
import { sampleFinanceRecords } from '../data/sampleData';
import { financeApi, transformFinance } from '../utils/supabase';
import FinanceTable from '../components/FinanceTable';
import FinanceSummary from '../components/FinanceSummary';

const FinanceManagement: React.FC = () => {
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [useSupabase, setUseSupabase] = useState(false);

  // CSV 매니저 초기화
  const financeCsvManager = new CsvManager<FinanceRecord>('finance', [
    'id', 'date', 'type', 'title', 'amount', 'memo'
  ]);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: FinanceRecord[] = [];

      // Supabase 사용 가능 여부 확인
      try {
        const supabaseData = await financeApi.getAll();
        if (supabaseData && supabaseData.length > 0) {
          data = supabaseData.map(transformFinance);
          setUseSupabase(true);
          console.log('Supabase에서 데이터를 로드했습니다.');
        } else {
          throw new Error('Supabase에 데이터가 없습니다.');
        }
      } catch (supabaseError) {
        console.log('Supabase 연결 실패, LocalStorage 사용:', supabaseError);
        setUseSupabase(false);
        
        // LocalStorage에서 데이터 로드
        data = await loadAndValidateFinanceData();
        
        // 데이터가 없으면 샘플 데이터로 초기화
        if (data.length === 0) {
          financeCsvManager.saveToStorage(sampleFinanceRecords);
          data = sampleFinanceRecords;
        }
      }

      setFinanceRecords(data);
      
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      
      // 구체적인 오류 메시지 제공
      let errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = '서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('Supabase')) {
          errorMessage = '데이터베이스 연결에 실패했습니다. 설정을 확인해주세요.';
        } else {
          errorMessage = `데이터 로드 오류: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      
      // 최후의 수단으로 LocalStorage에서 로드 시도
      try {
        const localData = localStorage.getItem('finance');
        if (localData) {
          const parsedData = JSON.parse(localData);
          setFinanceRecords(parsedData);
          setError(''); // 오류 메시지 제거
        }
      } catch (localError) {
        console.error('LocalStorage 로드 오류:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 초기화
  const initializeSampleData = async () => {
    if (!window.confirm('샘플 데이터로 초기화하시겠습니까? 기존 데이터는 삭제됩니다.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (useSupabase) {
        // Supabase에서 기존 데이터 삭제 후 샘플 데이터 추가
        const existingData = await financeApi.getAll();
        for (const record of existingData) {
          await financeApi.delete(record.id);
        }
        
        for (const record of sampleFinanceRecords) {
          await financeApi.create({
            date: record.date,
            type: record.type,
            title: record.title,
            amount: record.amount,
            memo: record.memo
          });
        }
      } else {
        // LocalStorage에 샘플 데이터 저장
        financeCsvManager.saveToStorage(sampleFinanceRecords);
      }
      
      setFinanceRecords(sampleFinanceRecords);
      alert('샘플 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('샘플 데이터 초기화 오류:', error);
      setError('샘플 데이터 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = financeRecords;

    // 월별 필터링
    if (selectedMonth) {
      filtered = filtered.filter(record => 
        record.date.startsWith(selectedMonth)
      );
    }

    // 타입 필터링
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.memo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [financeRecords, selectedMonth, typeFilter, searchTerm]);

  // 재무 기록 추가
  const handleAddRecord = async (recordData: Omit<FinanceRecord, 'id'>) => {
    const newRecord: FinanceRecord = {
      ...recordData,
      id: Date.now().toString(),
    };

    try {
      setError('');
      
      if (useSupabase) {
        // Supabase에 추가
        await financeApi.create({
          date: newRecord.date,
          type: newRecord.type,
          title: newRecord.title,
          amount: newRecord.amount,
          memo: newRecord.memo
        });
      } else {
        // LocalStorage에 추가
        const success = financeCsvManager.appendToStorage(newRecord);
        if (!success) {
          throw new Error('LocalStorage 저장 실패');
        }
      }
      
      setFinanceRecords(prev => [...prev, newRecord]);
      console.log('재무 기록이 성공적으로 추가되었습니다:', newRecord);
    } catch (error) {
      console.error('재무 기록 추가 오류:', error);
      setError('재무 기록 추가에 실패했습니다.');
    }
  };

  // 재무 기록 수정
  const handleEditRecord = async (record: FinanceRecord) => {
    try {
      setError('');
      
      if (useSupabase) {
        // Supabase에서 수정
        await financeApi.update(record.id, {
          date: record.date,
          type: record.type,
          title: record.title,
          amount: record.amount,
          memo: record.memo
        });
      } else {
        // LocalStorage에서 수정
        const success = financeCsvManager.updateByIdInStorage(record.id, record);
        if (!success) {
          throw new Error('LocalStorage 수정 실패');
        }
      }
      
      setFinanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
      console.log('재무 기록이 성공적으로 수정되었습니다:', record);
    } catch (error) {
      console.error('재무 기록 수정 오류:', error);
      setError('재무 기록 수정에 실패했습니다.');
    }
  };

  // 재무 기록 삭제
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('정말로 이 재무 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setError('');
      
      if (useSupabase) {
        // Supabase에서 삭제
        await financeApi.delete(recordId);
      } else {
        // LocalStorage에서 삭제
        const success = financeCsvManager.deleteByIdFromStorage(recordId);
        if (!success) {
          throw new Error('LocalStorage 삭제 실패');
        }
      }
      
      setFinanceRecords(prev => prev.filter(r => r.id !== recordId));
      console.log('재무 기록이 성공적으로 삭제되었습니다:', recordId);
    } catch (error) {
      console.error('재무 기록 삭제 오류:', error);
      setError('재무 기록 삭제에 실패했습니다.');
    }
  };

  // 월별 통계 계산
  const monthlyStats = calculateMonthlyStats(financeRecords, selectedMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 및 검색 섹션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">재무 관리</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {useSupabase ? 'Supabase' : 'LocalStorage'} 사용 중
            </span>
            <button
              onClick={initializeSampleData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              샘플 데이터 초기화
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="제목 또는 메모로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>

        {/* 선택된 월 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-blue-200">
            <div className="text-sm text-gray-600">{selectedMonth} 월 기록 수</div>
            <div className="text-xl font-bold text-blue-600">{monthlyStats.totalRecords}건</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-gray-600">{selectedMonth} 월 수입</div>
            <div className="text-xl font-bold text-green-600">
              {formatAmount(monthlyStats.totalIncome)}원
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-gray-600">{selectedMonth} 월 지출</div>
            <div className="text-xl font-bold text-red-600">
              {formatAmount(monthlyStats.totalExpense)}원
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
            <div className="text-sm text-gray-600">{selectedMonth} 월 순이익</div>
            <div className={`text-xl font-bold ${
              monthlyStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatAmount(monthlyStats.netProfit)}원
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 재무 요약 */}
        <div className="lg:col-span-1">
          <FinanceSummary
            records={filteredRecords}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* 재무 테이블 */}
        <div className="lg:col-span-3">
          <FinanceTable
            records={filteredRecords}
            onSave={handleAddRecord}
            onUpdate={handleEditRecord}
            onDelete={handleDeleteRecord}
          />
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement; 