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
};

/**
 * 시스템 폰트 스택
 */
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * RsvpListSection 컴포넌트 Props 타입
 */
interface RsvpListSectionProps {
  rsvpData: RsvpListResponse | null;    // RSVP 데이터
  rsvpLoading: boolean;                 // RSVP 로딩 상태
  onDeleteRsvp: (rsvpId: string, guestName: string) => void; // RSVP 삭제 함수
}

/**
 * 개별 RSVP 카드 Props 타입
 */
interface RsvpCardProps {
  rsvp: any;                            // RSVP 응답 데이터 (변환된 형태)
  onDeleteRsvp: (rsvpId: string, guestName: string) => void;
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
 * 개별 RSVP 응답을 표시하는 카드 컴포넌트
 */
const RsvpCard: React.FC<RsvpCardProps> = ({ rsvp, onDeleteRsvp }) => {
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
      {/* RSVP 정보 영역 */}
      <div style={{ flex: 1 }}>
        {/* 상단: 이름, 그룹, 참석 상태 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
            flexWrap: "wrap",
          }}
        >
          {/* 응답자 이름 */}
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: AppleColors.text,
            }}
          >
            {rsvp.guestName}
          </span>
          
          {/* 그룹명 뱃지 */}
          <span
            style={{
              fontSize: "14px",
              color: AppleColors.secondaryText,
              backgroundColor: AppleColors.inputBackground,
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: "500",
            }}
          >
            {rsvp.groupName}
          </span>
          
          {/* 참석 상태 뱃지 */}
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              padding: "2px 8px",
              borderRadius: "4px",
              color: "white",
              backgroundColor:
                rsvp.willAttend === true
                  ? AppleColors.success
                  : rsvp.willAttend === false
                  ? AppleColors.destructive
                  : AppleColors.warning,
            }}
          >
            {getAttendanceStatus(rsvp.willAttend)}
          </span>
        </div>
        
        {/* 중간: 연락처 및 동행자 정보 */}
        <div
          style={{
            fontSize: "14px",
            color: AppleColors.secondaryText,
            marginBottom: rsvp.message ? "8px" : "0",
          }}
        >
          전화번호: {rsvp.phoneNumber || "없음"} | 동행자: {rsvp.companions || 0}명
        </div>
        
        {/* 하단: 메시지 (있는 경우) */}
        {rsvp.message && (
          <div
            style={{
              fontSize: "14px",
              color: AppleColors.text,
              fontStyle: "italic",
              backgroundColor: AppleColors.inputBackground,
              padding: "8px",
              borderRadius: "6px",
              lineHeight: "1.4",
            }}
          >
            💬 {rsvp.message}
          </div>
        )}
      </div>
      
      {/* 액션 버튼 영역 */}
      <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
        <button
          onClick={() => onDeleteRsvp(rsvp.id!, rsvp.guestName!)}
          style={{
            padding: "6px 12px",
            backgroundColor: AppleColors.destructive,
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
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