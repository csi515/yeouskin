import React from 'react';
import { Customer, Appointment, TreatmentRecord } from '../types';

interface CustomerDetailsModalProps {
  customer: Customer;
  appointments: Appointment[];
  treatmentRecords: TreatmentRecord[];
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customer,
  appointments,
  treatmentRecords,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const customerAppointments = appointments.filter(app => app.customerId === customer.id);
  const customerTreatments = treatmentRecords.filter(record => record.customerId === customer.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">고객 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 고객 기본 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">이름:</span>
              <span className="ml-2">{customer.name}</span>
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
            <div>
              <span className="text-sm font-medium text-gray-600">현재 포인트:</span>
              <span className="ml-2">{customer.point.toLocaleString()} P</span>
            </div>
          </div>
        </div>

        {/* 예약 이력 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">예약 이력</h3>
          {customerAppointments.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      날짜
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      서비스
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      메모
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customerAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(appointment.datetime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {appointment.productId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status === 'scheduled' && '예약됨'}
                          {appointment.status === 'completed' && '완료'}
                          {appointment.status === 'cancelled' && '취소'}
                          {appointment.status === 'no-show' && '미방문'}
                          {!appointment.status && '예약됨'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {appointment.memo || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">예약 이력이 없습니다.</p>
          )}
        </div>

        {/* 시술 이력 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">시술 이력</h3>
          {customerTreatments.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      날짜
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      서비스
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      사용 제품
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      반응
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      메모
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customerTreatments.map((treatment) => (
                    <tr key={treatment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(treatment.datetime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {treatment.serviceId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {treatment.products.join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {treatment.reaction || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {treatment.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">시술 이력이 없습니다.</p>
          )}
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

export default CustomerDetailsModal; 