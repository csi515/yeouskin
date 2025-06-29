import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CsvManager } from '../utils/csvHandler';
import { sampleProducts } from '../data/sampleData';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // CSV 매니저 초기화
  const productCsvManager = new CsvManager<Product>('products', [
    'id', 'name', 'price', 'type', 'count', 'status', 'description'
  ]);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = productCsvManager.readFromStorage();

      // 데이터가 없으면 샘플 데이터로 초기화
      if (productsData.length === 0) {
        productCsvManager.saveToStorage(sampleProducts);
        setProducts(sampleProducts);
      } else {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 초기화
  const initializeSampleData = async () => {
    if (!window.confirm('샘플 데이터로 초기화하시겠습니까? 기존 데이터는 삭제됩니다.')) {
      return;
    }

    try {
      setLoading(true);
      productCsvManager.saveToStorage(sampleProducts);
      setProducts(sampleProducts);
      alert('샘플 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('샘플 데이터 초기화 오류:', error);
      alert('샘플 데이터 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = products;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  // 상품 추가
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };

    try {
      const success = productCsvManager.appendToStorage(newProduct);
      if (success) {
        setProducts(prev => [...prev, newProduct]);
        setIsFormOpen(false);
      } else {
        alert('상품 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 추가 오류:', error);
      alert('상품 추가 중 오류가 발생했습니다.');
    }
  };

  // 상품 수정
  const handleEditProduct = async (product: Product) => {
    try {
      const success = productCsvManager.updateByIdInStorage(product.id, product);
      if (success) {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        setIsFormOpen(false);
        setEditingProduct(null);
      } else {
        alert('상품 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 수정 오류:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    }
  };

  // 상품 삭제
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const success = productCsvManager.deleteByIdFromStorage(productId);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  // 상품 수정 모달 열기
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // 폼 제출 처리
  const handleFormSubmit = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      handleEditProduct({ ...productData, id: editingProduct.id });
    } else {
      handleAddProduct(productData);
    }
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <button
            onClick={initializeSampleData}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            샘플 데이터 초기화
          </button>
        </div>
        
        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="상품명 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            새 상품 추가
          </button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">총 상품 수</div>
            <div className="text-2xl font-bold text-blue-600">{products.length}개</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">활성 상품</div>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}개
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">이용권 상품</div>
            <div className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.type === 'voucher').length}개
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">1회 상품</div>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.type === 'single').length}개
            </div>
          </div>
        </div>
      </div>

      {/* 상품 테이블 */}
      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDeleteProduct}
      />

      {/* 상품 추가/수정 폼 모달 */}
      <ProductForm
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default ProductManagement; 