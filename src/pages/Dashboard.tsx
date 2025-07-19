import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Customer, Appointment, Product, FinanceRecord } from '../types';

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 모든 데이터를 병렬로 로드
      const [customersResult, appointmentsResult, productsResult, financeResult] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('products').select('*'),
        supabase.from('finance').select('*')
      ]);

      // 에러가 있더라도 데이터가 있으면 사용
      setCustomers(customersResult.data || []);
      setAppointments(appointmentsResult.data || []);
      setProducts(productsResult.data || []);
      setFinanceRecords(financeResult.data || []);

      // 모든 에러를 로그로만 기록하고 앱은 계속 실행
      if (customersResult.error) console.warn('고객 데이터 로드 오류:', customersResult.error);
      if (appointmentsResult.error) console.warn('예약 데이터 로드 오류:', appointmentsResult.error);
      if (productsResult.error) console.warn('상품 데이터 로드 오류:', productsResult.error);
      if (financeResult.error) console.warn('재무 데이터 로드 오류:', financeResult.error);
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
      // 에러가 발생해도 빈 배열로 초기화하여 앱이 계속 작동하도록 함
      setCustomers([]);
      setAppointments([]);
      setProducts([]);
      setFinanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 오늘 날짜 계산
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 오늘 예약 수
  const todayAppointments = appointments.filter(appointment => {
    if (!appointment.datetime) return false;
    const appointmentDate = new Date(appointment.datetime);
    return appointmentDate.toISOString().split('T')[0] === todayString;
  });

  // 이번 달 예약 수
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const monthlyAppointments = appointments.filter(appointment => {
    if (!appointment.datetime) return false;
    const appointmentDate = new Date(appointment.datetime);
    return appointmentDate >= currentMonthStart && appointmentDate <= currentMonthEnd;
  });

  // 이번 달 수입
  const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  const monthlyIncome = financeRecords
    .filter(record => record.type === 'income' && record.date.startsWith(currentMonth))
    .reduce((sum, record) => sum + record.amount, 0);

  // 이번 달 지출
  const monthlyExpense = financeRecords
    .filter(record => record.type === 'expense' && record.date.startsWith(currentMonth))
    .reduce((sum, record) => sum + record.amount, 0);

  // 활성 상품 수
  const activeProducts = products.filter(product => product.status === 'active').length;

  // 총 포인트
  const totalPoints = customers.reduce((sum, customer) => sum + (customer.point || 0), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">시스템 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 고객 수</p>
              <p className="text-2xl font-semibold text-gray-900">{customers.length}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">오늘 예약</p>
              <p className="text-2xl font-semibold text-gray-900">{todayAppointments.length}건</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 수입</p>
              <p className="text-2xl font-semibold text-gray-900">{monthlyIncome.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 상품</p>
              <p className="text-2xl font-semibold text-gray-900">{activeProducts}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">재무 현황</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">이번 달 수입</span>
              <span className="font-semibold text-green-600">{monthlyIncome.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">이번 달 지출</span>
              <span className="font-semibold text-red-600">{monthlyExpense.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">순이익</span>
              <span className={`font-semibold ${monthlyIncome - monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(monthlyIncome - monthlyExpense).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">고객 현황</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">총 고객 수</span>
              <span className="font-semibold">{customers.length}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 포인트</span>
              <span className="font-semibold">{totalPoints.toLocaleString()}P</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">평균 포인트</span>
              <span className="font-semibold">
                {customers.length > 0 ? Math.round(totalPoints / customers.length) : 0}P
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 현황</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">이번 달 예약</span>
              <span className="font-semibold">{monthlyAppointments.length}건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">오늘 예약</span>
              <span className="font-semibold">{todayAppointments.length}건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">활성 상품</span>
              <span className="font-semibold">{activeProducts}개</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 