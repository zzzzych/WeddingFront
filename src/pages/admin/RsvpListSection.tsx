// src/pages/admin/RsvpListSection.tsx
// RSVP 응답 목록을 표시하고 관리하는 섹션 컴포넌트

import React from "react";
import { RsvpListResponse, getAttendanceStatus } from "../../types";

// ==================== 🎨 스타일 설정 ====================

/**
 * 애플 디자인 시스템 색상 팔레트
 */
const AppleColors = {
  cardBackground: "#ffffff", // 카드 배경색
  text: "#1d1d1f", // 주요 텍스트 색상
  secondaryText: "#86868b", // 보조 텍스트 색상
  primary: "#007aff", // 주요 액센트 색상
  success: "#34c759", // 성공 상태 색상
  warning: "#ff9500", // 경고 상태 색상
  destructive: "#ff3b30", // 삭제/위험 상태 색상
  border: "#d2d2d7", // 테두리 색상
  inputBackground: "#f2f2f7", // 입력 필드 배경색
  secondaryButton: "#f2f2f7", // 보조 버튼 배경색 (이 줄 추가)
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
  rsvpData: RsvpListResponse | null; // RSVP 데이터
  rsvpLoading: boolean; // RSVP 로딩 상태
  onDeleteRsvp: (rsvpId: string, guestName: string) => void; // RSVP 삭제 함수
  // 새로 추가되는 편집 관련 props
  editingRsvpId?: string | null; // 현재 편집 중인 RSVP ID
  editingRsvpData?: any; // 편집 중인 RSVP 데이터
  onStartEditingRsvp?: (rsvp: any) => void; // RSVP 편집 시작 함수
  onCancelEditingRsvp?: () => void; // RSVP 편집 취소 함수
  onUpdateRsvp?: (rsvpId: string, updateData: any) => void; // RSVP 업데이트 함수
  onUpdateEditingRsvpData?: (field: string, value: any) => void; // 편집 데이터 업데이트
}

/**
 * 개별 RSVP 카드 Props 타입 (업데이트됨)
 */
interface RsvpCardProps {
  rsvp: any; // RSVP 응답 데이터 (변환된 형태)
  onDeleteRsvp: (rsvpId: string, guestName: string) => void;
  // 새로 추가되는 편집 관련 props
  isEditing?: boolean; // 현재 편집 중인지 여부
  editingData?: any; // 편집 중인 데이터
  onStartEditingRsvp?: (rsvp: any) => void;
  onCancelEditingRsvp?: () => void;
  onUpdateRsvp?: (rsvpId: string, updateData: any) => void;
  onUpdateEditingRsvpData?: (field: string, value: any) => void;
}

/**
 * 통계 카드 Props 타입
 */
interface StatsCardProps {
  title: string; // 통계 제목
  value: number; // 통계 값
  color: string; // 값 색상
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
 * 개별 RSVP 응답을 표시하고 편집할 수 있는 카드 컴포넌트 (완전 수정됨)
 */
const RsvpCard: React.FC<RsvpCardProps> = ({
  rsvp,
  onDeleteRsvp,
  isEditing = false,
  editingData,
  onStartEditingRsvp,
  onCancelEditingRsvp,
  onUpdateRsvp,
  onUpdateEditingRsvpData,
}) => {
  // 참석 상태에 따른 색상 결정
  const getStatusColor = (willAttend: boolean) => {
    return willAttend ? AppleColors.success : AppleColors.destructive;
  };

  /**
   * 참석자 정보를 표시하는 함수 (수정됨 - 참석자 이름 포함)
   */
  const getAttendeeInfo = (rsvp: any) => {
    const totalCount = rsvp.response?.totalCount || 0;
    const attendeeNames = rsvp.response?.attendeeNames || [];

    // 불참인 경우
    if (!rsvp.willAttend && !rsvp.response?.isAttending) {
      return "불참";
    }

    // 참석인 경우
    if (totalCount > 0) {
      const countText = `${totalCount}명`;

      // 참석자 이름이 있는 경우
      if (attendeeNames.length > 0) {
        if (attendeeNames.length === 1) {
          // 1명인 경우: "이지환 (1명)"
          return `${attendeeNames[0]} (${countText})`;
        } else if (attendeeNames.length <= 3) {
          // 2-3명인 경우: "이지환, 김철수 (2명)" 또는 "이지환, 김철수, 박영희 (3명)"
          return `${attendeeNames.join(", ")} (${countText})`;
        } else {
          // 4명 이상인 경우: "이지환 외 3명 (4명)"
          return `${attendeeNames[0]} 외 ${
            attendeeNames.length - 1
          }명 (${countText})`;
        }
      } else {
        // 이름이 없고 인원만 있는 경우 (기존 데이터 호환성)
        return countText;
      }
    }

    return "0명";
  };

  // 편집 모드일 때
  if (isEditing && editingData) {
    return (
      <div
        style={{
          border: `2px solid ${AppleColors.primary}`,
          borderRadius: "12px",
          padding: "24px",
          backgroundColor: AppleColors.cardBackground,
          boxShadow: "0 4px 12px rgba(0, 122, 255, 0.15)",
          marginBottom: "16px",
        }}
      >
        {/* 편집 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: AppleColors.primary,
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            ✏️ RSVP 응답 편집
          </h4>
          <span
            style={{
              fontSize: "12px",
              color: AppleColors.secondaryText,
              backgroundColor: AppleColors.inputBackground,
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            {rsvp.groupName || rsvp.groupInfo?.groupName || "그룹 없음"}
          </span>
        </div>

        {/* 편집 폼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 첫 번째 행: 기본 정보 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* 대표 응답자 이름 */}
            <div>
              <label
                style={{
                  fontSize: "14px",
                  color: AppleColors.text,
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                대표 응답자 이름
              </label>
              <input
                type="text"
                value={editingData.responderName || ""} // null/undefined 방지
                onChange={(e) =>
                  onUpdateEditingRsvpData?.("responderName", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                  boxSizing: "border-box",
                }}
                placeholder="응답자 이름을 입력하세요"
              />
            </div>

            {/* 참석 여부 */}
            <div>
              <label
                style={{
                  fontSize: "14px",
                  color: AppleColors.text,
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                참석 여부
              </label>
              {/* 참석 여부 선택 드롭다운 수정 */}
              <select
                value={editingData.isAttending ? "참석" : "불참"} // 명시적 비교로 변경
                onChange={(e) => {
                  const isAttending = e.target.value === "참석";
                  console.log("🎯 참석 여부 변경 요청:", isAttending); // 디버깅용
                  console.log(
                    "🎯 현재 editingData.isAttending:",
                    editingData.isAttending
                  ); // 추가 디버깅

                  if (onUpdateEditingRsvpData) {
                    // 🔧 수정: 한 번에 모든 상태를 업데이트하도록 변경
                    if (!isAttending) {
                      // 불참 선택 시 - 모든 필드를 하나의 객체로 한번에 업데이트
                      console.log("🚫 불참 선택 - 모든 필드 한번에 초기화"); // 디버깅용

                      // 불참 상태의 완전한 데이터 객체 생성
                      const notAttendingData = {
                        ...editingData,
                        isAttending: false,
                        totalCount: 0,
                        attendeeNames: [],
                      };

                      // 한 번의 호출로 모든 상태 업데이트
                      onUpdateEditingRsvpData("_bulk_update", notAttendingData);
                    } else {
                      // 참석 선택 시
                      console.log("✅ 참석 선택 - 기본값 설정"); // 디버깅용

                      // 현재 totalCount가 0이거나 없으면 1로 설정
                      const currentCount = editingData.totalCount || 0;
                      const newTotalCount =
                        currentCount === 0 ? 1 : currentCount;
                      const newAttendeeNames =
                        currentCount === 0
                          ? [""]
                          : editingData.attendeeNames || [""];

                      // 참석 상태의 완전한 데이터 객체 생성
                      const attendingData = {
                        ...editingData,
                        isAttending: true,
                        totalCount: newTotalCount,
                        attendeeNames: newAttendeeNames,
                      };

                      // 한 번의 호출로 모든 상태 업데이트
                      onUpdateEditingRsvpData("_bulk_update", attendingData);
                    }
                  } else {
                    console.error("❌ onUpdateEditingRsvpData 함수가 없음"); // 디버깅용
                  }
                }}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: AppleColors.inputBackground,
                  minWidth: "100px",
                }}
              >
                <option value="참석">참석</option>
                <option value="불참">불참</option>
              </select>
            </div>
          </div>

          {/* 참석인 경우에만 표시 */}
          {/* 참석 인원 및 이름 (항상 표시, 불참시 비활성화) */}
          <>
            {/* 두 번째 행: 참석 인원 */}
            <div style={{ opacity: editingData.isAttending ? 1 : 0.5 }}>
              <label
                style={{
                  fontSize: "14px",
                  color: AppleColors.text,
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                총 참석 인원
              </label>
              <select
                value={editingData.totalCount || 1}
                disabled={!editingData.isAttending} // 불참시 비활성화
                onChange={(e) => {
                  if (!editingData.isAttending) return; // 불참시 변경 방지

                  const newCount = parseInt(e.target.value) || 1;
                  console.log("🔢 인원 수 변경 (select):", newCount);

                  if (onUpdateEditingRsvpData) {
                    onUpdateEditingRsvpData("totalCount", newCount);

                    const currentNames = editingData.attendeeNames || [];
                    let newNames = [...currentNames];

                    if (newCount > currentNames.length) {
                      while (newNames.length < newCount) {
                        newNames.push("");
                      }
                    } else if (newCount < currentNames.length) {
                      newNames = newNames.slice(0, newCount);
                    }

                    onUpdateEditingRsvpData("attendeeNames", newNames);
                  }
                }}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: editingData.isAttending
                    ? AppleColors.inputBackground
                    : "#f0f0f0",
                  minWidth: "80px",
                  cursor: editingData.isAttending ? "pointer" : "not-allowed",
                }}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((count) => (
                  <option key={count} value={count}>
                    {count}명
                  </option>
                ))}
              </select>
            </div>

            {/* 참석자 이름들 (항상 표시, 불참시 비활성화) */}
            {editingData.totalCount > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  opacity: editingData.isAttending ? 1 : 0.5,
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    color: AppleColors.text,
                    fontWeight: "500",
                  }}
                >
                  참석자 이름 ({editingData.totalCount}명)
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {Array.from(
                    { length: editingData.totalCount },
                    (_, index) => (
                      <input
                        key={index}
                        type="text"
                        disabled={!editingData.isAttending} // 불참시 비활성화
                        value={editingData.attendeeNames?.[index] || ""}
                        onChange={(e) => {
                          console.log(`🔄 참석자 ${index} 이름 변경:`, e.target.value);

                          if (!editingData.isAttending) return;

                          if (onUpdateEditingRsvpData) {
                            const newNames = [...(editingData.attendeeNames || [])];
                            
                            while (newNames.length <= index) {
                              newNames.push("");
                            }
                            
                            newNames[index] = e.target.value;
                            
                            console.log("🔄 업데이트될 이름 배열:", newNames);
                            
                            const updatedData = {
                              ...editingData,
                              attendeeNames: newNames,
                              responderName: index === 0 ? e.target.value : editingData.responderName
                            };
                            
                            onUpdateEditingRsvpData("_bulk_update", updatedData);
                          }
                        }}
                        placeholder={
                          index === 0
                            ? "대표 참석자 이름"
                            : `${index + 1}번째 참석자`
                        }
                        style={{
                          padding: "8px 12px",
                          border: `1px solid ${AppleColors.border}`,
                          borderRadius: "8px",
                          fontSize: "16px",
                          backgroundColor: editingData.isAttending
                            ? AppleColors.inputBackground
                            : "#f0f0f0",
                          cursor: editingData.isAttending
                            ? "text"
                            : "not-allowed",
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </>

          {/* 네 번째 행: 연락처와 메시지 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "16px",
            }}
          >
            {/* 전화번호 */}
            <div>
              <label
                style={{
                  fontSize: "14px",
                  color: AppleColors.text,
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                전화번호 (선택사항)
              </label>
              <input
                type="tel"
                value={editingData.phoneNumber || ""} // null/undefined 방지
                onChange={(e) => {
                  console.log("🔄 전화번호 변경:", e.target.value); // 디버깅용
                  if (onUpdateEditingRsvpData) {
                    onUpdateEditingRsvpData("phoneNumber", e.target.value);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                  boxSizing: "border-box",
                }}
                placeholder="010-1234-5678"
              />
            </div>

            {/* 메시지 */}
            <div>
              <label
                style={{
                  fontSize: "14px",
                  color: AppleColors.text,
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                메시지 (선택사항)
              </label>
              <textarea
                value={editingData.message || ""} // null/undefined 방지
                onChange={(e) => {
                  console.log("🔄 메시지 변경:", e.target.value); // 디버깅용
                  if (onUpdateEditingRsvpData) {
                    onUpdateEditingRsvpData("message", e.target.value);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${AppleColors.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: systemFont,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                rows={3}
                placeholder="메시지를 입력하세요"
              />
            </div>
          </div>

          {/* 편집 버튼들 */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "8px",
            }}
          >
            <button
              onClick={onCancelEditingRsvp}
              style={{
                padding: "12px 24px",
                backgroundColor: AppleColors.secondaryButton,
                color: AppleColors.text,
                border: "none",
                borderRadius: "8px",
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
              💾 저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 일반 표시 모드 (이전에 수정한 내용 그대로)
  return (
    <div
      style={{
        border: `1px solid ${AppleColors.border}`,
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: AppleColors.inputBackground,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        transition: "all 0.2s ease",
        marginBottom: "12px",
      }}
    >
      {/* 왼쪽 정보 영역 */}
      <div style={{ flex: 1 }}>
        {/* 상단: 응답자 이름, 그룹명, 참석 상태 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
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
            {rsvp.guestName || rsvp.response?.responderName || "이름 없음"}
          </span>

          {/* 그룹명 */}
          <span
            style={{
              fontSize: "12px",
              color: AppleColors.secondaryText,
              backgroundColor: AppleColors.cardBackground,
              padding: "2px 8px",
              borderRadius: "4px",
              border: `1px solid ${AppleColors.border}`,
            }}
          >
            {rsvp.groupName || rsvp.groupInfo?.groupName || "그룹 없음"}
          </span>

          {/* 참석 상태 뱃지 */}
          <span
            style={{
              fontSize: "12px",
              color: "white",
              backgroundColor: getStatusColor(
                rsvp.willAttend ?? rsvp.response?.isAttending
              ),
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {rsvp.willAttend ?? rsvp.response?.isAttending ? "참석" : "불참"}
          </span>
        </div>

        {/* 하단: 상세 정보 */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "14px",
            color: AppleColors.secondaryText,
            flexWrap: "wrap",
          }}
        >
          {/* 참석자 정보 (수정됨 - 이름 포함) */}
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            👥 {getAttendeeInfo(rsvp)}
          </span>

          {/* 전화번호 */}
          {(rsvp.phoneNumber || rsvp.response?.phoneNumber) && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              📞 {rsvp.phoneNumber || rsvp.response?.phoneNumber}
            </span>
          )}

          {/* 메시지 */}
          {(rsvp.message || rsvp.response?.message) && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              💬{" "}
              {(() => {
                const message = rsvp.message || rsvp.response?.message;
                return message.length > 20
                  ? message.substring(0, 20) + "..."
                  : message;
              })()}
            </span>
          )}
        </div>
      </div>

      {/* 오른쪽 액션 버튼들 */}
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
          onClick={() =>
            onDeleteRsvp(
              rsvp.id,
              rsvp.guestName || rsvp.response?.responderName
            )
          }
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
    <div
      style={{
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "8px",
        color: AppleColors.text,
      }}
    >
      아직 RSVP 응답이 없습니다
    </div>
    <div style={{ fontSize: "14px" }}>초대장을 공유하고 응답을 받아보세요!</div>
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {rsvpData.responses.map((rsvp) => (
                <RsvpCard
                  key={rsvp.id}
                  rsvp={rsvp}
                  onDeleteRsvp={onDeleteRsvp}
                  // 새로 추가할 편집 관련 props들
                  isEditing={editingRsvpId === rsvp.id}
                  editingData={
                    editingRsvpId === rsvp.id ? editingRsvpData : null
                  }
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