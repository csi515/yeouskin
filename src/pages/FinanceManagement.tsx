import React, { useState, useEffect } from 'react';
import { FinanceRecord } from '../types';
import { 
  calculateMonthlyStats, 
  formatAmount
} from '../utils/finance';
import { sampleFinanceRecords } from '../data/sampleData';
import FinanceTable from '../components/FinanceTable';
import FinanceSummary from '../components/FinanceSummary';

const API_BASE_URL = 'http://localhost:3001/api';

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

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/finance`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 데이터가 없으면 샘플 데이터로 초기화
      if (data.length === 0) {
        await initializeSampleData();
      } else {
        setFinanceRecords(data);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      
      // API 서버가 실행되지 않은 경우 LocalStorage에서 로드
      const localData = localStorage.getItem('finance');
      if (localData) {
        setFinanceRecords(JSON.parse(localData));
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
      
      // 각 샘플 데이터를 API를 통해 추가
      for (const record of sampleFinanceRecords) {
        await addRecordToAPI(record);
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

  // API를 통해 레코드 추가
  const addRecordToAPI = async (record: FinanceRecord): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API 응답:', result);
      return result.success;
    } catch (error) {
      console.error('API 호출 오류:', error);
      return false;
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
      
      // API를 통해 추가
      const success = await addRecordToAPI(newRecord);
      
      if (success) {
        setFinanceRecords(prev => [...prev, newRecord]);
        console.log('재무 기록이 성공적으로 추가되었습니다:', newRecord);
      } else {
        throw new Error('API 호출 실패');
      }
    } catch (error) {
      console.error('재무 기록 추가 오류:', error);
      setError('재무 기록 추가에 실패했습니다.');
      
      // API 실패 시 LocalStorage에 백업 저장
      const localData = JSON.parse(localStorage.getItem('finance') || '[]');
      localData.push(newRecord);
      localStorage.setItem('finance', JSON.stringify(localData));
      setFinanceRecords(prev => [...prev, newRecord]);
    }
  };

  // 재무 기록 수정
  const handleEditRecord = async (record: FinanceRecord) => {
    try {
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/finance/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setFinanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
        console.log('재무 기록이 성공적으로 수정되었습니다:', record);
      } else {
        throw new Error('API 응답 실패');
      }
    } catch (error) {
      console.error('재무 기록 수정 오류:', error);
      setError('재무 기록 수정에 실패했습니다.');
      
      // API 실패 시 LocalStorage에 백업 저장
      const localData = JSON.parse(localStorage.getItem('finance') || '[]');
      const index = localData.findIndex((r: FinanceRecord) => r.id === record.id);
      if (index !== -1) {
        localData[index] = record;
        localStorage.setItem('finance', JSON.stringify(localData));
        setFinanceRecords(prev => prev.map(r => r.id === record.id ? record : r));
      }
    }
  };

  // 재무 기록 삭제
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('정말로 이 재무 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/finance/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setFinanceRecords(prev => prev.filter(r => r.id !== recordId));
        console.log('재무 기록이 성공적으로 삭제되었습니다:', recordId);
      } else {
        throw new Error('API 응답 실패');
      }
    } catch (error) {
      console.error('재무 기록 삭제 오류:', error);
      setError('재무 기록 삭제에 실패했습니다.');
      
      // API 실패 시 LocalStorage에서 백업 삭제
      const localData = JSON.parse(localStorage.getItem('finance') || '[]');
      const filteredData = localData.filter((r: FinanceRecord) => r.id !== recordId);
      localStorage.setItem('finance', JSON.stringify(filteredData));
      setFinanceRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  // 월별 통계 계산
  const monthlyStats = calculateMonthlyStats(financeRecords, selectedMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 및 검색 섹션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">재무 관리</h1>
          <button
            onClick={initializeSampleData}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            샘플 데이터 초기화
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
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