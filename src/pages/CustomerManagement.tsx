import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import CustomerTable from '../components/CustomerTable';
import CustomerForm from '../components/CustomerForm';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import EditCustomerModal from '../components/EditCustomerModal';
import { Customer } from '../types';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 데이터 로드 실패');
      console.error('고객 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select();

      if (error) throw error;
      
      if (data) {
        setCustomers(prev => [data[0], ...prev]);
        setIsFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 추가 실패');
      console.error('고객 추가 오류:', error);
    }
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (data) {
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? data[0] : customer
        ));
        setIsEditModalOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 업데이트 실패');
      console.error('고객 업데이트 오류:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 삭제 실패');
      console.error('고객 삭제 오류:', error);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
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
        <h1 className="text-3xl font-bold text-gray-900">고객 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새 고객 추가
        </button>
      </div>

      <CustomerTable
        customers={customers}
        onEdit={handleEditClick}
        onViewDetails={handleCustomerClick}
        onDelete={handleDeleteCustomer}
        getVoucherSummary={(customerId) => {
          // 간단한 바우처 요약 반환 (실제로는 더 복잡한 로직 필요)
          return '0개';
        }}
      />

      {isFormOpen && (
        <CustomerForm
          isOpen={isFormOpen}
          onSubmit={handleAddCustomer}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isDetailsModalOpen && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={isDetailsModalOpen}
          appointments={[]} // 실제로는 고객의 예약 데이터를 가져와야 함
          treatmentRecords={[]} // 실제로는 고객의 시술 기록을 가져와야 함
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {isEditModalOpen && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          appointments={[]} // 실제로는 고객의 예약 데이터를 가져와야 함
          purchaseItems={[]} // 실제로는 고객의 구매 아이템을 가져와야 함
          onSubmit={(customer, appointments, purchaseItems) => {
            handleUpdateCustomer(customer.id, customer);
          }}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement; 