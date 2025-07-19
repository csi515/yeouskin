import React from 'react';
import { format, parseISO } from 'date-fns';
import { Appointment, Customer, Product } from '../types';

interface ReservationListPanelProps {
  selectedDate: Date;
  appointments: Appointment[];
  customers: Customer[];
  products: Product[];
  onAddReservation: () => void;
  onEditReservation: (appointment: Appointment) => void;
  onDeleteReservation: (id: string) => void;
}

const ReservationListPanel: React.FC<ReservationListPanelProps> = ({
  selectedDate,
  appointments,
  customers,
  products,
  onAddReservation,
  onEditReservation,
  onDeleteReservation,
}) => {
  // 선택된 날짜의 예약을 시간순으로 정렬
  const dayAppointments = appointments
    .filter(a => format(parseISO(a.datetime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => parseISO(a.datetime).getTime() - parseISO(b.datetime).getTime());

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'yyyy년 MM월 dd일')} 예약
        </h2>
        <p className="text-sm text-gray-600">
          총 {dayAppointments.length}건의 예약
        </p>
      </div>

      <div className="space-y-3">
        {dayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>이 날짜에는 예약이 없습니다.</p>
            <p className="text-sm mt-1">새로운 예약을 추가해보세요!</p>
          </div>
        ) : (
          dayAppointments.map((appointment) => {
            const customer = customers.find(c => c.id === appointment.customerId);
            const product = products.find(p => p.id === appointment.productId);
            
            return (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-lg font-semibold text-blue-600">
                        {format(parseISO(appointment.datetime), 'HH:mm')}
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {customer?.name || '고객'}
                      </div>
                    </div>
                    <div className="text-gray-700 mb-2">
                      📋 {product?.name || '상품명 없음'}
                    </div>
                    {appointment.memo && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        💬 {appointment.memo}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEditReservation(appointment)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeleteReservation(appointment.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReservationListPanel; 