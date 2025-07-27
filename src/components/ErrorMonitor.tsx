import React, { useEffect, useState } from 'react';

interface NetworkError {
  id: string;
  timestamp: Date;
  url: string;
  status: number;
  statusText: string;
  type: 'fetch' | 'xhr' | 'image' | 'script' | 'link';
  message: string;
}

const ErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<NetworkError[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 기존 fetch 인터셉트
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const error: NetworkError = {
            id: Date.now().toString(),
            timestamp: new Date(),
            url: typeof args[0] === 'string' ? args[0] : args[0].url,
            status: response.status,
            statusText: response.statusText,
            type: 'fetch',
            message: `Fetch 오류: ${response.status} ${response.statusText}`
          };
          setErrors(prev => [error, ...prev.slice(0, 9)]); // 최대 10개 유지
        }
        return response;
      } catch (error) {
        const networkError: NetworkError = {
          id: Date.now().toString(),
          timestamp: new Date(),
          url: typeof args[0] === 'string' ? args[0] : args[0].url,
          status: 0,
          statusText: 'Network Error',
          type: 'fetch',
          message: `네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
        setErrors(prev => [networkError, ...prev.slice(0, 9)]);
        throw error;
      }
    };

    // XMLHttpRequest 인터셉트
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('error', () => {
        const error: NetworkError = {
          id: Date.now().toString(),
          timestamp: new Date(),
          url: this._url || '알 수 없는 URL',
          status: 0,
          statusText: 'Network Error',
          type: 'xhr',
          message: `XHR 오류: ${this._url}`
        };
        setErrors(prev => [error, ...prev.slice(0, 9)]);
      });

      this.addEventListener('load', () => {
        if (this.status >= 400) {
          const error: NetworkError = {
            id: Date.now().toString(),
            timestamp: new Date(),
            url: this._url || '알 수 없는 URL',
            status: this.status,
            statusText: this.statusText,
            type: 'xhr',
            message: `XHR 오류: ${this.status} ${this.statusText}`
          };
          setErrors(prev => [error, ...prev.slice(0, 9)]);
        }
      });

      return originalXHRSend.call(this, ...args);
    };

    // 이미지 로딩 오류 감지
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      const error: NetworkError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        url: img.src,
        status: 404,
        statusText: 'Not Found',
        type: 'image',
        message: `이미지 로딩 실패: ${img.src}`
      };
      setErrors(prev => [error, ...prev.slice(0, 9)]);
    };

    // 스크립트 로딩 오류 감지
    const handleScriptError = (event: Event) => {
      const script = event.target as HTMLScriptElement;
      const error: NetworkError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        url: script.src,
        status: 404,
        statusText: 'Not Found',
        type: 'script',
        message: `스크립트 로딩 실패: ${script.src}`
      };
      setErrors(prev => [error, ...prev.slice(0, 9)]);
    };

    // CSS 링크 로딩 오류 감지
    const handleLinkError = (event: Event) => {
      const link = event.target as HTMLLinkElement;
      const error: NetworkError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        url: link.href,
        status: 404,
        statusText: 'Not Found',
        type: 'link',
        message: `CSS 로딩 실패: ${link.href}`
      };
      setErrors(prev => [error, ...prev.slice(0, 9)]);
    };

    // 전역 오류 이벤트 리스너 추가
    document.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        handleImageError(event);
      } else if (target.tagName === 'SCRIPT') {
        handleScriptError(event);
      } else if (target.tagName === 'LINK') {
        handleLinkError(event);
      }
    }, true);

    // 정리 함수
    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR');
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'fetch': return '🌐';
      case 'xhr': return '📡';
      case 'image': return '🖼️';
      case 'script': return '📜';
      case 'link': return '🔗';
      default: return '❌';
    }
  };

  const getErrorColor = (status: number) => {
    if (status === 404) return 'text-red-600';
    if (status >= 500) return 'text-orange-600';
    if (status >= 400) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg mb-2"
        title="오류 모니터"
      >
        <span className="text-lg">⚠️</span>
        {errors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {errors.length}
          </span>
        )}
      </button>

      {/* 오류 패널 */}
      {isVisible && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
          <div className="bg-red-500 text-white px-4 py-2 flex justify-between items-center">
            <h3 className="font-semibold">네트워크 오류 모니터</h3>
            <div className="flex gap-2">
              <button
                onClick={clearErrors}
                className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                모두 지우기
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                닫기
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {errors.map((error) => (
              <div key={error.id} className="border-b border-gray-200 p-3 hover:bg-gray-50">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getErrorIcon(error.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${getErrorColor(error.status)}`}>
                        {error.status} {error.statusText}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(error.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 truncate" title={error.url}>
                      {error.url}
                    </p>
                    <p className="text-xs text-gray-600">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
            총 {errors.length}개의 오류가 감지되었습니다
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMonitor; 