// src/pages/admin/StatsCards.tsx - 수정됨
// 통계 카드들을 표시하는 컴포넌트 (총 참석 인원 추가)

import React from "react";

// ==================== 🎨 스타일 설정 ====================

/**
 * 애플 디자인 시스템 색상 팔레트
 */
const AppleColors = {
  background: "#f5f5f7",           // 기본 배경색
  cardBackground: "#ffffff",       // 카드 배경색
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondaryText: "#86868b",        // 보조 텍스트 색상
  primary: "#007aff",              // 주요 액센트 색상
  blue: "#007aff",                 // 파란색 (primary와 동일)
  success: "#34c759",              // 성공 상태 색상
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
 * 통계 데이터 타입 (수정됨 - totalAttendingCount 추가)
 */
interface Stats {
  totalGroups: number;        // 총 그룹 수
  totalResponses: number;     // 총 응답 수
  totalAttending: number;     // 참석 응답 수
  totalNotAttending: number;  // 불참 응답 수
  totalPending: number;       // 미응답 수
  totalAttendingCount: number; // 🆕 총 참석 인원 수 (실제 참석할 사람 수)
}

/**
 * StatsCards 컴포넌트 Props 타입
 */
interface StatsCardsProps {
  stats: Stats;      // 통계 데이터
  loading: boolean;  // 로딩 상태
}

/**
 * 개별 통계 카드 Props 타입
 */
interface StatCardProps {
  title: string;   // 통계 제목
  value: number;   // 통계 값
  color: string;   // 값 색상
}

// ==================== 🃏 개별 통계 카드 컴포넌트 ====================

/**
 * 개별 통계 정보를 표시하는 카드 컴포넌트
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div
    style={{
      backgroundColor: AppleColors.cardBackground,
      borderRadius: "12px",
      border: `1px solid ${AppleColors.border}`,
      padding: "24px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      fontFamily: systemFont,
    }}
  >
    <div
      style={{
        fontSize: "14px",
        color: AppleColors.secondaryText,
        marginBottom: "8px",
        fontWeight: "500",
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: "32px",
        fontWeight: "600",
        color: color,
      }}
    >
      {value.toLocaleString()}
    </div>
  </div>
);

// ==================== 🎯 메인 통계 카드 섹션 컴포넌트 ====================

/**
 * 관리자 대시보드 상단 통계 카드들을 표시하는 컴포넌트
 * 수정사항: 총 참석 인원 통계 카드 추가
 */
const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  // 로딩 중일 때는 스켈레톤 UI 표시
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* 로딩 스켈레톤 카드들 */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              padding: "24px",
              height: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "14px",
                backgroundColor: AppleColors.inputBackground,
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "40%",
                height: "32px",
                backgroundColor: AppleColors.inputBackground,
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "40px",
      }}
    >
      {/* 총 그룹 통계 카드 */}
      <StatCard
        title="총 그룹"
        value={stats.totalGroups}
        color={AppleColors.blue}
      />

      {/* 총 응답 통계 카드 */}
      <StatCard
        title="총 응답"
        value={stats.totalResponses}
        color={AppleColors.text}
      />

      {/* 참석 응답 통계 카드 */}
      <StatCard
        title="참석"
        value={stats.totalAttending}
        color={AppleColors.success}
      />

      {/* 불참 응답 통계 카드 */}
      <StatCard
        title="불참"
        value={stats.totalNotAttending}
        color={AppleColors.destructive}
      />

      {/* 🆕 총 참석 인원 통계 카드 추가 */}
      <StatCard
        title="총 참석 인원"
        value={stats.totalAttendingCount}
        color={AppleColors.blue}
      />
    </div>
  );
};

export default StatsCards;