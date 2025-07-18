import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 데이터 로드 실패');
      console.error('상품 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user?.id) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user.id }])
        .select();

      if (error) throw error;
      
      if (data) {
        setProducts(prev => [data[0], ...prev]);
        setIsFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 추가 실패');
      console.error('상품 추가 오류:', error);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (data) {
        setProducts(prev => prev.map(product => 
          product.id === id ? data[0] : product
        ));
        setIsFormOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 업데이트 실패');
      console.error('상품 업데이트 오류:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 삭제 실패');
      console.error('상품 삭제 오류:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>오류:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">상품 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새 상품 추가
        </button>
      </div>

      <ProductTable
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteProduct}
      />

      {isFormOpen && (
        <ProductForm
          isOpen={isFormOpen}
          product={editingProduct || undefined}
          onSubmit={editingProduct ? 
            (productData) => handleUpdateProduct(editingProduct.id, productData) : 
            handleAddProduct
          }
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement; 