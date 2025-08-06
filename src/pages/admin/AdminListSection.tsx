// src/pages/admin/AdminListSection.tsx
// 관리자 목록을 표시하고 관리하는 섹션 컴포넌트

import React from 'react';
import { AdminInfo, getAdminRoleLabel } from '../../types';

// ==================== 🎨 스타일 설정 ====================

/**
 * 애플 디자인 시스템 색상 팔레트
 */
const AppleColors = {
  cardBackground: "#ffffff",       // 카드 배경색
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondaryText: "#86868b",        // 보조 텍스트 색상
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
 * AdminListSection 컴포넌트 Props 타입
 */
interface AdminListSectionProps {
  showAdminList: boolean;          // 관리자 목록 표시 여부
  adminList: AdminInfo[];          // 관리자 목록 데이터
  adminLoading: boolean;           // 관리자 목록 로딩 상태
}

// ==================== 👤 개별 관리자 카드 컴포넌트 ====================

/**
 * 개별 관리자 정보를 표시하는 카드 컴포넌트
 */
interface AdminCardProps {
  admin: AdminInfo;                // 관리자 정보
}

const AdminCard: React.FC<AdminCardProps> = ({ admin }) => (
  <div
    style={{
      border: `1px solid ${AppleColors.border}`,
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: AppleColors.inputBackground,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.2s ease",
    }}
  >
    <div>
      {/* 관리자 사용자명 */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: AppleColors.text,
          marginBottom: "4px",
        }}
      >
        {admin.username}
      </div>
      
      {/* 관리자 역할 및 생성일 */}
      <div
        style={{
          fontSize: "14px",
          color: AppleColors.secondaryText,
        }}
      >
        역할: {getAdminRoleLabel(admin.role)} | 생성일: {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
      </div>
      
      {/* 마지막 로그인 (있는 경우) */}
      {admin.lastLoginAt && (
        <div
          style={{
            fontSize: "12px",
            color: AppleColors.secondaryText,
            marginTop: "2px",
          }}
        >
          마지막 로그인: {new Date(admin.lastLoginAt).toLocaleDateString('ko-KR')}
        </div>
      )}
    </div>

    {/* 관리자 역할에 따른 뱃지 */}
    <div
      style={{
        fontSize: "12px",
        padding: "4px 8px",
        borderRadius: "4px",
        backgroundColor: admin.role === 'super_admin' ? '#007aff' : 
                        admin.role === 'admin' ? '#34c759' : '#ff9500',
        color: "white",
        fontWeight: "600",
      }}
    >
      {getAdminRoleLabel(admin.role)}
    </div>
  </div>
);

// ==================== 📋 로딩 상태 컴포넌트 ====================

/**
 * 관리자 목록 로딩 중 표시 컴포넌트
 */
const AdminListLoading: React.FC = () => (
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
        borderTop: `3px solid ${AppleColors.secondaryText}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 16px",
      }}
    />
    관리자 목록을 불러오는 중...
  </div>
);

// ==================== 📭 빈 목록 컴포넌트 ====================

/**
 * 관리자가 없을 때 표시하는 컴포넌트
 */
const EmptyAdminList: React.FC = () => (
  <div
    style={{
      textAlign: "center",
      padding: "40px",
      color: AppleColors.secondaryText,
    }}
  >
    <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
    <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
      등록된 관리자가 없습니다
    </div>
    <div style={{ fontSize: "14px" }}>
      새로운 관리자를 추가해보세요
    </div>
  </div>
);

// ==================== 📋 메인 관리자 목록 섹션 컴포넌트 ====================

/**
 * 관리자 목록을 표시하는 메인 섹션 컴포넌트
 * 표시/숨김 상태에 따라 조건부 렌더링
 */
const AdminListSection: React.FC<AdminListSectionProps> = ({
  showAdminList,
  adminList,
  adminLoading,
}) => {
  // 관리자 목록이 숨겨진 상태면 아무것도 렌더링하지 않음
  if (!showAdminList) {
    return null;
  }

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
          👥 관리자 목록
          {!adminLoading && adminList.length > 0 && (
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
              {adminList.length}명
            </span>
          )}
        </h2>
      </div>

      {/* 관리자 목록 컨텐츠 */}
      <div style={{ padding: "24px" }}>
        {adminLoading ? (
          <AdminListLoading />
        ) : adminList.length === 0 ? (
          <EmptyAdminList />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {adminList.map((admin) => (
              <AdminCard key={admin.id} admin={admin} />
            ))}
          </div>
        )}
      </div>

      {/* CSS 애니메이션 정의 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminListSection;

// ==================== 📝 사용 예시 ====================
/*
사용 예시:

import AdminListSection from './admin/AdminListSection';

// 컴포넌트에서 사용
<AdminListSection
  showAdminList={showAdminList}
  adminList={adminList}
  adminLoading={adminLoading}
/>
*/