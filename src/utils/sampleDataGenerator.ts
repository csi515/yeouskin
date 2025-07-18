import { supabase } from './supabase';
import { Customer, Product, Appointment, FinanceRecord } from '../types';

export class SampleDataGenerator {
  // 고객 샘플 데이터 생성
  static async generateCustomers(): Promise<void> {
    const sampleCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '김미영',
        phone: '010-1234-5678',
        birthDate: '1990-05-15',
        skinType: 'combination',
        memo: '민감성 피부, 알레르기 주의',
        point: 1500,
        purchasedProducts: []
      },
      {
        name: '이지현',
        phone: '010-2345-6789',
        birthDate: '1988-12-03',
        skinType: 'dry',
        memo: '건조한 피부, 보습 중시',
        point: 2300,
        purchasedProducts: []
      },
      {
        name: '박수진',
        phone: '010-3456-7890',
        birthDate: '1992-08-22',
        skinType: 'oily',
        memo: '지성 피부, 모공 관리 필요',
        point: 800,
        purchasedProducts: []
      },
      {
        name: '최영희',
        phone: '010-4567-8901',
        birthDate: '1985-03-10',
        skinType: 'sensitive',
        memo: '민감성 피부, 성분 주의',
        point: 3200,
        purchasedProducts: []
      },
      {
        name: '정민수',
        phone: '010-5678-9012',
        birthDate: '1995-11-28',
        skinType: 'normal',
        memo: '건강한 피부, 기본 관리',
        point: 500,
        purchasedProducts: []
      }
    ];

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(sampleCustomers)
        .select();

      if (error) throw error;
      console.log('고객 샘플 데이터 생성 완료:', data?.length, '개');
    } catch (error) {
      console.error('고객 샘플 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 상품 샘플 데이터 생성
  static async generateProducts(): Promise<void> {
    const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '기본 페이셜',
        price: 50000,
        type: 'single',
        status: 'active',
        description: '기본적인 얼굴 관리 시술'
      },
      {
        name: '프리미엄 페이셜',
        price: 80000,
        type: 'single',
        status: 'active',
        description: '고급 얼굴 관리 시술'
      },
      {
        name: '페이셜 패키지 (10회)',
        price: 400000,
        type: 'voucher',
        count: 10,
        status: 'active',
        description: '페이셜 10회 이용권'
      },
      {
        name: '마사지 패키지 (5회)',
        price: 250000,
        type: 'voucher',
        count: 5,
        status: 'active',
        description: '마사지 5회 이용권'
      },
      {
        name: '스킨케어 세트',
        price: 120000,
        type: 'single',
        status: 'active',
        description: '스킨케어 제품 세트'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (error) throw error;
      console.log('상품 샘플 데이터 생성 완료:', data?.length, '개');
    } catch (error) {
      console.error('상품 샘플 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 예약 샘플 데이터 생성
  static async generateAppointments(): Promise<void> {
    // 먼저 고객과 상품 데이터를 가져옴
    const { data: customers } = await supabase.from('customers').select('id');
    const { data: products } = await supabase.from('products').select('id');

    if (!customers || !products || customers.length === 0 || products.length === 0) {
      throw new Error('고객 또는 상품 데이터가 없습니다.');
    }

    const sampleAppointments: Omit<Appointment, 'id'>[] = [
      {
        customerId: customers[0].id,
        productId: products[0].id,
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 내일
        memo: '첫 방문 고객',
        status: 'scheduled'
      },
      {
        customerId: customers[1].id,
        productId: products[1].id,
        datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 모레
        memo: '정기 고객',
        status: 'scheduled'
      },
      {
        customerId: customers[2].id,
        productId: products[2].id,
        datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
        memo: '패키지 이용',
        status: 'scheduled'
      },
      {
        customerId: customers[3].id,
        productId: products[3].id,
        datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 어제 (완료)
        memo: '완료된 예약',
        status: 'completed'
      },
      {
        customerId: customers[4].id,
        productId: products[4].id,
        datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전 (완료)
        memo: '완료된 예약',
        status: 'completed'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(sampleAppointments)
        .select();

      if (error) throw error;
      console.log('예약 샘플 데이터 생성 완료:', data?.length, '개');
    } catch (error) {
      console.error('예약 샘플 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 재무 샘플 데이터 생성
  static async generateFinance(): Promise<void> {
    const sampleFinance: Omit<FinanceRecord, 'id'>[] = [
      {
        date: new Date().toISOString().split('T')[0], // 오늘
        type: 'income',
        title: '페이셜 시술 수입',
        amount: 50000,
        memo: '김미영 고객'
      },
      {
        date: new Date().toISOString().split('T')[0], // 오늘
        type: 'income',
        title: '패키지 판매',
        amount: 400000,
        memo: '페이셜 패키지 10회'
      },
      {
        date: new Date().toISOString().split('T')[0], // 오늘
        type: 'expense',
        title: '화장품 구매',
        amount: 150000,
        memo: '스킨케어 제품'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 어제
        type: 'income',
        title: '마사지 시술',
        amount: 80000,
        memo: '이지현 고객'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 어제
        type: 'expense',
        title: '월세',
        amount: 500000,
        memo: '매장 월세'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('finance')
        .insert(sampleFinance)
        .select();

      if (error) throw error;
      console.log('재무 샘플 데이터 생성 완료:', data?.length, '개');
    } catch (error) {
      console.error('재무 샘플 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 모든 샘플 데이터 생성
  static async generateAllSampleData(): Promise<void> {
    try {
      console.log('샘플 데이터 생성 시작...');
      
      // 순서대로 생성 (의존성 고려)
      await this.generateCustomers();
      await this.generateProducts();
      await this.generateAppointments();
      await this.generateFinance();
      
      console.log('모든 샘플 데이터 생성 완료!');
    } catch (error) {
      console.error('샘플 데이터 생성 중 오류:', error);
      throw error;
    }
  }

  // 기존 데이터 확인
  static async checkExistingData(): Promise<{
    customers: number;
    products: number;
    appointments: number;
    finance: number;
  }> {
    try {
      const [customersResult, productsResult, appointmentsResult, financeResult] = await Promise.all([
        supabase.from('customers').select('count'),
        supabase.from('products').select('count'),
        supabase.from('appointments').select('count'),
        supabase.from('finance').select('count')
      ]);

      return {
        customers: customersResult.count || 0,
        products: productsResult.count || 0,
        appointments: appointmentsResult.count || 0,
        finance: financeResult.count || 0
      };
    } catch (error) {
      console.error('기존 데이터 확인 실패:', error);
      return { customers: 0, products: 0, appointments: 0, finance: 0 };
    }
  }
} 