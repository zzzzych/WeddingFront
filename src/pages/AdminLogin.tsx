// 관리자 로그인 페이지
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/invitationService';
import { AdminCredentials } from '../types';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  
  // 폼 상태 관리
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: '',
    password: ''
  });

  // UI 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 이미 로그인된 상태인지 확인
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 이미 로그인된 경우 대시보드로 리다이렉트
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // 입력값 변경 처리
  const handleInputChange = (field: keyof AdminCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 제거
    if (error) {
      setError(null);
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    if (!credentials.username.trim()) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    
    if (!credentials.password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (credentials.username.trim().length < 3) {
      setError('아이디는 3글자 이상 입력해주세요.');
      return false;
    }

    if (credentials.password.length < 4) {
      setError('비밀번호는 4글자 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  // 로그인 처리
  /*
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const response = await adminLogin({
        username: credentials.username.trim(),
        password: credentials.password
      });

      // 토큰 저장 (실제 구현에서는 더 안전한 방법 사용)
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        // 대시보드로 이동
        navigate('/admin/dashboard');
      } else {
        setError('로그인 응답에 토큰이 없습니다.');
      }

    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      // 에러 메시지 설정
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.message?.includes('404')) {
        setError('존재하지 않는 계정입니다.');
      } else if (error.message?.includes('Network')) {
        setError('네트워크 연결을 확인해주세요.');
      } else {
        setError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  */

  // 기존 handleLogin 함수를 다음과 같이 수정해주세요:

// 로그인 처리
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // 유효성 검사
  if (!validateForm()) {
    return;
  }

  try {
    setIsLoading(true);
    setError(null);

    // ===== 임시 테스트 모드 =====
    // 백엔드가 연결되기 전까지 사용할 테스트 계정
    if (credentials.username === 'admin' && credentials.password === 'test123') {
      // 테스트 토큰과 사용자 정보 생성
      const testToken = 'test-admin-token-' + Date.now();
      const testUser = {
        id: 1,
        username: 'admin',
        name: '테스트 관리자'
      };

      // 로컬 스토리지에 저장
      localStorage.setItem('adminToken', testToken);
      localStorage.setItem('adminUser', JSON.stringify(testUser));
      
      // 대시보드로 이동
      navigate('/admin/dashboard');
      return;
    }
    // ===== 테스트 모드 끝 =====

    // 실제 API 호출 (백엔드 연결 시)
    const response = await adminLogin({
      username: credentials.username.trim(),
      password: credentials.password
    });

    // 토큰 저장
    if (response.token) {
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // 대시보드로 이동
      navigate('/admin/dashboard');
    } else {
      setError('로그인 응답에 토큰이 없습니다.');
    }

  } catch (error: any) {
    console.error('로그인 실패:', error);
    
    // 에러 메시지 설정
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.message?.includes('404')) {
      setError('존재하지 않는 계정입니다.');
    } else if (error.message?.includes('Network')) {
      setError('네트워크 연결을 확인해주세요.');
    } else {
      setError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    }
  } finally {
    setIsLoading(false);
  }
};

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin(e as any);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            color: '#2c3e50', 
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            관리자 로그인
          </h1>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '14px',
            margin: 0
          }}>
            청첩장 관리 시스템에 접속합니다
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin}>
          {/* 아이디 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#495057',
              fontSize: '14px'
            }}>
              아이디
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="관리자 아이디를 입력하세요"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: error && !credentials.username.trim() ? '2px solid #dc3545' : '1px solid #ced4da',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ced4da';
                e.target.style.boxShadow = 'none';
              }}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#495057',
              fontSize: '14px'
            }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: error && !credentials.password ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ced4da';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              
              {/* 비밀번호 표시/숨기기 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px'
                }}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {isLoading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>


       


        {/* 하단 안내 */}
        <div style={{
        textAlign: 'center',
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
        }}>
        <p style={{
            fontSize: '13px',
            color: '#6c757d',
            margin: '0 0 10px 0',
            lineHeight: '1.4'
        }}>
            🔒 관리자만 접근 가능합니다<br />
            계정 정보는 시스템 관리자에게 문의하세요
        </p>
        
        {/* 테스트 계정 안내 */}
        <div style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '10px'
        }}>
            <p style={{
            fontSize: '12px',
            color: '#0c5460',
            margin: 0,
            fontWeight: 'bold'
            }}>
            🧪 테스트용 계정
            </p>
            <p style={{
            fontSize: '12px',
            color: '#0c5460',
            margin: '5px 0 0 0'
            }}>
            ID: <code>admin</code> / PW: <code>test123</code>
            </p>
        </div>
        </div>
    </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;