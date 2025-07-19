import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import CustomerTable from '../components/CustomerTable';
import CustomerForm from '../components/CustomerForm';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import EditCustomerModal from '../components/EditCustomerModal';
import { Customer, Product, Purchase, Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadPurchases();
    loadAppointments();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 데이터베이스 필드명을 클라이언트 필드명으로 변환
      const transformedData = (data || []).map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        birthDate: customer.birth_date,
        skinType: customer.skin_type,
        memo: customer.memo,
        point: customer.point,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        purchasedProducts: customer.purchased_products || []
      }));
      
      setCustomers(transformedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 데이터 로드 실패');
      console.error('고객 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        count: product.count,
        category: product.category,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('상품 데이터 로드 오류:', error);
    }
  };

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((purchase: any) => ({
        id: purchase.id,
        customerId: purchase.customer_id,
        productId: purchase.product_id,
        quantity: purchase.quantity,
        purchaseDate: purchase.purchase_date,
        createdAt: purchase.created_at,
        updatedAt: purchase.updated_at
      }));
      
      setPurchases(transformedData);
    } catch (error) {
      console.error('구매 데이터 로드 오류:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((appointment: any) => ({
        id: appointment.id,
        customerId: appointment.customer_id,
        productId: appointment.product_id,
        datetime: appointment.datetime,
        memo: appointment.memo,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }));
      
      setAppointments(transformedData);
    } catch (error) {
      console.error('예약 데이터 로드 오류:', error);
    }
  };

  const handleAddCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user?.id) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbCustomer = {
        name: customer.name,
        phone: customer.phone,
        birth_date: customer.birthDate,
        skin_type: customer.skinType,
        memo: customer.memo,
        point: customer.point,
        purchased_products: customer.purchasedProducts,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomer])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 새로 추가된 고객을 클라이언트 형식으로 변환
        const newCustomer = {
          id: data[0].id,
          name: data[0].name,
          phone: data[0].phone,
          birthDate: data[0].birth_date,
          skinType: data[0].skin_type,
          memo: data[0].memo,
          point: data[0].point,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
          purchasedProducts: data[0].purchased_products || []
        };
        
        setCustomers(prev => [newCustomer, ...prev]);
        setIsFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 추가 실패');
      console.error('고객 추가 오류:', error);
    }
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
      if (updates.skinType) dbUpdates.skin_type = updates.skinType;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
      if (updates.point !== undefined) dbUpdates.point = updates.point;
      if (updates.purchasedProducts) dbUpdates.purchased_products = updates.purchasedProducts;

      const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // 업데이트된 고객을 클라이언트 형식으로 변환
        const updatedCustomer = {
          id: data[0].id,
          name: data[0].name,
          phone: data[0].phone,
          birthDate: data[0].birth_date,
          skinType: data[0].skin_type,
          memo: data[0].memo,
          point: data[0].point,
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
          purchasedProducts: data[0].purchased_products || []
        };
        
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? updatedCustomer : customer
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
          products={products}
          purchases={purchases}
          appointments={appointments}
          isOpen={isEditModalOpen}
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