import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { getSupabase } from '../utils/supabase';

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
        const supabase = getSupabase();
        if (!supabase) {
          console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
          setState(prev => ({ ...prev, loading: false, error: 'Supabase 클라이언트 초기화 실패' }));
          return;
        }

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
    const setupAuthListener = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
        return;
      }

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

      return () => subscription.unsubscribe();
    };

    setupAuthListener();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return { error: 'Supabase 클라이언트를 초기화할 수 없습니다.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('로그인 오류:', error);
        return { error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          role: data.user.user_metadata?.role || 'employee',
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date(),
        };

        setState({
          user,
          session: data.session,
          loading: false,
          error: null,
        });
      }

      return { error: null };
    } catch (error) {
      console.error('로그인 예외:', error);
      return { error: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return { error: 'Supabase 클라이언트를 초기화할 수 없습니다.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'employee',
          },
        },
      });

      if (error) {
        console.error('회원가입 오류:', error);
        return { error: error.message };
      }

      if (data.user) {
        // 회원가입 후 자동 로그인
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('자동 로그인 오류:', signInError);
          return { error: '회원가입은 성공했지만 자동 로그인에 실패했습니다. 다시 로그인해주세요.' };
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          role: data.user.user_metadata?.role || 'employee',
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date(),
        };

        setState({
          user,
          session: data.session,
          loading: false,
          error: null,
        });
      }

      return { error: null };
    } catch (error) {
      console.error('회원가입 예외:', error);
      return { error: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
        throw error;
      }

      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('로그아웃 예외:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.' 
      }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return { error: 'Supabase 클라이언트를 초기화할 수 없습니다.' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('비밀번호 재설정 오류:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('비밀번호 재설정 예외:', error);
      return { error: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
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