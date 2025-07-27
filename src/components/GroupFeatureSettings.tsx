// src/components/GroupFeatureSettings.tsx
// 기존 그룹의 기능 설정을 관리하는 컴포넌트
import React, { useState, useEffect } from 'react';
import { InvitationGroup } from '../types';

// 그룹 기능 설정 인터페이스
interface GroupFeatures {
  showRsvpForm: boolean;          // 참석 응답 폼
  showAccountInfo: boolean;       // 계좌 정보
  showShareButton: boolean;       // 공유 버튼
  showVenueInfo: boolean;         // 오시는 길 정보
  showPhotoGallery: boolean;      // 포토 갤러리
  showCeremonyProgram: boolean;   // 본식 순서
}

// Props 타입 정의
interface GroupFeatureSettingsProps {
  group: InvitationGroup;
  currentFeatures: GroupFeatures;
  onSave: (groupId: string, features: GroupFeatures) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const GroupFeatureSettings: React.FC<GroupFeatureSettingsProps> = ({
  group,
  currentFeatures,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // 로컬 상태 관리
  const [features, setFeatures] = useState<GroupFeatures>(currentFeatures);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Props 변경 시 로컬 상태 업데이트
  useEffect(() => {
    setFeatures(currentFeatures);
    setHasChanges(false);
  }, [currentFeatures]);

  // 기능 변경 처리
  const handleFeatureChange = (feature: keyof GroupFeatures, enabled: boolean) => {
    const newFeatures = {
      ...features,
      [feature]: enabled
    };
    
    setFeatures(newFeatures);
    
    // 변경사항 확인
    const changed = Object.keys(newFeatures).some(
      key => newFeatures[key as keyof GroupFeatures] !== currentFeatures[key as keyof GroupFeatures]
    );
    setHasChanges(changed);
  };

  // 저장 처리
  const handleSave = () => {
    if (!hasChanges) {
      onCancel();
      return;
    }
    onSave(group.id!, features);
  };

  // 취소 처리
  const handleCancel = () => {
    setFeatures(currentFeatures);
    setHasChanges(false);
    onCancel();
  };

  // 기능 목록 정의
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

  return (
    <div style={{
      backgroundColor: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px 0'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '16px',
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚙️ {group.groupName} 기능 설정
        </h4>
        
        {hasChanges && (
          <span style={{
            fontSize: '11px',
            color: '#007bff',
            backgroundColor: '#e3f2fd',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            변경됨
          </span>
        )}
      </div>

      {/* 기능 목록 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '15px'
      }}>
        {featureList.map(({ key, icon, label, description }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: features[key as keyof GroupFeatures] ? '#f8f9fa' : '#ffffff',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              flex: 1
            }}>
              <input
                type="checkbox"
                checked={features[key as keyof GroupFeatures]}
                onChange={(e) => handleFeatureChange(key as keyof GroupFeatures, e.target.checked)}
                disabled={isLoading}
                style={{
                  transform: 'scale(1.1)',
                  accentColor: '#007bff'
                }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2c3e50',
                  marginBottom: '2px'
                }}>
                  {icon} {label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  lineHeight: '1.3'
                }}>
                  {description}
                </div>
              </div>
            </label>
            
            {/* 상태 표시 */}
            <div style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: features[key as keyof GroupFeatures] ? '#d4edda' : '#f8d7da',
              color: features[key as keyof GroupFeatures] ? '#155724' : '#721c24'
            }}>
              {features[key as keyof GroupFeatures] ? '활성' : '비활성'}
            </div>
          </div>
        ))}
      </div>

      {/* 활성화된 기능 요약 */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #bbdefb',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#1565c0',
          marginBottom: '5px'
        }}>
          📋 활성화된 기능 요약:
        </div>
        <div style={{
          fontSize: '11px',
          color: '#1976d2',
          lineHeight: '1.4'
        }}>
          {featureList
            .filter(({ key }) => features[key as keyof GroupFeatures])
            .map(({ icon, label }) => `${icon} ${label}`)
            .join(' • ') || '활성화된 기능이 없습니다'}
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          ❌ 취소
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          style={{
            backgroundColor: isLoading ? '#28a745' : (hasChanges ? '#007bff' : '#6c757d'),
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: (isLoading || !hasChanges) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !hasChanges) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {isLoading ? (
            <>⏳ 저장 중...</>
          ) : hasChanges ? (
            <>💾 저장</>
          ) : (
            <>✅ 저장됨</>
          )}
        </button>
      </div>
    </div>
  );
};

export default GroupFeatureSettings;