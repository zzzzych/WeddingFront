// src/pages/admin/WeddingInfoForm.tsx
// 결혼식 기본 정보를 편집할 수 있는 폼 컴포넌트

import React from 'react';
import { WeddingInfoUpdateRequest } from '../../types';

// ==================== 🎨 스타일 설정 ====================

const AppleColors = {
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondary: "#5856d6",            // 보조 액센트 색상
  destructive: "#ff3b30",          // 삭제/위험 상태 색상
  border: "#d2d2d7",               // 테두리 색상
  inputBackground: "#f2f2f7",      // 입력 필드 배경색
};

const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * WeddingInfoForm 컴포넌트 Props 타입
 */
interface WeddingInfoFormProps {
  formData: WeddingInfoUpdateRequest;    // 편집 중인 폼 데이터
  onFormChange: (field: keyof WeddingInfoUpdateRequest, value: string | string[]) => void; // 폼 변경 핸들러
}

/**
 * 입력 필드 Props 타입
 */
interface FormFieldProps {
  label: string;                         // 필드 라벨
  type?: 'text' | 'url' | 'datetime-local' | 'textarea'; // 입력 타입
  value: string;                         // 현재 값
  onChange: (value: string) => void;     // 변경 핸들러
  placeholder?: string;                  // 플레이스홀더
  isFullWidth?: boolean;                 // 전체 너비 사용 여부
  rows?: number;                         // textarea의 행 수
  required?: boolean;                    // 필수 입력 여부
}

/**
 * 계좌 정보 필드 Props 타입
 */
interface AccountInfoFieldProps {
  accountInfo: string[];                 // 계좌 정보 배열
  onAccountChange: (index: number, value: string) => void; // 계좌 정보 변경 핸들러
  onAddAccount: () => void;              // 계좌 추가 핸들러
  onRemoveAccount: (index: number) => void; // 계좌 삭제 핸들러
}

// ==================== 🎨 하위 컴포넌트 ====================

/**
 * 개별 폼 필드를 렌더링하는 컴포넌트
 */
const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  isFullWidth = false, 
  rows = 3,
  required = false
}) => {
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
        {label} {required && <span style={{ color: AppleColors.destructive }}>*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: `1px solid ${AppleColors.border}`,
            borderRadius: '8px',
            backgroundColor: AppleColors.inputBackground,
            fontFamily: systemFont,
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: `1px solid ${AppleColors.border}`,
            borderRadius: '8px',
            backgroundColor: AppleColors.inputBackground,
            fontFamily: systemFont,
            boxSizing: 'border-box'
          }}
        />
      )}
    </div>
  );
};

/**
 * 계좌 정보 입력 필드 컴포넌트
 */
const AccountInfoField: React.FC<AccountInfoFieldProps> = ({
  accountInfo,
  onAccountChange,
  onAddAccount,
  onRemoveAccount
}) => {
  return (
    <div style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: '500',
        color: AppleColors.text,
        fontFamily: systemFont
      }}>
        계좌 정보
      </label>
      
      <div>
        {accountInfo.map((account, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              value={account}
              onChange={(e) => onAccountChange(index, e.target.value)}
              placeholder="은행명 계좌번호 (예금주명)"
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                border: `1px solid ${AppleColors.border}`,
                borderRadius: '8px',
                backgroundColor: AppleColors.inputBackground,
                fontFamily: systemFont,
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={() => onRemoveAccount(index)}
              style={{
                padding: '12px 16px',
                backgroundColor: AppleColors.destructive,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: systemFont,
                whiteSpace: 'nowrap'
              }}
            >
              삭제
            </button>
          </div>
        ))}
        
        <button
          onClick={onAddAccount}
          style={{
            padding: '12px 24px',
            backgroundColor: AppleColors.secondary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: systemFont
          }}
        >
          + 계좌 추가
        </button>
      </div>
    </div>
  );
};

// ==================== 🎭 메인 컴포넌트 ====================

/**
 * 결혼식 기본 정보 편집 폼 컴포넌트
 * 모든 결혼식 정보를 편집할 수 있는 폼을 제공합니다.
 */
const WeddingInfoForm: React.FC<WeddingInfoFormProps> = ({ 
  formData, 
  onFormChange 
}) => {
  // ==================== 🎯 이벤트 핸들러 ====================

  /**
   * 계좌 정보 변경 핸들러
   */
  const handleAccountInfoChange = (index: number, value: string) => {
    const newAccountInfo = [...formData.accountInfo];
    newAccountInfo[index] = value;
    onFormChange('accountInfo', newAccountInfo);
  };

  /**
   * 계좌 정보 추가 핸들러
   */
  const handleAddAccountInfo = () => {
    onFormChange('accountInfo', [...formData.accountInfo, '']);
  };

  /**
   * 계좌 정보 삭제 핸들러
   */
  const handleRemoveAccountInfo = (index: number) => {
    const newAccountInfo = formData.accountInfo.filter((_, i) => i !== index);
    onFormChange('accountInfo', newAccountInfo);
  };

  // ==================== 🎨 렌더링 ====================

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      fontFamily: systemFont
    }}>
      {/* 기본 정보 섹션 */}
      <FormField
        label="신랑 이름"
        value={formData.groomName}
        onChange={(value) => onFormChange('groomName', value)}
        required
      />

      <FormField
        label="신부 이름"
        value={formData.brideName}
        onChange={(value) => onFormChange('brideName', value)}
        required
      />

      <FormField
        label="결혼식 날짜"
        type="datetime-local"
        value={formData.weddingDate}
        onChange={(value) => onFormChange('weddingDate', value)}
        required
      />

      <FormField
        label="웨딩홀 이름"
        value={formData.venueName}
        onChange={(value) => onFormChange('venueName', value)}
        required
      />

      {/* 장소 정보 섹션 */}
      <FormField
        label="웨딩홀 주소"
        value={formData.venueAddress}
        onChange={(value) => onFormChange('venueAddress', value)}
        isFullWidth
        required
      />

      <FormField
        label="카카오맵 URL"
        type="url"
        value={formData.kakaoMapUrl || ''}
        onChange={(value) => onFormChange('kakaoMapUrl', value)}
        placeholder="https://place.map.kakao.com/..."
      />

      <FormField
        label="네이버맵 URL"
        type="url"
        value={formData.naverMapUrl || ''}
        onChange={(value) => onFormChange('naverMapUrl', value)}
        placeholder="https://naver.me/..."
      />

      {/* 추가 정보 섹션 */}
      <FormField
        label="주차 정보"
        type="textarea"
        value={formData.parkingInfo || ''}
        onChange={(value) => onFormChange('parkingInfo', value)}
        placeholder="주차장 위치, 이용 시간, 요금 정보 등을 입력하세요"
        isFullWidth
        rows={3}
      />

      <FormField
        label="교통 정보"
        type="textarea"
        value={formData.transportInfo || ''}
        onChange={(value) => onFormChange('transportInfo', value)}
        placeholder="대중교통 이용 방법, 도보 안내 등을 입력하세요"
        isFullWidth
        rows={3}
      />

      <FormField
        label="기본 인사말"
        type="textarea"
        value={formData.greetingMessage || ''}
        onChange={(value) => onFormChange('greetingMessage', value)}
        placeholder="청첩장에 표시될 기본 인사말을 입력하세요"
        isFullWidth
        rows={4}
      />

      <FormField
        label="예식 순서"
        type="textarea"
        value={formData.ceremonyProgram}
        onChange={(value) => onFormChange('ceremonyProgram', value)}
        placeholder="예식 시간과 순서를 입력하세요 (예: 오후 6시 예식)"
        isFullWidth
        rows={3}
        required
      />

      {/* 계좌 정보 섹션 */}
      <AccountInfoField
        accountInfo={formData.accountInfo}
        onAccountChange={handleAccountInfoChange}
        onAddAccount={handleAddAccountInfo}
        onRemoveAccount={handleRemoveAccountInfo}
      />
    </div>
  );
};

export default WeddingInfoForm;