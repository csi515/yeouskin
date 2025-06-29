import React, { useMemo } from 'react';
import { Customer, Product, Appointment, Purchase } from '../types';

interface ViewCustomerModalProps {
  customer: Customer;
  products: Product[];
  appointments: Appointment[];
  purchases: Purchase[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({
  customer,
  products,
  appointments,
  purchases,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null;

  // 고객의 구매 내역과 사용 내역을 계산하여 잔여 상품권 계산
  const voucherSummary = useMemo(() => {
    const purchaseMap: { [productId: string]: number } = {};
    const usedMap: { [productId: string]: number } = {};

    // 구매 내역 집계
    purchases
      .filter(p => p.customerId === customer.id)
      .forEach(purchase => {
        purchaseMap[purchase.productId] = (purchaseMap[purchase.productId] || 0) + purchase.quantity;
      });

    // 사용 내역 집계 (예약에서 사용된 횟수)
    appointments
      .filter(a => a.customerId === customer.id)
      .forEach(appointment => {
        usedMap[appointment.productId] = (usedMap[appointment.productId] || 0) + 1;
      });

    // 잔여 계산
    const result: Array<{
      productName: string;
      totalPurchased: number;
      totalUsed: number;
      remaining: number;
      productTimes: number;
    }> = [];

    Object.entries(purchaseMap).forEach(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const totalPurchased = quantity * (product.count || 1);
      const totalUsed = usedMap[productId] || 0;
      const remaining = totalPurchased - totalUsed;

      if (remaining > 0) {
        result.push({
          productName: product.name,
          totalPurchased,
          totalUsed,
          remaining,
          productTimes: product.count || 1,
        });
      }
    });

    return result;
  }, [customer.id, purchases, appointments, products]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">고객 상세 정보</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(customer)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              수정
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">고객 이름:</span>
              <span className="ml-2 font-medium">{customer.name}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">전화번호:</span>
              <span className="ml-2">{customer.phone}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">생년월일:</span>
              <span className="ml-2">{customer.birthDate || '미입력'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">피부 타입:</span>
              <span className="ml-2">
                {customer.skinType === 'normal' && '일반'}
                {customer.skinType === 'dry' && '건성'}
                {customer.skinType === 'oily' && '지성'}
                {customer.skinType === 'combination' && '복합성'}
                {customer.skinType === 'sensitive' && '민감성'}
              </span>
            </div>
          </div>
          {customer.memo && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">메모:</span>
              <p className="mt-1 text-gray-800">{customer.memo}</p>
            </div>
          )}
        </div>

        {/* 포인트 정보 */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">포인트 정보</h3>
          <div className="text-2xl font-bold text-blue-600">
            {customer.point.toLocaleString()} P
          </div>
        </div>

        {/* 잔여 상품권 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">잔여 상품권</h3>
          {voucherSummary.length > 0 ? (
            <div className="space-y-3">
              {voucherSummary.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-600">
                        {item.productTimes}회권 × {item.totalPurchased / item.productTimes}개 구매
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {item.remaining}회 남음
                      </div>
                      <div className="text-sm text-gray-500">
                        총 {item.totalPurchased}회 중 {item.totalUsed}회 사용
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎫</div>
              <p>잔여 상품권이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 구매 상품 목록 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">구매한 상품 목록</h3>
          {customer.purchasedProducts && customer.purchasedProducts.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {customer.purchasedProducts.map((product, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">구매 이력이 없습니다.</p>
          )}
        </div>

        {/* 시술 이력 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">시술 이력</h3>
          {(() => {
            const customerAppointments = appointments
              .filter(a => a.customerId === customer.id)
              .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            if (customerAppointments.length === 0) {
              return <p className="text-gray-500">시술 이력이 없습니다.</p>;
            }
            return (
              <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시술일자</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스명</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customerAppointments.map((app) => {
                      const product = products.find(p => p.id === app.productId);
                      return (
                        <tr key={app.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(app.datetime).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{product ? product.name : '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{app.memo || '메모 없음'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerModal; 