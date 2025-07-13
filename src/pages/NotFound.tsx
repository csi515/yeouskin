import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            to="/dashboard"
            className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            대시보드로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;