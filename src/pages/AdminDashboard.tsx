import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllGroups,
  deleteGroup,
  updateGroup,
  getAllRsvps, // ✅ RSVP 데이터 조회를 위한 import
} from "../services/invitationService";
import { InvitationGroup, RsvpResponse } from "../types"; // ✅ 타입 정의 import
import CreateGroupModal from "../components/CreateGroupModal";
import CreateAdminModal from "../components/CreateAdminModal";
import {
  AdminCreateResponse,
  AdminInfo,
  AdminListResponse,
  getAdminRoleLabel,
} from "../types";
import { getAdminList } from "../services/invitationService";

// ==================== 🎨 스타일 설정 ====================
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

// 시스템 폰트 설정
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ==================== 📱 메인 컴포넌트 ====================
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // ==================== 🔄 상태 관리 ====================
  // 그룹 관련 상태
  const [groups, setGroups] = useState<InvitationGroup[]>([]); // 그룹 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [showCreateModal, setShowCreateModal] = useState(false); // 그룹 생성 모달 표시 여부
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null); // 편집 중인 그룹 ID
  const [editingGreeting, setEditingGreeting] = useState(""); // 편집 중인 인사말

  // 결혼식 정보 편집 상태
  const [isEditingWeddingInfo, setIsEditingWeddingInfo] = useState(false); // 결혼식 정보 편집 모드 여부

  // RSVP 응답 관련 상태
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]); // RSVP 응답 목록
  const [rsvpLoading, setRsvpLoading] = useState(true); // RSVP 로딩 상태

  // 관리자 관련 상태
  const [showCreateAdminModal, setShowCreateAdminModal] = useState<boolean>(false); // 관리자 생성 모달 표시 여부
  const [adminList, setAdminList] = useState<AdminInfo[]>([]); // 관리자 목록
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(false); // 관리자 목록 로딩 상태
  const [showAdminList, setShowAdminList] = useState<boolean>(false); // 관리자 목록 표시 여부

  // 결혼식 기본 정보 상태
  const [weddingInfo, setWeddingInfo] = useState({
    groomName: "이지환", // 신랑 이름
    brideName: "이윤진", // 신부 이름
    weddingDate: "2025-10-25", // 결혼식 날짜
    weddingTime: "18:00", // 결혼식 시간
    weddingLocation: "포포인츠 바이쉐라톤 조선 서울역 19층", // 결혼식 장소
    address: "서울특별시 용산구 한강대로 366", // 주소
    greetingMessage: // 인사말
      "두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n지환, 윤진 결혼합니다.",
  });

  // ==================== 🔧 관리자 관련 함수들 ====================
  // 관리자 목록 조회 함수
  const fetchAdminList = async () => {
    try {
      setLoadingAdmins(true);
      const response: AdminListResponse = await getAdminList();
      setAdminList(response.admins);
      console.log("✅ 관리자 목록 조회 성공:", response);
    } catch (error: any) {
      console.error("❌ 관리자 목록 조회 실패:", error);
      alert(`❌ 관리자 목록을 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // 관리자 생성 성공 처리 함수
  const handleCreateAdminSuccess = (newAdmin: AdminCreateResponse) => {
    console.log("🎉 새 관리자 생성 완료:", newAdmin);
    // 관리자 목록이 열려있다면 새로고침
    if (showAdminList) {
      fetchAdminList();
    }
  };

  // 관리자 목록 토글 함수
  const toggleAdminList = () => {
    if (!showAdminList) {
      // 목록을 처음 열 때만 데이터 조회
      fetchAdminList();
    }
    setShowAdminList(!showAdminList);
  };

  // ==================== 🔄 초기 데이터 로딩 ====================
  useEffect(() => {
    fetchGroups(); // 그룹 목록 조회
    fetchRsvps(); // RSVP 데이터 조회
  }, []);

  // 그룹 목록 조회 함수
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

  // RSVP 데이터 조회 함수
  const fetchRsvps = async () => {
    try {
      setRsvpLoading(true);
      const data = await getAllRsvps();

      // 서버 응답 구조 처리 (타입 안전성 개선)
      let processedRsvps: any[] = [];
      if ((data as any)?.responses && Array.isArray((data as any).responses)) {
        // responses 배열에서 response 객체 추출
        processedRsvps = (data as any).responses.map(
          (item: any) => item.response
        );
      } else if (Array.isArray(data)) {
        // 이미 배열 형태인 경우
        processedRsvps = data;
      }

      setRsvps(processedRsvps as RsvpResponse[]);
    } catch (error) {
      console.error("RSVP 데이터 가져오기 실패:", error);
    } finally {
      setRsvpLoading(false);
    }
  };

  // ==================== 🗑️ 그룹 삭제 함수 ====================
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

  // ==================== ✏️ 그룹 정보 업데이트 함수들 ====================
  // 인사말 업데이트 함수
  const handleUpdateGreeting = async (groupId: string, newGreeting: string) => {
    try {
      await updateGroup(groupId, { greetingMessage: newGreeting });
      await fetchGroups();
      setEditingGroupId(null);
      alert("인사말이 업데이트되었습니다.");
    } catch (error) {
      console.error("인사말 업데이트 실패:", error);
      alert("인사말 업데이트에 실패했습니다.");
    }
  };

  // 그룹명 업데이트 함수
  const handleUpdateGroupName = async (groupId: string, newName: string) => {
    try {
      await updateGroup(groupId, { groupName: newName });
      await fetchGroups();
      alert("그룹 이름이 업데이트되었습니다.");
    } catch (error) {
      console.error("그룹 이름 업데이트 실패:", error);
      alert("그룹 이름 업데이트에 실패했습니다.");
    }
  };

  // URL 코드 업데이트 함수
  const handleUpdateGroupCode = async (groupId: string, newCode: string) => {
    try {
      await updateGroup(groupId, { uniqueCode: newCode });
      await fetchGroups();
      alert("✅ URL 코드가 업데이트되었습니다!");
    } catch (error: any) {
      console.error("URL 코드 업데이트 실패:", error);
      if (error.message && error.message.includes("이미 존재")) {
        alert("❌ 이미 사용 중인 URL 코드입니다.\n다른 코드를 사용해주세요.");
      } else {
        alert("❌ URL 코드 업데이트에 실패했습니다.");
      }
    }
  };

  // ==================== ⚙️ 그룹 기능 설정 관련 함수들 ====================
  // 그룹 기능 설정 값 가져오기 함수
  const getFeatureValue = (
    group: InvitationGroup,
    featureKey: string
  ): boolean => {
    // 실제 저장된 값이 있으면 사용, 없으면 기본값 사용
    const actualValue = group[featureKey as keyof InvitationGroup];

    if (actualValue !== undefined && actualValue !== null) {
      return actualValue as boolean;
    }

    // 기본값 설정 (실제 값이 없을 때만 사용)
    const defaults = {
      WEDDING_GUEST: {
        showRsvpForm: true,
        showAccountInfo: false,
        showShareButton: false,
        showVenueInfo: true,
        showPhotoGallery: true,
        showCeremonyProgram: true,
      },
      PARENTS_GUEST: {
        showRsvpForm: false,
        showAccountInfo: true,
        showShareButton: true,
        showVenueInfo: false,
        showPhotoGallery: true,
        showCeremonyProgram: false,
      },
      COMPANY_GUEST: {
        showRsvpForm: false,
        showAccountInfo: false,
        showShareButton: false,
        showVenueInfo: false,
        showPhotoGallery: true,
        showCeremonyProgram: false,
      },
    };

    const groupDefaults =
      defaults[group.groupType as keyof typeof defaults] ||
      defaults.WEDDING_GUEST;
    return groupDefaults[featureKey as keyof typeof groupDefaults] || false;
  };

  // 기능 설정 토글 처리 함수
  const handleFeatureToggle = async (
    groupId: string,
    featureKey: string,
    enabled: boolean
  ) => {
    try {
      console.log(`🔧 기능 설정 변경: ${featureKey} = ${enabled}`);

      // API 호출로 기능 설정 업데이트
      const updateData: any = {};
      updateData[featureKey] = enabled;

      await updateGroup(groupId, updateData);
      await fetchGroups(); // 그룹 목록 새로고침

      alert(
        `✅ ${featureKey} 설정이 ${enabled ? "활성화" : "비활성화"}되었습니다.`
      );
    } catch (error: any) {
      console.error("기능 설정 업데이트 실패:", error);
      alert(`❌ 설정 변경에 실패했습니다: ${error.message}`);
    }
  };

  // ==================== 🔧 유틸리티 함수들 ====================
  // 인사말 편집 시작 함수
  const startEditingGreeting = (group: InvitationGroup) => {
    setEditingGroupId(group.id || null);
    setEditingGreeting(group.greetingMessage || "");
  };

  // 그룹 타입 표시 텍스트 변환 함수
  const getGroupTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      WEDDING_GUEST: "🎎 결혼식 초대",
      PARENTS_GUEST: "👨‍👩‍👧‍👦 부모님",
      COMPANY_GUEST: "🏢 회사",
    };
    return typeMap[type] || type;
  };

  // 전체 통계 계산 함수
  const getTotalStats = () => {
    return {
      totalGroups: groups.length,
      totalGuests: 0, // 임시로 0으로 설정 (해당 필드가 없으므로)
      totalResponses: 0, // 임시로 0으로 설정
    };
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 로컬스토리지에서 토큰과 사용자 정보 삭제
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    // 로그인 페이지로 리다이렉트
    navigate("/012486/login");
  };

  // ==================== 📊 통계 데이터 ====================
  const stats = getTotalStats();

  // ==================== 🔄 로딩 화면 ====================
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

  // ==================== 🎨 메인 렌더링 ====================
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
        {/* ==================== 📋 헤더 섹션 ==================== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 헤더 제목 영역 */}
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0 0 8px 0",
              }}
            >
              관리자 대시보드
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: AppleColors.secondaryText,
                margin: 0,
              }}
            >
              청첩장 그룹 관리 및 통계
            </p>
          </div>

          {/* 헤더 버튼 그룹 */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* 관리자 목록 버튼 */}
            <button
              onClick={toggleAdminList}
              disabled={loadingAdmins}
              style={{
                padding: "12px 20px",
                backgroundColor: showAdminList ? AppleColors.primary : "white",
                color: showAdminList ? "white" : AppleColors.primary,
                border: `2px solid ${AppleColors.primary}`,
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loadingAdmins ? "not-allowed" : "pointer",
                opacity: loadingAdmins ? 0.7 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loadingAdmins ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid currentColor",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  로딩 중...
                </>
              ) : (
                <>👥 관리자 목록 {showAdminList ? "숨기기" : "보기"}</>
              )}
            </button>

            {/* 새 관리자 생성 버튼 */}
            <button
              onClick={() => setShowCreateAdminModal(true)}
              style={{
                padding: "12px 20px",
                backgroundColor: AppleColors.success,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = AppleColors.success;
              }}
            >
              ➕ 새 관리자 생성
            </button>

            {/* 새 그룹 생성 버튼 */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "12px 20px",
                backgroundColor: AppleColors.primary,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ➕ 새 그룹 생성
            </button>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 20px",
                backgroundColor: AppleColors.destructive,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = AppleColors.destructive;
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* ==================== 👥 관리자 목록 섹션 ==================== */}
        {showAdminList && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "16px",
              padding: "32px",
              marginTop: "24px",
              marginBottom: "24px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: AppleColors.text,
                  marginBottom: "8px",
                }}
              >
                👥 관리자 목록
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: AppleColors.secondaryText,
                  margin: 0,
                }}
              >
                총 {adminList.length}명의 관리자가 등록되어 있습니다
              </p>
            </div>

            {loadingAdmins ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    fontSize: "16px",
                    color: AppleColors.secondaryText,
                  }}
                >
                  관리자 목록을 불러오는 중...
                </div>
              </div>
            ) : adminList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    fontSize: "16px",
                    color: AppleColors.secondaryText,
                  }}
                >
                  등록된 관리자가 없습니다
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                {adminList.map((admin) => (
                  <div
                    key={admin.id}
                    style={{
                      backgroundColor: "white",
                      border: `1px solid ${AppleColors.border}`,
                      borderRadius: "12px",
                      padding: "20px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: AppleColors.text,
                            marginBottom: "4px",
                          }}
                        >
                          {admin.username}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "14px",
                            color: AppleColors.secondaryText,
                          }}
                        >
                          <span>🎭 {getAdminRoleLabel(admin.role)}</span>
                          <span>•</span>
                          <span>
                            📅{" "}
                            {new Date(admin.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                          {admin.lastLoginAt && (
                            <>
                              <span>•</span>
                              <span>
                                🕐 마지막 로그인:{" "}
                                {new Date(admin.lastLoginAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "6px 12px",
                          backgroundColor:
                            admin.role === "super_admin"
                              ? AppleColors.destructive
                              : admin.role === "admin"
                              ? AppleColors.primary
                              : AppleColors.warning,
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {getAdminRoleLabel(admin.role)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 💒 결혼식 기본 정보 섹션 ==================== */}
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
            // 편집 모드 - 결혼식 정보 수정 폼
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* 신랑 이름 입력 */}
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

              {/* 신부 이름 입력 */}
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

              {/* 결혼식 날짜 입력 */}
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

              {/* 결혼식 시간 입력 */}
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

              {/* 결혼식 장소 입력 */}
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

              {/* 주소 입력 */}
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

              {/* 인사말 입력 */}
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

              {/* 저장/취소 버튼 */}
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
                    // 저장 로직 (향후 API 연동 시 구현)
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
            // 조회 모드 - 결혼식 정보 표시
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* 결혼식 기본 정보 카드들 */}
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

        {/* ==================== 👥 그룹 관리 섹션 ==================== */}
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
            // 그룹이 없을 때 표시
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
            // 그룹 목록 표시
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

                  {/* 그룹 통계 정보 */}
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

                  {/* 그룹 고유 링크 */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: AppleColors.text,
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
                        marginBottom: "8px",
                      }}
                    >
                      https://leelee.kr/invitation/{group.uniqueCode}
                    </div>

                    {/* URL 관리 버튼들 */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => {
                          const url = `https://leelee.kr/invitation/${group.uniqueCode}`;
                          navigator.clipboard
                            .writeText(url)
                            .then(() => {
                              alert("✅ URL이 클립보드에 복사되었습니다!");
                            })
                            .catch(() => {
                              alert(
                                "❌ 복사에 실패했습니다. 브라우저가 지원하지 않는 기능입니다."
                              );
                            });
                        }}
                        style={{
                          backgroundColor: AppleColors.primary,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: systemFont,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#0066CC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            AppleColors.primary;
                        }}
                      >
                        📋 URL 복사
                      </button>

                      <button
                        onClick={() => {
                          const newCode = prompt(
                            "새로운 URL 코드를 입력하세요:\n(영문, 숫자, 하이픈만 사용 가능, 3-20자)",
                            group.uniqueCode
                          );

                          if (
                            newCode &&
                            newCode !== group.uniqueCode &&
                            group.id
                          ) {
                            // URL 코드 유효성 검사
                            const isValid = /^[a-zA-Z0-9-]{3,20}$/.test(
                              newCode
                            );
                            if (isValid) {
                              handleUpdateGroupCode(group.id, newCode);
                            } else {
                              alert(
                                "❌ 잘못된 형식입니다.\n영문, 숫자, 하이픈만 사용하여 3-20자로 입력해주세요."
                              );
                            }
                          }
                        }}
                        style={{
                          backgroundColor: AppleColors.secondary,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: systemFont,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FF9500";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            AppleColors.secondary;
                        }}
                      >
                        ✏️ URL 편집
                      </button>
                    </div>
                  </div>

                  {/* 인사말 편집 섹션 */}
                  <div style={{ marginBottom: "16px" }}>
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
                      // 인사말 편집 모드
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
                      // 인사말 표시 모드
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

                  {/* 그룹 기능 설정 섹션 */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
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
                        ⚙️ 기능 설정
                      </span>
                    </div>

                    {/* 기능 설정 체크박스들 */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "8px",
                        backgroundColor: AppleColors.inputBackground,
                        padding: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${AppleColors.border}`,
                      }}
                    >
                      {[
                        {
                          key: "showRsvpForm",
                          label: "📝 참석응답",
                          icon: "📝",
                        },
                        {
                          key: "showAccountInfo",
                          label: "💳 계좌정보",
                          icon: "💳",
                        },
                        {
                          key: "showShareButton",
                          label: "📤 공유버튼",
                          icon: "📤",
                        },
                        {
                          key: "showVenueInfo",
                          label: "📍 오시는길",
                          icon: "📍",
                        },
                        {
                          key: "showPhotoGallery",
                          label: "📸 포토갤러리",
                          icon: "📸",
                        },
                        {
                          key: "showCeremonyProgram",
                          label: "📋 본식순서",
                          icon: "📋",
                        },
                      ].map((feature) => (
                        <label
                          key={feature.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            transition: "all 0.2s ease",
                            fontFamily: systemFont,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={getFeatureValue(group, feature.key)}
                            onChange={(e) =>
                              handleFeatureToggle(
                                group.id!,
                                feature.key,
                                e.target.checked
                              )
                            }
                            style={{
                              cursor: "pointer",
                            }}
                          />
                          <span style={{ color: AppleColors.text }}>
                            {feature.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== 📋 RSVP 응답 현황 섹션 ==================== */}
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

          {rsvpLoading ? (
            // RSVP 로딩 상태
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
                  fontSize: "16px",
                  color: AppleColors.secondaryText,
                  fontFamily: systemFont,
                }}
              >
                RSVP 데이터를 불러오는 중...
              </div>
            </div>
          ) : rsvps.length === 0 ? (
            // RSVP 데이터가 없을 때
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
          ) : (
            // RSVP 응답 목록 표시
            <div>
              <div
                style={{
                  fontSize: "16px",
                  color: AppleColors.text,
                  marginBottom: "16px",
                  fontFamily: systemFont,
                }}
              >
                총 {rsvps.length}개의 응답이 있습니다.
              </div>
              {rsvps.map((rsvp, index) => (
                <div
                  key={rsvp.id || `rsvp-${index}`}
                  style={{
                    backgroundColor: AppleColors.inputBackground,
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "8px",
                    border: `1px solid ${AppleColors.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: AppleColors.text,
                      fontFamily: systemFont,
                    }}
                  >
                    {rsvp.responderName} - {rsvp.isAttending ? "참석" : "불참"}
                  </div>
                  {rsvp.isAttending && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                        marginTop: "4px",
                        fontFamily: systemFont,
                      }}
                    >
                      성인 {rsvp.adultCount}명, 자녀 {rsvp.childrenCount}명
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================== 🎭 모달 컴포넌트들 ==================== */}
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
      <CreateAdminModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onSuccess={handleCreateAdminSuccess}
      />

      {/* ==================== 🎨 CSS 애니메이션 스타일 ==================== */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;