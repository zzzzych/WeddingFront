// src/components/CreateGroupModal.tsx
// 개선된 그룹 생성 모달 (기능 설정 및 UI 개선)
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
        updated[field] = value;
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

  // 모달 닫기
  const handleClose = () => {
    if (isSubmitting) return;
    
    setFormData({
      groupName: '',
      groupType: GroupType.WEDDING_GUEST,
      greetingMessage: defaultGreetingTemplates[GroupType.WEDDING_GUEST],
      features: defaultFeaturesByType[GroupType.WEDDING_GUEST]
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

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
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '700px',  // 크기 확대
          maxHeight: '95vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #dee2e6',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
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
                fontSize: '20px',
                color: '#6c757d',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                padding: '5px',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div style={{ padding: '25px' }}>
          {/* 에러 메시지 */}
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
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
                placeholder="예: 신랑 대학 동기"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.groupName ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'  // 크기 고정
                }}
                disabled={isSubmitting}
              />
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
                fontSize: '14px'
              }}>
                그룹 타입 *
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(GroupType).map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      border: formData.groupType === type ? '2px solid #007bff' : '1px solid #dee2e6',
                      borderRadius: '6px',
                      backgroundColor: formData.groupType === type ? '#f8f9ff' : 'white',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="groupType"
                      value={type}
                      checked={formData.groupType === type}
                      onChange={(e) => handleInputChange('groupType', e.target.value as GroupType)}
                      disabled={isSubmitting}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {type === GroupType.WEDDING_GUEST && '🎊 결혼식 초대 그룹'}
                      {type === GroupType.PARENTS_GUEST && '👨‍👩‍👧‍👦 부모님 그룹'}
                      {type === GroupType.COMPANY_GUEST && '🏢 회사 그룹'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 기능 설정 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '14px'
              }}>
                활성화할 기능 선택
              </label>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '15px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'showRsvpForm', label: '📝 참석 응답 폼' },
                    { key: 'showAccountInfo', label: '💳 계좌 정보' },
                    { key: 'showShareButton', label: '📤 공유 버튼' },
                    { key: 'showVenueInfo', label: '📍 오시는 길' },
                    { key: 'showPhotoGallery', label: '📸 포토 갤러리' },
                    { key: 'showCeremonyProgram', label: '📋 본식 순서' }
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.features[key as keyof GroupFeatureSettings]}
                        onChange={(e) => handleFeatureChange(key as keyof GroupFeatureSettings, e.target.checked)}
                        disabled={isSubmitting}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 인사말 입력 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 'bold',
                color: '#495057',
                fontSize: '14px'
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
                  height: '80px',
                  padding: '10px',
                  border: errors.greetingMessage ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px'
              }}>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                  💡 그룹 타입 변경 시 기본 템플릿 적용
                </div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>
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
              gap: '10px',
              justifyContent: 'flex-end',
              paddingTop: '15px',
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
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#28a745' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? '⏳ 생성 중...' : '✅ 그룹 생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;