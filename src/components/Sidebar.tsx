import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/customers', icon: '👥', label: '고객 관리' },
    { path: '/appointments', icon: '📅', label: '예약 관리' },
    { path: '/products', icon: '🛍️', label: '상품 관리' },
    { path: '/finance', icon: '💰', label: '재무 관리' },
    { path: '/settings', icon: '⚙️', label: '설정' },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-gray-800">CRM 시스템</h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 