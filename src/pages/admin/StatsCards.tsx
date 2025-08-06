// src/pages/admin/StatsCards.tsx
// 관리자 대시보드 상단 통계 카드들을 표시하는 컴포넌트

import React from 'react';

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
  destructive: "#ff3b30",          // 삭제/위험 상태 색상
  border: "#d2d2d7",               // 테두리 색상
};

// ==================== 📊 타입 정의 ====================

/**
 * 통계 데이터 타입
 */
interface StatsData {
  totalGroups: number;         // 총 그룹 수
  totalResponses: number;      // 총 응답 수
  totalAttending: number;      // 참석 응답 수
  totalNotAttending: number;   // 불참 응답 수
  totalPending: number;        // 대기 중 응답 수
}

/**
 * StatsCards 컴포넌트 Props 타입
 */
interface StatsCardsProps {
  stats: StatsData;            // 표시할 통계 데이터
  loading?: boolean;           // 로딩 상태 (선택사항)
}

/**
 * 개별 통계 카드 Props 타입
 */
interface StatCardProps {
  title: string;               // 카드 제목
  value: number;               // 표시할 값
  color: string;               // 값 색상
  loading?: boolean;           // 로딩 상태
}

// ==================== 🃏 개별 통계 카드 컴포넌트 ====================

/**
 * 개별 통계 카드 컴포넌트
 * 제목, 값, 색상을 받아서 카드 형태로 표시
 */
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color, 
  loading = false 
}) => (
  <div
    style={{
      backgroundColor: AppleColors.cardBackground,
      padding: "24px",
      borderRadius: "12px",
      border: `1px solid ${AppleColors.border}`,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease",
    }}
  >
    {/* 카드 제목 */}
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
    
    {/* 카드 값 */}
    <div
      style={{
        fontSize: "28px",
        fontWeight: "bold",
        color: loading ? AppleColors.secondaryText : color,
        transition: "color 0.2s ease",
      }}
    >
      {loading ? "—" : value.toLocaleString()}
    </div>
  </div>
);

// ==================== 📊 메인 통계 카드 컴포넌트 ====================

/**
 * 통계 카드들을 그리드 형태로 표시하는 메인 컴포넌트
 * 4개의 카드 (총 그룹, 총 응답, 참석, 불참)를 표시
 */
const StatsCards: React.FC<StatsCardsProps> = ({ 
  stats, 
  loading = false 
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "40px",
      }}
    >
      {/* 총 그룹 수 카드 */}
      <StatCard
        title="총 그룹"
        value={stats.totalGroups}
        color={AppleColors.primary}
        loading={loading}
      />

      {/* 총 응답 수 카드 */}
      <StatCard
        title="총 응답"
        value={stats.totalResponses}
        color={AppleColors.text}
        loading={loading}
      />

      {/* 참석 응답 수 카드 */}
      <StatCard
        title="참석"
        value={stats.totalAttending}
        color={AppleColors.success}
        loading={loading}
      />

      {/* 불참 응답 수 카드 */}
      <StatCard
        title="불참"
        value={stats.totalNotAttending}
        color={AppleColors.destructive}
        loading={loading}
      />
    </div>
  );
};

export default StatsCards;

// ==================== 📝 사용 예시 ====================
/*
사용 예시:

import StatsCards from './admin/StatsCards';

// 컴포넌트에서 사용
<StatsCards 
  stats={{
    totalGroups: 5,
    totalResponses: 23,
    totalAttending: 18,
    totalNotAttending: 5,
    totalPending: 0
  }}
  loading={false}
/>
*/