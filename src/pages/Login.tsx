import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 비밀번호 재설정 관련 상태
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error);
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(error);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      email: '',
      password: '',
      name: '',
    });
  };

  // 비밀번호 재설정 토글
  const toggleResetForm = () => {
    setShowResetForm(!showResetForm);
    setResetEmail('');
    setResetMessage(null);
    setError(null);
  };

  // 비밀번호 재설정 링크 전송
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMessage('이메일을 입력해주세요.');
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetMessage('비밀번호 재설정 링크가 전송되었습니다. 이메일을 확인해주세요.');
        setResetEmail('');
        setTimeout(() => {
          setShowResetForm(false);
          setResetMessage(null);
        }, 3000);
      }
    } catch (err) {
      setError('비밀번호 재설정 링크 전송 중 오류가 발생했습니다.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">💆</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            에스테틱 CRM
          </h1>
          <p className="text-gray-600">
            {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="이름을 입력하세요"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? '로그인 중...' : '회원가입 중...'}
                </div>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </button>
          </form>

          {/* 모드 전환 - 회원가입에서 로그인으로만 전환 가능 */}
          {!isLogin && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          )}

          {/* 비밀번호 재설정 */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleResetForm}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors underline"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {/* 비밀번호 재설정 폼 */}
          {isLogin && showResetForm && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="비밀번호 재설정을 받을 이메일을 입력하세요"
                  />
                </div>

                {resetMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-600 text-sm">{resetMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      전송 중...
                    </div>
                  ) : (
                    '비밀번호 재설정 링크 보내기'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            에스테틱 샵 전용 CRM 시스템
          </p>
          <p className="text-gray-400 text-xs mt-1">
            고객 관리 • 예약 관리 • 재무 관리
          </p>
          <p className="text-gray-400 text-xs mt-2">
            가입 문의: <a href="mailto:csi515@naver.com" className="text-purple-600 hover:text-purple-700 underline">csi515@naver.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 