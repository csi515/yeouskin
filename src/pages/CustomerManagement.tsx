import React, { useState, useEffect } from 'react';
import { Customer, Appointment, Product, Purchase } from '../types';
import { CsvManager } from '../utils/csvHandler';
import { sampleCustomers, sampleAppointments, sampleProducts } from '../data/sampleData';
import CustomerTable from '../components/CustomerTable';
import CustomerForm from '../components/CustomerForm';
import ViewCustomerModal from '../components/ViewCustomerModal';
import EditCustomerModal from '../components/EditCustomerModal';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const purchaseCsvManager = new CsvManager<Purchase>('purchases', [
    'id', 'customerId', 'productId', 'quantity', 'purchaseDate', 'totalPrice'
  ]);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersData, appointmentsData, productsData, purchasesData] = await Promise.all([
        customerCsvManager.readFromStorage(),
        appointmentCsvManager.readFromStorage(),
        productCsvManager.readFromStorage(),
        purchaseCsvManager.readFromStorage(),
      ]);

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

      // purchases는 빈 배열로 초기화 (샘플 데이터에 없음)
      setPurchases(purchasesData);
      
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  // 고객 추가
  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const success = customerCsvManager.appendToStorage(newCustomer);
      if (success) {
        setCustomers(prev => [...prev, newCustomer]);
        setIsFormOpen(false);
      } else {
        alert('고객 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 추가 오류:', error);
      alert('고객 추가 중 오류가 발생했습니다.');
    }
  };

  // 고객 수정
  const handleEditCustomer = async (customer: Customer, appointments: Appointment[], purchaseItems: Array<{productId: string, quantity: number}>) => {
    try {
      const success = customerCsvManager.updateByIdInStorage(customer.id, customer);
      if (success) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
        
        // 시술 이력도 함께 업데이트
        for (const appointment of appointments) {
          if (appointment?.id?.startsWith('new-')) {
            // 새 시술 이력 추가
            const newAppointment = {
              ...appointment,
              id: Date.now().toString(),
            };
            appointmentCsvManager.appendToStorage(newAppointment);
            setAppointments(prev => [...prev, newAppointment]);
          } else if (appointment?.id) {
            // 기존 시술 이력 업데이트
            appointmentCsvManager.updateByIdInStorage(appointment.id, appointment);
            setAppointments(prev => prev.map(a => a.id === appointment.id ? appointment : a));
          }
        }

        // 구매 내역 업데이트
        const existingPurchases = purchases.filter(p => p.customerId === customer.id);
        
        // 기존 구매 내역 삭제
        for (const purchase of existingPurchases) {
          purchaseCsvManager.deleteByIdFromStorage(purchase.id);
        }
        
        // 새로운 구매 내역 추가
        for (const item of purchaseItems) {
          if (item.productId && item.quantity > 0) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              const newPurchase: Purchase = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                customerId: customer.id,
                productId: item.productId,
                quantity: item.quantity,
                purchaseDate: new Date().toISOString(),
                totalPrice: product.price * item.quantity,
              };
              purchaseCsvManager.appendToStorage(newPurchase);
            }
          }
        }
        
        // 구매 내역 다시 로드
        const updatedPurchases = purchaseCsvManager.readFromStorage();
        setPurchases(updatedPurchases);
        
        setIsEditModalOpen(false);
        setEditingCustomer(null);
      } else {
        alert('고객 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 수정 오류:', error);
      alert('고객 수정 중 오류가 발생했습니다.');
    }
  };

  // 고객 삭제
  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const success = customerCsvManager.deleteByIdFromStorage(customerId);
      if (success) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        alert('고객 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 삭제 오류:', error);
      alert('고객 삭제 중 오류가 발생했습니다.');
    }
  };

  // 고객 수정 모달 열기
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  // 고객 상세보기 모달 열기
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  // 폼 제출 처리
  const handleFormSubmit = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    handleAddCustomer(customerData);
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // 고객별 잔여 상품권(이용권) 계산
  const getVoucherSummary = (customerId: string): string => {
    const purchaseMap: { [productId: string]: number } = {};
    const usedMap: { [productId: string]: number } = {};

    // 구매 내역 집계
    purchases
      .filter(p => p?.customerId === customerId)
      .forEach(purchase => {
        if (purchase?.productId) {
          purchaseMap[purchase.productId] = (purchaseMap[purchase.productId] || 0) + (purchase?.quantity || 0);
        }
      });

    // 사용 내역 집계 (예약에서 사용된 횟수)
    appointments
      .filter(a => a?.customerId === customerId)
      .forEach(appointment => {
        if (appointment?.productId) {
          usedMap[appointment.productId] = (usedMap[appointment.productId] || 0) + 1;
        }
      });

    // 잔여 계산
    const result: string[] = [];
    Object.entries(purchaseMap).forEach(([productId, quantity]) => {
      const product = products.find(p => p?.id === productId);
      if (!product) return;

      const totalPurchased = quantity * (product?.count || 1);
      const totalUsed = usedMap[productId] || 0;
      const remaining = totalPurchased - totalUsed;

      if (remaining > 0) {
        result.push(`${product?.name || '알 수 없음'}: ${remaining}회`);
      }
    });

    return result.join(', ');
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
        </div>
        
        {/* 검색 및 추가 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="고객 이름 또는 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            새 고객 추가
          </button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 고객 수</div>
            <div className="text-2xl font-bold text-blue-600">{customers.length}명</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">검색 결과</div>
            <div className="text-2xl font-bold text-green-600">{filteredCustomers.length}명</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 포인트</div>
            <div className="text-2xl font-bold text-purple-600">
              {customers.reduce((sum, c) => sum + (c?.point || 0), 0).toLocaleString()}P
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 예약</div>
            <div className="text-2xl font-bold text-orange-600">
              {appointments.length}건
            </div>
          </div>
        </div>
      </div>

      {/* 고객 테이블 */}
      {filteredCustomers.length > 0 ? (
        <CustomerTable
          customers={filteredCustomers}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteCustomer}
          getVoucherSummary={getVoucherSummary}
        />
      ) : (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
          </div>
          <div className="text-gray-400 text-sm">
            {searchTerm ? '다른 검색어를 시도해보세요.' : '새 고객을 추가해보세요.'}
          </div>
        </div>
      )}

      {/* 고객 추가 폼 모달 */}
      <CustomerForm
        customer={undefined}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* 고객 상세보기 모달 */}
      {selectedCustomer && (
        <ViewCustomerModal
          customer={selectedCustomer}
          products={products}
          appointments={appointments}
          purchases={purchases}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCustomer(null);
          }}
          onEdit={handleEdit}
        />
      )}

      {/* 고객 수정 모달 */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          products={products}
          purchases={purchases}
          appointments={appointments}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          onSubmit={(customer, appointments, purchaseItems) => handleEditCustomer(customer, appointments, purchaseItems)}
        />
      )}
    </div>
  );
};

export default CustomerManagement; 