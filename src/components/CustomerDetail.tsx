import React from 'react';
import { Customer, Product, Appointment } from '../types';

interface CustomerDetailProps {
  customer: Customer;
  products: Product[];
  purchases: any[];
  appointments: Appointment[];
  onSubmit: (customer: Customer, appointments: Appointment[], purchaseItems: Array<{productId: string, quantity: number}>) => void;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  products,
  purchases,
  appointments,
  onSubmit,
  onClose
}) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('ko-KR');
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '알 수 없음';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예약됨';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      case 'no-show': return '노쇼';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const customerAppointments = appointments.filter(app => app.customerId === customer.id);
  const customerPurchases = purchases.filter(purchase => purchase.customerId === customer.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">고객 상세 정보</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 고객 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">이름:</span> {customer.name}
                </div>
                <div>
                  <span className="font-medium">연락처:</span> {customer.phone}
                </div>
                <div>
                  <span className="font-medium">생년월일:</span> {formatDate(customer.birthDate)}
                </div>
                <div>
                  <span className="font-medium">피부타입:</span> {customer.skinType || '-'}
                </div>
                <div>
                  <span className="font-medium">포인트:</span> {customer.point?.toLocaleString() || 0}P
                </div>
                <div>
                  <span className="font-medium">등록일:</span> {formatDate(customer.createdAt)}
                </div>
                {customer.memo && (
                  <div>
                    <span className="font-medium">메모:</span> {customer.memo}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">통계</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">총 예약 수:</span> {customerAppointments.length}건
                </div>
                <div>
                  <span className="font-medium">완료된 예약:</span> {customerAppointments.filter(app => app.status === 'completed').length}건
                </div>
                <div>
                  <span className="font-medium">총 구매 건수:</span> {customerPurchases.length}건
                </div>
                <div>
                  <span className="font-medium">총 구매 수량:</span> {customerPurchases.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0)}개
                </div>
              </div>
            </div>
          </div>

          {/* 예약 내역 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">예약 내역</h3>
            {customerAppointments.length === 0 ? (
              <p className="text-gray-500">예약 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {customerAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{getProductName(appointment.productId)}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(appointment.datetime)}</p>
                        {appointment.memo && (
                          <p className="text-sm text-gray-500">메모: {appointment.memo}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 구매 내역 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">구매 내역</h3>
            {customerPurchases.length === 0 ? (
              <p className="text-gray-500">구매 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {customerPurchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{getProductName(purchase.productId)}</p>
                        <p className="text-sm text-gray-600">수량: {purchase.quantity}개</p>
                        <p className="text-sm text-gray-500">구매일: {formatDate(purchase.purchaseDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;