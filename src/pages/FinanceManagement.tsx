import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import FinanceTable from '../components/FinanceTable';
import FinanceSummary from '../components/FinanceSummary';
import { FinanceRecord } from '../types';

const FinanceManagement: React.FC = () => {
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error } = await supabase
        .from('finance')
        .insert([record])
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">재무 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새 기록 추가
        </button>
      </div>

      <FinanceSummary 
        records={financeRecords} 
        selectedMonth={new Date().toISOString().substring(0, 7)}
      />

      <FinanceTable
        records={financeRecords}
        onSave={handleAddRecord}
        onDelete={handleDeleteRecord}
        onUpdate={(record) => handleUpdateRecord(record.id, record)}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingRecord ? '재무 기록 수정' : '새 재무 기록'}
            </h2>
            {/* 여기에 재무 기록 폼 컴포넌트를 추가할 수 있습니다 */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingRecord(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement; 