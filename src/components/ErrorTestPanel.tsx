import React from 'react';

const ErrorTestPanel: React.FC = () => {
  const test404Error = () => {
    // 존재하지 않는 이미지 로드 시도
    const img = new Image();
    img.src = '/non-existent-image.png';
    img.onerror = () => {
      console.log('404 오류 테스트: 이미지 로딩 실패');
    };
  };

  const testFetchError = async () => {
    try {
      const response = await fetch('/api/non-existent-endpoint');
      console.log('Fetch 응답:', response);
    } catch (error) {
      console.log('Fetch 오류 테스트:', error);
    }
  };

  const testConsoleError = () => {
    console.error('테스트 콘솔 오류 메시지');
  };

  const testGlobalError = () => {
    // 의도적으로 오류 발생
    setTimeout(() => {
      throw new Error('테스트 전역 오류');
    }, 100);
  };

  const testPromiseError = () => {
    Promise.reject(new Error('테스트 Promise 오류'));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 오류 테스트</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          onClick={test404Error}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
        >
          🖼️ 404 이미지
        </button>
        
        <button
          onClick={testFetchError}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
        >
          🌐 Fetch 오류
        </button>
        
        <button
          onClick={testConsoleError}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
        >
          💻 콘솔 오류
        </button>
        
        <button
          onClick={testGlobalError}
          className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm"
        >
          🌍 전역 오류
        </button>
        
        <button
          onClick={testPromiseError}
          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm"
        >
          ⏳ Promise 오류
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        위 버튼들을 클릭하여 다양한 오류를 테스트할 수 있습니다.
      </p>
    </div>
  );
};

export default ErrorTestPanel; 