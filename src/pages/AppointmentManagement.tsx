import React, { useState, useEffect } from 'react';
import { Appointment, Customer, Product } from '../types';
import { CsvManager } from '../utils/csvHandler';
import { sampleAppointments, sampleCustomers, sampleProducts } from '../data/sampleData';
import CalendarPanel from '../components/CalendarPanel';
import ReservationListPanel from '../components/ReservationListPanel';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import EditableAppointmentRow from '../components/EditableAppointmentRow';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSV 매니저 초기화
  const appointmentCsvManager = new CsvManager<Appointment>('appointments', [
    'id', 'customerId', 'productId', 'datetime', 'memo'
  ]);

  const customerCsvManager = new CsvManager<Customer>('customers', [
    'id', 'name', 'phone', 'birthDate', 'skinType', 'memo', 'point', 'createdAt', 'updatedAt'
  ]);

  const productCsvManager = new CsvManager<Product>('products', [
    'id', 'name', 'price', 'type', 'count', 'status', 'description'
  ]);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsData, customersData, productsData] = await Promise.all([
        appointmentCsvManager.readFromStorage(),
        customerCsvManager.readFromStorage(),
        productCsvManager.readFromStorage(),
      ]);

      // 데이터가 없으면 샘플 데이터로 초기화
      if (appointmentsData.length === 0) {
        appointmentCsvManager.saveToStorage(sampleAppointments);
        setAppointments(sampleAppointments);
      } else {
        setAppointments(appointmentsData);
      }

      if (customersData.length === 0) {
        customerCsvManager.saveToStorage(sampleCustomers);
        setCustomers(sampleCustomers);
      } else {
        setCustomers(customersData);
      }

      if (productsData.length === 0) {
        productCsvManager.saveToStorage(sampleProducts);
        setProducts(sampleProducts);
      } else {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 선택된 날짜의 예약 목록
  const selectedDateAppointments = appointments.filter(appointment => {
    if (!appointment?.datetime) return false;
    const appointmentDate = new Date(appointment.datetime);
    return (
      appointmentDate.getFullYear() === selectedDate.getFullYear() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getDate() === selectedDate.getDate()
    );
  });

  // 예약 추가
  const handleAddAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
    };

    try {
      const success = appointmentCsvManager.appendToStorage(newAppointment);
      if (success) {
        setAppointments(prev => [...prev, newAppointment]);
        setIsFormOpen(false);
      } else {
        alert('예약 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 추가 오류:', error);
      alert('예약 추가 중 오류가 발생했습니다.');
    }
  };

  // 예약 수정
  const handleEditAppointment = async (appointment: Appointment) => {
    try {
      const success = appointmentCsvManager.updateByIdInStorage(appointment.id, appointment);
      if (success) {
        setAppointments(prev => prev.map(a => a.id === appointment.id ? appointment : a));
        setEditingAppointment(null);
      } else {
        alert('예약 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 수정 오류:', error);
      alert('예약 수정 중 오류가 발생했습니다.');
    }
  };

  // 예약 삭제
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const success = appointmentCsvManager.deleteByIdFromStorage(appointmentId);
      if (success) {
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      } else {
        alert('예약 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 삭제 오류:', error);
      alert('예약 삭제 중 오류가 발생했습니다.');
    }
  };

  // 예약 상세보기
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  // 예약 수정 모달 열기
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  // 폼 제출 처리
  const handleFormSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    handleAddAppointment(appointmentData);
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">오류가 발생했습니다</div>
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">예약 관리</h1>
        
        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 예약 수</div>
            <div className="text-2xl font-bold text-blue-600">{appointments.length}건</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">오늘 예약</div>
            <div className="text-2xl font-bold text-green-600">
              {selectedDateAppointments.length}건
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 고객 수</div>
            <div className="text-2xl font-bold text-purple-600">{customers.length}명</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">활성 상품</div>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.status === 'active').length}개
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 달력 패널 */}
        <div className="lg:col-span-2">
          <CalendarPanel
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            customers={customers}
            products={products}
          />
        </div>

        {/* 예약 목록 패널 */}
        <div>
          <ReservationListPanel
            appointments={selectedDateAppointments}
            customers={customers}
            products={products}
            selectedDate={selectedDate}
            onAddReservation={() => setIsFormOpen(true)}
            onViewDetail={handleViewDetails}
            onEditReservation={handleEdit}
            onDeleteReservation={handleDeleteAppointment}
          />
        </div>
      </div>

      {/* 예약 추가 폼 모달 */}
      <AppointmentForm
        customers={customers}
        products={products.filter(p => p.status === 'active')}
        selectedDate={selectedDate}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* 예약 상세보기 모달 */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          customers={customers}
          products={products}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentManagement; 