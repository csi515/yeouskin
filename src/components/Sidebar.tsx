import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { signOut, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/customers', icon: '👥', label: '고객 관리' },
    { path: '/appointments', icon: '📅', label: '예약 관리' },
    { path: '/products', icon: '🛍️', label: '상품 관리' },
    { path: '/finance', icon: '💰', label: '재무 관리' },
    { path: '/settings', icon: '⚙️', label: '설정' },
    { path: '/debug', icon: '🔧', label: '디버깅' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 relative ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">{settings.businessName}</h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  {user.name}님 환영합니다
                </p>
              )}
            </div>
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

      {/* 로그아웃 버튼 */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title={collapsed ? '로그아웃' : undefined}
        >
          <span className="text-xl mr-3">🚪</span>
          {!collapsed && <span>로그아웃</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 