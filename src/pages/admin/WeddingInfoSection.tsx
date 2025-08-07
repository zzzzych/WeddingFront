// src/pages/admin/WeddingInfoSection.tsx
// 결혼식 기본 정보 관리 섹션의 메인 컨테이너 컴포넌트

import React, { useState, useEffect } from 'react';
import { WeddingInfo, WeddingInfoUpdateRequest } from '../../types';
import { getWeddingInfoAdmin, updateWeddingInfo } from '../../services/invitationService';
import WeddingInfoDisplay from './WeddingInfoDisplay';
import WeddingInfoForm from './WeddingInfoForm';

// ==================== 🎨 스타일 설정 ====================

const AppleColors = {
  cardBackground: "#ffffff",
  text: "#1d1d1f",
  secondaryText: "#86868b",
  primary: "#007aff",
  success: "#34c759",
  destructive: "#ff3b30",
  border: "#d2d2d7",
  secondaryButton: "#f2f2f7",
};

const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 🎭 메인 컴포넌트 ====================

/**
 * 결혼식 기본 정보 관리 섹션 컴포넌트
 * 조회/편집 모드를 관리하고 하위 컴포넌트들을 조율합니다.
 */
const WeddingInfoSection: React.FC = () => {
  // ==================== 🎮 상태 관리 ====================
  
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null); // 결혼식 정보
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // 성공 메시지

  // 편집용 폼 데이터 상태
  const [formData, setFormData] = useState<WeddingInfoUpdateRequest>({
    groomName: '',
    brideName: '',
    weddingDate: '',
    venueName: '',
    venueAddress: '',
    kakaoMapUrl: '',
    naverMapUrl: '',
    parkingInfo: '',
    transportInfo: '',
    greetingMessage: '',
    ceremonyProgram: '',
    accountInfo: []
  });

  // ==================== 🔄 데이터 로딩 ====================

  /**
   * 결혼식 정보를 서버에서 로드하는 함수
   */
  const loadWeddingInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getWeddingInfoAdmin();
      setWeddingInfo(data);
      
      // 폼 데이터에 로드된 정보 설정
      setFormData({
        groomName: data.groomName,
        brideName: data.brideName,
        weddingDate: data.weddingDate,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        kakaoMapUrl: data.kakaoMapUrl || '',
        naverMapUrl: data.naverMapUrl || '',
        parkingInfo: data.parkingInfo || '',
        transportInfo: data.transportInfo || '',
        greetingMessage: data.greetingMessage || '',
        ceremonyProgram: data.ceremonyProgram,
        accountInfo: data.accountInfo
      });
    } catch (error: any) {
        console.error('결혼식 정보 로딩 실패:', error);
        
        // 데이터가 없는 경우 (404 에러) 처리
        if (error.message.includes('404') || error.message.includes('찾을 수 없습니다')) {
            console.log('📝 결혼식 정보가 없어서 편집 모드로 전환합니다.');
            setWeddingInfo(null);
            setIsEditing(true); // 자동으로 편집 모드 활성화
            setError('결혼식 정보가 없습니다. 새로 입력해주세요.');
        } else {
            setError('결혼식 정보를 불러오는데 실패했습니다.');
        }
    }finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    loadWeddingInfo();
  }, []);

  // ==================== 🎯 이벤트 핸들러 ====================

  /**
   * 편집 모드 시작 함수
   */
  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * 편집 취소 함수
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    // 원래 데이터로 폼 리셋
    if (weddingInfo) {
      setFormData({
        groomName: weddingInfo.groomName,
        brideName: weddingInfo.brideName,
        weddingDate: weddingInfo.weddingDate,
        venueName: weddingInfo.venueName,
        venueAddress: weddingInfo.venueAddress,
        kakaoMapUrl: weddingInfo.kakaoMapUrl || '',
        naverMapUrl: weddingInfo.naverMapUrl || '',
        parkingInfo: weddingInfo.parkingInfo || '',
        transportInfo: weddingInfo.transportInfo || '',
        greetingMessage: weddingInfo.greetingMessage || '',
        ceremonyProgram: weddingInfo.ceremonyProgram,
        accountInfo: weddingInfo.accountInfo
      });
    }
  };

  /**
   * 폼 데이터 변경 핸들러
   */
  const handleFormChange = (field: keyof WeddingInfoUpdateRequest, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 저장 처리 함수
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // 빈 계좌 정보 제거
      const cleanedFormData = {
        ...formData,
        accountInfo: formData.accountInfo.filter(info => info.trim() !== '')
      };
      
      const updatedInfo = await updateWeddingInfo(cleanedFormData);
      setWeddingInfo(updatedInfo);
      setIsEditing(false);
      setSuccessMessage('결혼식 정보가 성공적으로 업데이트되었습니다.');
      
      // 성공 메시지 3초 후 자동 제거
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('결혼식 정보 저장 실패:', error);
      setError('결혼식 정보 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== 🎨 렌더링 ====================

  // 로딩 상태
  if (isLoading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: systemFont,
        color: AppleColors.secondaryText
      }}>
        결혼식 정보를 불러오는 중...
      </div>
    );
  }

  // 에러 상태
  if (error && !weddingInfo) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: systemFont,
        color: AppleColors.destructive
      }}>
        {error}
        <button
          onClick={loadWeddingInfo}
          style={{
            display: 'block',
            margin: '20px auto 0',
            padding: '12px 24px',
            backgroundColor: AppleColors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontFamily: systemFont,
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 기존 return 문의 내용을 모두 삭제하고 아래 코드로 교체하세요:
return (
  <div style={{ 
    fontFamily: systemFont,
    backgroundColor: AppleColors.cardBackground,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${AppleColors.border}`,
    marginBottom: '24px'
  }}>
    {/* 헤더 섹션 */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: 0,
        fontSize: '22px',
        fontWeight: '600',
        color: AppleColors.text
      }}>
        🎭 결혼식 기본 정보
      </h2>
      
      {/* 데이터가 있고 편집 모드가 아닐 때만 편집 버튼 표시 */}
      {weddingInfo && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          style={{
            backgroundColor: AppleColors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: systemFont
          }}
        >
          ✏️ 편집
        </button>
      )}
    </div>

    {/* 로딩 상태 */}
    {isLoading && (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: AppleColors.secondaryText
      }}>
        <div>📊 결혼식 정보를 불러오는 중...</div>
      </div>
    )}

    {/* 에러 메시지 */}
    {error && (
      <div style={{
        backgroundColor: '#fff2f0',
        border: `1px solid ${AppleColors.destructive}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        color: AppleColors.destructive,
        fontSize: '14px'
      }}>
        ⚠️ {error}
      </div>
    )}

    {/* 성공 메시지 */}
    {successMessage && (
      <div style={{
        backgroundColor: '#f0f9ff',
        border: `1px solid ${AppleColors.success}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        color: AppleColors.success,
        fontSize: '14px'
      }}>
        ✅ {successMessage}
      </div>
    )}

    {/* 메인 콘텐츠 */}
    {!isLoading && (
      <>
        {/* 데이터가 없거나 편집 모드일 때 - 폼 표시 */}
        {(!weddingInfo || isEditing) && (
          <div>
            {!weddingInfo && (
              <div style={{
                backgroundColor: '#f8f9fa',
                border: `1px solid ${AppleColors.border}`,
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '500',
                  color: AppleColors.text,
                  marginBottom: '8px'
                }}>
                  📝 결혼식 정보 입력이 필요합니다
                </div>
                <div style={{ 
                  fontSize: '14px',
                  color: AppleColors.secondaryText
                }}>
                  아래 폼을 작성해서 결혼식 기본 정보를 등록해주세요.
                </div>
              </div>
            )}
            
            <WeddingInfoForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={weddingInfo ? () => setIsEditing(false) : undefined}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* 데이터가 있고 편집 모드가 아닐 때 - 정보 표시 */}
        {weddingInfo && !isEditing && (
          <WeddingInfoDisplay weddingInfo={weddingInfo} />
        )}
      </>
    )}
  </div>
);
};

export default WeddingInfoSection;