import React from 'react';
import { Appointment, Customer, Product } from '../types';

interface AppointmentListProps {
  appointments: Appointment[];
  customers: Customer[];
  products: Product[];
  selectedDate: Date;
  onAddAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  customers,
  products,
  selectedDate,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}) => {
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : '알 수 없음';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '알 수 없음';
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예약됨';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      case 'no-show': return '노쇼';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.datetime);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          예약 목록 ({selectedDate.toLocaleDateString('ko-KR')})
        </h3>
        <button
          onClick={onAddAppointment}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          예약 추가
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>선택된 날짜에 예약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {getCustomerName(appointment.customerId)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getProductName(appointment.productId)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(appointment.datetime)}
                  </p>
                  {appointment.memo && (
                    <p className="text-sm text-gray-600 mt-1">
                      메모: {appointment.memo}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditAppointment(appointment)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteAppointment(appointment.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;