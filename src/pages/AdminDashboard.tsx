import React, { useState, useEffect } from "react";
import {
  getAllGroups,
  deleteGroup,
  updateGroup,
} from "../services/invitationService";
import { InvitationGroup } from "../types";
import CreateGroupModal from "../components/CreateGroupModal";

// 애플 디자인 색상 팔레트
const AppleColors = {
  background: "#f5f5f7",
  cardBackground: "#ffffff",
  text: "#1d1d1f",
  secondaryText: "#86868b",
  primary: "#007aff",
  primaryHover: "#0056d3",
  secondary: "#5856d6",
  success: "#34c759",
  warning: "#ff9500",
  destructive: "#ff3b30",
  border: "#d2d2d7",
  inputBackground: "#f2f2f7",
  secondaryButton: "#f2f2f7",
  secondaryButtonHover: "#e5e5ea",
};

// 시스템 폰트
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const AdminDashboard: React.FC = () => {
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGreeting, setEditingGreeting] = useState("");
  const [isEditingWeddingInfo, setIsEditingWeddingInfo] = useState(false);

  // 결혼식 기본 정보 상태
  const [weddingInfo, setWeddingInfo] = useState({
    groomName: "이지환",
    brideName: "이윤진",
    weddingDate: "2025-10-25",
    weddingTime: "18:00",
    weddingLocation: "포포인츠 바이쉐라톤 조선 서울역 19층",
    address: "서울특별시 용산구 한강대로 366",
    greetingMessage:
      "두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n지환, 윤진 결혼합니다.",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getAllGroups();
      setGroups(data);
    } catch (error) {
      console.error("그룹 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  //그룹 삭제
  const handleDeleteGroup = async (groupId: string) => {
    try {
      // 1차 삭제 시도
      const confirmDelete = window.confirm(
        "정말로 이 그룹을 삭제하시겠습니까?"
      );
      if (!confirmDelete) return;

      console.log("🗑️ 일반 삭제 시도:", groupId);
      await deleteGroup(groupId, false); // 일반 삭제 시도
      await fetchGroups();
      alert("그룹이 삭제되었습니다.");
    } catch (error: any) {
      console.error("그룹 삭제 실패:", error);

      // 409 Conflict 에러 또는 응답이 있는 그룹인 경우
      if (
        error.message &&
        (error.message.includes("응답이 있는") ||
          error.message.includes("응답이") ||
          error.message.includes("force=true"))
      ) {
        // 응답 수 추출 (에러 메시지에서)
        const responseCount =
          error.message.match(/(\d+)개의 응답/)?.[1] || "여러";

        const forceConfirm = window.confirm(
          `⚠️ 강제 삭제 확인\n\n` +
            `이 그룹에는 ${responseCount}개의 응답이 있습니다.\n` +
            `응답 데이터와 함께 그룹을 강제로 삭제하시겠습니까?\n\n` +
            `주의: 이 작업은 되돌릴 수 없습니다!\n` +
            `- 그룹 정보 삭제\n` +
            `- 모든 응답 데이터 삭제`
        );

        if (forceConfirm) {
          try {
            console.log("🔥 강제 삭제 시도:", groupId);
            await deleteGroup(groupId, true); // 강제 삭제
            await fetchGroups();
            alert(
              `✅ 성공!\n그룹과 ${responseCount}개의 응답이 모두 삭제되었습니다.`
            );
          } catch (forceError: any) {
            console.error("강제 삭제 실패:", forceError);
            alert(
              `❌ 강제 삭제 실패\n${
                forceError.message || "알 수 없는 오류"
              }\n\n관리자에게 문의하세요.`
            );
          }
        }
      } else {
        // 기타 에러
        alert(
          `❌ 삭제 실패\n${error.message || "알 수 없는 오류가 발생했습니다."}`
        );
      }
    }
  };

  const handleUpdateGreeting = async (groupId: string, newGreeting: string) => {
    try {
      // updateGroup을 사용하여 인사말 업데이트
      await updateGroup(groupId, { greetingMessage: newGreeting });
      await fetchGroups();
      setEditingGroupId(null);
      alert("인사말이 업데이트되었습니다.");
    } catch (error) {
      console.error("인사말 업데이트 실패:", error);
      alert("인사말 업데이트에 실패했습니다.");
    }
  };

  const handleUpdateGroupName = async (groupId: string, newName: string) => {
    try {
      // updateGroup을 사용하여 그룹명 업데이트
      await updateGroup(groupId, { groupName: newName });
      await fetchGroups();
      alert("그룹 이름이 업데이트되었습니다.");
    } catch (error) {
      console.error("그룹 이름 업데이트 실패:", error);
      alert("그룹 이름 업데이트에 실패했습니다.");
    }
  };

  const startEditingGreeting = (group: InvitationGroup) => {
    setEditingGroupId(group.id || null);
    setEditingGreeting(group.greetingMessage || "");
  };

  const getGroupTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      WEDDING_GUEST: "🎎 결혼식 초대",
      PARENTS_GUEST: "👨‍👩‍👧‍👦 부모님",
      COMPANY_GUEST: "🏢 회사",
    };
    return typeMap[type] || type;
  };

  const getTotalStats = () => {
    return {
      totalGroups: groups.length,
      // 임시로 0으로 설정 (해당 필드가 없으므로)
      totalGuests: 0,
      totalResponses: 0,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
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
            fontSize: "18px",
            color: AppleColors.secondaryText,
          }}
        >
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: AppleColors.background,
        minHeight: "100vh",
        fontFamily: systemFont,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* 헤더 섹션 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "24px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: AppleColors.text,
                  margin: "0 0 8px 0",
                  fontFamily: systemFont,
                }}
              >
                웨딩 초대장 관리
              </h1>
              <p
                style={{
                  fontSize: "17px",
                  color: AppleColors.secondaryText,
                  margin: "0",
                  fontFamily: systemFont,
                }}
              >
                그룹별 청첩장을 관리하고 응답을 확인하세요
              </p>
            </div>
            {/* 기존의 단일 버튼 부분을 이 코드로 교체 */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {/* 로그아웃 버튼 */}
              <button
                onClick={() => {
                  if (window.confirm("로그아웃하시겠습니까?")) {
                    // 홈페이지로 이동
                    window.location.href = "/";
                  }
                }}
                style={{
                  backgroundColor: AppleColors.secondaryButton,
                  color: AppleColors.text,
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: systemFont,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    AppleColors.secondaryButtonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    AppleColors.secondaryButton;
                }}
              >
                🚪 로그아웃
              </button>

              {/* 새 그룹 생성 버튼 (기존 코드 그대로) */}
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: AppleColors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: systemFont,
                  boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    AppleColors.primaryHover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 123, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = AppleColors.primary;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 123, 255, 0.3)";
                }}
              >
                + 새 그룹 생성
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                title: "총 그룹 수",
                value: stats.totalGroups,
                icon: "👥",
                color: AppleColors.primary,
              },
              {
                title: "예상 하객",
                value: stats.totalGuests,
                icon: "📊",
                color: AppleColors.secondary,
              },
              {
                title: "실제 응답",
                value: stats.totalResponses,
                icon: "✅",
                color: AppleColors.success,
              },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: AppleColors.inputBackground,
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  border: `1px solid ${AppleColors.border}`,
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    marginBottom: "8px",
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: stat.color,
                    marginBottom: "4px",
                    fontFamily: systemFont,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: AppleColors.secondaryText,
                    fontWeight: "500",
                    fontFamily: systemFont,
                  }}
                >
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결혼식 기본 정보 섹션 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0",
                fontFamily: systemFont,
              }}
            >
              💒 결혼식 기본 정보
            </h3>
            <button
              onClick={() => setIsEditingWeddingInfo(!isEditingWeddingInfo)}
              style={{
                backgroundColor: isEditingWeddingInfo
                  ? AppleColors.destructive
                  : AppleColors.primary,
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: systemFont,
                boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 123, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 123, 255, 0.3)";
              }}
            >
              {isEditingWeddingInfo ? "취소" : "편집"}
            </button>
          </div>

          {isEditingWeddingInfo ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* 신랑 이름 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  신랑 이름
                </label>
                <input
                  type="text"
                  value={weddingInfo.groomName}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      groomName: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 신부 이름 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  신부 이름
                </label>
                <input
                  type="text"
                  value={weddingInfo.brideName}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      brideName: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 결혼식 날짜 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  결혼식 날짜
                </label>
                <input
                  type="date"
                  value={weddingInfo.weddingDate}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      weddingDate: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 결혼식 시간 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  결혼식 시간
                </label>
                <input
                  type="time"
                  value={weddingInfo.weddingTime}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      weddingTime: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 결혼식 장소 */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  결혼식 장소
                </label>
                <input
                  type="text"
                  value={weddingInfo.weddingLocation}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      weddingLocation: e.target.value,
                    })
                  }
                  placeholder="예: 그랜드 하얏트 서울 그랜드볼룸"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 주소 */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  주소
                </label>
                <input
                  type="text"
                  value={weddingInfo.address}
                  onChange={(e) =>
                    setWeddingInfo({ ...weddingInfo, address: e.target.value })
                  }
                  placeholder="예: 서울특별시 용산구 소월로 322"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 인사말 */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: AppleColors.secondaryText,
                    fontFamily: systemFont,
                  }}
                >
                  인사말
                </label>
                <textarea
                  value={weddingInfo.greetingMessage}
                  onChange={(e) =>
                    setWeddingInfo({
                      ...weddingInfo,
                      greetingMessage: e.target.value,
                    })
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${AppleColors.border}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontFamily: systemFont,
                    backgroundColor: AppleColors.inputBackground,
                    color: AppleColors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = AppleColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${AppleColors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = AppleColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 저장 버튼 */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => setIsEditingWeddingInfo(false)}
                  style={{
                    backgroundColor: AppleColors.secondaryButton,
                    color: AppleColors.text,
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: systemFont,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      AppleColors.secondaryButtonHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      AppleColors.secondaryButton;
                  }}
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 저장 로직 (다음 단계에서 구현)
                    console.log("결혼식 정보 저장:", weddingInfo);
                    setIsEditingWeddingInfo(false);
                  }}
                  style={{
                    backgroundColor: AppleColors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: systemFont,
                    boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 123, 255, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 123, 255, 0.3)";
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            // 조회 모드
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* 결혼식 정보 카드들 */}
              {[
                { label: "신랑", value: weddingInfo.groomName, icon: "🤵" },
                { label: "신부", value: weddingInfo.brideName, icon: "👰" },
                { label: "날짜", value: weddingInfo.weddingDate, icon: "📅" },
                { label: "시간", value: weddingInfo.weddingTime, icon: "🕐" },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: AppleColors.inputBackground,
                    padding: "16px",
                    borderRadius: "12px",
                    border: `1px solid ${AppleColors.border}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: AppleColors.secondaryText,
                      marginBottom: "4px",
                      fontWeight: "500",
                      fontFamily: systemFont,
                    }}
                  >
                    {item.icon} {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: AppleColors.text,
                      fontWeight: "500",
                      fontFamily: systemFont,
                    }}
                  >
                    {item.value || "설정되지 않음"}
                  </div>
                </div>
              ))}

              {/* 장소 정보 - 전체 너비 */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  backgroundColor: AppleColors.inputBackground,
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px solid ${AppleColors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: AppleColors.secondaryText,
                    marginBottom: "4px",
                    fontWeight: "500",
                    fontFamily: systemFont,
                  }}
                >
                  🏛️ 결혼식 장소
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: AppleColors.text,
                    fontWeight: "500",
                    fontFamily: systemFont,
                    marginBottom: "8px",
                  }}
                >
                  {weddingInfo.weddingLocation || "설정되지 않음"}
                </div>
                {weddingInfo.address && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: AppleColors.secondaryText,
                      fontFamily: systemFont,
                    }}
                  >
                    📍 {weddingInfo.address}
                  </div>
                )}
              </div>

              {/* 인사말 - 전체 너비 */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  backgroundColor: AppleColors.inputBackground,
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px solid ${AppleColors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: AppleColors.secondaryText,
                    marginBottom: "8px",
                    fontWeight: "500",
                    fontFamily: systemFont,
                  }}
                >
                  💌 인사말
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: AppleColors.text,
                    lineHeight: "1.5",
                    fontFamily: systemFont,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {weddingInfo.greetingMessage || "설정되지 않음"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 그룹 관리 섹션 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 20px 0",
              fontFamily: systemFont,
            }}
          >
            👥 그룹 관리
          </h3>

          {groups.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: AppleColors.secondaryText,
                fontSize: "16px",
                fontFamily: systemFont,
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  opacity: 0.6,
                }}
              >
                📭
              </div>
              <div>아직 생성된 그룹이 없습니다.</div>
              <div style={{ marginTop: "8px", fontSize: "14px" }}>
                상단의 "새 그룹 생성" 버튼을 클릭해서 첫 번째 그룹을
                만들어보세요!
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px",
              }}
            >
              {groups.map((group) => (
                <div
                  key={group.id}
                  style={{
                    backgroundColor: AppleColors.inputBackground,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${AppleColors.border}`,
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {/* 그룹 헤더 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        defaultValue={group.groupName}
                        onBlur={(e) => {
                          if (e.target.value !== group.groupName && group.id) {
                            handleUpdateGroupName(group.id, e.target.value);
                          }
                        }}
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: AppleColors.text,
                          backgroundColor: "transparent",
                          border: "none",
                          outline: "none",
                          width: "100%",
                          fontFamily: systemFont,
                          padding: "4px 0",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "14px",
                          color: AppleColors.secondaryText,
                          marginTop: "4px",
                          fontFamily: systemFont,
                        }}
                      >
                        {getGroupTypeDisplay(group.groupType)}
                      </div>
                    </div>
                    <button
                      onClick={() => group.id && handleDeleteGroup(group.id)}
                      style={{
                        backgroundColor: AppleColors.destructive,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: systemFont,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* 그룹 정보 - 임시 데이터 사용 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: AppleColors.cardBackground,
                        padding: "12px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: AppleColors.primary,
                          fontFamily: systemFont,
                        }}
                      >
                        0
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: AppleColors.secondaryText,
                          fontFamily: systemFont,
                        }}
                      >
                        예상 하객
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: AppleColors.cardBackground,
                        padding: "12px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: AppleColors.success,
                          fontFamily: systemFont,
                        }}
                      >
                        0
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: AppleColors.secondaryText,
                          fontFamily: systemFont,
                        }}
                      >
                        실제 응답
                      </div>
                    </div>
                  </div>

                  {/* 고유 링크 */}
                  <div
                    style={{
                      backgroundColor: AppleColors.cardBackground,
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                        marginBottom: "4px",
                        fontFamily: systemFont,
                      }}
                    >
                      🔗 고유 링크
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: AppleColors.primary,
                        fontFamily: "Monaco, Consolas, monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      https://leelee.kr/invitation/{group.uniqueCode}
                    </div>
                  </div>

                  {/* 인사말 편집 */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: AppleColors.text,
                          fontFamily: systemFont,
                        }}
                      >
                        💌 인사말
                      </span>
                      <button
                        onClick={() => startEditingGreeting(group)}
                        style={{
                          backgroundColor: AppleColors.primary,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: systemFont,
                        }}
                      >
                        편집
                      </button>
                    </div>

                    {editingGroupId === group.id ? (
                      <div>
                        <textarea
                          value={editingGreeting}
                          onChange={(e) => setEditingGreeting(e.target.value)}
                          style={{
                            width: "100%",
                            height: "80px",
                            padding: "8px",
                            border: `1px solid ${AppleColors.border}`,
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontFamily: systemFont,
                            backgroundColor: AppleColors.cardBackground,
                            color: AppleColors.text,
                            outline: "none",
                            resize: "vertical",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            onClick={() =>
                              group.id &&
                              handleUpdateGreeting(group.id, editingGreeting)
                            }
                            style={{
                              backgroundColor: AppleColors.success,
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: systemFont,
                            }}
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingGroupId(null)}
                            style={{
                              backgroundColor: AppleColors.secondaryButton,
                              color: AppleColors.text,
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: systemFont,
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          backgroundColor: AppleColors.cardBackground,
                          padding: "10px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: AppleColors.text,
                          lineHeight: "1.4",
                          fontFamily: systemFont,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {group.greetingMessage ||
                          "인사말이 설정되지 않았습니다."}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RSVP 현황 섹션 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "16px",
            padding: "24px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 20px 0",
              fontFamily: systemFont,
            }}
          >
            📋 RSVP 응답 현황
          </h3>

          <div
            style={{
              backgroundColor: AppleColors.inputBackground,
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                opacity: 0.6,
              }}
            >
              📊
            </div>
            <div
              style={{
                fontSize: "16px",
                color: AppleColors.secondaryText,
                fontFamily: systemFont,
              }}
            >
              RSVP 응답 데이터가 아직 없습니다.
            </div>
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.secondaryText,
                marginTop: "8px",
                fontFamily: systemFont,
              }}
            >
              하객들이 응답을 시작하면 여기에 표시됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
