// src/pages/admin/WeddingInfoDisplay.tsx
// 결혼식 기본 정보를 읽기 전용으로 표시하는 컴포넌트

import React from 'react';
import { WeddingInfo } from '../../types';

// ==================== 🎨 스타일 설정 ====================

const AppleColors = {
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondaryText: "#86868b",        // 보조 텍스트 색상
  inputBackground: "#f2f2f7",      // 입력 필드 배경색
};

const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * WeddingInfoDisplay 컴포넌트 Props 타입
 */
interface WeddingInfoDisplayProps {
  weddingInfo: WeddingInfo | null; // 표시할 결혼식 정보
}

/**
 * 정보 필드 Props 타입
 */
interface InfoFieldProps {
  label: string;                   // 필드 라벨
  value: string | string[] | null | undefined; // 필드 값
  isFullWidth?: boolean;           // 전체 너비 사용 여부
  isMultiline?: boolean;           // 여러 줄 표시 여부
}

// ==================== 🎨 하위 컴포넌트 ====================

/**
 * 개별 정보 필드를 표시하는 컴포넌트
 */
const InfoField: React.FC<InfoFieldProps> = ({ 
  label, 
  value, 
  isFullWidth = false, 
  isMultiline = false 
}) => {
  // 값 포맷팅 함수
  const formatValue = () => {
    if (!value) return '미설정';
    
    if (Array.isArray(value)) {
      // 배열인 경우 (계좌 정보)
      return value.length > 0 ? (
        <div>
          {value.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              • {item}
            </div>
          ))}
        </div>
      ) : '미설정';
    }
    
    if (label === '결혼식 날짜' && typeof value === 'string') {
      // 날짜 포맷팅
      try {
        return new Date(value).toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long'
        });
      } catch {
        return value;
      }
    }
    
    return value;
  };

  return (
    <div style={{ 
      gridColumn: isFullWidth ? '1 / -1' : 'auto',
      marginBottom: '20px'
    }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: '500',
        color: AppleColors.text,
        fontFamily: systemFont
      }}>
        {label}
      </label>
      <div style={{
        padding: '12px 16px',
        fontSize: '16px',
        color: AppleColors.text,
        backgroundColor: AppleColors.inputBackground,
        borderRadius: '8px',
        minHeight: '48px',
        display: 'flex',
        alignItems: isMultiline ? 'flex-start' : 'center',
        whiteSpace: isMultiline ? 'pre-wrap' : 'normal',
        fontFamily: systemFont
      }}>
        {formatValue()}
      </div>
    </div>
  );
};

// ==================== 🎭 메인 컴포넌트 ====================

/**
 * 결혼식 기본 정보 조회 컴포넌트
 * 읽기 전용으로 결혼식 정보를 깔끔하게 표시합니다.
 */
const WeddingInfoDisplay: React.FC<WeddingInfoDisplayProps> = ({ weddingInfo }) => {
  // 데이터가 없는 경우
  if (!weddingInfo) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: AppleColors.secondaryText,
        fontFamily: systemFont
      }}>
        결혼식 정보가 없습니다.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      fontFamily: systemFont
    }}>
      {/* 기본 정보 섹션 */}
      <InfoField 
        label="신랑 이름" 
        value={weddingInfo.groomName} 
      />
      
      <InfoField 
        label="신부 이름" 
        value={weddingInfo.brideName} 
      />
      
      <InfoField 
        label="결혼식 날짜" 
        value={weddingInfo.weddingDate} 
      />
      
      <InfoField 
        label="웨딩홀 이름" 
        value={weddingInfo.venueName} 
      />

      {/* 장소 정보 섹션 */}
      <InfoField 
        label="웨딩홀 주소" 
        value={weddingInfo.venueAddress} 
        isFullWidth 
      />
      
      <InfoField 
        label="카카오맵 URL" 
        value={weddingInfo.kakaoMapUrl} 
      />
      
      <InfoField 
        label="네이버맵 URL" 
        value={weddingInfo.naverMapUrl} 
      />

      {/* 추가 정보 섹션 */}
      <InfoField 
        label="주차 정보" 
        value={weddingInfo.parkingInfo} 
        isFullWidth 
        isMultiline 
      />
      
      <InfoField 
        label="교통 정보" 
        value={weddingInfo.transportInfo} 
        isFullWidth 
        isMultiline 
      />
      
      <InfoField 
        label="기본 인사말" 
        value={weddingInfo.greetingMessage} 
        isFullWidth 
        isMultiline 
      />
      
      <InfoField 
        label="예식 순서" 
        value={weddingInfo.ceremonyProgram} 
        isFullWidth 
        isMultiline 
      />

      {/* 계좌 정보 섹션 */}
      <InfoField 
        label="계좌 정보" 
        value={weddingInfo.accountInfo} 
        isFullWidth 
      />
    </div>
  );
};

export default WeddingInfoDisplay;