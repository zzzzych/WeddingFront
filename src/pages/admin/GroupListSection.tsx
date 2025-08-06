// src/pages/admin/GroupListSection.tsx - Part 1
// 그룹 목록을 표시하고 관리하는 섹션 컴포넌트

import React from 'react';
import { InvitationGroup, RsvpListResponse } from '../../types';

// ==================== 🎨 스타일 설정 ====================

/**
 * 애플 디자인 시스템 색상 팔레트
 */
const AppleColors = {
  cardBackground: "#ffffff",       // 카드 배경색
  text: "#1d1d1f",                // 주요 텍스트 색상
  secondaryText: "#86868b",        // 보조 텍스트 색상
  primary: "#007aff",              // 주요 액센트 색상
  secondary: "#5856d6",            // 보조 액센트 색상
  success: "#34c759",              // 성공 상태 색상
  warning: "#ff9500",              // 경고 상태 색상
  destructive: "#ff3b30",          // 삭제/위험 상태 색상
  border: "#d2d2d7",               // 테두리 색상
  inputBackground: "#f2f2f7",      // 입력 필드 배경색
  secondaryButton: "#f2f2f7",      // 보조 버튼 배경색
};

/**
 * 시스템 폰트 스택
 */
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📊 타입 정의 ====================

/**
 * GroupListSection 컴포넌트 Props 타입
 */
interface GroupListSectionProps {
  groups: InvitationGroup[];                    // 그룹 목록 데이터
  rsvpData: RsvpListResponse | null;            // RSVP 데이터 (통계용)
  editingGroupId: string | null;                // 현재 편집 중인 그룹 ID
  editingGreeting: string;                      // 편집 중인 인사말
  onShowCreateModal: () => void;                // 그룹 생성 모달 표시 함수
  onStartEditingGreeting: (group: InvitationGroup) => void; // 인사말 편집 시작
  onUpdateGreeting: (groupId: string, newGreeting: string) => void; // 인사말 업데이트
  onUpdateGroupName: (groupId: string, newName: string) => void; // 그룹명 업데이트
  onUpdateGroupCode: (groupId: string, newCode: string) => void; // URL 코드 업데이트
  onDeleteGroup: (groupId: string, groupName: string) => void; // 그룹 삭제
  onCancelEditing: () => void;                  // 편집 취소
  onEditingGreetingChange: (value: string) => void; // 편집 중인 인사말 변경
}

/**
 * 개별 그룹 카드 Props 타입
 */
interface GroupCardProps {
  group: InvitationGroup;                       // 그룹 데이터
  rsvpData: RsvpListResponse | null;            // RSVP 데이터
  isEditing: boolean;                           // 편집 모드 여부
  editingGreeting: string;                      // 편집 중인 인사말
  onStartEditingGreeting: (group: InvitationGroup) => void;
  onUpdateGreeting: (groupId: string, newGreeting: string) => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
  onUpdateGroupCode: (groupId: string, newCode: string) => void;
  onDeleteGroup: (groupId: string, groupName: string) => void;
  onCancelEditing: () => void;
  onEditingGreetingChange: (value: string) => void;
}

// ==================== 🔧 유틸리티 함수들 ====================

/**
 * 그룹 타입 표시 텍스트 변환 함수
 */
const getGroupTypeDisplay = (type: string) => {
  const typeMap: { [key: string]: string } = {
    WEDDING_GUEST: "🎎 결혼식 초대",
    PARENTS_GUEST: "👨‍👩‍👧‍👦 부모님",
    COMPANY_GUEST: "🏢 회사",
  };
  return typeMap[type] || type;
};

/**
 * 그룹별 RSVP 통계 계산 함수
 */
const getGroupStats = (groupName: string, rsvpData: RsvpListResponse | null) => {
  if (!rsvpData) {
    return { totalResponses: 0, attending: 0, notAttending: 0 };
  }

  const groupResponses = rsvpData.responses.filter(r => r.groupName === groupName);
  return {
    totalResponses: groupResponses.length,
    attending: groupResponses.filter(r => r.willAttend === true).length,
    notAttending: groupResponses.filter(r => r.willAttend === false).length,
  };
};

// src/pages/admin/GroupListSection.tsx - Part 2
// 그룹 카드 및 메인 컴포넌트

// ==================== 🃏 개별 그룹 카드 컴포넌트 ====================

/**
 * 개별 그룹 정보를 표시하고 편집할 수 있는 카드 컴포넌트
 */
const GroupCard: React.FC<GroupCardProps> = ({
  group,
  rsvpData,
  isEditing,
  editingGreeting,
  onStartEditingGreeting,
  onUpdateGreeting,
  onUpdateGroupName,
  onUpdateGroupCode,
  onDeleteGroup,
  onCancelEditing,
  onEditingGreetingChange,
}) => {
  const stats = getGroupStats(group.groupName, rsvpData);

  return (
    <div
      style={{
        border: `1px solid ${AppleColors.border}`,
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: AppleColors.inputBackground,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        {/* 그룹 정보 영역 */}
        <div style={{ flex: 1 }}>
          {/* 그룹명 및 타입 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: 0,
              }}
            >
              {group.groupName}
            </h3>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                backgroundColor: AppleColors.primary,
                color: "white",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              {getGroupTypeDisplay(group.groupType.toString())}
            </span>
          </div>

          {/* 초대장 URL */}
          <div
            style={{
              fontSize: "14px",
              color: AppleColors.secondaryText,
              marginBottom: "12px",
            }}
          >
            🔗 초대장 URL:{" "}
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                backgroundColor: AppleColors.cardBackground,
                padding: "2px 6px",
                borderRadius: "4px",
                border: `1px solid ${AppleColors.border}`,
              }}
            >
              https://leelee.kr/{group.uniqueCode}
            </span>
          </div>

          {/* 인사말 편집 영역 */}
          {isEditing ? (
            <div style={{ marginBottom: "12px" }}>
              <textarea
                value={editingGreeting}
                onChange={(e) => onEditingGreetingChange(e.target.value)}
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "8px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                  resize: "vertical",
                  backgroundColor: AppleColors.cardBackground,
                }}
                placeholder="그룹별 인사말을 입력하세요..."
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={() => onUpdateGreeting(group.id!, editingGreeting)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: AppleColors.success,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  ✅ 저장
                </button>
                <button
                  onClick={onCancelEditing}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: AppleColors.secondaryButton,
                    color: AppleColors.text,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  ❌ 취소
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.text,
                marginBottom: "12px",
                fontStyle: "italic",
                lineHeight: "1.4",
                backgroundColor: AppleColors.cardBackground,
                padding: "8px",
                borderRadius: "6px",
                border: `1px solid ${AppleColors.border}`,
              }}
            >
              💬 "{group.greetingMessage}"
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "16px" }}>
          <button
            onClick={() => onStartEditingGreeting(group)}
            style={{
              padding: "8px 16px",
              backgroundColor: AppleColors.secondaryButton,
              color: AppleColors.text,
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            ✏️ 인사말 수정
          </button>
          <button
            onClick={() => {
              const newName = prompt("새로운 그룹 이름을 입력하세요:", group.groupName);
              if (newName && newName.trim()) {
                onUpdateGroupName(group.id!, newName.trim());
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: AppleColors.warning,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            🏷️ 이름 변경
          </button>
          <button
            onClick={() => {
              const newCode = prompt("새로운 URL 코드를 입력하세요:", group.uniqueCode);
              if (newCode && newCode.trim()) {
                onUpdateGroupCode(group.id!, newCode.trim());
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: AppleColors.secondary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            🔗 URL 변경
          </button>
          <button
            onClick={() => onDeleteGroup(group.id!, group.groupName)}
            style={{
              padding: "8px 16px",
              backgroundColor: AppleColors.destructive,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      {/* 그룹 통계 미리보기 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "12px",
          padding: "16px",
          backgroundColor: AppleColors.cardBackground,
          borderRadius: "8px",
          border: `1px solid ${AppleColors.border}`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "2px" }}>
            총 응답
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: AppleColors.text }}>
            {stats.totalResponses}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "2px" }}>
            참석
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: AppleColors.success }}>
            {stats.attending}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: AppleColors.secondaryText, marginBottom: "2px" }}>
            불참
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: AppleColors.destructive }}>
            {stats.notAttending}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 📭 빈 그룹 목록 컴포넌트 ====================

/**
 * 그룹이 없을 때 표시하는 컴포넌트
 */
const EmptyGroupList: React.FC<{ onShowCreateModal: () => void }> = ({ onShowCreateModal }) => (
  <div
    style={{
      textAlign: "center",
      padding: "60px 20px",
      color: AppleColors.secondaryText,
    }}
  >
    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
    <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: AppleColors.text }}>
      아직 생성된 그룹이 없습니다
    </div>
    <div style={{ fontSize: "14px", marginBottom: "24px" }}>
      첫 번째 초대 그룹을 만들어보세요!
    </div>
    <button
      onClick={onShowCreateModal}
      style={{
        padding: "12px 24px",
        backgroundColor: AppleColors.primary,
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      ➕ 첫 그룹 만들기
    </button>
  </div>
);

// ==================== 📋 메인 그룹 목록 섹션 컴포넌트 ====================

/**
 * 그룹 목록을 표시하고 관리하는 메인 섹션 컴포넌트
 */
const GroupListSection: React.FC<GroupListSectionProps> = ({
  groups,
  rsvpData,
  editingGroupId,
  editingGreeting,
  onShowCreateModal,
  onStartEditingGreeting,
  onUpdateGreeting,
  onUpdateGroupName,
  onUpdateGroupCode,
  onDeleteGroup,
  onCancelEditing,
  onEditingGreetingChange,
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          📋 초대 그룹 관리
          {groups.length > 0 && (
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
              {groups.length}개
            </span>
          )}
        </h2>
        
        {groups.length > 0 && (
          <button
            onClick={onShowCreateModal}
            style={{
              padding: "12px 24px",
              backgroundColor: AppleColors.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ➕ 새 그룹 생성
          </button>
        )}
      </div>

      {/* 그룹 목록 컨텐츠 */}
      <div style={{ padding: "24px" }}>
        {groups.length === 0 ? (
          <EmptyGroupList onShowCreateModal={onShowCreateModal} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                rsvpData={rsvpData}
                isEditing={editingGroupId === group.id}
                editingGreeting={editingGreeting}
                onStartEditingGreeting={onStartEditingGreeting}
                onUpdateGreeting={onUpdateGreeting}
                onUpdateGroupName={onUpdateGroupName}
                onUpdateGroupCode={onUpdateGroupCode}
                onDeleteGroup={onDeleteGroup}
                onCancelEditing={onCancelEditing}
                onEditingGreetingChange={onEditingGreetingChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupListSection;