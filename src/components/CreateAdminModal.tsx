// src/components/CreateAdminModal.tsx
import React, { useState } from 'react';
import { 
  CreateAdminRequest, 
  AdminCreateResponse, 
  ADMIN_ROLE_OPTIONS, 
  AdminRole 
} from '../types';
import { createAdmin } from '../services/invitationService';

interface CreateAdminModalProps {
  isOpen: boolean; // 모달 열림/닫힘 상태
  onClose: () => void; // 모달 닫기 함수
  onSuccess: (newAdmin: AdminCreateResponse) => void; // 성공 시 콜백
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<CreateAdminRequest>({
    username: '',
    password: '',
    role: 'admin'
  });

  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 입력값 변경 처리
  const handleInputChange = (field: keyof CreateAdminRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 사용자명 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = '사용자명은 3글자 이상 입력해주세요.';
    } else if (formData.username.trim().length > 20) {
      newErrors.username = '사용자명은 20글자 이하로 입력해주세요.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = '사용자명은 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 4) {
      newErrors.password = '비밀번호는 4글자 이상 입력해주세요.';
    } else if (formData.password.length > 50) {
      newErrors.password = '비밀번호는 50글자 이하로 입력해주세요.';
    }

    // 역할 검증
    if (!formData.role) {
      newErrors.role = '역할을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'admin'
    });
    setErrors({});
    setShowPassword(false);
  };

  // 모달 닫기
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // API 호출
      const response = await createAdmin({
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      });

      console.log('✅ 관리자 생성 성공:', response);
      
      // 성공 콜백 호출
      onSuccess(response);
      
      // 폼 초기화 및 모달 닫기
      resetForm();
      onClose();

      // 성공 메시지 표시
      alert(`🎉 관리자 계정이 성공적으로 생성되었습니다!\n사용자명: ${response.username}\n역할: ${response.role}`);

    } catch (error: any) {
      console.error('❌ 관리자 생성 실패:', error);
      
      // 에러 메시지 처리
      if (error.message?.includes('409') || error.message?.includes('conflict')) {
        setErrors({ username: '이미 존재하는 사용자명입니다.' });
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        alert('❌ 인증이 만료되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트 로직 추가 가능
      } else if (error.message?.includes('400') || error.message?.includes('bad request')) {
        setErrors({ general: '입력 데이터가 올바르지 않습니다.' });
      } else {
        setErrors({ general: error.message || '관리자 생성에 실패했습니다.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          margin: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록
      >
        {/* 모달 헤더 */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            👤 새 관리자 생성
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            새로운 관리자 계정을 생성합니다
          </p>
        </div>

        {/* 전역 에러 메시지 */}
        {errors.general && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ {errors.general}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 사용자명 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              사용자명 *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="영문, 숫자, 언더스코어만 사용 가능"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.username ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: isSubmitting ? '#f9fafb' : 'white'
              }}
              onFocus={(e) => {
                if (!errors.username) {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                if (!errors.username) {
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
            />
            {errors.username && (
              <p style={{
                fontSize: '12px',
                color: '#dc2626',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                {errors.username}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              비밀번호 *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="4글자 이상 입력해주세요"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 50px 12px 16px',
                  border: errors.password ? '2px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: isSubmitting ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p style={{
                fontSize: '12px',
                color: '#dc2626',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* 역할 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              역할 *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.role ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: isSubmitting ? '#f9fafb' : 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {ADMIN_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            {errors.role && (
              <p style={{
                fontSize: '12px',
                color: '#dc2626',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                {errors.role}
              </p>
            )}
          </div>

          {/* 버튼들 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              취소
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {isSubmitting && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {isSubmitting ? '생성 중...' : '관리자 생성'}
            </button>
          </div>
        </form>

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CreateAdminModal;