// src/components/CreateGroupModal.tsx
// 개선된 그룹 생성 모달 (UI 레이아웃 개선 및 기능 설정 완성)
import React, { useState } from 'react';
import { createGroup } from '../services/invitationService';
import { CreateGroupRequest, GroupType, InvitationGroup } from '../types';

// 그룹 기능 설정 인터페이스
interface GroupFeatureSettings {
  showRsvpForm: boolean;          // 참석 응답 폼
  showAccountInfo: boolean;       // 계좌 정보
  showShareButton: boolean;       // 공유 버튼
  showVenueInfo: boolean;         // 오시는 길 정보
  showPhotoGallery: boolean;      // 포토 갤러리
  showCeremonyProgram: boolean;   // 본식 순서
}

// 확장된 그룹 생성 요청
interface ExtendedCreateGroupRequest extends CreateGroupRequest {
  features: GroupFeatureSettings;
}

// Props 타입 정의
interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newGroup: InvitationGroup) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState<ExtendedCreateGroupRequest>({
    groupName: '',
    groupType: GroupType.WEDDING_GUEST,
    greetingMessage: '',
    features: {
      showRsvpForm: true,
      showAccountInfo: false,
      showShareButton: false,
      showVenueInfo: true,
      showPhotoGallery: true,
      showCeremonyProgram: true
    }
  });

  // UI 상태 관리
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 그룹 타입별 기본 설정
  const defaultFeaturesByType = {
    [GroupType.WEDDING_GUEST]: {
      showRsvpForm: true,
      showAccountInfo: false,
      showShareButton: false,
      showVenueInfo: true,
      showPhotoGallery: true,
      showCeremonyProgram: true
    },
    [GroupType.PARENTS_GUEST]: {
      showRsvpForm: false,
      showAccountInfo: true,
      showShareButton: true,
      showVenueInfo: false,
      showPhotoGallery: true,
      showCeremonyProgram: false
    },
    [GroupType.COMPANY_GUEST]: {
      showRsvpForm: false,
      showAccountInfo: false,
      showShareButton: false,
      showVenueInfo: false,
      showPhotoGallery: true,
      showCeremonyProgram: false
    }
  };

  // 그룹 타입별 기본 인사말
  const defaultGreetingTemplates = {
    [GroupType.WEDDING_GUEST]: '소중한 분들을 저희 결혼식에 초대합니다. 여러분의 축복 속에서 더욱 의미있는 하루가 되길 바랍니다.',
    [GroupType.PARENTS_GUEST]: '오늘까지 키워주시고 사랑해주신 부모님께 깊은 감사를 드리며, 저희의 새로운 출발을 함께 기뻐해주시길 바랍니다.',
    [GroupType.COMPANY_GUEST]: '함께 일하며 소중한 인연을 맺어온 동료 여러분을 저희 결혼식에 초대합니다. 새로운 시작을 함께 축복해주세요.'
  };

  // 기능 목록 정의 (아이콘과 함께)
  const featureList = [
    {
      key: 'showRsvpForm',
      icon: '📝',
      label: '참석 응답 폼',
      description: '하객이 참석 여부와 인원을 응답할 수 있습니다'
    },
    {
      key: 'showAccountInfo',
      icon: '💳',
      label: '계좌 정보',
      description: '마음 전할 곳 계좌 정보를 표시합니다'
    },
    {
      key: 'showShareButton',
      icon: '📤',
      label: '공유 버튼',
      description: '청첩장을 다른 사람들과 공유할 수 있습니다'
    },
    {
      key: 'showVenueInfo',
      icon: '📍',
      label: '오시는 길',
      description: '웨딩홀 위치와 교통 정보를 표시합니다'
    },
    {
      key: 'showPhotoGallery',
      icon: '📸',
      label: '포토 갤러리',
      description: '신랑신부의 사진들을 갤러리로 표시합니다'
    },
    {
      key: 'showCeremonyProgram',
      icon: '📋',
      label: '본식 순서',
      description: '결혼식 당일 순서를 안내합니다 (7일 전 공개)'
    }
  ];

  // 입력값 변경 처리
  const handleInputChange = (field: keyof CreateGroupRequest, value: string | GroupType) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (field === 'groupType' && value in defaultGreetingTemplates) {
        // 그룹 타입 변경 시 기본 설정 적용
        updated.groupType = value as GroupType;
        updated.greetingMessage = defaultGreetingTemplates[value as GroupType];
        updated.features = defaultFeaturesByType[value as GroupType];
      } else {
        // 타입 안전성을 위한 분기 처리
        if (field === 'groupType') {
          updated[field] = value as GroupType;
        } else {
          updated[field] = value as string;
        }
      }
      
      return updated;
    });
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 기능 설정 변경
  const handleFeatureChange = (feature: keyof GroupFeatureSettings, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled
      }
    }));
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 그룹 이름 검사
    if (!formData.groupName.trim()) {
      newErrors.groupName = '그룹 이름을 입력해주세요.';
    } else if (formData.groupName.trim().length < 2) {
      newErrors.groupName = '그룹 이름은 2글자 이상 입력해주세요.';
    } else if (formData.groupName.trim().length > 30) {
      newErrors.groupName = '그룹 이름은 30글자 이하로 입력해주세요.';
    }

    // 인사말 검사
    if (!formData.greetingMessage.trim()) {
      newErrors.greetingMessage = '인사말을 입력해주세요.';
    } else if (formData.greetingMessage.trim().length < 10) {
      newErrors.greetingMessage = '인사말은 10글자 이상 입력해주세요.';
    } else if (formData.greetingMessage.trim().length > 300) {
      newErrors.greetingMessage = '인사말은 300글자 이하로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // 기본 그룹 생성 요청 (기능 설정은 추후 별도 API로 처리)
      const newGroup = await createGroup({
        groupName: formData.groupName.trim(),
        groupType: formData.groupType,
        greetingMessage: formData.greetingMessage.trim()
      });

      onSuccess(newGroup);
      
      // 폼 초기화
      setFormData({
        groupName: '',
        groupType: GroupType.WEDDING_GUEST,
        greetingMessage: defaultGreetingTemplates[GroupType.WEDDING_GUEST],
        features: defaultFeaturesByType[GroupType.WEDDING_GUEST]
      });
      setErrors({});
      onClose();

    } catch (error: any) {
      console.error('그룹 생성 실패:', error);
      setErrors({ 
        general: error.message || '그룹 생성에 실패했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 처리
  const handleClose = () => {
    if (!isSubmitting) {
      // 폼 초기화
      setFormData({
        groupName: '',
        groupType: GroupType.WEDDING_GUEST,
        greetingMessage: defaultGreetingTemplates[GroupType.WEDDING_GUEST],
        features: defaultFeaturesByType[GroupType.WEDDING_GUEST]
      });
      setErrors({});
      onClose();
    }
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <>
      {/* 모달 배경 오버레이 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '50px',
          paddingBottom: '50px',
          zIndex: 1000,
          overflowY: 'auto'
        }}
        onClick={handleClose}
      >
        {/* 모달 컨테이너 - 크기 개선 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '600px', // 최대 너비 증가
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #007bff'
          }}>
            <h2 style={{
              margin: 0,
              color: '#007bff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ✨ 새 그룹 생성
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: '#6c757d',
                padding: '5px'
              }}
            >
              ✕
            </button>
          </div>

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb',
              fontSize: '14px'
            }}>
              ⚠️ {errors.general}
            </div>
          )}

          {/* 폼 시작 */}
          <form onSubmit={handleSubmit}>
            {/* 그룹 이름 입력 - 크기 개선 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '15px'
              }}>
                그룹 이름 *
              </label>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => handleInputChange('groupName', e.target.value)}
                placeholder="예: 신랑 대학동기, 신부 회사동료"
                disabled={isSubmitting}
                style={{
                  width: '100%', // 100%로 설정
                  padding: '12px',
                  border: errors.groupName ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box', // 패딩 포함한 전체 크기 계산
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                {formData.groupName.length}/30자
              </div>
              {errors.groupName && (
                <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                  {errors.groupName}
                </div>
              )}
            </div>

            {/* 그룹 타입 선택 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '15px'
              }}>
                그룹 타입 *
              </label>
              <select
                value={formData.groupType}
                onChange={(e) => handleInputChange('groupType', e.target.value as GroupType)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              >
                <option value={GroupType.WEDDING_GUEST}>🎊 결혼식 초대 그룹</option>
                <option value={GroupType.PARENTS_GUEST}>👨‍👩‍👧‍👦 부모님 그룹</option>
                <option value={GroupType.COMPANY_GUEST}>🏢 회사 그룹</option>
              </select>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                💡 타입에 따라 기본 기능과 인사말이 자동 설정됩니다
              </div>
            </div>

            {/* 기능 설정 - 그리드 레이아웃 개선 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '15px'
              }}>
                그룹 기능 설정
              </label>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // 반응형 그리드
                  gap: '12px'
                }}>
                  {featureList.map(({ key, icon, label, description }) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features[key as keyof GroupFeatureSettings]}
                        onChange={(e) => handleFeatureChange(key as keyof GroupFeatureSettings, e.target.checked)}
                        disabled={isSubmitting}
                        style={{
                          marginTop: '2px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#495057' }}>
                          {icon} {label}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: '11px', marginTop: '2px' }}>
                          {description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 인사말 입력 - 크기 개선 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '15px'
              }}>
                그룹 인사말 *
              </label>
              <textarea
                value={formData.greetingMessage}
                onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                placeholder="이 그룹에 맞는 따뜻한 인사말을 작성해주세요..."
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '100px', // 높이 증가
                  padding: '12px',
                  border: errors.greetingMessage ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px'
              }}>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  💡 그룹 타입 변경 시 기본 템플릿 적용
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {formData.greetingMessage.length}/300자
                </div>
              </div>
              {errors.greetingMessage && (
                <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                  {errors.greetingMessage}
                </div>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid #dee2e6'
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
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
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
                  opacity: isSubmitting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span>⏳</span> 생성 중...
                  </>
                ) : (
                  <>
                    <span>✨</span> 그룹 생성
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateGroupModal;