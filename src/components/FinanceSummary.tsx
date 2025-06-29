import React from 'react';
import { FinanceRecord } from '../types';

interface FinanceSummaryProps {
  records: FinanceRecord[];
  selectedMonth: string;
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({ records, selectedMonth }) => {
  // 월별 데이터 필터링
  const monthlyRecords = records.filter(record => {
    const recordMonth = record.date.substring(0, 7); // YYYY-MM
    return recordMonth === selectedMonth;
  });

  // 통계 계산
  const totalIncome = monthlyRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpense = monthlyRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);

  const netIncome = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* 월별 통계 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">월별 통계</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>총 거래 건수:</span>
            <span className="font-medium">{monthlyRecords.length}건</span>
          </div>
          <div className="flex justify-between">
            <span>수입 건수:</span>
            <span className="font-medium text-green-600">
              {monthlyRecords.filter(r => r.type === 'income').length}건
            </span>
          </div>
          <div className="flex justify-between">
            <span>지출 건수:</span>
            <span className="font-medium text-red-600">
              {monthlyRecords.filter(r => r.type === 'expense').length}건
            </span>
          </div>
          <div className="flex justify-between">
            <span>평균 수입:</span>
            <span className="font-medium text-green-600">
              {monthlyRecords.filter(r => r.type === 'income').length > 0
                ? (totalIncome / monthlyRecords.filter(r => r.type === 'income').length).toLocaleString()
                : 0}원
            </span>
          </div>
          <div className="flex justify-between">
            <span>평균 지출:</span>
            <span className="font-medium text-red-600">
              {monthlyRecords.filter(r => r.type === 'expense').length > 0
                ? (totalExpense / monthlyRecords.filter(r => r.type === 'expense').length).toLocaleString()
                : 0}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary; 