import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import CalendarPanel from '../components/CalendarPanel';
import ReservationListPanel from '../components/ReservationListPanel';
import AppointmentForm from '../components/AppointmentForm';
import { Appointment, Customer, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 모든 데이터를 병렬로 로드
      const [appointmentsResult, customersResult, productsResult] = await Promise.all([
        supabase.from('appointments').select('*, customers(name, phone), products(name, price)').order('datetime', { ascending: false }),
        supabase.from('customers').select('*').order('name'),
        supabase.from('products').select('*').order('name')
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (customersResult.error) throw customersResult.error;
      if (productsResult.error) throw productsResult.error;

      // 데이터베이스 필드명을 클라이언트 필드명으로 변환
      const transformedAppointments = (appointmentsResult.data || []).map((appointment: any) => ({
        id: appointment.id,
        customerId: appointment.customer_id,
        productId: appointment.product_id,
        datetime: appointment.datetime,
        memo: appointment.memo,
        status: appointment.status,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }));

      setAppointments(transformedAppointments);
      setCustomers(customersResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : '데이터 로드 실패');
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbAppointment = {
        user_id: user.id,
        customer_id: appointment.customerId,
        product_id: appointment.productId,
        datetime: appointment.datetime,
        memo: appointment.memo,
        status: appointment.status || 'scheduled'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([dbAppointment])
        .select('*, customers(name, phone), products(name, price)');

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 새로 추가된 예약을 클라이언트 형식으로 변환
        const newAppointment = {
          id: data[0].id,
          customerId: data[0].customer_id,
          productId: data[0].product_id,
          datetime: data[0].datetime,
          memo: data[0].memo,
          status: data[0].status,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setAppointments(prev => [newAppointment, ...prev]);
        setIsFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '예약 추가 실패');
      console.error('예약 추가 오류:', error);
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbUpdates: any = {};
      if (updates.customerId) dbUpdates.customer_id = updates.customerId;
      if (updates.productId) dbUpdates.product_id = updates.productId;
      if (updates.datetime) dbUpdates.datetime = updates.datetime;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
      if (updates.status) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id)
        .select('*, customers(name, phone), products(name, price)');

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 업데이트된 예약을 클라이언트 형식으로 변환
        const updatedAppointment = {
          id: data[0].id,
          customerId: data[0].customer_id,
          productId: data[0].product_id,
          datetime: data[0].datetime,
          memo: data[0].memo,
          status: data[0].status,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setAppointments(prev => prev.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ));
        setIsFormOpen(false);
        setEditingAppointment(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '예약 업데이트 실패');
      console.error('예약 업데이트 오류:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : '예약 삭제 실패');
      console.error('예약 삭제 오류:', error);
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
        <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새 예약 추가
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarPanel
            appointments={appointments}
            customers={customers}
            products={products}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ReservationListPanel
            appointments={appointments}
            customers={customers}
            products={products}
            selectedDate={selectedDate}
            onAddReservation={() => setIsFormOpen(true)}
            onEditReservation={handleEditClick}
            onDeleteReservation={handleDeleteAppointment}
          />
        </div>
      </div>

      {isFormOpen && (
        <AppointmentForm
          isOpen={isFormOpen}
          appointment={editingAppointment || undefined}
          customers={customers}
          products={products}
          selectedDate={selectedDate}
          onSubmit={editingAppointment ? 
            (appointmentData) => handleUpdateAppointment(editingAppointment.id, appointmentData) : 
            handleAddAppointment
          }
          onClose={() => {
            setIsFormOpen(false);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentManagement; 