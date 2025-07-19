import React, { useState, useEffect } from 'react';
import { Customer, Product, Purchase, Appointment } from '../types';
import EditableAppointmentRow from './EditableAppointmentRow';

interface EditCustomerModalProps {
  customer: Customer;
  products: Product[];
  purchases: Purchase[];
  appointments: Appointment[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer, appointments: Appointment[], purchaseItems: Array<{productId: string, quantity: number}>) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  products,
  purchases,
  appointments: allAppointments,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    skinType: 'normal' as Customer['skinType'],
    point: 0,
    memo: '',
  });

  const [purchaseItems, setPurchaseItems] = useState<Array<{
    productId: string;
    quantity: number;
  }>>([]);

  const [editAppointments, setEditAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        birthDate: customer.birthDate || '',
        skinType: customer.skinType || 'normal',
        point: customer.point || 0,
        memo: customer.memo || '',
      });

      // 구매 내역 초기화
      const customerPurchases = purchases.filter(p => p.customerId === customer.id);
      const purchaseMap: { [productId: string]: number } = {};
      
      customerPurchases.forEach(purchase => {
        purchaseMap[purchase.productId] = (purchaseMap[purchase.productId] || 0) + purchase.quantity;
      });

      const purchaseItems = Object.entries(purchaseMap).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      setPurchaseItems(purchaseItems);

      setEditAppointments(
        allAppointments
          .filter(a => a.customerId === customer.id)
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      );
    }
  }, [customer, purchases, allAppointments, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) {
      console.error('고객 정보가 없습니다.');
      return;
    }
    
    const updatedCustomer: Customer = {
      ...customer,
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    onSubmit(updatedCustomer, editAppointments, purchaseItems);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'point' ? Number(value) : value,
    }));
  };

  const handlePurchaseChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newPurchaseItems = [...purchaseItems];
    newPurchaseItems[index] = {
      ...newPurchaseItems[index],
      [field]: field === 'quantity' ? Number(value) : value,
    };
    setPurchaseItems(newPurchaseItems);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { productId: '', quantity: 1 }]);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  // 시술 이력 행 변경
  const handleAppointmentChange = (index: number, field: keyof Appointment, value: string) => {
    setEditAppointments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 시술 이력 삭제
  const handleAppointmentDelete = (index: number) => {
    setEditAppointments(prev => prev.filter((_, i) => i !== index));
  };

  // 시술 이력 추가
  const handleAddAppointment = () => {
    if (!customer) {
      console.error('고객 정보가 없습니다.');
      return;
    }
    
    setEditAppointments(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        customerId: customer.id,
        productId: '',
        datetime: new Date().toISOString().slice(0, 16),
        memo: '',
      },
    ]);
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">고객 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고객 이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  생년월일
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  피부 타입
                </label>
                <select
                  name="skinType"
                  value={formData.skinType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">일반</option>
                  <option value="dry">건성</option>
                  <option value="oily">지성</option>
                  <option value="combination">복합성</option>
                  <option value="sensitive">민감성</option>
                </select>
              </div>
            </div>
          </div>

          {/* 포인트 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">포인트 정보</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 포인트
              </label>
              <input
                type="number"
                name="point"
                value={formData.point}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 구매 상품 관리 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">구매 상품 관리</h3>
              <button
                type="button"
                onClick={addPurchaseItem}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                + 상품 추가
              </button>
            </div>
            
            {purchaseItems.length > 0 ? (
              <div className="space-y-3">
                {purchaseItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handlePurchaseChange(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">상품 선택</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.count}회권, {product.price.toLocaleString()}원)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handlePurchaseChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="수량"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePurchaseItem(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">구매 상품이 없습니다.</p>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              rows={4}
              placeholder="고객에 대한 메모를 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 시술 이력 편집 섹션 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">시술 이력 편집</h3>
              <button
                type="button"
                onClick={handleAddAppointment}
                className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                + 시술 추가
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">시술일자</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">서비스명</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">메모</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {editAppointments.length > 0 ? (
                    editAppointments.map((app, idx) => (
                      <EditableAppointmentRow
                        key={app.id}
                        appointment={app}
                        products={products}
                        onChange={(field, value) => handleAppointmentChange(idx, field, value)}
                        onDelete={() => handleAppointmentDelete(idx)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-4">시술 이력이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal; 