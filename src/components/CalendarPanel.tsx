import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO } from 'date-fns';
import { Appointment, Customer, Product } from '../types';

interface CalendarPanelProps {
  selectedDate: Date;
  appointments: Appointment[];
  customers: Customer[];
  products: Product[];
  onDateSelect: (date: Date) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({
  selectedDate,
  appointments,
  customers,
  products,
  onDateSelect,
}) => {
  // 날짜 선택 핸들러
  const handleDateSelect = (value: any) => {
    if (value instanceof Date) {
      console.log('달력에서 선택된 날짜:', value);
      onDateSelect(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      console.log('달력에서 선택된 날짜:', value[0]);
      onDateSelect(value[0]);
    }
  };

  // 달력 타일에 예약 요약 표시
  const tileContent = ({ date }: { date: Date }) => {
    const dayAppointments = appointments
      .filter(a => isSameDay(parseISO(a.datetime), date))
      .sort((a, b) => parseISO(a.datetime).getTime() - parseISO(b.datetime).getTime());
    
    if (dayAppointments.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-0.5">
        {dayAppointments.slice(0, 4).map((a) => {
          const customer = customers.find(c => c.id === a.customerId);
          const product = products.find(p => p.id === a.productId);
          const time = format(parseISO(a.datetime), 'HH:mm');
          return (
            <div key={a.id} className="text-xs bg-blue-100 rounded px-1 py-0.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">{time}</span>
                <span className="truncate ml-1">{customer?.name || '고객'}</span>
              </div>
            </div>
          );
        })}
        {dayAppointments.length > 4 && (
          <div className="text-xs text-gray-400">+{dayAppointments.length - 4}건</div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">예약 달력</h2>
      </div>
      
      <div className="w-full">
        <Calendar
          value={selectedDate}
          onChange={handleDateSelect}
          tileContent={tileContent}
          calendarType="gregory"
          className="w-full border-none font-inherit"
          tileClassName="h-24 p-2 relative min-w-[100px]"
          navigationLabel={({ date }) => format(date, 'yyyy년 MM월')}
        />
      </div>
    </div>
  );
};

export default CalendarPanel; 