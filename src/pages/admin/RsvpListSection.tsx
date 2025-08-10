// src/pages/admin/RsvpListSection.tsx
// RSVP 응답 목록을 표시하고 관리하는 섹션 컴포넌트

import React from 'react';
import { RsvpListResponse, getAttendanceStatus } from '../../types';

// ==================== 🎨 스타일 설정 ====================

/**
 * 애플 디자인 시스템 색상 팔레트
 */
const AppleColors = {
  cardBackground: "#ffffff",       // 카드 배경색
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondaryText: "#86868b",        // 보조 텍스트 색상
  primary: "#007aff",              // 주요 액센트 색상
  success: "#34c759",              // 성공 상태 색상
  warning: "#ff9500",              // 경고 상태 색상
  destructive: "#ff3b30",          // 삭제/위험 상태 색상
  border: "#d2d2d7",               // 테두리 색상
  inputBackground: "#f2f2f7",      // 입력 필드 배경색
  secondaryButton: "#f2f2f7",      // 보조 버튼 배경색 (이 줄 추가)
};

/**
 * 시스템 폰트 스택
 */
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * RsvpListSection 컴포넌트 Props 타입 (업데이트됨)
 */
interface RsvpListSectionProps {
  rsvpData: RsvpListResponse | null;    // RSVP 데이터
  rsvpLoading: boolean;                 // RSVP 로딩 상태
  onDeleteRsvp: (rsvpId: string, guestName: string) => void; // RSVP 삭제 함수
  // 새로 추가되는 편집 관련 props
  editingRsvpId?: string | null;        // 현재 편집 중인 RSVP ID
  editingRsvpData?: any;                // 편집 중인 RSVP 데이터
  onStartEditingRsvp?: (rsvp: any) => void; // RSVP 편집 시작 함수
  onCancelEditingRsvp?: () => void;     // RSVP 편집 취소 함수
  onUpdateRsvp?: (rsvpId: string, updateData: any) => void; // RSVP 업데이트 함수
  onUpdateEditingRsvpData?: (field: string, value: any) => void; // 편집 데이터 업데이트
}

/**
 * 개별 RSVP 카드 Props 타입 (업데이트됨)
 */
interface RsvpCardProps {
  rsvp: any;                            // RSVP 응답 데이터 (변환된 형태)
  onDeleteRsvp: (rsvpId: string, guestName: string) => void;
  // 새로 추가되는 편집 관련 props
  isEditing?: boolean;                  // 현재 편집 중인지 여부
  editingData?: any;                    // 편집 중인 데이터
  onStartEditingRsvp?: (rsvp: any) => void;
  onCancelEditingRsvp?: () => void;
  onUpdateRsvp?: (rsvpId: string, updateData: any) => void;
  onUpdateEditingRsvpData?: (field: string, value: any) => void;
}

/**
 * 통계 카드 Props 타입
 */
interface StatsCardProps {
  title: string;                        // 통계 제목
  value: number;                        // 통계 값
  color: string;                        // 값 색상
}

// ==================== 📊 통계 카드 컴포넌트 ====================

/**
 * 개별 통계 정보를 표시하는 카드 컴포넌트
 */
const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: "12px",
        color: AppleColors.secondaryText,
        marginBottom: "4px",
        fontWeight: "500",
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: "18px",
        fontWeight: "600",
        color: color,
      }}
    >
      {value.toLocaleString()}
    </div>
  </div>
);

// ==================== 🃏 개별 RSVP 카드 컴포넌트 ====================

/**
 * 개별 RSVP 응답을 표시하고 편집할 수 있는 카드 컴포넌트
 */
const RsvpCard: React.FC<RsvpCardProps> = ({ 
  rsvp, 
  onDeleteRsvp, 
  isEditing = false,
  editingData,
  onStartEditingRsvp,
  onCancelEditingRsvp,
  onUpdateRsvp,
  onUpdateEditingRsvpData
}) => {
  // 참석 상태에 따른 색상 결정
  const getStatusColor = (willAttend: boolean) => {
    return willAttend ? AppleColors.success : AppleColors.destructive;
  };

  // 총 인원 표시 함수
  const getAttendeeInfo = (rsvp: any) => {
    const totalCount = rsvp.response?.totalCount || 0;
    
    if (!rsvp.willAttend && !rsvp.response?.isAttending) {
      return '불참';
    }
    
    return totalCount > 0 ? `총 ${totalCount}명` : '1명';
  };

  if (isEditing && editingData) {
    // 편집 모드
    return (
      <div
        style={{
          border: `2px solid ${AppleColors.primary}`,
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: AppleColors.cardBackground,
          boxShadow: "0 4px 12px rgba(0, 122, 255, 0.15)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 편집 헤더 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, color: AppleColors.primary, fontSize: "16px" }}>
              ✏️ RSVP 응답 편집
            </h4>
            <span style={{ 
              fontSize: "12px", 
              color: AppleColors.secondaryText, 
              backgroundColor: AppleColors.inputBackground,
              padding: "4px 8px",
              borderRadius: "4px"
            }}>
              {rsvp.groupName}
            </span>
          </div>

          {/* 편집 폼 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* 응답자 이름 */}
            <div>
              <label style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "4px", display: "block" }}>
                응답자 이름
              </label>
              <input
                type="text"
                value={editingData.responderName}
                onChange={(e) => onUpdateEditingRsvpData?.('responderName', e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                }}
              />
            </div>

            {/* 참석 여부 */}
            <div>
              <label style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "4px", display: "block" }}>
                참석 여부
              </label>
              <select
                value={editingData.isAttending ? "true" : "false"}
                onChange={(e) => onUpdateEditingRsvpData?.('isAttending', e.target.value === "true")}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                }}
              >
                <option value="true">✅ 참석</option>
                <option value="false">❌ 불참</option>
              </select>
            </div>

            {/* 총 참석 인원 */}
            <div>
              <label style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "4px", display: "block" }}>
                총 참석 인원
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={editingData.totalCount || 0}
                onChange={(e) => onUpdateEditingRsvpData?.('totalCount', parseInt(e.target.value) || 0)}
                disabled={!editingData.isAttending}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                  backgroundColor: !editingData.isAttending ? AppleColors.inputBackground : "white",
                  color: !editingData.isAttending ? AppleColors.secondaryText : AppleColors.text,
                }}
              />
              {!editingData.isAttending && (
                <div style={{ fontSize: "11px", color: AppleColors.secondaryText, marginTop: "2px" }}>
                  불참 선택 시 자동으로 0명으로 설정됩니다
                </div>
              )}
            </div>

            {/* 빈 공간 (그리드 레이아웃 유지용) */}
            <div></div>
          </div>

          {/* 전화번호 */}
          <div>
            <label style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "4px", display: "block" }}>
              전화번호 (선택사항)
            </label>
            <input
              type="tel"
              value={editingData.phoneNumber || ''}
              onChange={(e) => onUpdateEditingRsvpData?.('phoneNumber', e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${AppleColors.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: systemFont,
              }}
            />
          </div>

          {/* 메시지 */}
          <div>
            <label style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "4px", display: "block" }}>
              메시지 (선택사항)
            </label>
            <textarea
              value={editingData.message || ''}
              onChange={(e) => onUpdateEditingRsvpData?.('message', e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${AppleColors.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: systemFont,
                resize: "vertical",
              }}
            />
          </div>

          {/* 편집 버튼들 */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={onCancelEditingRsvp}
              style={{
                padding: "10px 20px",
                backgroundColor: AppleColors.secondaryButton,
                color: AppleColors.text,
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              취소
            </button>
            <button
              onClick={() => onUpdateRsvp?.(rsvp.id, editingData)}
              style={{
                padding: "10px 20px",
                backgroundColor: AppleColors.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 일반 표시 모드
  return (
    <div
      style={{
        border: `1px solid ${AppleColors.border}`,
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: AppleColors.cardBackground,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s ease",
      }}
    >
      {/* 응답자 정보 */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          {/* 이름 */}
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: 0,
            }}
          >
            {rsvp.guestName || rsvp.response?.responderName}
          </h4>
          
          {/* 그룹명 */}
          <span
            style={{
              fontSize: "12px",
              color: AppleColors.secondaryText,
              backgroundColor: AppleColors.inputBackground,
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {rsvp.groupName}
          </span>
          
          {/* 참석 여부 */}
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "white",
              backgroundColor: getStatusColor(rsvp.willAttend ?? rsvp.response?.isAttending),
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {rsvp.willAttend ?? rsvp.response?.isAttending ? "참석" : "불참"}
          </span>
        </div>
        
        {/* 상세 정보 */}
        <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: AppleColors.secondaryText }}>
          {/* 인원 정보 */}
          <span>👥 {getAttendeeInfo(rsvp)}</span>
          
          {/* 전화번호 */}
          {rsvp.phoneNumber && (
            <span>📞 {rsvp.phoneNumber}</span>
          )}
          
          {/* 메시지 */}
          {rsvp.message && (
            <span>💬 {rsvp.message.length > 20 ? rsvp.message.substring(0, 20) + '...' : rsvp.message}</span>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onStartEditingRsvp?.(rsvp)}
          style={{
            padding: "8px 16px",
            backgroundColor: AppleColors.primary,
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ✏️ 편집
        </button>
        <button
          onClick={() => onDeleteRsvp(rsvp.id, rsvp.guestName || rsvp.response?.responderName)}
          style={{
            padding: "8px 16px",
            backgroundColor: AppleColors.destructive,
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🗑️ 삭제
        </button>
      </div>
    </div>
  );
};

// ==================== 📋 로딩 상태 컴포넌트 ====================

/**
 * RSVP 데이터 로딩 중 표시 컴포넌트
 */
const RsvpListLoading: React.FC = () => (
  <div
    style={{
      textAlign: "center",
      padding: "40px",
      color: AppleColors.secondaryText,
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        border: `3px solid ${AppleColors.border}`,
        borderTop: `3px solid ${AppleColors.primary}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 16px",
      }}
    />
    RSVP 데이터를 불러오는 중...
  </div>
);

// ==================== 📭 빈 RSVP 목록 컴포넌트 ====================

/**
 * RSVP 응답이 없을 때 표시하는 컴포넌트
 */
const EmptyRsvpList: React.FC = () => (
  <div
    style={{
      textAlign: "center",
      padding: "60px 20px",
      color: AppleColors.secondaryText,
    }}
  >
    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
    <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: AppleColors.text }}>
      아직 RSVP 응답이 없습니다
    </div>
    <div style={{ fontSize: "14px" }}>
      초대장을 공유하고 응답을 받아보세요!
    </div>
  </div>
);

// ==================== 📊 메인 RSVP 목록 섹션 컴포넌트 ====================

/**
 * RSVP 응답 목록과 통계를 표시하는 메인 섹션 컴포넌트
 */
const RsvpListSection: React.FC<RsvpListSectionProps> = ({
  rsvpData,
  rsvpLoading,
  onDeleteRsvp,
  editingRsvpId,
  editingRsvpData,
  onStartEditingRsvp,
  onCancelEditingRsvp,
  onUpdateRsvp,
  onUpdateEditingRsvpData,
}) => {
  return (
    <div
      style={{
        backgroundColor: AppleColors.cardBackground,
        borderRadius: "12px",
        border: `1px solid ${AppleColors.border}`,
        marginBottom: "40px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        fontFamily: systemFont,
      }}
    >
      {/* 섹션 헤더 */}
      <div
        style={{
          padding: "24px",
          borderBottom: `1px solid ${AppleColors.border}`,
          backgroundColor: AppleColors.cardBackground,
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: AppleColors.text,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📊 RSVP 응답 목록
          {!rsvpLoading && rsvpData && rsvpData.responses.length > 0 && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: AppleColors.secondaryText,
                backgroundColor: AppleColors.inputBackground,
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {rsvpData.responses.length}개
            </span>
          )}
        </h2>
      </div>

      {/* RSVP 목록 컨텐츠 */}
      <div style={{ padding: "24px" }}>
        {rsvpLoading ? (
          <RsvpListLoading />
        ) : !rsvpData || rsvpData.responses.length === 0 ? (
          <EmptyRsvpList />
        ) : (
          <div>
            {/* 상세 통계 섹션 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: AppleColors.inputBackground,
                borderRadius: "8px",
                border: `1px solid ${AppleColors.border}`,
              }}
            >
              <StatsCard
                title="총 응답"
                value={rsvpData.summary.totalResponses || 0}
                color={AppleColors.text}
              />
              <StatsCard
                title="참석"
                value={rsvpData.summary.attendingResponses || 0}
                color={AppleColors.success}
              />
              <StatsCard
                title="불참"
                value={rsvpData.summary.notAttendingResponses || 0}
                color={AppleColors.destructive}
              />
              <StatsCard
                title="총 참석 인원"
                value={rsvpData.summary.totalAttendingCount || 0}
                color={AppleColors.primary}
              />
            </div>

            {/* RSVP 응답 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {rsvpData.responses.map((rsvp) => (
                <RsvpCard
                  key={rsvp.id}
                  rsvp={rsvp}
                  onDeleteRsvp={onDeleteRsvp}
                  // 새로 추가할 편집 관련 props들
                  isEditing={editingRsvpId === rsvp.id}
                  editingData={editingRsvpId === rsvp.id ? editingRsvpData : null}
                  onStartEditingRsvp={onStartEditingRsvp}
                  onCancelEditingRsvp={onCancelEditingRsvp}
                  onUpdateRsvp={onUpdateRsvp}
                  onUpdateEditingRsvpData={onUpdateEditingRsvpData}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 정의 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default RsvpListSection;

// ==================== 📝 사용 예시 ====================
/*
사용 예시:

import RsvpListSection from './admin/RsvpListSection';

// 컴포넌트에서 사용
<RsvpListSection
  rsvpData={rsvpData}
  rsvpLoading={rsvpLoading}
  onDeleteRsvp={handleDeleteRsvp}
/>
*/