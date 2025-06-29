import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Appointment, Product, FinanceRecord } from '../types';
import { CsvManager } from '../utils/csvHandler';
import { 
  calculateCurrentMonthStats, 
  getRecentFinanceRecords, 
  formatAmount,
  loadAndValidateFinanceData 
} from '../utils/finance';
import { sampleCustomers, sampleAppointments, sampleProducts, sampleFinanceRecords } from '../data/sampleData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // CSV 매니저 초기화
  const customerCsvManager = new CsvManager<Customer>('customers', [
    'id', 'name', 'phone', 'birthDate', 'skinType', 'memo', 'point', 'createdAt', 'updatedAt'
  ]);

  const appointmentCsvManager = new CsvManager<Appointment>('appointments', [
    'id', 'customerId', 'productId', 'datetime', 'memo'
  ]);

  const productCsvManager = new CsvManager<Product>('products', [
    'id', 'name', 'price', 'type', 'count', 'status', 'description'
  ]);

  const financeCsvManager = new CsvManager<FinanceRecord>('finance', [
    'id', 'date', 'type', 'title', 'amount', 'memo'
  ]);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 변경 이벤트 리스너
  useEffect(() => {
    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('dataChanged', handleDataChanged);
    return () => {
      window.removeEventListener('dataChanged', handleDataChanged);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, appointmentsData, productsData] = await Promise.all([
        customerCsvManager.readFromStorage(),
        appointmentCsvManager.readFromStorage(),
        productCsvManager.readFromStorage(),
      ]);

      // 재무 데이터는 새로운 유틸리티 함수를 사용하여 로드 및 검증
      let financeData = await loadAndValidateFinanceData();

      // 데이터가 없으면 샘플 데이터로 초기화
      if (customersData.length === 0) {
        customerCsvManager.saveToStorage(sampleCustomers);
        setCustomers(sampleCustomers);
      } else {
        setCustomers(customersData);
      }

      if (appointmentsData.length === 0) {
        appointmentCsvManager.saveToStorage(sampleAppointments);
        setAppointments(sampleAppointments);
      } else {
        setAppointments(appointmentsData);
      }

      if (productsData.length === 0) {
        productCsvManager.saveToStorage(sampleProducts);
        setProducts(sampleProducts);
      } else {
        setProducts(productsData);
      }

      if (financeData.length === 0) {
        financeCsvManager.saveToStorage(sampleFinanceRecords);
        financeData = sampleFinanceRecords;
      }
      
      setFinanceRecords(financeData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 오늘 예약 수 계산
  const getTodayAppointments = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment?.datetime?.startsWith(todayString)
    ).length;
  };

  // 이번 달 재무 통계 계산
  const currentMonthStats = calculateCurrentMonthStats(financeRecords);

  // 최근 재무 기록 가져오기
  const recentFinanceRecords = getRecentFinanceRecords(financeRecords, 5);

  // 활성 서비스 수 계산
  const getActiveServices = () => {
    return products.filter(product => product.status === 'active').length;
  };

  // 빠른 작업 버튼들
  const quickActions = [
    {
      title: '고객 관리',
      description: '고객 정보 관리',
      icon: '👥',
      color: 'bg-blue-500',
      route: '/customers'
    },
    {
      title: '상품 관리',
      description: '상품 및 서비스 관리',
      icon: '🛍️',
      color: 'bg-green-500',
      route: '/products'
    },
    {
      title: '예약 관리',
      description: '예약 일정 관리',
      icon: '📅',
      color: 'bg-purple-500',
      route: '/appointments'
    },
    {
      title: '재무 관리',
      description: '수입/지출 관리',
      icon: '💰',
      color: 'bg-yellow-500',
      route: '/finance'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">에스테틱샵 CRM 시스템에 오신 것을 환영합니다</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 고객 수</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">오늘 예약</p>
              <p className="text-2xl font-bold text-gray-900">{getTodayAppointments()}건</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 매출</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(currentMonthStats.totalIncome)}원
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 서비스</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveServices()}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 이번 달 재무 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 수입</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(currentMonthStats.totalIncome)}원
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-red-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <span className="text-2xl">📉</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 지출</p>
              <p className="text-2xl font-bold text-red-600">
                {formatAmount(currentMonthStats.totalExpense)}원
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">💵</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 순이익</p>
              <p className={`text-2xl font-bold ${
                currentMonthStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatAmount(currentMonthStats.netProfit)}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className={`${action.color} text-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 예약 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 예약</h3>
          <div className="space-y-3">
            {appointments
              .filter(appointment => appointment?.id && appointment?.datetime)
              .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
              .slice(0, 5)
              .map(appointment => {
                const customer = customers.find(c => c?.id === appointment?.customerId);
                const product = products.find(p => p?.id === appointment?.productId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name || '알 수 없음'}</p>
                      <p className="text-sm text-gray-600">{product?.name || '알 수 없음'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {appointment?.datetime ? new Date(appointment.datetime).toLocaleDateString() : '날짜 없음'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment?.datetime ? new Date(appointment.datetime).toLocaleTimeString() : '시간 없음'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 최근 재무 기록 */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 재무 기록</h3>
          <div className="space-y-3">
            {recentFinanceRecords.length > 0 ? (
              recentFinanceRecords.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      record.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{record.title}</p>
                      <p className="text-sm text-gray-600">{record.memo || '메모 없음'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      record.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}{formatAmount(record.amount)}원
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>재무 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 