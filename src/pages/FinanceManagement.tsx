import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '../utils/supabase';
import { FinanceRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

const FinanceManagement: React.FC = () => {
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { user } = useAuth();

  useEffect(() => {
    loadFinanceRecords();
  }, []);

  const loadFinanceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('finance')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setFinanceRecords(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 데이터 로드 실패');
      console.error('재무 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (record: Omit<FinanceRecord, 'id'>) => {
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('finance')
        .insert([{ ...record, user_id: user.id }])
        .select();

      if (error) throw error;
      
      if (data) {
        setFinanceRecords(prev => [data[0], ...prev]);
        setIsFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 기록 추가 실패');
      console.error('재무 기록 추가 오류:', error);
    }
  };

  const handleUpdateRecord = async (id: string, updates: Partial<FinanceRecord>) => {
    try {
      const { data, error } = await supabase
        .from('finance')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (data) {
        setFinanceRecords(prev => prev.map(record => 
          record.id === id ? data[0] : record
        ));
        setIsFormOpen(false);
        setEditingRecord(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 기록 업데이트 실패');
      console.error('재무 기록 업데이트 오류:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('finance')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFinanceRecords(prev => prev.filter(record => record.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 기록 삭제 실패');
      console.error('재무 기록 삭제 오류:', error);
    }
  };

  const handleEditClick = (record: FinanceRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  // 선택된 월의 기록만 필터링
  const filteredRecords = financeRecords.filter(record => {
    const recordMonth = format(parseISO(record.date), 'yyyy-MM');
    return recordMonth === selectedMonth;
  });

  // 월별 통계 계산
  const monthlyStats = filteredRecords.reduce((stats, record) => {
    if (record.type === 'income') {
      stats.totalIncome += record.amount;
      stats.incomeCount += 1;
    } else {
      stats.totalExpense += record.amount;
      stats.expenseCount += 1;
    }
    stats.totalCount += 1;
    return stats;
  }, { totalIncome: 0, totalExpense: 0, incomeCount: 0, expenseCount: 0, totalCount: 0 });

  const netProfit = monthlyStats.totalIncome - monthlyStats.totalExpense;
  const avgIncome = monthlyStats.incomeCount > 0 ? Math.round(monthlyStats.totalIncome / monthlyStats.incomeCount) : 0;
  const avgExpense = monthlyStats.expenseCount > 0 ? Math.round(monthlyStats.totalExpense / monthlyStats.expenseCount) : 0;

  // 월 선택 옵션 생성 (최근 12개월)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>오류:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">재무 관리</h1>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">월 선택:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthOptions.map(month => (
                <option key={month} value={month}>
                  {format(parseISO(month + '-01'), 'yyyy년 MM월', { locale: ko })}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* FAB 버튼 */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-6 right-6 lg:relative lg:bottom-auto lg:right-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 lg:px-6 lg:py-3 lg:rounded-lg shadow-lg transition-all duration-200 z-50"
        >
          <span className="hidden lg:inline">새 기록 추가</span>
          <span className="lg:hidden text-xl">+</span>
        </button>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 총 거래 건수 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 거래 건수</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalCount}건</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 수입 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">수입</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.incomeCount}건</p>
              <p className="text-lg font-semibold text-green-600">{monthlyStats.totalIncome.toLocaleString()}원</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* 지출 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">지출</p>
              <p className="text-2xl font-bold text-red-600">{monthlyStats.expenseCount}건</p>
              <p className="text-lg font-semibold text-red-600">{monthlyStats.totalExpense.toLocaleString()}원</p>
            </div>
            <div className="text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 순이익 */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">순이익</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}원
              </p>
            </div>
            <div className={`${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 기록 테이블 섹션 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(parseISO(selectedMonth + '-01'), 'yyyy년 MM월', { locale: ko })} 거래 기록
          </h2>
        </div>

        {/* 데스크톱 테이블 */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">항목명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메모</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`hover:bg-gray-50 ${record.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(record.date), 'MM/dd', { locale: ko })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.type === 'income' ? '수입' : '지출'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()}원
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {record.memo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 테이블 */}
        <div className="lg:hidden">
          <div className="p-4 space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className={`border rounded-lg p-4 ${
                record.type === 'income' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.type === 'income' ? '수입' : '지출'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(parseISO(record.date), 'MM/dd', { locale: ko })}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(record)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{record.title}</h3>
                  </div>
                  <div>
                    <span className={`text-lg font-semibold ${
                      record.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()}원
                    </span>
                  </div>
                  {record.memo && (
                    <div>
                      <p className="text-sm text-gray-600">{record.memo}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">기록이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {format(parseISO(selectedMonth + '-01'), 'yyyy년 MM월', { locale: ko })}에 등록된 재무 기록이 없습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 재무 기록 폼 모달 */}
      {isFormOpen && (
        <FinanceRecordForm
          isOpen={isFormOpen}
          record={editingRecord}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
          onSubmit={editingRecord ? 
            (recordData) => handleUpdateRecord(editingRecord.id, recordData) : 
            handleAddRecord
          }
        />
      )}
    </div>
  );
};

// 재무 기록 폼 컴포넌트
interface FinanceRecordFormProps {
  isOpen: boolean;
  record?: FinanceRecord | null;
  onClose: () => void;
  onSubmit: (record: Omit<FinanceRecord, 'id'>) => void;
}

const FinanceRecordForm: React.FC<FinanceRecordFormProps> = ({
  isOpen,
  record,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    type: 'income' as 'income' | 'expense',
    title: '',
    amount: '',
    memo: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        date: record.date,
        type: record.type,
        title: record.title,
        amount: record.amount.toString(),
        memo: record.memo || '',
      });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'income',
        title: '',
        amount: '',
        memo: '',
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.title || !formData.amount) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    onSubmit({
      date: formData.date,
      type: formData.type,
      title: formData.title,
      amount: parseInt(formData.amount),
      memo: formData.memo,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {record ? '재무 기록 수정' : '새 재무 기록'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구분 *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              항목명 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="예: 페이셜 마사지, 월세 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              금액 *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              rows={3}
              placeholder="추가 정보나 메모를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {record ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceManagement; 