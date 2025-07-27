// 그룹 생성 모달 컴포넌트
import React, { useState } from 'react';
import { createGroup } from '../services/invitationService';
import { CreateGroupRequest, GroupType, InvitationGroup } from '../types';

// Props 타입 정의
interface CreateGroupModalProps {
  isOpen: boolean;                                    // 모달 열림/닫힘 상태
  onClose: () => void;                               // 모달 닫기 함수
  onSuccess: (newGroup: InvitationGroup) => void;    // 그룹 생성 성공 시 실행할 함수
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState<CreateGroupRequest>({
    groupName: '',
    groupType: GroupType.WEDDING_GUEST  // 기본값: 결혼식 초대 그룹
  });

  // UI 상태 관리
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 그룹 타입별 설명
  const groupTypeDescriptions = {
    [GroupType.WEDDING_GUEST]: '참석 응답, 오시는 길, 본식 순서 등 모든 기능이 포함됩니다.',
    [GroupType.PARENTS_GUEST]: '계좌 정보, 공유 기능이 포함되며 참석 응답은 제외됩니다.',
    [GroupType.COMPANY_GUEST]: '기본 인사말과 포토 갤러리만 표시됩니다.'
  };

  // 입력값 변경 처리
  const handleInputChange = (field: keyof CreateGroupRequest, value: string | GroupType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 그룹 이름 검사
    if (!formData.groupName.trim()) {
      newErrors.groupName = '그룹 이름을 입력해주세요.';
    } else if (formData.groupName.trim().length < 2) {
      newErrors.groupName = '그룹 이름은 2글자 이상 입력해주세요.';
    } else if (formData.groupName.trim().length > 50) {
      newErrors.groupName = '그룹 이름은 50글자 이하로 입력해주세요.';
    }

    // 그룹 타입 검사
    if (!Object.values(GroupType).includes(formData.groupType)) {
      newErrors.groupType = '올바른 그룹 타입을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // API 호출
      const newGroup = await createGroup({
        groupName: formData.groupName.trim(),
        groupType: formData.groupType
      });

      // 성공 처리
      onSuccess(newGroup);
      
      // 폼 초기화
      setFormData({
        groupName: '',
        groupType: GroupType.WEDDING_GUEST
      });
      setErrors({});
      
      // 모달 닫기
      onClose();

    } catch (error: any) {
      console.error('그룹 생성 실패:', error);
      
      // 에러 처리
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setErrors({ general: '인증이 만료되었습니다. 다시 로그인해주세요.' });
      } else {
        setErrors({ 
          general: error.message || '그룹 생성에 실패했습니다. 다시 시도해주세요.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 처리
  const handleClose = () => {
    if (isSubmitting) return; // 제출 중일 때는 닫기 불가
    
    // 폼 초기화
    setFormData({
      groupName: '',
      groupType: GroupType.WEDDING_GUEST
    });
    setErrors({});
    onClose();
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
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
          padding: '20px'
        }}
        onClick={handleClose}
      >
        {/* 모달 컨텐츠 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 중단
        >
          {/* 헤더 */}
          <div style={{
            padding: '25px 30px 0 30px',
            borderBottom: '1px solid #dee2e6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                color: '#2c3e50',
                margin: 0,
                fontWeight: 'bold'
              }}>
                새 초대 그룹 생성
              </h2>
              
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6c757d',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* 바디 */}
          <div style={{ padding: '25px 30px' }}>
            {/* 전역 에러 메시지 */}
            {errors.general && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                ⚠️ {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 그룹 이름 입력 */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  그룹 이름 *
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => handleInputChange('groupName', e.target.value)}
                  placeholder="예: 신랑 대학 동기, 신부 회사 동료"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: errors.groupName ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  disabled={isSubmitting}
                  maxLength={50}
                />
                {errors.groupName && (
                  <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
                    {errors.groupName}
                  </p>
                )}
              </div>

              {/* 그룹 타입 선택 */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  그룹 타입 *
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.values(GroupType).map((type) => (
                    <label
                      key={type}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '15px',
                        border: formData.groupType === type ? '2px solid #007bff' : '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        backgroundColor: formData.groupType === type ? '#f8f9ff' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="groupType"
                        value={type}
                        checked={formData.groupType === type}
                        onChange={() => handleInputChange('groupType', type)}
                        disabled={isSubmitting}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '4px',
                          color: '#2c3e50'
                        }}>
                          {type === GroupType.WEDDING_GUEST && '🎊 결혼식 초대 그룹'}
                          {type === GroupType.PARENTS_GUEST && '👨‍👩‍👧‍👦 부모님 그룹'}
                          {type === GroupType.COMPANY_GUEST && '🏢 회사 그룹'}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#6c757d',
                          lineHeight: '1.4'
                        }}>
                          {groupTypeDescriptions[type]}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {errors.groupType && (
                  <p style={{ color: '#dc3545', fontSize: '14px', margin: '8px 0 0 0' }}>
                    {errors.groupType}
                  </p>
                )}
              </div>

              {/* 제출 버튼 */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                marginTop: '30px'
              }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  취소
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting && (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                  {isSubmitting ? '생성 중...' : '그룹 생성'}
                </button>
              </div>
            </form>
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
    </>
  );
};

export default CreateGroupModal;