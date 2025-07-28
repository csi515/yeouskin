import React, { useState, useEffect } from 'react';
import { getSupabase } from '../utils/supabase';
import { Customer, Product, Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CustomerForm from '../components/CustomerForm';
import CustomerList from '../components/CustomerList';
import CustomerDetail from '../components/CustomerDetail';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCustomers();
      loadProducts();
      loadPurchases();
      loadAppointments();
    }
  }, [user]);

  const loadCustomers = async () => {
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
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
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
      const supabase = getSupabase();
      if (!supabase || !user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
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
      const supabase = getSupabase();
      if (!supabase || !user) return;

      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
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
      const supabase = getSupabase();
      if (!supabase || !user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('datetime', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((appointment: any) => ({
        id: appointment.id,
        customerId: appointment.customer_id,
        productId: appointment.product_id,
        datetime: appointment.datetime,
        memo: appointment.memo,
        status: appointment.status,
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
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbCustomer = {
        user_id: user.id,
        name: customer.name,
        phone: customer.phone,
        birth_date: customer.birthDate,
        skin_type: customer.skinType,
        memo: customer.memo,
        point: customer.point || 0
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomer])
        .select()
        .single();

      if (error) throw error;
      
      // 새로 추가된 고객을 클라이언트 형식으로 변환
      const newCustomer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        birthDate: data.birth_date,
        skinType: data.skin_type,
        memo: data.memo,
        point: data.point,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        purchasedProducts: data.purchased_products || []
      };
      
      setCustomers(prev => [newCustomer, ...prev]);
      setIsFormOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 추가 실패');
      console.error('고객 추가 오류:', error);
    }
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>, appointments?: Appointment[], purchaseItems?: Array<{productId: string, quantity: number}>) => {
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 클라이언트 필드명을 데이터베이스 필드명으로 변환
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
      if (updates.skinType) dbUpdates.skin_type = updates.skinType;
      if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
      if (updates.point !== undefined) dbUpdates.point = updates.point;

      const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // 업데이트된 고객을 클라이언트 형식으로 변환
      const updatedCustomer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        birthDate: data.birth_date,
        skinType: data.skin_type,
        memo: data.memo,
        point: data.point,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        purchasedProducts: data.purchased_products || []
      };
      
      setCustomers(prev => 
        prev.map(customer => customer.id === id ? updatedCustomer : customer)
      );

      // 예약 업데이트
      if (appointments && appointments.length > 0) {
        for (const appointment of appointments) {
          const { error: appointmentError } = await supabase
            .from('appointments')
            .update({ customer_id: id })
            .eq('id', appointment.id);
          
          if (appointmentError) {
            console.error('예약 업데이트 오류:', appointmentError);
          }
        }
      }

      // 구매 내역 추가
      if (purchaseItems && purchaseItems.length > 0) {
        for (const item of purchaseItems) {
          const { error: purchaseError } = await supabase
            .from('purchases')
            .insert([{
              user_id: user.id,
              customer_id: id,
              product_id: item.productId,
              quantity: item.quantity
            }]);
          
          if (purchaseError) {
            console.error('구매 내역 추가 오류:', purchaseError);
          }
        }
      }

      setEditingCustomer(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 수정 실패');
      console.error('고객 수정 오류:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '고객 삭제 실패');
      console.error('고객 삭제 오류:', error);
    }
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

      <CustomerList
        customers={customers}
        onEdit={handleEditClick}
        onDelete={handleDeleteCustomer}
        onSelect={setSelectedCustomer}
        selectedCustomer={selectedCustomer}
      />

      {isFormOpen && (
        <CustomerForm
          isOpen={isFormOpen}
          onSubmit={handleAddCustomer}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {editingCustomer && (
        <CustomerDetail
          customer={editingCustomer}
          products={products}
          purchases={purchases}
          appointments={appointments}
          onSubmit={(customer, appointments, purchaseItems) => {
            handleUpdateCustomer(customer.id, customer, appointments, purchaseItems);
          }}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerManagement; 