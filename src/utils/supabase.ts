import { supabaseClient } from './supabaseClient';

// 안전한 Supabase 클라이언트 내보내기
export const supabase = supabaseClient;
if (!supabase) {
  console.error('x supabase 인스턴스 null');}

// Supabase 클라이언트 초기화 상태 로깅 (개발 모드에서만)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('Supabase 클라이언트 상태:', {
    supabaseExists: !!supabase,
    url: import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    env: import.meta.env.MODE
  });
}

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

// 고객 관련 함수
export const customerApi = {
  // 모든 고객 조회
  async getAll() {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다!!');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 고객 추가
  async create(customer: Omit<SupabaseCustomer, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 고객 수정
  async update(id: string, customer: Partial<SupabaseCustomer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 고객 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 고객 검색
  async search(query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// 상품 관련 함수
export const productApi = {
  // 모든 상품 조회
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 상품 추가
  async create(product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 상품 수정
  async update(id: string, product: Partial<SupabaseProduct>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 상품 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 예약 관련 함수
export const appointmentApi = {
  // 모든 예약 조회
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('datetime', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 고객별 예약 조회
  async getByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_id', customerId)
      .order('datetime', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 예약 추가
  async create(appointment: Omit<SupabaseAppointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 예약 수정
  async update(id: string, appointment: Partial<SupabaseAppointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 예약 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 재무 관련 함수
export const financeApi = {
  // 모든 재무 기록 조회
  async getAll() {
    const { data, error } = await supabase
      .from('finance')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 재무 기록 추가
  async create(finance: Omit<SupabaseFinance, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('finance')
      .insert([finance])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 재무 기록 수정
  async update(id: string, finance: Partial<SupabaseFinance>) {
    const { data, error } = await supabase
      .from('finance')
      .update(finance)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 재무 기록 삭제
  async delete(id: string) {
    const { error } = await supabase
      .from('finance')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 월별 통계 조회
  async getMonthlyStats(yearMonth: string) {
    const { data, error } = await supabase
      .rpc('get_monthly_finance_stats', { year_month: yearMonth });
    
    if (error) throw error;
    return data;
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