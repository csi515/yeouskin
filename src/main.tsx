import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './utils/errorMonitor';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('root 엘리먼트를 찾을 수 없습니다.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 