import React, { useState, useEffect } from 'react';
import { getSupabase } from '../utils/supabase';
import { FinanceRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import FinanceTable from '../components/FinanceTable';
import FinanceSummary from '../components/FinanceSummary';

const FinanceManagement: React.FC = () => {
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFinanceRecords();
    }
  }, [user]);

  const loadFinanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('finance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((record: any) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        title: record.title,
        amount: record.amount,
        memo: record.memo,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }));
      
      setFinanceRecords(transformedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 데이터 로드 실패');
      console.error('재무 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (record: Omit<FinanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const dbRecord = {
        user_id: user.id,
        date: record.date,
        type: record.type,
        title: record.title,
        amount: record.amount,
        memo: record.memo
      };

      const { data, error } = await supabase
        .from('finance')
        .insert([dbRecord])
        .select()
        .single();

      if (error) throw error;
      
      const newRecord = {
        id: data.id,
        date: data.date,
        type: data.type,
        title: data.title,
        amount: data.amount,
        memo: data.memo,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setFinanceRecords(prev => [newRecord, ...prev]);
      setIsFormOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 기록 추가 실패');
      console.error('재무 기록 추가 오류:', error);
    }
  };

  const handleUpdateRecord = async (id: string, updates: Partial<FinanceRecord>) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const dbUpdates: any = {};
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo;

      const { data, error } = await supabase
        .from('finance')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedRecord = {
        id: data.id,
        date: data.date,
        type: data.type,
        title: data.title,
        amount: data.amount,
        memo: data.memo,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setFinanceRecords(prev => 
        prev.map(record => record.id === id ? updatedRecord : record)
      );
      setEditingRecord(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '재무 기록 수정 실패');
      console.error('재무 기록 수정 오류:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600">⚠️</span>
            <span className="font-medium text-red-800">오류 발생</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button 
            onClick={loadFinanceRecords}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">재무 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          새 기록 추가
        </button>
      </div>

      <FinanceSummary records={financeRecords} />

      <FinanceTable
        records={financeRecords}
        onEdit={handleEditClick}
        onDelete={handleDeleteRecord}
      />

      {/* 재무 기록 폼은 FinanceTable 컴포넌트 내부에서 처리됨 */}
    </div>
  );
};

export default FinanceManagement; 