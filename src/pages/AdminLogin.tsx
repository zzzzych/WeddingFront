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
      navigate('/012486');
    }
  }, [navigate]);

  // 입력값 변경 처리
  const handleInputChange = (field: keyof AdminCredentials, value: string) => {
    setCredentials((prev: AdminCredentials) => ({
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

  // 로그인 처리 - 실제 API 호출
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 실제 API 호출
      const response = await adminLogin({
        username: credentials.username.trim(),
        password: credentials.password
      });

      // 토큰 및 사용자 정보 저장
      if (response.token) {
        // JWT 토큰을 로컬 스토리지에 저장
        localStorage.setItem('adminToken', response.token);
        
        // 사용자 정보 저장 (토큰 만료 시간 포함)
        const userInfo = {
          username: response.username,
          expiresAt: response.expiresAt
        };
        localStorage.setItem('adminUser', JSON.stringify(userInfo));
        
        console.log('로그인 성공:', { 
          username: response.username, 
          tokenLength: response.token.length,
          expiresAt: response.expiresAt 
        });
        
        // 대시보드로 이동
        navigate('/012486');
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
      } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        setError('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
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
                border: error && !credentials.username.trim() ? 
                  '2px solid #dc3545' : '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ced4da'}
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
                  border: error && !credentials.password ? 
                    '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
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
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6c757d',
                  padding: '4px'
                }}
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
          
          {/* 실제 계정 안내 */}
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '10px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#155724',
              margin: 0,
              fontWeight: 'bold'
            }}>
              🔐 실제 관리자 계정으로 로그인
            </p>
            <p style={{
              fontSize: '12px',
              color: '#155724',
              margin: '5px 0 0 0'
            }}>
              기본 계정: <code>admin</code> / <code>admin</code>
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