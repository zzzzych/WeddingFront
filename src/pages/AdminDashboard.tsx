// src/pages/AdminDashboard.tsx
// 완성된 관리자 대시보드 (그룹별 기능 설정 시스템 통합)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRsvps,
  getAllGroups,
  updateGroup,
  createGroup,
  deleteGroup,
} from "../services/invitationService";
import { RsvpResponse, InvitationGroup, GroupType } from "../types";
import CreateGroupModal from "../components/CreateGroupModal";
import GreetingEditor from "../components/GreetingEditor";
import GroupFeatureSettings from "../components/GroupFeatureSettings";

// 그룹 기능 설정 인터페이스
interface GroupFeatures {
  showRsvpForm: boolean;
  showAccountInfo: boolean;
  showShareButton: boolean;
  showVenueInfo: boolean;
  showPhotoGallery: boolean;
  showCeremonyProgram: boolean;
}

// src/pages/AdminDashboard.tsx 파일 최상단 import 구문들 아래에 추가

// 애플 디자인 색상 팔레트
const AppleColors = {
  primary: "#007AFF", // 애플 블루
  success: "#34C759", // 애플 그린
  warning: "#FF9500", // 애플 오렌지
  danger: "#FF3B30", // 애플 레드
  background: "#F2F2F7", // 애플 배경 그레이
  surface: "#FFFFFF", // 표면 흰색
  text: {
    primary: "#000000", // 기본 텍스트
    secondary: "#6D6D70", // 보조 텍스트
    tertiary: "#C7C7CC", // 비활성 텍스트
  },
  border: "#E5E5EA", // 테두리 색상
  shadow: "rgba(0, 0, 0, 0.1)", // 그림자
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  // 기존 상태들 (weddingInfo 관련 상태들) 아래에 추가
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  // 삭제 관련 상태 추가
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [deleteConfirmGroup, setDeleteConfirmGroup] =
    useState<InvitationGroup | null>(null);
  // 그룹 이름 편집 상태 추가
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [isUpdatingGroupName, setIsUpdatingGroupName] =
    useState<boolean>(false);
  const [tempGroupName, setTempGroupName] = useState<string>("");
  // 그룹 인사말 편집 상태
  const [editingGroupGreeting, setEditingGroupGreeting] = useState<
    string | null
  >(null);
  const [isUpdatingGreeting, setIsUpdatingGreeting] = useState<boolean>(false);

  // 그룹 기능 설정 편집 상태
  const [editingGroupFeatures, setEditingGroupFeatures] = useState<
    string | null
  >(null);
  const [isUpdatingFeatures, setIsUpdatingFeatures] = useState<boolean>(false);

  // 결혼식 기본 정보 관리 상태 추가 (기존 상태들 아래에)
  const [weddingInfo, setWeddingInfo] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    weddingTime: "",
    weddingLocation: "",
    weddingAddress: "",
    greetingMessage: "",
  });
  const [isEditingWeddingInfo, setIsEditingWeddingInfo] =
    useState<boolean>(false);
  const [isUpdatingWeddingInfo, setIsUpdatingWeddingInfo] =
    useState<boolean>(false);
  // 그룹별 기능 설정 데이터 (임시 데이터)
  const [groupFeatures, setGroupFeatures] = useState<{
    [groupId: string]: GroupFeatures;
  }>({
    "1": {
      showRsvpForm: true,
      showAccountInfo: false,
      showShareButton: false,
      showVenueInfo: true,
      showPhotoGallery: true,
      showCeremonyProgram: true,
    },
    "2": {
      showRsvpForm: true,
      showAccountInfo: false,
      showShareButton: false,
      showVenueInfo: true,
      showPhotoGallery: true,
      showCeremonyProgram: true,
    },
    "3": {
      showRsvpForm: false,
      showAccountInfo: true,
      showShareButton: true,
      showVenueInfo: false,
      showPhotoGallery: true,
      showCeremonyProgram: false,
    },
  });

  // 모달 상태
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] =
    useState<boolean>(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, []);

  // 대시보드 데이터 로드 함수
  // loadDashboardData 함수에서 API 응답 처리 부분을 수정
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // ===== API 응답 구조 자세히 확인 =====
      console.log("🔍 RSVP API 호출 시작...");

      // RSVP 데이터 호출
      const rsvpResponse = await fetch(
        "https://api.leelee.kr/api/admin/rsvps",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📡 RSVP API 응답 상태:", rsvpResponse.status);

      if (!rsvpResponse.ok) {
        throw new Error(`RSVP API 에러! status: ${rsvpResponse.status}`);
      }

      const rsvpData = await rsvpResponse.json();
      console.log("📊 원본 RSVP 응답:", rsvpData);
      console.log("📊 RSVP 응답 타입:", typeof rsvpData);
      console.log("📊 RSVP 응답 구조:", Object.keys(rsvpData));

      // ✅ 중요: API 응답을 배열로 변환
      let processedRsvps = [];

      if (rsvpData && rsvpData.responses && Array.isArray(rsvpData.responses)) {
        // responses 배열이 있는 경우
        processedRsvps = rsvpData.responses;
        console.log("✅ responses 배열에서 데이터 추출:", processedRsvps);
      } else if (Array.isArray(rsvpData)) {
        // 직접 배열인 경우
        processedRsvps = rsvpData;
        console.log("✅ 직접 배열 데이터:", processedRsvps);
      } else {
        // 예상하지 못한 구조인 경우 빈 배열로 설정
        console.warn("⚠️ 예상하지 못한 RSVP 응답 구조, 빈 배열로 설정");
        processedRsvps = [];
      }

      // 그룹 데이터 호출
      const [groupData] = await Promise.all([getAllGroups()]);

      console.log("👥 불러온 그룹 데이터:", groupData);

      // ✅ 처리된 배열 데이터로 설정
      setRsvps(processedRsvps);
      setGroups(groupData);

      // 관리자 정보 (localStorage에서 가져옴)
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser));
      }
    } catch (error: any) {
      console.error("대시보드 데이터 로드 실패:", error);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 실제 로그인에서 사용하는 올바른 키로 수정
    localStorage.removeItem("adminToken"); // ✅ JWT 토큰 제거
    localStorage.removeItem("adminUser"); // ✅ 사용자 정보 제거

    console.log("🔐 로그아웃 완료 - 토큰 및 사용자 정보 삭제");
    navigate("/admin");
  };
  // 새 그룹 생성 성공 처리
  const handleGroupCreated = (newGroup: InvitationGroup) => {
    setGroups((prev) => [...prev, newGroup]);

    // 새 그룹에 대한 기본 기능 설정 추가
    const defaultFeatures: GroupFeatures = {
      showRsvpForm: newGroup.groupType === GroupType.WEDDING_GUEST,
      showAccountInfo: newGroup.groupType === GroupType.PARENTS_GUEST,
      showShareButton: newGroup.groupType === GroupType.PARENTS_GUEST,
      showVenueInfo: newGroup.groupType === GroupType.WEDDING_GUEST,
      showPhotoGallery: true,
      showCeremonyProgram: newGroup.groupType === GroupType.WEDDING_GUEST,
    };

    setGroupFeatures((prev) => ({
      ...prev,
      [newGroup.id!]: defaultFeatures,
    }));

    setSuccessMessage("새 그룹이 성공적으로 생성되었습니다!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 그룹별 인사말 편집 시작
  const handleGroupGreetingEdit = (groupId: string) => {
    setEditingGroupGreeting(groupId);
  };

  // 그룹별 인사말 저장
  const handleGroupGreetingSave = async (
    groupId: string,
    newGreeting: string
  ) => {
    try {
      setIsUpdatingGreeting(true);

      // ✅ 실제 API 호출로 변경
      await updateGroup(groupId, {
        greetingMessage: newGreeting,
      });

      // 로컬 상태 업데이트
      const updatedGroups = groups.map((group) =>
        group.id === groupId
          ? { ...group, greetingMessage: newGreeting }
          : group
      );
      setGroups(updatedGroups);

      // 성공 메시지 표시
      setSuccessMessage("인사말이 성공적으로 수정되었습니다!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // 편집 모드 종료
      setEditingGroupGreeting(null);
    } catch (error: any) {
      console.error("인사말 수정 실패:", error);
      setError(error.message || "인사말 수정에 실패했습니다.");
    } finally {
      setIsUpdatingGreeting(false);
    }
  };

  // 그룹별 인사말 편집 취소
  const handleGroupGreetingCancel = () => {
    setEditingGroupGreeting(null);
  };

  // 그룹 기능 설정 편집 시작
  const handleGroupFeaturesEdit = (groupId: string) => {
    setEditingGroupFeatures(groupId);
  };

  // 그룹 기능 설정 저장
  const handleGroupFeaturesSave = async (
    groupId: string,
    features: GroupFeatures
  ) => {
    try {
      setIsUpdatingFeatures(true);

      // ===== 임시 처리 (백엔드 연결 시 실제 API 호출) =====
      // const response = await updateGroupFeatures(groupId, features);

      // 임시로 로컬 상태 업데이트
      setGroupFeatures((prev) => ({
        ...prev,
        [groupId]: features,
      }));

      // 성공 메시지
      setSuccessMessage("그룹 기능 설정이 성공적으로 업데이트되었습니다!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // 편집 모드 종료
      setEditingGroupFeatures(null);
    } catch (error: any) {
      console.error("그룹 기능 설정 실패:", error);
      setError(error.message || "그룹 기능 설정에 실패했습니다.");
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  // 그룹 삭제 확인 다이얼로그 열기
  const handleDeleteGroup = (group: InvitationGroup) => {
    setDeleteConfirmGroup(group);
  };

  // 그룹 삭제 실행
  const handleConfirmDelete = async (forceDelete: boolean = false) => {
    if (!deleteConfirmGroup) return;

    try {
      setDeletingGroupId(deleteConfirmGroup.id!);

      // ✅ 실제 API 호출
      await deleteGroup(deleteConfirmGroup.id!, forceDelete);

      // 로컬 상태에서 삭제된 그룹 제거
      setGroups((prev) =>
        prev.filter((group) => group.id !== deleteConfirmGroup.id)
      );

      // 성공 메시지 표시
      setSuccessMessage(
        `"${deleteConfirmGroup.groupName}" 그룹이 성공적으로 삭제되었습니다!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // 상태 초기화
      setDeleteConfirmGroup(null);
    } catch (error: any) {
      console.error("그룹 삭제 실패:", error);

      // 409 에러 (응답이 있는 그룹)인 경우 강제 삭제 옵션 제공
      if (error.message.includes("응답이 있는")) {
        // 에러 메시지는 표시하지 않고, 사용자가 강제 삭제를 선택할 수 있도록 함
        return;
      }

      setError(error.message || "그룹 삭제에 실패했습니다.");
    } finally {
      setDeletingGroupId(null);
    }
  };

  // 삭제 확인 다이얼로그 닫기
  const handleCancelDelete = () => {
    setDeleteConfirmGroup(null);
  };

  // 그룹 기능 설정 편집 취소
  const handleGroupFeaturesCancel = () => {
    setEditingGroupFeatures(null);
  };

  // 그룹 이름 편집 시작
  const handleGroupNameEdit = (group: InvitationGroup) => {
    setEditingGroupName(group.id!);
    setTempGroupName(group.groupName);
  };

  // 그룹 이름 저장
  const handleGroupNameSave = async (groupId: string) => {
    if (!tempGroupName.trim()) {
      setError("그룹 이름을 입력해주세요.");
      return;
    }

    try {
      setIsUpdatingGroupName(true);

      // ✅ 실제 API 호출
      await updateGroup(groupId, {
        groupName: tempGroupName.trim(),
      });

      // 로컬 상태 업데이트
      const updatedGroups = groups.map((group) =>
        group.id === groupId
          ? { ...group, groupName: tempGroupName.trim() }
          : group
      );
      setGroups(updatedGroups);

      // 성공 메시지 표시
      setSuccessMessage("그룹 이름이 성공적으로 수정되었습니다!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // 편집 모드 종료
      setEditingGroupName(null);
      setTempGroupName("");
    } catch (error: any) {
      console.error("그룹 이름 수정 실패:", error);
      setError(error.message || "그룹 이름 수정에 실패했습니다.");
    } finally {
      setIsUpdatingGroupName(false);
    }
  };

  // 그룹 이름 편집 취소
  const handleGroupNameCancel = () => {
    setEditingGroupName(null);
    setTempGroupName("");
  };

  // 통계 계산
  const totalResponses = rsvps.length;
  const attendingCount = rsvps.filter((rsvp) => rsvp.isAttending).length;
  const totalAttendees = rsvps
    .filter((rsvp) => rsvp.isAttending)
    .reduce((sum, rsvp) => sum + rsvp.adultCount + rsvp.childrenCount, 0);

  // 로딩 중 표시
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: AppleColors.background,
          padding: "20px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        ⏳ 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: AppleColors.background,
        padding: "20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          backgroundColor: AppleColors.surface,
          padding: "24px 32px",
          borderRadius: "16px",
          marginBottom: "24px",
          boxShadow: `0 4px 20px ${AppleColors.shadow}`,
          border: `1px solid ${AppleColors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: AppleColors.text.primary,
              fontSize: "32px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            📊 관리자 대시보드
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              color: AppleColors.text.secondary,
              fontSize: "16px",
              fontWeight: "400",
            }}
          >
            {adminUser?.username || "관리자"}님 환영합니다!
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: AppleColors.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: `0 2px 8px ${AppleColors.shadow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0056CC";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = AppleColors.primary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ➕ 새 그룹 생성
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "12px 24px",
              backgroundColor: AppleColors.danger,
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              boxShadow: `0 2px 8px ${AppleColors.shadow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#D70015";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = AppleColors.danger;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
      {/* 결혼식 기본 정보 섹션 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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
          <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}>
            💒 결혼식 기본 정보
          </h2>
          <button
            onClick={() => setIsEditingWeddingInfo(!isEditingWeddingInfo)}
            disabled={isUpdatingWeddingInfo}
            style={{
              padding: "8px 16px",
              backgroundColor: isEditingWeddingInfo ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isEditingWeddingInfo ? "📝 편집 취소" : "✏️ 정보 수정"}
          </button>
        </div>

        {isEditingWeddingInfo ? (
          // 편집 모드
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                👰 신부 이름
              </label>
              <input
                type="text"
                value={weddingInfo.brideName}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    brideName: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="신부 이름 입력"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                🤵 신랑 이름
              </label>
              <input
                type="text"
                value={weddingInfo.groomName}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    groomName: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="신랑 이름 입력"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                📅 결혼식 날짜
              </label>
              <input
                type="date"
                value={weddingInfo.weddingDate}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    weddingDate: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                🕐 결혼식 시간
              </label>
              <input
                type="time"
                value={weddingInfo.weddingTime}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    weddingTime: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                🏛️ 결혼식 장소명
              </label>
              <input
                type="text"
                value={weddingInfo.weddingLocation}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    weddingLocation: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="예: 신라호텔 다이아몬드홀"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                📍 상세 주소
              </label>
              <input
                type="text"
                value={weddingInfo.weddingAddress}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    weddingAddress: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="서울시 중구 동호로 249"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                💌 인사말
              </label>
              <textarea
                value={weddingInfo.greetingMessage}
                onChange={(e) =>
                  setWeddingInfo((prev) => ({
                    ...prev,
                    greetingMessage: e.target.value,
                  }))
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
                placeholder="결혼식 인사말을 입력해주세요..."
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsEditingWeddingInfo(false)}
                disabled={isUpdatingWeddingInfo}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: 다음 단계에서 실제 저장 로직 구현
                  console.log("결혼식 정보 저장:", weddingInfo);
                  setIsEditingWeddingInfo(false);
                }}
                disabled={isUpdatingWeddingInfo}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isUpdatingWeddingInfo ? "⏳ 저장 중..." : "💾 저장하기"}
              </button>
            </div>
          </div>
        ) : (
          // 조회 모드
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <strong style={{ color: "#374151" }}>👰 신부:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.brideName || "미입력"}
              </span>
            </div>
            <div>
              <strong style={{ color: "#374151" }}>🤵 신랑:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.groomName || "미입력"}
              </span>
            </div>
            <div>
              <strong style={{ color: "#374151" }}>📅 날짜:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.weddingDate || "미입력"}
              </span>
            </div>
            <div>
              <strong style={{ color: "#374151" }}>🕐 시간:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.weddingTime || "미입력"}
              </span>
            </div>
            <div>
              <strong style={{ color: "#374151" }}>🏛️ 장소:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.weddingLocation || "미입력"}
              </span>
            </div>
            <div>
              <strong style={{ color: "#374151" }}>📍 주소:</strong>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {weddingInfo.weddingAddress || "미입력"}
              </span>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <strong style={{ color: "#374151" }}>💌 인사말:</strong>
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {weddingInfo.greetingMessage || "인사말이 입력되지 않았습니다."}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 성공/에러 메시지 */}
      {successMessage && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #c3e6cb",
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#2c3e50" }}
          >
            {groups.length}
          </div>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>총 그룹 수</div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📝</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#2c3e50" }}
          >
            {totalResponses}
          </div>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>총 응답 수</div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}
          >
            {attendingCount}
          </div>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>참석 응답</div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}
          >
            {totalAttendees}
          </div>
          <div style={{ color: "#6c757d", fontSize: "14px" }}>총 참석 인원</div>
        </div>
      </div>

      {/* 그룹 관리 섹션 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: "#2c3e50",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          👥 그룹 관리
        </h2>

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
                border: "2px solid #e9ecef",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
              }}
            >
              {/* 그룹 기본 정보 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "15px",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* 그룹 이름 편집 기능 */}
                  {editingGroupName === group.id ? (
                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>
                          {group.groupType === GroupType.WEDDING_GUEST && "🎊"}
                          {group.groupType === GroupType.PARENTS_GUEST && "👨‍👩‍👧‍👦"}
                          {group.groupType === GroupType.COMPANY_GUEST && "🏢"}
                        </span>
                        <input
                          type="text"
                          value={tempGroupName}
                          onChange={(e) => setTempGroupName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleGroupNameSave(group.id!);
                            }
                            if (e.key === "Escape") {
                              handleGroupNameCancel();
                            }
                          }}
                          disabled={isUpdatingGroupName}
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            border: "2px solid #007bff",
                            borderRadius: "4px",
                            fontSize: "16px",
                            outline: "none",
                          }}
                          placeholder="그룹 이름을 입력하세요"
                          autoFocus
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          onClick={() => handleGroupNameSave(group.id!)}
                          disabled={
                            isUpdatingGroupName || !tempGroupName.trim()
                          }
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor:
                              isUpdatingGroupName || !tempGroupName.trim()
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              isUpdatingGroupName || !tempGroupName.trim()
                                ? 0.6
                                : 1,
                          }}
                        >
                          {isUpdatingGroupName ? "저장 중..." : "✓ 저장"}
                        </button>
                        <button
                          onClick={handleGroupNameCancel}
                          disabled={isUpdatingGroupName}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: isUpdatingGroupName
                              ? "not-allowed"
                              : "pointer",
                            opacity: isUpdatingGroupName ? 0.6 : 1,
                          }}
                        >
                          ✕ 취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#2c3e50",
                          fontSize: "18px",
                        }}
                      >
                        {group.groupType === GroupType.WEDDING_GUEST && "🎊"}
                        {group.groupType === GroupType.PARENTS_GUEST && "👨‍👩‍👧‍👦"}
                        {group.groupType === GroupType.COMPANY_GUEST &&
                          "🏢"}{" "}
                        {group.groupName}
                      </h3>
                      <button
                        onClick={() => handleGroupNameEdit(group)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #17a2b8",
                          color: "#17a2b8",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginRight: "8px",
                        }}
                      >
                        ✏️ 이름수정
                      </button>
                    </div>
                  )}

                  {/* 활성화된 기능 표시 */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#1976d2",
                      lineHeight: "1.4",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>활성화된 기능:</strong>
                    <br />
                    {Object.entries(groupFeatures[group.id!] || {})
                      .filter(([_, enabled]) => enabled)
                      .map(([key, _]) => {
                        const featureNames: { [key: string]: string } = {
                          showRsvpForm: "📝 참석응답",
                          showAccountInfo: "💳 계좌정보",
                          showShareButton: "📤 공유",
                          showVenueInfo: "📍 오시는길",
                          showPhotoGallery: "📸 갤러리",
                          showCeremonyProgram: "📋 본식순서",
                        };
                        return featureNames[key];
                      })
                      .join(" • ") || "활성화된 기능이 없습니다"}
                  </div>
                </div>

                {/* 기능 설정 버튼 */}
                {editingGroupFeatures !== group.id && (
                  <button
                    onClick={() => handleGroupFeaturesEdit(group.id!)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #1565c0",
                      color: "#1565c0",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ⚙️ 기능설정
                  </button>
                )}

                {/* 삭제 버튼 추가 */}
                {!deletingGroupId && (
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #dc3545",
                      color: "#dc3545",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginLeft: "8px",
                    }}
                  >
                    🗑️ 삭제
                  </button>
                )}
              </div>

              {/* 고유 URL 정보 */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#6c757d",
                  marginBottom: "15px",
                  padding: "8px",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <strong>고유 URL:</strong>
                <br />
                <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                  /invitation/{group.uniqueCode}
                </span>
              </div>

              {/* 인사말 표시/편집 */}
              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#495057",
                    marginBottom: "8px",
                  }}
                >
                  💬 그룹 인사말:
                </div>

                {editingGroupGreeting === group.id ? (
                  <GreetingEditor
                    currentGreeting={group.greetingMessage}
                    onSave={(newGreeting: string) =>
                      handleGroupGreetingSave(group.id!, newGreeting)
                    }
                    onCancel={handleGroupGreetingCancel}
                    isLoading={isUpdatingGreeting}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#495057",
                      lineHeight: "1.4",
                      padding: "10px",
                      backgroundColor: "white",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                      marginBottom: "10px",
                    }}
                  >
                    {group.greetingMessage}
                  </div>
                )}
              </div>

              {/* 기능 설정 편집 모드 */}
              {editingGroupFeatures === group.id && (
                <GroupFeatureSettings
                  group={group}
                  currentFeatures={
                    groupFeatures[group.id!] || {
                      showRsvpForm: false,
                      showAccountInfo: false,
                      showShareButton: false,
                      showVenueInfo: false,
                      showPhotoGallery: false,
                      showCeremonyProgram: false,
                    }
                  }
                  onSave={handleGroupFeaturesSave}
                  onCancel={handleGroupFeaturesCancel}
                  isLoading={isUpdatingFeatures}
                />
              )}

              {/* 버튼 그룹 (기능 설정 편집 중이 아닐 때만 표시) */}
              {editingGroupFeatures !== group.id && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/invitation/${group.uniqueCode}`
                      );
                      setSuccessMessage("링크가 클립보드에 복사되었습니다!");
                      setTimeout(() => setSuccessMessage(null), 2000);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    📋 링크 복사
                  </button>

                  {editingGroupGreeting !== group.id && (
                    <button
                      onClick={() => handleGroupGreetingEdit(group.id!)}
                      style={{
                        flex: 1,
                        backgroundColor: "#ffc107",
                        color: "#212529",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ 인사말 수정
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RSVP 응답 목록 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: "#2c3e50",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          📝 참석 응답 현황
        </h2>

        {rsvps.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    응답자
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    참석 여부
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    성인
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    아동
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    총 인원
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    응답일
                  </th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp, index) => (
                  <tr
                    key={rsvp.id || `rsvp-${index}`} // ← id가 없으면 index 사용
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>{rsvp.responderName}</strong>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: rsvp.isAttending
                            ? "#d4edda"
                            : "#f8d7da",
                          color: rsvp.isAttending ? "#155724" : "#721c24",
                        }}
                      >
                        {rsvp.isAttending ? "✅ 참석" : "❌ 불참"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {rsvp.adultCount}명
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {rsvp.childrenCount}명
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <strong>{rsvp.adultCount + rsvp.childrenCount}명</strong>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#6c757d",
                      }}
                    >
                      {rsvp.createdAt
                        ? new Date(rsvp.createdAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6c757d",
              fontSize: "16px",
            }}
          >
            📭 아직 응답이 없습니다.
          </div>
        )}
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={handleGroupCreated}
      />
      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirmGroup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#dc3545" }}>
              🗑️ 그룹 삭제 확인
            </h3>

            <p style={{ marginBottom: "20px", lineHeight: "1.5" }}>
              <strong>"{deleteConfirmGroup.groupName}"</strong> 그룹을 정말
              삭제하시겠습니까?
            </p>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
                ⚠️ <strong>주의:</strong> 삭제된 그룹은 복구할 수 없습니다.
                <br />
                응답이 있는 그룹의 경우 추가 확인이 필요할 수 있습니다.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCancelDelete}
                disabled={deletingGroupId === deleteConfirmGroup.id}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    deletingGroupId === deleteConfirmGroup.id
                      ? "not-allowed"
                      : "pointer",
                  opacity: deletingGroupId === deleteConfirmGroup.id ? 0.6 : 1,
                }}
              >
                취소
              </button>

              <button
                onClick={() => handleConfirmDelete(false)}
                disabled={deletingGroupId === deleteConfirmGroup.id}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    deletingGroupId === deleteConfirmGroup.id
                      ? "not-allowed"
                      : "pointer",
                  opacity: deletingGroupId === deleteConfirmGroup.id ? 0.6 : 1,
                }}
              >
                {deletingGroupId === deleteConfirmGroup.id
                  ? "삭제 중..."
                  : "삭제"}
              </button>

              <button
                onClick={() => handleConfirmDelete(true)}
                disabled={deletingGroupId === deleteConfirmGroup.id}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    deletingGroupId === deleteConfirmGroup.id
                      ? "not-allowed"
                      : "pointer",
                  opacity: deletingGroupId === deleteConfirmGroup.id ? 0.6 : 1,
                  fontSize: "12px",
                }}
              >
                강제 삭제
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CreateGroupModal 수정 */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newGroup: InvitationGroup) => {
            // 로컬 상태 업데이트
            setGroups((prev) => [...prev, newGroup]);

            // 성공 메시지 표시
            setSuccessMessage(
              `"${newGroup.groupName}" 그룹이 성공적으로 생성되었습니다!`
            );
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
