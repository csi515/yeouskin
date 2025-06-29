import React from 'react';
import { Appointment, Product } from '../types';

interface EditableAppointmentRowProps {
  appointment: Appointment;
  products: Product[];
  onChange: (field: keyof Appointment, value: string) => void;
  onDelete: () => void;
}

const EditableAppointmentRow: React.FC<EditableAppointmentRowProps> = ({
  appointment,
  products,
  onChange,
  onDelete,
}) => {
  return (
    <tr>
      <td className="px-2 py-2">
        <input
          type="date"
          value={appointment.datetime.slice(0, 10)}
          onChange={e => {
            const date = e.target.value;
            const time = appointment.datetime.slice(11, 16) || '10:00';
            onChange('datetime', `${date}T${time}`);
          }}
          className="w-full px-2 py-1 border border-gray-300 rounded-md"
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={appointment.productId}
          onChange={e => onChange('productId', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value="">서비스 선택</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={appointment.memo || ''}
          onChange={e => onChange('memo', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-md"
          placeholder="메모"
        />
      </td>
      <td className="px-2 py-2 text-center">
        <button
          type="button"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 px-2"
        >
          삭제
        </button>
      </td>
    </tr>
  );
};

export default EditableAppointmentRow; 