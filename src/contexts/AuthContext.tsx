import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../utils/supabase';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 확인 오류:', error);
          setState(prev => ({ ...prev, loading: false, error: error.message }));
          return;
        }

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'employee',
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(),
          };

          setState({
            user,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('초기 세션 확인 오류:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : '알 수 없는 오류' 
        }));
      }
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        // 개발 모드에서만 로그 출력
        if (import.meta.env.DEV) {
          console.log('Auth state changed:', event, session?.user?.email);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'employee',
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(),
          };

          setState({
            user,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'employee',
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(),
          };

          setState(prev => ({
            ...prev,
            user,
            session,
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 1. 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'employee', // 기본 역할
          },
        },
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { error: error.message };
      }

      // 2. 회원가입 성공 시 자동 로그인
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.warn('자동 로그인 실패:', signInError);
          // 자동 로그인 실패해도 회원가입은 성공으로 처리
          setState(prev => ({ ...prev, loading: false }));
          return { error: null };
        }
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' 
      }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '비밀번호 재설정 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { error: errorMessage };
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 