import { createClient } from '@supabase/supabase-js';
import { 
  SupabaseConnectionStatus, 
  SupabaseSchemaInfo, 
  SupabaseTestData, 
  SupabaseQueryResult,
  Customer,
  Appointment,
  Product,
  FinanceRecord
} from '../types';

// Supabase MCP 연결 설정
export class SupabaseMCP {
  private supabase: any;
  private isConnected: boolean = false;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 환경변수가 누락되었습니다.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // 연결 테스트
  async testConnection(): Promise<SupabaseConnectionStatus> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      this.isConnected = true;
      return { 
        success: true, 
        message: 'Supabase 연결 성공',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.isConnected = false;
      return { 
        success: false, 
        message: `연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 데이터베이스 스키마 정보 가져오기
  async getSchemaInfo(): Promise<SupabaseSchemaInfo> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_schema_info');

      if (error) {
        // RPC 함수가 없는 경우 기본 테이블 정보 반환
        return {
          tables: ['customers', 'products', 'appointments', 'finance', 'settings'],
          message: '기본 테이블 정보',
          version: '1.0.0'
        };
      }

      return data;
    } catch (error) {
      return {
        tables: ['customers', 'products', 'appointments', 'finance', 'settings'],
        message: '기본 테이블 정보 (오류 발생)',
        version: '1.0.0'
      };
    }
  }

  // 고객 데이터 조회
  async getCustomers(): Promise<SupabaseQueryResult<Customer>> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 예약 데이터 조회
  async getAppointments(): Promise<SupabaseQueryResult<Appointment>> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          customers(name, phone),
          products(name, price)
        `)
        .order('datetime', { ascending: false });

      if (error) throw error;
      return { success: true, data, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 상품 데이터 조회
  async getProducts(): Promise<SupabaseQueryResult<Product>> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 재무 데이터 조회
  async getFinance(): Promise<SupabaseQueryResult<FinanceRecord>> {
    try {
      const { data, error } = await this.supabase
        .from('finance')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 연결 상태 확인
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 데이터 테스트 결과
  async getTestData(): Promise<SupabaseTestData> {
    try {
      const customers = await this.getCustomers();
      const appointments = await this.getAppointments();
      const products = await this.getProducts();
      const finance = await this.getFinance();

      return {
        customers: customers.success ? customers.count || 0 : '오류',
        appointments: appointments.success ? appointments.count || 0 : '오류',
        products: products.success ? products.count || 0 : '오류',
        finance: finance.success ? finance.count || 0 : '오류'
      };
    } catch (error) {
      return { 
        customers: '오류',
        appointments: '오류',
        products: '오류',
        finance: '오류',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const supabaseMCP = new SupabaseMCP(); 