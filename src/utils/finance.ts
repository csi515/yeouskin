import { FinanceRecord } from '../types';

// 금액을 1000 단위 콤마로 포맷팅
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

// 금액 문자열을 숫자로 파싱 (콤마 제거)
export const parseAmount = (amountStr: string): number => {
  return Number(amountStr.replace(/,/g, '')) || 0;
};

// 날짜가 특정 월에 속하는지 확인
export const isInMonth = (dateStr: string, targetMonth: string): boolean => {
  return dateStr.startsWith(targetMonth);
};

// 날짜가 이번 달에 속하는지 확인
export const isCurrentMonth = (dateStr: string): boolean => {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  return isInMonth(dateStr, currentMonth);
};

// 재무 데이터 통계 계산
export const calculateFinanceStats = (records: FinanceRecord[]) => {
  const totalIncome = records
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  const totalExpense = records
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    totalRecords: records.length,
    incomeCount: records.filter(record => record.type === 'income').length,
    expenseCount: records.filter(record => record.type === 'expense').length,
  };
};

// 월별 재무 데이터 통계 계산
export const calculateMonthlyStats = (records: FinanceRecord[], targetMonth: string) => {
  const monthlyRecords = records.filter(record => isInMonth(record.date, targetMonth));
  return calculateFinanceStats(monthlyRecords);
};

// 이번 달 재무 데이터 통계 계산
export const calculateCurrentMonthStats = (records: FinanceRecord[]) => {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  return calculateMonthlyStats(records, currentMonth);
};

// 최근 재무 기록 가져오기 (최신 순으로 정렬)
export const getRecentFinanceRecords = (records: FinanceRecord[], limit: number = 5) => {
  return records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// 재무 기록 유효성 검사
export const validateFinanceRecord = (record: any): boolean => {
  if (!record || typeof record !== 'object') return false;
  
  const requiredFields = ['id', 'date', 'type', 'title', 'amount'];
  for (const field of requiredFields) {
    if (!record[field]) return false;
  }

  // 날짜 형식 검사 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(record.date)) return false;

  // 타입 검사
  if (!['income', 'expense'].includes(record.type)) return false;

  // 금액 검사
  if (typeof record.amount !== 'number' || record.amount < 0) return false;

  return true;
};

// 재무 데이터 로딩 및 검증
export const loadAndValidateFinanceData = async (): Promise<FinanceRecord[]> => {
  try {
    // LocalStorage에서 데이터 읽기
    const stored = localStorage.getItem('finance');
    if (!stored) return [];

    const records = JSON.parse(stored);
    if (!Array.isArray(records)) {
      console.warn('재무 데이터가 배열 형식이 아닙니다.');
      return [];
    }

    // 각 레코드 유효성 검사
    const validRecords: FinanceRecord[] = [];
    const invalidRecords: any[] = [];

    records.forEach((record, index) => {
      if (validateFinanceRecord(record)) {
        validRecords.push(record as FinanceRecord);
      } else {
        invalidRecords.push({ index, record });
      }
    });

    if (invalidRecords.length > 0) {
      console.warn('잘못된 형식의 재무 데이터가 발견되었습니다:', invalidRecords);
    }

    return validRecords;
  } catch (error) {
    console.error('재무 데이터 로딩 중 오류 발생:', error);
    return [];
  }
}; 