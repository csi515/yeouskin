import { supabase } from './supabase';

// 테이블 스키마 정보를 캐시
const schemaCache = new Map<string, Set<string>>();

// 테이블 존재 여부 확인
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error;
  } catch {
    return false;
  }
};

// 컬럼 존재 여부를 안전하게 확인하는 함수
export const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // 먼저 테이블이 존재하는지 확인
    const tableExists = await checkTableExists(tableName);
    if (!tableExists) {
      console.warn(`테이블 ${tableName}이(가) 존재하지 않습니다.`);
      return false;
    }

    // 캐시된 스키마 정보 확인
    const cacheKey = `${tableName}_columns`;
    if (schemaCache.has(cacheKey)) {
      const columns = schemaCache.get(cacheKey)!;
      return columns.has(columnName);
    }

    // 스키마 정보를 가져와서 캐시
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0); // 실제 데이터는 가져오지 않고 스키마만 확인

    if (error) {
      console.warn(`테이블 ${tableName} 스키마 확인 실패:`, error);
      return false;
    }

    // 컬럼 목록을 캐시에 저장
    const columns = new Set<string>();
    if (data && typeof data === 'object') {
      // 빈 결과에서 컬럼명 추출
      Object.keys(data).forEach(key => columns.add(key));
    }
    
    schemaCache.set(cacheKey, columns);
    return columns.has(columnName);

  } catch (error) {
    console.warn(`컬럼 ${columnName} 존재 여부 확인 실패:`, error);
    return false;
  }
};

// 안전한 SELECT 쿼리 생성
export const createSafeSelectQuery = async (
  tableName: string, 
  requiredColumns: string[], 
  optionalColumns: string[] = []
): Promise<string> => {
  const safeColumns: string[] = [];
  
  // 테이블 존재 여부 확인
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    console.warn(`테이블 ${tableName}이(가) 존재하지 않습니다. 빈 쿼리를 반환합니다.`);
    return '';
  }
  
  // 필수 컬럼들 추가
  for (const column of requiredColumns) {
    if (await checkColumnExists(tableName, column)) {
      safeColumns.push(column);
    } else {
      console.warn(`필수 컬럼 ${column}이(가) 테이블 ${tableName}에 존재하지 않습니다.`);
    }
  }
  
  // 선택적 컬럼들 추가
  for (const column of optionalColumns) {
    if (await checkColumnExists(tableName, column)) {
      safeColumns.push(column);
    }
  }
  
  return safeColumns.join(', ');
};

// settings 테이블용 특화 함수
export const getSettingsColumns = async (): Promise<string> => {
  const requiredColumns = ['business_name', 'business_phone', 'business_address', 'business_hours', 'language'];
  const optionalColumns = ['appointment_time_interval'];
  
  return await createSafeSelectQuery('settings', requiredColumns, optionalColumns);
};

// settings 테이블 생성 함수
export const createSettingsTable = async (): Promise<boolean> => {
  try {
    // RPC를 통해 테이블 생성 (Supabase에서는 직접 테이블 생성이 제한적)
    const { error } = await supabase.rpc('create_settings_table_if_not_exists');
    
    if (error) {
      console.error('settings 테이블 생성 실패:', error);
      return false;
    }
    
    // 캐시 초기화
    clearTableSchemaCache('settings');
    return true;
  } catch (error) {
    console.error('settings 테이블 생성 중 오류:', error);
    return false;
  }
};

// 스키마 캐시 초기화
export const clearSchemaCache = (): void => {
  schemaCache.clear();
};

// 특정 테이블의 스키마 캐시 초기화
export const clearTableSchemaCache = (tableName: string): void => {
  const cacheKey = `${tableName}_columns`;
  schemaCache.delete(cacheKey);
}; 