import React from 'react';
import { format, parseISO } from 'date-fns';
import { Appointment, Customer, Product } from '../types';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  appointment,
  customers,
  products,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !appointment) return null;

  const customer = customers.find(c => c.id === appointment.customerId);
  const product = products.find(p => p.id === appointment.productId);

  const handleDelete = () => {
    if (window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      onDelete(appointment.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">예약 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">예약 일시</div>
            <div className="text-lg font-semibold text-gray-900">
              {format(parseISO(appointment.datetime), 'yyyy년 MM월 dd일 HH:mm')}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">고객 정보</div>
            <div className="text-lg font-semibold text-gray-900">
              {customer?.name || '고객명 없음'}
            </div>
            <div className="text-gray-700">
              {customer?.phone || '전화번호 없음'}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">예약 상품</div>
            <div className="text-lg font-semibold text-gray-900">
              {product?.name || '상품명 없음'}
            </div>
            {product && (
              <div className="text-gray-700">
                {product.count || 1}회권 • {product.price.toLocaleString()}원
              </div>
            )}
          </div>

          {appointment.memo && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">메모</div>
              <div className="text-gray-900">{appointment.memo}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => onEdit(appointment)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 