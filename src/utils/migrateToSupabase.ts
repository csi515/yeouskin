import { supabase } from './supabase';
import { Customer, Product, Appointment, FinanceRecord } from '../types';

export class SupabaseMigrator {
  // 고객 데이터 마이그레이션
  static async migrateCustomers(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // LocalStorage에서 고객 데이터 읽기
      const customersData = localStorage.getItem('crm-customers');
      if (!customersData) {
        return { success: true, count: 0, error: '마이그레이션할 고객 데이터가 없습니다.' };
      }

      const customers: Customer[] = JSON.parse(customersData);
      
      if (customers.length === 0) {
        return { success: true, count: 0 };
      }

      // Supabase에 데이터 삽입
      const { data, error } = await supabase
        .from('customers')
        .insert(customers)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 상품 데이터 마이그레이션
  static async migrateProducts(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // LocalStorage에서 상품 데이터 읽기
      const productsData = localStorage.getItem('crm-products');
      if (!productsData) {
        return { success: true, count: 0, error: '마이그레이션할 상품 데이터가 없습니다.' };
      }

      const products: Product[] = JSON.parse(productsData);
      
      if (products.length === 0) {
        return { success: true, count: 0 };
      }

      // Supabase에 데이터 삽입
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 예약 데이터 마이그레이션
  static async migrateAppointments(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // LocalStorage에서 예약 데이터 읽기
      const appointmentsData = localStorage.getItem('crm-appointments');
      if (!appointmentsData) {
        return { success: true, count: 0, error: '마이그레이션할 예약 데이터가 없습니다.' };
      }

      const appointments: Appointment[] = JSON.parse(appointmentsData);
      
      if (appointments.length === 0) {
        return { success: true, count: 0 };
      }

      // Supabase에 데이터 삽입
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointments)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 재무 데이터 마이그레이션
  static async migrateFinance(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // LocalStorage에서 재무 데이터 읽기
      const financeData = localStorage.getItem('crm-finance');
      if (!financeData) {
        return { success: true, count: 0, error: '마이그레이션할 재무 데이터가 없습니다.' };
      }

      const finance: FinanceRecord[] = JSON.parse(financeData);
      
      if (finance.length === 0) {
        return { success: true, count: 0 };
      }

      // Supabase에 데이터 삽입
      const { data, error } = await supabase
        .from('finance')
        .insert(finance)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, count: data?.length || 0 };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 모든 데이터 마이그레이션
  static async migrateAllData(): Promise<{
    customers: { success: boolean; count: number; error?: string };
    products: { success: boolean; count: number; error?: string };
    appointments: { success: boolean; count: number; error?: string };
    finance: { success: boolean; count: number; error?: string };
  }> {
    const customers = await this.migrateCustomers();
    const products = await this.migrateProducts();
    const appointments = await this.migrateAppointments();
    const finance = await this.migrateFinance();

    return {
      customers,
      products,
      appointments,
      finance
    };
  }

  // 마이그레이션 완료 후 로컬 데이터 정리
  static clearLocalData(): void {
    try {
      // LocalStorage에서 기존 데이터 삭제
      localStorage.removeItem('crm-customers');
      localStorage.removeItem('crm-products');
      localStorage.removeItem('crm-appointments');
      localStorage.removeItem('crm-finance');
      
      console.log('로컬 데이터가 정리되었습니다.');
    } catch (error) {
      console.error('로컬 데이터 정리 중 오류:', error);
    }
  }

  // 마이그레이션 상태 확인
  static async checkMigrationStatus(): Promise<{
    hasLocalData: boolean;
    hasSupabaseData: boolean;
    localDataCounts: { customers: number; products: number; appointments: number; finance: number };
    supabaseDataCounts: { customers: number; products: number; appointments: number; finance: number };
  }> {
    // 로컬 데이터 확인
    const customersData = localStorage.getItem('crm-customers');
    const productsData = localStorage.getItem('crm-products');
    const appointmentsData = localStorage.getItem('crm-appointments');
    const financeData = localStorage.getItem('crm-finance');

    const localDataCounts = {
      customers: customersData ? JSON.parse(customersData).length : 0,
      products: productsData ? JSON.parse(productsData).length : 0,
      appointments: appointmentsData ? JSON.parse(appointmentsData).length : 0,
      finance: financeData ? JSON.parse(financeData).length : 0
    };

    const hasLocalData = Object.values(localDataCounts).some(count => count > 0);

    // Supabase 데이터 확인
    try {
      const [customersResult, productsResult, appointmentsResult, financeResult] = await Promise.all([
        supabase.from('customers').select('count'),
        supabase.from('products').select('count'),
        supabase.from('appointments').select('count'),
        supabase.from('finance').select('count')
      ]);

      const supabaseDataCounts = {
        customers: customersResult.count || 0,
        products: productsResult.count || 0,
        appointments: appointmentsResult.count || 0,
        finance: financeResult.count || 0
      };

      const hasSupabaseData = Object.values(supabaseDataCounts).some(count => count > 0);

      return {
        hasLocalData,
        hasSupabaseData,
        localDataCounts,
        supabaseDataCounts
      };
    } catch (error) {
      return {
        hasLocalData,
        hasSupabaseData: false,
        localDataCounts,
        supabaseDataCounts: { customers: 0, products: 0, appointments: 0, finance: 0 }
      };
    }
  }
} 