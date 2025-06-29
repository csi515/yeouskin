import React, { useState, useEffect } from 'react';
import { FinanceRecord } from '../types';
import { formatAmount, parseAmount } from '../utils/finance';

interface FinanceTableProps {
  records: FinanceRecord[];
  onSave: (record: FinanceRecord) => void;
  onDelete: (id: string) => void;
  onUpdate: (record: FinanceRecord) => void;
}

const FinanceTable: React.FC<FinanceTableProps> = ({
  records,
  onSave,
  onDelete,
  onUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<FinanceRecord>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<FinanceRecord>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 자동완성 제안 목록 생성
  useEffect(() => {
    const titles = [...new Set(records.filter(r => r?.title).map(r => r.title))];
    setSuggestions(titles);
  }, [records]);

  // 편집 시작
  const startEditing = (record: FinanceRecord) => {
    if (record?.id) {
      setEditingId(record.id);
      setEditingData({ ...record });
    }
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  // 편집 저장
  const saveEditing = () => {
    if (editingId && editingData.title && editingData.amount && editingData.date && editingData.type) {
      onUpdate({
        id: editingId,
        title: editingData.title,
        amount: editingData.amount,
        date: editingData.date,
        type: editingData.type,
        memo: editingData.memo || '',
      });
      setEditingId(null);
      setEditingData({});
    }
  };

  // 새 행 추가 시작
  const startAdding = () => {
    setIsAdding(true);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      title: '',
      amount: 0,
      memo: '',
    });
  };

  // 새 행 추가 취소
  const cancelAdding = () => {
    setIsAdding(false);
    setNewRecord({});
  };

  // 새 행 저장
  const saveNewRecord = () => {
    if (newRecord.title && newRecord.amount && newRecord.date && newRecord.type) {
      const record: FinanceRecord = {
        id: Date.now().toString(),
        title: newRecord.title,
        amount: newRecord.amount,
        date: newRecord.date,
        type: newRecord.type,
        memo: newRecord.memo || '',
      };
      onSave(record);
      setIsAdding(false);
      setNewRecord({});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">구분</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">항목명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record?.id || 'unknown'} className="hover:bg-gray-50">
                {editingId === record?.id ? (
                  // 편집 모드
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={editingData.date || ''}
                        onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editingData.type || ''}
                        onChange={(e) => setEditingData({ ...editingData, type: e.target.value as 'income' | 'expense' })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="income">수입</option>
                        <option value="expense">지출</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.title || ''}
                        onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        list="title-suggestions"
                      />
                      <datalist id="title-suggestions">
                        {suggestions.map((suggestion, index) => (
                          <option key={index} value={suggestion} />
                        ))}
                      </datalist>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formatAmount(editingData.amount || 0)}
                        onChange={(e) => setEditingData({ ...editingData, amount: parseAmount(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.memo || ''}
                        onChange={(e) => setEditingData({ ...editingData, memo: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        placeholder="메모"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={saveEditing}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          취소
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // 보기 모드
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record?.date ? new Date(record.date).toLocaleDateString() : '날짜 없음'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record?.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record?.type === 'income' ? '수입' : '지출'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record?.title || '제목 없음'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatAmount(record?.amount || 0)}원
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {record?.memo || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => record && startEditing(record)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => record?.id && onDelete(record.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {/* 새 행 추가 */}
            {isAdding && (
              <tr className="bg-blue-50">
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={newRecord.date || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={newRecord.type || 'income'}
                    onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as 'income' | 'expense' })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="income">수입</option>
                    <option value="expense">지출</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newRecord.title || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="항목명"
                    list="title-suggestions"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={formatAmount(newRecord.amount || 0)}
                    onChange={(e) => setNewRecord({ ...newRecord, amount: parseAmount(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newRecord.memo || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, memo: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="메모"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={saveNewRecord}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelAdding}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      취소
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 새 행 추가 버튼 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={startAdding}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + 새 항목 추가
        </button>
      </div>
    </div>
  );
};

export default FinanceTable; 