// src/pages/admin/AdminDashboardLayout.tsx
// 관리자 대시보드의 레이아웃과 헤더를 담당하는 컴포넌트

import React from 'react';

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
  secondary: "#5856d6",            // 보조 액센트 색상
  destructive: "#ff3b30",          // 삭제/위험 상태 색상
  secondaryButton: "#f2f2f7",      // 보조 버튼 배경색
};

/**
 * 시스템 폰트 스택
 */
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * AdminDashboardLayout 컴포넌트 타입 확장
 * 정적 메서드 Loading을 포함하도록 타입 정의
 */
type AdminDashboardLayoutComponent = React.FC<AdminDashboardLayoutProps> & {
  Loading: React.ComponentType; // ✅ React.FC에서 React.ComponentType으로 변경
};

/**
 * 헤더 버튼 Props 타입
 */
interface HeaderButtonProps {
  onClick: () => void;              // 클릭 이벤트 핸들러
  children: React.ReactNode;        // 버튼 내용
  variant?: 'primary' | 'secondary' | 'destructive'; // 버튼 스타일 변형
  isActive?: boolean;               // 활성 상태 여부
}

/**
 * AdminDashboardLayout 컴포넌트 Props 타입
 */
interface AdminDashboardLayoutProps {
  children: React.ReactNode;        // 메인 컨텐츠
  showAdminList: boolean;           // 관리자 목록 표시 상태
  onToggleAdminList: () => void;    // 관리자 목록 토글 함수
  onShowCreateAdminModal: () => void; // 관리자 생성 모달 표시 함수
  onLogout: () => void;             // 로그아웃 함수
}

// ==================== 🔘 헤더 버튼 컴포넌트 ====================

/**
 * 헤더에 사용되는 버튼 컴포넌트
 * 다양한 스타일 변형을 지원
 */
const HeaderButton: React.FC<HeaderButtonProps> = ({
  onClick,
  children,
  variant = 'secondary',
  isActive = false,
}) => {
  // 버튼 스타일 변형에 따른 색상 설정
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: AppleColors.primary,
          color: "white",
        };
      case 'secondary':
        return {
          backgroundColor: isActive ? AppleColors.primary : AppleColors.secondaryButton,
          color: isActive ? "white" : AppleColors.text,
        };
      case 'destructive':
        return {
          backgroundColor: AppleColors.destructive,
          color: "white",
        };
      default:
        return {
          backgroundColor: AppleColors.secondaryButton,
          color: AppleColors.text,
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        ...buttonStyles,
      }}
    >
      {children}
    </button>
  );
};

// ==================== 📋 헤더 컴포넌트 ====================

/**
 * 대시보드 헤더 컴포넌트
 * 제목, 설명, 액션 버튼들을 포함
 */
interface DashboardHeaderProps {
  showAdminList: boolean;
  onToggleAdminList: () => void;
  onShowCreateAdminModal: () => void;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showAdminList,
  onToggleAdminList,
  onShowCreateAdminModal,
  onLogout,
}) => {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "40px",
        gap: "20px",
      }}
    >
      {/* 좌측: 제목 및 설명 */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: AppleColors.text,
            margin: "0 0 8px 0",
            lineHeight: "1.2",
          }}
        >
          🎎 결혼식 초대장 관리자 대시보드
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: AppleColors.secondaryText,
            margin: 0,
            lineHeight: "1.4",
          }}
        >
          그룹 관리, RSVP 응답 확인, 통계 분석을 한눈에
        </p>
      </div>

      {/* 우측: 액션 버튼들 */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <HeaderButton
          onClick={onToggleAdminList}
          variant="secondary"
          isActive={showAdminList}
        >
          👥 관리자 목록
        </HeaderButton>
        
        <HeaderButton
          onClick={onShowCreateAdminModal}
          variant="primary"
        >
          ➕ 관리자 추가
        </HeaderButton>
        
        <HeaderButton
          onClick={onLogout}
          variant="destructive"
        >
          🚪 로그아웃
        </HeaderButton>
      </div>
    </header>
  );
};

// ==================== 🔄 로딩 오버레이 컴포넌트 ====================

/**
 * 전체 화면 로딩 상태를 표시하는 컴포넌트
 */
const LoadingOverlay: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: AppleColors.background,
      fontFamily: systemFont,
    }}
  >
    <div
      style={{
        textAlign: "center",
        color: AppleColors.secondaryText,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${AppleColors.secondaryButton}`,
          borderTop: `3px solid ${AppleColors.primary}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }}
      />
      <div style={{ fontSize: "18px", fontWeight: "500" }}>
        대시보드를 불러오는 중...
      </div>
      <div style={{ fontSize: "14px", marginTop: "4px" }}>
        잠시만 기다려주세요
      </div>
    </div>
  </div>
);

// ==================== 📱 메인 레이아웃 컴포넌트 ====================

/**
 * 관리자 대시보드의 전체 레이아웃을 담당하는 메인 컴포넌트
 * 헤더, 메인 컨텐츠 영역, 반응형 디자인을 포함
 */
const AdminDashboardLayoutBase: React.FC<AdminDashboardLayoutProps> = ({
  children,
  showAdminList,
  onToggleAdminList,
  onShowCreateAdminModal,
  onLogout,
}) => {
  return (
    <div
      style={{
        backgroundColor: AppleColors.background,
        minHeight: "100vh",
        fontFamily: systemFont,
      }}
    >
      {/* 메인 컨테이너 */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
          position: "relative",
        }}
      >
        {/* 대시보드 헤더 */}
        <DashboardHeader
          showAdminList={showAdminList}
          onToggleAdminList={onToggleAdminList}
          onShowCreateAdminModal={onShowCreateAdminModal}
          onLogout={onLogout}
        />

        {/* 메인 컨텐츠 영역 */}
        <main>
          {children}
        </main>
      </div>

      {/* CSS 스타일 정의 */}
      <style>{`
        /* 로딩 애니메이션 */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* 버튼 호버 효과 */
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          /* 모바일에서 헤더 스택 배치 */
          header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          /* 모바일에서 버튼들 전체 너비 */
          header > div:last-child {
            width: 100%;
            justify-content: flex-start;
          }
          
          /* 모바일에서 메인 컨테이너 패딩 조정 */
          .main-container {
            padding: 20px 16px !important;
          }
          
          /* 모바일에서 제목 크기 조정 */
          h1 {
            font-size: 24px !important;
          }
        }
        
        @media (max-width: 480px) {
          /* 매우 작은 화면에서 버튼들 세로 배치 */
          header > div:last-child {
            flex-direction: column;
            width: 100%;
          }
          
          header button {
            width: 100%;
          }
        }
        
        /* 부드러운 전환 효과 */
        * {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

// 정적 속성 할당
const AdminDashboardLayout = AdminDashboardLayoutBase as AdminDashboardLayoutComponent;
AdminDashboardLayout.Loading = LoadingOverlay;

export default AdminDashboardLayout;
// ==================== 📝 사용 예시 ====================
/*
사용 예시:

import AdminDashboardLayout from './admin/AdminDashboardLayout';

// 로딩 상태일 때
if (loading) {
  return <AdminDashboardLayout.Loading />;
}

// 일반 사용
<AdminDashboardLayout
  showAdminList={showAdminList}
  onToggleAdminList={toggleAdminList}
  onShowCreateAdminModal={() => setShowCreateAdminModal(true)}
  onLogout={handleLogout}
>
  <StatsCards stats={stats} />
  <AdminListSection ... />
  <GroupListSection ... />
  <RsvpListSection ... />
</AdminDashboardLayout>
*/