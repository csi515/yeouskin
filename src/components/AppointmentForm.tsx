import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Appointment, Customer, Product } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface AppointmentFormProps {
  isOpen: boolean;
  selectedDate: Date;
  appointment?: Appointment;
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onSubmit: (appointmentData: Omit<Appointment, 'id'>) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  selectedDate,
  appointment,
  customers,
  products,
  onClose,
  onSubmit,
}) => {
  const { settings } = useSettings();

  // 시간 단위에 따른 시간 옵션 생성
  const generateTimeOptions = () => {
    const options = [];
    const interval = settings.appointmentTimeInterval;
    
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();
  const [form, setForm] = useState({
    customerId: '',
    productId: '',
    date: '',
    time: '10:00',
    memo: '',
  });

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.datetime);
      setForm({
        customerId: appointment.customerId,
        productId: appointment.productId,
        date: format(dt, 'yyyy-MM-dd'),
        time: dt.toTimeString().slice(0, 5),
        memo: appointment.memo || '',
      });
    } else {
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
      setForm(prev => ({
        ...prev,
        date: selectedDateString,
        customerId: '',
        productId: '',
        time: '10:00',
        memo: '',
      }));
    }
  }, [appointment, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.productId || !form.date || !form.time) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    const datetime = `${form.date}T${form.time}`;
    onSubmit({
      customerId: form.customerId,
      productId: form.productId,
      datetime,
      memo: form.memo,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {appointment ? '예약 수정' : '새 예약 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            📅 예약 날짜: {format(selectedDate, 'yyyy년 MM월 dd일')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              고객 *
            </label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">고객을 선택하세요</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품 *
            </label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">상품을 선택하세요</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.count || 1}회권)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜 *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">시간 *</label>
              <select
                name="time"
                value={form.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="memo"
              value={form.memo}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="특이사항이나 메모를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {appointment ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm; 