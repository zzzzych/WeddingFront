// src/pages/AdminDashboard.tsx - 최종 메인 파일
// 분리된 컴포넌트들을 조합하여 관리자 대시보드를 구성하는 메인 컴포넌트

import React from "react";
import { useAdminDashboard } from "./admin/hooks/useAdminDashboard";
import AdminDashboardLayout from "./admin/AdminDashboardLayout";
import StatsCards from "./admin/StatsCards";
import AdminListSection from "./admin/AdminListSection";
import WeddingInfoSection from "./admin/WeddingInfoSection";  // 이 줄 추가
import GroupListSection from "./admin/GroupListSection";
import RsvpListSection from "./admin/RsvpListSection";
import CreateGroupModal from "../components/CreateGroupModal";
import CreateAdminModal from "../components/CreateAdminModal";

// ==================== 📱 메인 관리자 대시보드 컴포넌트 ====================

/**
 * 관리자 대시보드 메인 컴포넌트
 * - 커스텀 훅을 통한 상태 및 로직 관리
 * - 분리된 컴포넌트들을 조합하여 완전한 대시보드 구성
 * - 깔끔하고 유지보수하기 쉬운 구조
 */
const AdminDashboard: React.FC = () => {
  // ==================== 🔄 커스텀 훅 사용 ====================
  
  // 모든 상태와 로직을 커스텀 훅으로 분리하여 관리
  const {
    // 상태
    groups,
    loading,
    showCreateModal,
    editingGroupId,
    editingGreeting,
    rsvpData,
    rsvpLoading,
    showCreateAdminModal,
    adminList,
    adminLoading,
    showAdminList,
    editingRsvpId,
    editingRsvpData,

    // 상태 변경 함수들
    setShowCreateModal,
    setEditingGroupId,
    setShowCreateAdminModal,
    setEditingGreeting,
    cancelEditingRsvp,
    handleUpdateRsvp,
    updateEditingRsvpData,
    // 데이터 로딩 함수들
    fetchGroups,

    // 비즈니스 로직 함수들
    handleDeleteGroup,
    handleUpdateGreeting,
    handleUpdateGroupName,
    handleUpdateGroupCode,
    handleDeleteRsvp,
    toggleAdminList,
    handleCreateAdminSuccess,
    startEditingGreeting,
    getTotalStats,
    handleLogout,
    startEditingRsvp,
    handleUpdateGroupFeatures
  } = useAdminDashboard();

  // ==================== 📊 통계 데이터 계산 ====================
  
  const stats = getTotalStats();

  // ==================== 🔄 로딩 상태 처리 ====================
  
    // 초기 로딩 중일 때는 로딩 컴포넌트 표시
    if (loading) {
    const Loading = AdminDashboardLayout.Loading as React.ComponentType;
    return <Loading />;
    }

  // ==================== 🎨 메인 렌더링 ====================
  
  return (
    <AdminDashboardLayout
      showAdminList={showAdminList}
      onToggleAdminList={toggleAdminList}
      onShowCreateAdminModal={() => setShowCreateAdminModal(true)}
      onLogout={handleLogout}
    >
      {/* ==================== 📊 통계 카드 섹션 ==================== */}
      <StatsCards stats={stats} loading={false} />

      {/* ==================== 👥 관리자 목록 섹션 ==================== */}
      <AdminListSection
        showAdminList={showAdminList}
        adminList={adminList}
        adminLoading={adminLoading}
      />

      {/* ==================== 🎭 결혼식 기본 정보 섹션 ==================== */}
      <WeddingInfoSection />

      {/* ==================== 📋 그룹 목록 섹션 ==================== */}
      <GroupListSection
        groups={groups}
        rsvpData={rsvpData}
        editingGroupId={editingGroupId}
        editingGreeting={editingGreeting}
        onShowCreateModal={() => setShowCreateModal(true)}
        onStartEditingGreeting={startEditingGreeting}
        onUpdateGreeting={handleUpdateGreeting}
        onUpdateGroupName={handleUpdateGroupName}
        onUpdateGroupCode={handleUpdateGroupCode}
        onDeleteGroup={handleDeleteGroup}
        onCancelEditing={() => setEditingGroupId(null)}
       onEditingGreetingChange={(value: string) => {
        setEditingGreeting(value);  // 👈 이렇게 간단하게 수정하세요
      }}
      onUpdateGroupFeatures={handleUpdateGroupFeatures}
      />

      {/* ==================== 📊 RSVP 응답 목록 섹션 ==================== */}
      <RsvpListSection
        rsvpData={rsvpData}
        rsvpLoading={rsvpLoading}
        onDeleteRsvp={handleDeleteRsvp}
        // 새로 추가할 props들
        editingRsvpId={editingRsvpId}
        editingRsvpData={editingRsvpData}
        onStartEditingRsvp={startEditingRsvp}
        onCancelEditingRsvp={cancelEditingRsvp}
        onUpdateRsvp={handleUpdateRsvp}
        onUpdateEditingRsvpData={updateEditingRsvpData}
      />

      {/* ==================== 🔧 모달들 ==================== */}
      
      {/* 그룹 생성 모달 */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups(); // 그룹 목록 새로고침
          }}
        />
      )}

      {/* 관리자 생성 모달 */}
      {showCreateAdminModal && (
        <CreateAdminModal
          isOpen={showCreateAdminModal}
          onClose={() => setShowCreateAdminModal(false)}
          onSuccess={handleCreateAdminSuccess}
        />
      )}
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;

// ==================== 📝 컴포넌트 구조 설명 ====================
/*
컴포넌트 구조:

AdminDashboard (메인)
├── useAdminDashboard (커스텀 훅 - 모든 상태와 로직)
├── AdminDashboardLayout (레이아웃 및 헤더)
│   ├── DashboardHeader (제목, 설명, 버튼들)
│   └── main (메인 컨텐츠 영역)
├── StatsCards (통계 카드들)
│   └── StatCard × 4 (개별 통계 카드)
├── AdminListSection (관리자 목록)
│   └── AdminCard × N (개별 관리자 카드)
├── GroupListSection (그룹 목록)
│   └── GroupCard × N (개별 그룹 카드)
├── RsvpListSection (RSVP 응답 목록)
│   ├── StatsCard × 4 (RSVP 통계)
│   └── RsvpCard × N (개별 RSVP 카드)
└── Modals (모달들)
    ├── CreateGroupModal (그룹 생성)
    └── CreateAdminModal (관리자 생성)

장점:
✅ 각 컴포넌트가 단일 책임만 담당
✅ 재사용 가능한 컴포넌트 구조
✅ 유지보수하기 쉬운 코드
✅ 테스트하기 쉬운 구조
✅ 성능 최적화 가능 (필요한 부분만 리렌더링)
*/