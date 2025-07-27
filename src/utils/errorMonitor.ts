// 네트워크 오류 모니터링 유틸리티

interface NetworkError {
  timestamp: Date;
  url: string;
  status: number;
  statusText: string;
  type: string;
  message: string;
}

class ErrorMonitor {
  private errors: NetworkError[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // 콘솔 오류 감지 (개발 모드에서만)
    if (import.meta.env.DEV) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        this.logError('console', 'Console Error', args.join(' '));
        originalConsoleError.apply(console, args);
      };
    }

    // 전역 오류 이벤트 감지
    window.addEventListener('error', (event) => {
      this.logError('global', 'Global Error', event.message, event.filename);
    });

    // Promise 오류 감지
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('promise', 'Unhandled Promise Rejection', event.reason);
    });

    // 네트워크 오류 감지 (이미지, 스크립트, CSS)
    document.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        this.logError('image', 'Image Load Error', `이미지 로딩 실패: ${img.src}`, img.src);
      } else if (target.tagName === 'SCRIPT') {
        const script = target as HTMLScriptElement;
        this.logError('script', 'Script Load Error', `스크립트 로딩 실패: ${script.src}`, script.src);
      } else if (target.tagName === 'LINK') {
        const link = target as HTMLLinkElement;
        this.logError('css', 'CSS Load Error', `CSS 로딩 실패: ${link.href}`, link.href);
      }
    }, true);

    // Fetch API 인터셉트
    this.interceptFetch();
    
    // XMLHttpRequest 인터셉트
    this.interceptXHR();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          this.logError('fetch', 'Fetch Error', 
            `${response.status} ${response.statusText}`, url, response.status);
        }
        return response;
      } catch (error) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        this.logError('fetch', 'Network Error', 
          error instanceof Error ? error.message : '알 수 없는 오류', url);
        throw error;
      }
    };
  }

  private interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      return originalOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('error', () => {
        this.logError('xhr', 'XHR Network Error', 
          `XHR 오류: ${this._url}`, this._url);
      });

      this.addEventListener('load', () => {
        if (this.status >= 400) {
          this.logError('xhr', 'XHR Error', 
            `${this.status} ${this.statusText}`, this._url, this.status);
        }
      });

      return originalSend.call(this, ...args);
    };
  }

  private logError(type: string, title: string, message: string, url?: string, status?: number) {
    if (!this.isEnabled) return;

    const error: NetworkError = {
      timestamp: new Date(),
      url: url || 'N/A',
      status: status || 0,
      statusText: status ? this.getStatusText(status) : 'Error',
      type,
      message
    };

    this.errors.push(error);
    
    // 콘솔에 오류 출력
    console.group(`🚨 ${title} (${type})`);
    console.log('시간:', error.timestamp.toLocaleString('ko-KR'));
    console.log('URL:', error.url);
    console.log('상태:', error.status, error.statusText);
    console.log('메시지:', error.message);
    console.groupEnd();

    // 오류가 10개 이상이면 가장 오래된 것 제거
    if (this.errors.length > 10) {
      this.errors.shift();
    }

    // 개발 모드에서만 브라우저 알림 표시
    if (import.meta.env.DEV && this.errors.length === 1) {
      this.showBrowserNotification(title, message);
    }
  }

  private getStatusText(status: number): string {
    const statusTexts: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return statusTexts[status] || 'Unknown Error';
  }

  private showBrowserNotification(title: string, message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // 오류 목록 가져오기
  getErrors(): NetworkError[] {
    return [...this.errors];
  }

  // 오류 목록 지우기
  clearErrors(): void {
    this.errors = [];
  }

  // 모니터링 활성화/비활성화
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 오류 통계 가져오기
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {} as { [key: string]: number },
      byStatus: {} as { [key: number]: number }
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.byStatus[error.status] = (stats.byStatus[error.status] || 0) + 1;
    });

    return stats;
  }

  // 404 오류만 필터링
  get404Errors(): NetworkError[] {
    return this.errors.filter(error => error.status === 404);
  }

  // 특정 URL 패턴의 오류 필터링
  getErrorsByUrlPattern(pattern: string): NetworkError[] {
    const regex = new RegExp(pattern);
    return this.errors.filter(error => regex.test(error.url));
  }
}

// 싱글톤 인스턴스 생성
const errorMonitor = new ErrorMonitor();

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  (window as any).errorMonitor = errorMonitor;
}

export default errorMonitor; 