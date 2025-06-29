// 브라우저 환경용 CSV 매니저
export class CsvManager<T> {
  private fileName: string;
  private columns: string[];

  constructor(fileName: string, columns: string[]) {
    this.fileName = fileName;
    this.columns = columns;
  }

  // CSV 파일 읽기
  async readAll(): Promise<T[]> {
    try {
      const response = await fetch(`/data/${this.fileName}.csv`);
      if (!response.ok) {
        // 파일이 없으면 빈 배열 반환
        return [];
      }
      
      const csvText = await response.text();
      if (!csvText.trim()) {
        return [];
      }

      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: T[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCsvLine(lines[i]);
          const item: any = {};
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              // 숫자 필드 처리
              if (['price', 'amount', 'point', 'count', 'quantity', 'totalPrice'].includes(header)) {
                item[header] = Number(values[index]) || 0;
              } else {
                item[header] = values[index];
              }
            }
          });
          
          data.push(item as T);
        }
      }
      
      return data;
    } catch (error) {
      console.error(`CSV 읽기 오류 (${this.fileName}):`, error);
      return [];
    }
  }

  // CSV 파일 쓰기
  async write(data: T[]): Promise<boolean> {
    try {
      const csvContent = this.convertToCsv(data);
      
      // 브라우저 환경에서는 다운로드로 처리
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.fileName}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // LocalStorage에 백업 저장
      localStorage.setItem(`${this.fileName}_backup`, JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error(`CSV 쓰기 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // 새 항목 추가
  async append(item: T): Promise<boolean> {
    try {
      const data = await this.readAll();
      data.push(item);
      
      // LocalStorage에 저장
      localStorage.setItem(this.fileName, JSON.stringify(data));
      
      // 데이터 변경 이벤트 발생
      window.dispatchEvent(new CustomEvent('dataChanged'));
      
      return true;
    } catch (error) {
      console.error(`항목 추가 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // ID로 항목 업데이트
  async updateById(id: string, updatedItem: T): Promise<boolean> {
    try {
      const data = await this.readAll();
      const index = data.findIndex((item: any) => item?.id === id);
      
      if (index !== -1) {
        data[index] = updatedItem;
        
        // LocalStorage에 저장
        localStorage.setItem(this.fileName, JSON.stringify(data));
        
        // 데이터 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('dataChanged'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`항목 업데이트 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // ID로 항목 삭제
  async deleteById(id: string): Promise<boolean> {
    try {
      const data = await this.readAll();
      const filteredData = data.filter((item: any) => item?.id !== id);
      
      if (filteredData.length < data.length) {
        // LocalStorage에 저장
        localStorage.setItem(this.fileName, JSON.stringify(filteredData));
        
        // 데이터 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('dataChanged'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`항목 삭제 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // LocalStorage에서 데이터 읽기 (실제 구현에서는 이 방법 사용)
  readFromStorage(): T[] {
    try {
      const stored = localStorage.getItem(this.fileName);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`LocalStorage 읽기 오류 (${this.fileName}):`, error);
      return [];
    }
  }

  // LocalStorage에 데이터 저장
  saveToStorage(data: T[]): boolean {
    try {
      localStorage.setItem(this.fileName, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`LocalStorage 저장 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // LocalStorage에서 새 항목 추가
  appendToStorage(item: T): boolean {
    try {
      const data = this.readFromStorage();
      data.push(item);
      this.saveToStorage(data);
      
      // 데이터 변경 이벤트 발생
      window.dispatchEvent(new CustomEvent('dataChanged'));
      
      return true;
    } catch (error) {
      console.error(`LocalStorage 항목 추가 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // LocalStorage에서 ID로 항목 업데이트
  updateByIdInStorage(id: string, updatedItem: T): boolean {
    try {
      const data = this.readFromStorage();
      const index = data.findIndex((item: any) => item?.id === id);
      
      if (index !== -1) {
        data[index] = updatedItem;
        this.saveToStorage(data);
        
        // 데이터 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('dataChanged'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`LocalStorage 항목 업데이트 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // LocalStorage에서 ID로 항목 삭제
  deleteByIdFromStorage(id: string): boolean {
    try {
      const data = this.readFromStorage();
      const filteredData = data.filter((item: any) => item?.id !== id);
      
      if (filteredData.length < data.length) {
        this.saveToStorage(filteredData);
        
        // 데이터 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('dataChanged'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`LocalStorage 항목 삭제 오류 (${this.fileName}):`, error);
      return false;
    }
  }

  // CSV 라인 파싱 (쉼표가 포함된 필드 처리)
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // 데이터를 CSV 형식으로 변환
  private convertToCsv(data: T[]): string {
    if (data.length === 0) {
      return this.columns.join(',') + '\n';
    }

    const csvLines = [this.columns.join(',')];
    
    data.forEach(item => {
      const values = this.columns.map(column => {
        const value = (item as any)[column];
        // 쉼표나 따옴표가 포함된 값은 따옴표로 감싸기
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvLines.push(values.join(','));
    });
    
    return csvLines.join('\n');
  }

  getFileName(): string {
    return this.fileName;
  }

  async getStats(): Promise<{ count: number; lastModified: Date }> {
    const records = await this.readAll();
    return {
      count: records.length,
      lastModified: new Date()
    };
  }

  // CSV 다운로드 기능
  async downloadAsCSV(): Promise<void> {
    const records = await this.readAll();
    if (records.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // CSV 헤더 생성
    const csvContent = [
      this.columns.join(','),
      ...records.map((record: any) => 
        this.columns.map(header => {
          const value = record[header];
          // 값에 쉼표가 있으면 따옴표로 감싸기
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // CSV 파일 업로드 기능
  async uploadFromCSV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string;
          const lines = csvContent.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const records: T[] = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const record: any = {};
              headers.forEach((header, index) => {
                record[header] = values[index]?.trim() || '';
              });
              records.push(record);
            }
          }
          
          this.write(records).then(() => resolve()).catch(reject);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
} 