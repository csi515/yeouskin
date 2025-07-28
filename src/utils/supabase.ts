import { getSupabaseClient } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

// 안전한 Supabase 클라이언트 가져오기
export const getSupabase = (): SupabaseClient | null => {
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('Supabase: 클라이언트를 가져올 수 없습니다.');
    return null;
  }
  
  return client;
};

// 기본 내보내기 (기존 코드 호환성)
export const supabase = getSupabase();

// 연결 상태 확인
export const checkSupabaseConnection = async (): Promise<{
  isConnected: boolean;
  error?: string;
  details?: any;
}> => {
  const client = getSupabase();
  
  if (!client) {
    return {
      isConnected: false,
      error: 'Supabase 클라이언트가 초기화되지 않았습니다.'
    };
  }

  try {
    // 간단한 연결 테스트
    const { data, error } = await client
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      return {
        isConnected: false,
        error: error.message,
        details: {
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      };
    }

    return {
      isConnected: true,
      details: { data }
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      details: { error }
    };
  }
};

// 타입 정의
export interface SupabaseCustomer {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
  skin_type?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  memo?: string;
  point: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  type: 'voucher' | 'single';
  count?: number;
  status: 'active' | 'inactive';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAppointment {
  id: string;
  customer_id: string;
  product_id: string;
  datetime: string;
  memo?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  created_at: string;
  updated_at: string;
}

export interface SupabaseFinance {
  id: string;
  date: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

// 안전한 API 호출 래퍼
const safeApiCall = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  operationName: string
): Promise<T> => {
  const client = getSupabase();
  
  if (!client) {
    throw new Error(`Supabase 클라이언트가 초기화되지 않았습니다. (${operationName})`);
  }

  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`Supabase ${operationName} 오류:`, error);
      throw new Error(`${operationName} 실패: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`${operationName}: 데이터가 없습니다.`);
    }
    
    return data;
  } catch (error) {
    console.error(`Supabase ${operationName} 예외:`, error);
    throw error;
  }
};

// 고객 관련 함수
export const customerApi = {
  // 모든 고객 조회
  async getAll(): Promise<SupabaseCustomer[]> {
    return safeApiCall(
      () => getSupabase()!.from('customers').select('*').order('created_at', { ascending: false }),
      '고객 조회'
    );
  },

  // 고객 추가
  async create(customer: Omit<SupabaseCustomer, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseCustomer> {
    return safeApiCall(
      () => getSupabase()!.from('customers').insert([customer]).select().single(),
      '고객 추가'
    );
  },

  // 고객 수정
  async update(id: string, customer: Partial<SupabaseCustomer>): Promise<SupabaseCustomer> {
    return safeApiCall(
      () => getSupabase()!.from('customers').update(customer).eq('id', id).select().single(),
      '고객 수정'
    );
  },

  // 고객 삭제
  async delete(id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await client.from('customers').delete().eq('id', id);
    if (error) throw new Error(`고객 삭제 실패: ${error.message}`);
  },

  // 고객 검색
  async search(query: string): Promise<SupabaseCustomer[]> {
    return safeApiCall(
      () => getSupabase()!.from('customers').select('*').or(`name.ilike.%${query}%,phone.ilike.%${query}%`).order('created_at', { ascending: false }),
      '고객 검색'
    );
  }
};

// 상품 관련 함수
export const productApi = {
  // 모든 상품 조회
  async getAll(): Promise<SupabaseProduct[]> {
    return safeApiCall(
      () => getSupabase()!.from('products').select('*').order('created_at', { ascending: false }),
      '상품 조회'
    );
  },

  // 상품 추가
  async create(product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseProduct> {
    return safeApiCall(
      () => getSupabase()!.from('products').insert([product]).select().single(),
      '상품 추가'
    );
  },

  // 상품 수정
  async update(id: string, product: Partial<SupabaseProduct>): Promise<SupabaseProduct> {
    return safeApiCall(
      () => getSupabase()!.from('products').update(product).eq('id', id).select().single(),
      '상품 수정'
    );
  },

  // 상품 삭제
  async delete(id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw new Error(`상품 삭제 실패: ${error.message}`);
  }
};

// 예약 관련 함수
export const appointmentApi = {
  // 모든 예약 조회
  async getAll(): Promise<SupabaseAppointment[]> {
    return safeApiCall(
      () => getSupabase()!.from('appointments').select('*').order('datetime', { ascending: false }),
      '예약 조회'
    );
  },

  // 고객별 예약 조회
  async getByCustomer(customerId: string): Promise<SupabaseAppointment[]> {
    return safeApiCall(
      () => getSupabase()!.from('appointments').select('*').eq('customer_id', customerId).order('datetime', { ascending: false }),
      '고객별 예약 조회'
    );
  },

  // 예약 추가
  async create(appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseAppointment> {
    return safeApiCall(
      () => getSupabase()!.from('appointments').insert([appointment]).select().single(),
      '예약 추가'
    );
  },

  // 예약 수정
  async update(id: string, appointment: Partial<SupabaseAppointment>): Promise<SupabaseAppointment> {
    return safeApiCall(
      () => getSupabase()!.from('appointments').update(appointment).eq('id', id).select().single(),
      '예약 수정'
    );
  },

  // 예약 삭제
  async delete(id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await client.from('appointments').delete().eq('id', id);
    if (error) throw new Error(`예약 삭제 실패: ${error.message}`);
  }
};

// 재무 관련 함수
export const financeApi = {
  // 모든 재무 기록 조회
  async getAll(): Promise<SupabaseFinance[]> {
    return safeApiCall(
      () => getSupabase()!.from('finance').select('*').order('date', { ascending: false }),
      '재무 기록 조회'
    );
  },

  // 재무 기록 추가
  async create(finance: Omit<SupabaseFinance, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseFinance> {
    return safeApiCall(
      () => getSupabase()!.from('finance').insert([finance]).select().single(),
      '재무 기록 추가'
    );
  },

  // 재무 기록 수정
  async update(id: string, finance: Partial<SupabaseFinance>): Promise<SupabaseFinance> {
    return safeApiCall(
      () => getSupabase()!.from('finance').update(finance).eq('id', id).select().single(),
      '재무 기록 수정'
    );
  },

  // 재무 기록 삭제
  async delete(id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await client.from('finance').delete().eq('id', id);
    if (error) throw new Error(`재무 기록 삭제 실패: ${error.message}`);
  },

  // 월별 통계 조회
  async getMonthlyStats(yearMonth: string): Promise<any> {
    return safeApiCall(
      () => getSupabase()!.rpc('get_monthly_finance_stats', { year_month: yearMonth }),
      '월별 통계 조회'
    );
  }
};

// 데이터 변환 함수
export const transformCustomer = (supabaseCustomer: SupabaseCustomer) => ({
  id: supabaseCustomer.id,
  name: supabaseCustomer.name,
  phone: supabaseCustomer.phone,
  birthDate: supabaseCustomer.birth_date,
  skinType: supabaseCustomer.skin_type,
  memo: supabaseCustomer.memo,
  point: supabaseCustomer.point,
  createdAt: supabaseCustomer.created_at,
  updatedAt: supabaseCustomer.updated_at,
});

export const transformProduct = (supabaseProduct: SupabaseProduct) => ({
  id: supabaseProduct.id,
  name: supabaseProduct.name,
  price: supabaseProduct.price,
  type: supabaseProduct.type,
  count: supabaseProduct.count,
  status: supabaseProduct.status,
  description: supabaseProduct.description,
});

export const transformAppointment = (supabaseAppointment: SupabaseAppointment) => ({
  id: supabaseAppointment.id,
  customerId: supabaseAppointment.customer_id,
  productId: supabaseAppointment.product_id,
  datetime: supabaseAppointment.datetime,
  memo: supabaseAppointment.memo,
  status: supabaseAppointment.status,
});

export const transformFinance = (supabaseFinance: SupabaseFinance) => ({
  id: supabaseFinance.id,
  date: supabaseFinance.date,
  type: supabaseFinance.type,
  title: supabaseFinance.title,
  amount: supabaseFinance.amount,
  memo: supabaseFinance.memo,
}); 