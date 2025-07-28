import React, { useState, useEffect } from 'react';
import { getSupabase } from '../utils/supabase';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        count: product.count,
        category: product.category,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      setProducts(transformedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 데이터 로드 실패');
      console.error('상품 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        throw new Error('사용자 인증이 필요합니다.');
      }

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const dbProduct = {
        user_id: user.id,
        name: product.name,
        description: product.description,
        price: product.price,
        count: product.count,
        category: product.category
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) throw error;
      
      const newProduct = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        count: data.count,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setProducts(prev => [newProduct, ...prev]);
      setIsFormOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 추가 실패');
      console.error('상품 추가 오류:', error);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.count !== undefined) dbUpdates.count = updates.count;
      if (updates.category) dbUpdates.category = updates.category;

      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedProduct = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        count: data.count,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setProducts(prev => 
        prev.map(product => product.id === id ? updatedProduct : product)
      );
      setEditingProduct(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '상품 수정 실패');
      console.error('상품 수정 오류:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600">⚠️</span>
            <span className="font-medium text-red-800">오류 발생</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button 
            onClick={loadProducts}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct || undefined}
          onSubmit={editingProduct ? 
            (productData) => handleUpdateProduct(editingProduct.id, productData) : 
            handleAddProduct
          }
        />
      )}
    </div>
  );
};

export default ProductManagement; 