// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner' | 'employee' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthDate?: string;
  skinType?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  memo?: string;
  point: number;
  createdAt: string; // ISO 형식
  updatedAt: string; // ISO 형식
  purchasedProducts?: string[]; // 구매한 상품 ID 목록
}

// Appointment Types
export interface Appointment {
  id: string;
  customerId: string;
  productId: string;
  datetime: string; // ISO 형식
  memo?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

// Service/Treatment Types
export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  category: string;
  description?: string;
  isActive: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  type: "voucher" | "single";
  count?: number; // voucher일 경우 횟수
  status: "active" | "inactive";
  description?: string;
}

// Purchase Types
export interface Purchase {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  purchaseDate: string; // ISO 형식
  totalPrice: number;
}

export interface TreatmentRecord {
  id: string;
  customerId: string;
  serviceId: string;
  employeeId: string;
  datetime: Date;
  products: string[];
  reaction: string;
  notes: string;
  photos: string[];
  summary?: string; // AI-generated summary
  createdAt: Date;
}

// Financial Types
export interface FinanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: "income" | "expense";
  title: string;
  amount: number;
  memo?: string;
}

export interface DailySales {
  id: string;
  date: string; // YYYY-MM-DD
  cash: number;
  card: number;
  transfer: number;
  total: number;
  createdAt: Date;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  recurringType?: 'monthly' | 'weekly' | 'yearly';
  createdAt: Date;
}

export interface DailyClosing {
  id: string;
  date: string; // YYYY-MM-DD
  systemSales: number;
  actualSales: number;
  difference: number;
  notes?: string;
  createdAt: Date;
}

// Employee Types
export interface Employee {
  id: string;
  name: string;
  hourlyWage: number;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

export interface WorkRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut?: string; // HH:MM
  hoursWorked: number;
  wage: number;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  customerId?: string;
  category: string;
  content: string;
  images: string[];
  status: 'pending' | 'answered' | 'closed';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common utility types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Settings Types
export interface ShopInfo {
  name: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
}

export interface AppointmentSettings {
  defaultDuration: number; // minutes
  allowOverlap: boolean;
  maxAppointmentsPerDay: number;
}

export interface AdminSettings {
  adminPassword: string;
}

export interface ThemeSettings {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
}

export interface Settings {
  shopInfo: ShopInfo;
  appointmentSettings: AppointmentSettings;
  adminSettings: AdminSettings;
  themeSettings: ThemeSettings;
}

// Supabase MCP Types
export interface SupabaseConnectionStatus {
  success: boolean;
  message: string;
  timestamp?: string;
}

export interface SupabaseSchemaInfo {
  tables: string[];
  message: string;
  version?: string;
}

export interface SupabaseTestData {
  customers: number | string;
  appointments: number | string;
  products: number | string;
  finance: number | string;
  error?: string;
}

export interface SupabaseMCPConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  schema: string;
  tables: string[];
}

export interface SupabaseQueryResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  count?: number;
} 