import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './utils/errorMonitor';
import { getConnectionDiagnostics } from './utils/connectionTest';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('root 엘리먼트를 찾을 수 없습니다.');
}

const root = ReactDOM.createRoot(rootElement);

// 전역 디버깅 함수 추가
if (typeof window !== 'undefined') {
  (window as any).testConnection = getConnectionDiagnostics;
  (window as any).testDatabase = async () => {
    const diagnostics = await getConnectionDiagnostics();
    console.log('🔍 데이터베이스 연결 진단 결과:', diagnostics);
    return diagnostics;
  };
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 