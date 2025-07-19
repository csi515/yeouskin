import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    type: 'single' as 'single' | 'voucher',
    count: 1,
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        type: product.type,
        count: product.count || 1,
        description: product.description || '',
        status: product.status,
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        type: 'single',
        count: 1,
        description: '',
        status: 'active',
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'count' ? Number(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {product ? '상품 정보 수정' : '새 상품 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품명 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 여드름 관리 10회권"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가격 (원) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품 유형 *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">1회 상품</option>
              <option value="voucher">이용권</option>
            </select>
          </div>

          {formData.type === 'voucher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용 횟수 *
              </label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                이용권의 총 이용 가능 횟수를 입력하세요
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태 *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              비활성 상품은 예약 시 선택할 수 없습니다
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="상품에 대한 상세 설명을 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product ? '저장' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 