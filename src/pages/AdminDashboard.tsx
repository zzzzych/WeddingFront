// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllGroups,
  deleteGroup,
  updateGroup,
  getAllRsvpsList,      // ✅ 수정된 함수명
  getRsvpList,          // ✅ 새로 추가
  updateRsvpResponse,   // ✅ 새로 추가
  deleteRsvpResponse,   // ✅ 새로 추가
  getAdminList          // ✅ 새로 추가
} from "../services/invitationService";
import {
  InvitationGroup,
  RsvpListResponse,         // ✅ 새로 추가
  SimpleRsvpWithGroupInfo,  // ✅ 새로 추가
  RsvpSummary,              // ✅ 새로 추가
  UpdateRsvpRequest,        // ✅ 새로 추가
  AdminCreateResponse,      // ✅ 새로 추가
  AdminInfo,                // ✅ 새로 추가
  AdminListResponse,        // ✅ 새로 추가
  getAdminRoleLabel         // ✅ 새로 추가
} from "../types";
import CreateGroupModal from "../components/CreateGroupModal";
import CreateAdminModal from "../components/CreateAdminModal";

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

  // RSVP 응답 관련 상태
  const [rsvpData, setRsvpData] = useState<RsvpListResponse | null>(null); // ✅ 전체 RSVP 데이터 (응답 목록 + 통계)
  const [rsvpLoading, setRsvpLoading] = useState(false); // RSVP 로딩 상태
  const [selectedGroupForRsvp, setSelectedGroupForRsvp] = useState<string | null>(null); // 선택된 그룹 ID (RSVP 조회용)

  // 관리자 관련 상태
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false); // 관리자 생성 모달 표시 여부
  const [adminList, setAdminList] = useState<AdminInfo[]>([]); // 관리자 목록
  const [adminLoading, setAdminLoading] = useState(false); // 관리자 로딩 상태
  const [showAdminList, setShowAdminList] = useState(false); // 관리자 목록 표시 여부

  // ==================== 🔄 데이터 로딩 함수들 ====================

  /**
   * 그룹 목록을 서버에서 가져오는 함수
   */
  const fetchGroups = async () => {
    try {
      console.log("📋 그룹 목록 조회 시작");
      const groupsData = await getAllGroups();
      setGroups(groupsData);
      console.log("✅ 그룹 목록 조회 완료:", groupsData);
    } catch (error) {
      console.error("❌ 그룹 조회 실패:", error);
      alert("그룹 목록을 불러오는데 실패했습니다.");
    }
  };

/**
 * 전체 RSVP 응답 목록과 통계를 가져오는 함수 (수정된 버전)
 */
const fetchAllRsvps = async () => {
  try {
    setRsvpLoading(true);
    console.log("📊 전체 RSVP 데이터 조회 시작");
    const data = await getAllRsvpsList();
    
    // ✅ 호환성을 위한 추가 필드들 보완
    const enhancedSummary = {
      ...data.summary,
      totalAttending: data.summary.attendingResponses,  // 호환성
      totalNotAttending: data.summary.notAttendingResponses,  // 호환성
      totalPending: 0  // 서버에서 지원하지 않으므로 0으로 설정
    };
    
    setRsvpData({
      responses: data.responses,
      summary: enhancedSummary
    });
    console.log("✅ RSVP 데이터 조회 완료:", data);
  } catch (error) {
    console.error("❌ RSVP 데이터 조회 실패:", error);
    alert("RSVP 데이터를 불러오는데 실패했습니다.");
  } finally {
    setRsvpLoading(false);
  }
};

  /**
 * 관리자 목록을 가져오는 함수 (타입 오류 수정)
 */
const fetchAdminList = async () => {
  try {
    setAdminLoading(true);
    console.log("👥 관리자 목록 조회 시작");
    const data = await getAdminList();
    setAdminList(data.admins || []);
    console.log("✅ 관리자 목록 조회 완료:", data);
  } catch (error: any) {  // ✅ error: any로 타입 명시
    console.error("❌ 관리자 목록 조회 실패:", error);
    // 권한이 없는 경우 에러 메시지 표시하지 않음
    if (!error?.message?.includes('권한')) {  // ✅ 옵셔널 체이닝 사용
      alert("관리자 목록을 불러오는데 실패했습니다.");
    }
  } finally {
    setAdminLoading(false);
  }
};

  // ==================== 🔄 컴포넌트 초기화 ====================
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        // 병렬로 데이터 로딩
        await Promise.all([
          fetchGroups(),
          fetchAllRsvps()
        ]);
      } catch (error) {
        console.error("❌ 대시보드 초기화 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // ==================== 🗑️ 그룹 삭제 관련 함수들 ====================

  /**
   * 그룹 삭제 처리 함수 (일반 삭제)
   * @param groupId - 삭제할 그룹 ID
   * @param groupName - 삭제할 그룹 이름 (확인용)
   */
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    // 삭제 확인
    const confirmDelete = window.confirm(
      `정말로 "${groupName}" 그룹을 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      console.log(`🗑️ 그룹 삭제 시도: ${groupId}`);
      await deleteGroup(groupId, false); // 일반 삭제
      await fetchGroups(); // 그룹 목록 새로고침
      await fetchAllRsvps(); // RSVP 데이터도 새로고침
      alert("✅ 그룹이 성공적으로 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ 그룹 삭제 실패:", error);
      
      // 409 에러 (응답이 있는 그룹)인 경우 강제 삭제 옵션 제공
      if (error.message && error.message.includes("응답이 있는")) {
        const forceDelete = window.confirm(
          `❌ ${error.message}\n\n정말로 강제 삭제하시겠습니까?\n\n⚠️ 경고: 모든 응답 데이터가 함께 삭제됩니다!`
        );
        
        if (forceDelete) {
          await handleForceDeleteGroup(groupId, groupName);
        }
      } else {
        alert(`❌ 그룹 삭제에 실패했습니다.\n\n${error.message}`);
      }
    }
  };

  /**
   * 그룹 강제 삭제 처리 함수
   * @param groupId - 삭제할 그룹 ID
   * @param groupName - 삭제할 그룹 이름 (확인용)
   */
  const handleForceDeleteGroup = async (groupId: string, groupName: string) => {
    try {
      console.log(`💥 그룹 강제 삭제 시도: ${groupId}`);
      await deleteGroup(groupId, true); // 강제 삭제
      await fetchGroups(); // 그룹 목록 새로고침
      await fetchAllRsvps(); // RSVP 데이터도 새로고침
      alert("✅ 그룹과 모든 관련 데이터가 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ 강제 삭제 실패:", error);
      alert(`❌ 강제 삭제에 실패했습니다.\n\n${error.message}`);
    }
  };

  // ==================== ✏️ 그룹 정보 업데이트 함수들 ====================

  /**
   * 인사말 업데이트 함수
   * @param groupId - 수정할 그룹 ID
   * @param newGreeting - 새로운 인사말
   */
  const handleUpdateGreeting = async (groupId: string, newGreeting: string) => {
    try {
      console.log(`✏️ 인사말 업데이트: ${groupId}`);
      await updateGroup(groupId, { greetingMessage: newGreeting });
      await fetchGroups();
      setEditingGroupId(null);
      alert("✅ 인사말이 업데이트되었습니다.");
    } catch (error) {
      console.error("❌ 인사말 업데이트 실패:", error);
      alert("❌ 인사말 업데이트에 실패했습니다.");
    }
  };

  /**
   * 그룹명 업데이트 함수
   * @param groupId - 수정할 그룹 ID
   * @param newName - 새로운 그룹명
   */
  const handleUpdateGroupName = async (groupId: string, newName: string) => {
    try {
      console.log(`✏️ 그룹명 업데이트: ${groupId}`);
      await updateGroup(groupId, { groupName: newName });
      await fetchGroups();
      alert("✅ 그룹 이름이 업데이트되었습니다.");
    } catch (error) {
      console.error("❌ 그룹 이름 업데이트 실패:", error);
      alert("❌ 그룹 이름 업데이트에 실패했습니다.");
    }
  };

  /**
   * URL 코드 업데이트 함수
   * @param groupId - 수정할 그룹 ID
   * @param newCode - 새로운 URL 코드
   */
  const handleUpdateGroupCode = async (groupId: string, newCode: string) => {
    try {
      console.log(`✏️ URL 코드 업데이트: ${groupId}`);
      await updateGroup(groupId, { uniqueCode: newCode });
      await fetchGroups();
      alert("✅ URL 코드가 업데이트되었습니다!");
    } catch (error: any) {
      console.error("❌ URL 코드 업데이트 실패:", error);
      if (error.message && error.message.includes("이미 존재")) {
        alert("❌ 이미 사용 중인 URL 코드입니다.\n다른 코드를 사용해주세요.");
      } else {
        alert("❌ URL 코드 업데이트에 실패했습니다.");
      }
    }
  };

  // ==================== ⚙️ 그룹 기능 설정 관련 함수들 ====================

  /**
   * 그룹 기능 설정 값 가져오기 함수
   * @param group - 그룹 객체
   * @param featureKey - 기능 키
   * @returns boolean - 기능 활성화 여부
   */
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

  /**
   * 기능 설정 토글 처리 함수
   * @param groupId - 그룹 ID
   * @param featureKey - 기능 키
   * @param enabled - 활성화 여부
   */
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
      console.error("❌ 기능 설정 업데이트 실패:", error);
      alert(`❌ 설정 변경에 실패했습니다: ${error.message}`);
    }
  };

  // ==================== 📊 RSVP 관련 함수들 ====================

 /**
 * 특정 그룹의 RSVP 응답 조회 (수정된 버전)
 * @param groupId - 그룹 ID
 */
const handleViewGroupRsvps = async (groupId: string) => {
  try {
    setRsvpLoading(true);
    setSelectedGroupForRsvp(groupId);
    console.log(`📋 그룹 ${groupId}의 RSVP 조회`);
    
    const responses = await getRsvpList(groupId);
    
    // ✅ 서버 응답을 올바른 형태로 변환
    setRsvpData({
      responses: responses,
      summary: {
        totalResponses: responses.length,
        attendingResponses: responses.filter(r => r.willAttend === true).length,  // ✅ attendingResponses 사용
        notAttendingResponses: responses.filter(r => r.willAttend === false).length,  // ✅ notAttendingResponses 사용
        totalAttendingCount: responses.filter(r => r.willAttend === true).reduce((sum, r) => sum + (r.companions || 0) + 1, 0),
        totalAdultCount: responses.filter(r => r.willAttend === true).reduce((sum, r) => sum + (r.companions || 0) + 1, 0),
        totalChildrenCount: 0,  // 현재 데이터에서 구분이 없으므로 0
        // ✅ 호환성을 위한 추가 필드들
        totalAttending: responses.filter(r => r.willAttend === true).length,
        totalNotAttending: responses.filter(r => r.willAttend === false).length,
        totalPending: responses.filter(r => r.willAttend === null).length
      }
    });
  } catch (error) {
    console.error("❌ 그룹 RSVP 조회 실패:", error);
    alert("RSVP 데이터를 불러오는데 실패했습니다.");
  } finally {
    setRsvpLoading(false);
  }
};

  /**
   * RSVP 응답 수정
   * @param rsvpId - 수정할 RSVP ID
   * @param updateData - 수정할 데이터
   */
  const handleUpdateRsvp = async (rsvpId: string, updateData: UpdateRsvpRequest) => {
    try {
      console.log(`✏️ RSVP 응답 수정: ${rsvpId}`);
      await updateRsvpResponse(rsvpId, updateData);
      
      // 현재 선택된 그룹이 있으면 해당 그룹의 RSVP 재조회, 없으면 전체 조회
      if (selectedGroupForRsvp) {
        await handleViewGroupRsvps(selectedGroupForRsvp);
      } else {
        await fetchAllRsvps();
      }
      
      alert("✅ RSVP 응답이 수정되었습니다.");
    } catch (error: any) {
      console.error("❌ RSVP 응답 수정 실패:", error);
      alert(`❌ RSVP 응답 수정에 실패했습니다: ${error.message}`);
    }
  };

  /**
   * RSVP 응답 삭제
   * @param rsvpId - 삭제할 RSVP ID
   * @param guestName - 게스트 이름 (확인용)
   */
  const handleDeleteRsvp = async (rsvpId: string, guestName: string) => {
    const confirmDelete = window.confirm(
      `정말로 "${guestName}"님의 RSVP 응답을 삭제하시겠습니까?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      console.log(`🗑️ RSVP 응답 삭제: ${rsvpId}`);
      await deleteRsvpResponse(rsvpId);
      
      // 현재 선택된 그룹이 있으면 해당 그룹의 RSVP 재조회, 없으면 전체 조회
      if (selectedGroupForRsvp) {
        await handleViewGroupRsvps(selectedGroupForRsvp);
      } else {
        await fetchAllRsvps();
      }
      
      alert("✅ RSVP 응답이 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ RSVP 응답 삭제 실패:", error);
      alert(`❌ RSVP 응답 삭제에 실패했습니다: ${error.message}`);
    }
  };

  // ==================== 👥 관리자 관련 함수들 ====================

  /**
   * 관리자 목록 토글 함수
   */
  const toggleAdminList = () => {
    if (!showAdminList) {
      // 목록을 처음 열 때만 데이터 조회
      fetchAdminList();
    }
    setShowAdminList(!showAdminList);
  };

  /**
   * 관리자 생성 성공 처리 함수
   * @param newAdmin - 새로 생성된 관리자 정보
   */
  const handleCreateAdminSuccess = (newAdmin: AdminCreateResponse) => {
    console.log("🎉 새 관리자 생성 완료:", newAdmin);
    // 관리자 목록이 열려있다면 새로고침
    if (showAdminList) {
      fetchAdminList();
    }
  };

  // ==================== 🔧 유틸리티 함수들 ====================

  /**
   * 인사말 편집 시작 함수
   * @param group - 그룹 객체
   */
  const startEditingGreeting = (group: InvitationGroup) => {
    setEditingGroupId(group.id || null);
    setEditingGreeting(group.greetingMessage || "");
  };

  /**
   * 그룹 타입 표시 텍스트 변환 함수
   * @param type - 그룹 타입
   * @returns string - 표시용 텍스트
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
   * 전체 통계 계산 함수
   * @returns object - 통계 데이터
   */
  const getTotalStats = () => {
    const summary = rsvpData?.summary;
    return {
      totalGroups: groups.length,
      totalResponses: summary?.totalResponses || 0,
      totalAttending: summary?.totalAttending || 0,
      totalNotAttending: summary?.totalNotAttending || 0,
      totalPending: summary?.totalPending || 0,
    };
  };

  /**
   * 참석 상태 텍스트 변환 함수
   * @param willAttend - 참석 여부
   * @returns string - 상태 텍스트
   */
  const getAttendanceStatus = (willAttend: boolean | null): string => {
    if (willAttend === true) return "참석";
    if (willAttend === false) return "불참";
    return "미응답";
  };

  /**
   * 로그아웃 처리 함수
   */
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
            marginBottom: "40px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: AppleColors.text,
                margin: "0 0 8px 0",
              }}
            >
              🎎 결혼식 초대장 관리자 대시보드
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: AppleColors.secondaryText,
                margin: 0,
              }}
            >
              그룹 관리, RSVP 응답 확인 및 관리자 설정
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
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = AppleColors.primaryHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = AppleColors.primary;
              }}
            >
              + 새 그룹 생성
            </button>
            <button
              onClick={() => setShowCreateAdminModal(true)}
              style={{
                padding: "12px 24px",
                backgroundColor: AppleColors.secondary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              + 관리자 추가
            </button>
            <button
              onClick={toggleAdminList}
              style={{
                padding: "12px 24px",
                backgroundColor: AppleColors.secondaryButton,
                color: AppleColors.text,
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {showAdminList ? "관리자 목록 숨기기" : "관리자 목록 보기"}
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 24px",
                backgroundColor: AppleColors.destructive,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* ==================== 📊 통계 카드들 ==================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* 총 그룹 수 */}
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              padding: "24px",
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.secondaryText,
                marginBottom: "8px",
              }}
            >
              총 그룹 수
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: AppleColors.primary,
              }}
            >
              {stats.totalGroups}
            </div>
          </div>

          {/* 총 응답 수 */}
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              padding: "24px",
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.secondaryText,
                marginBottom: "8px",
              }}
            >
              총 응답 수
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: AppleColors.success,
              }}
            >
              {stats.totalResponses}
            </div>
          </div>

          {/* 참석 예정 */}
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              padding: "24px",
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.secondaryText,
                marginBottom: "8px",
              }}
            >
              참석 예정
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: AppleColors.success,
              }}
            >
              {stats.totalAttending}
            </div>
          </div>

          {/* 불참 */}
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              padding: "24px",
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: AppleColors.secondaryText,
                marginBottom: "8px",
              }}
            >
              불참
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: AppleColors.destructive,
              }}
            >
              {stats.totalNotAttending}
            </div>
          </div>
        </div>

        {/* ==================== 👥 관리자 목록 섹션 ==================== */}
        {showAdminList && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "12px",
              border: `1px solid ${AppleColors.border}`,
              marginBottom: "40px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: `1px solid ${AppleColors.border}`,
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: AppleColors.text,
                  margin: 0,
                }}
              >
                👥 관리자 목록
              </h2>
            </div>

            <div style={{ padding: "24px" }}>
              {adminLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: AppleColors.secondaryText,
                  }}
                >
                  관리자 목록을 불러오는 중...
                </div>
              ) : adminList.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: AppleColors.secondaryText,
                  }}
                >
                  등록된 관리자가 없습니다.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {adminList.map((admin) => (
                    <div
                      key={admin.id}
                      style={{
                        border: `1px solid ${AppleColors.border}`,
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: AppleColors.inputBackground,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: AppleColors.text,
                            }}
                          >
                            {admin.username}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              color: AppleColors.secondaryText,
                              backgroundColor: AppleColors.cardBackground,
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {getAdminRoleLabel(admin.role)}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: AppleColors.secondaryText,
                          }}
                        >
                          생성일: {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 📋 그룹 목록 섹션 ==================== */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "12px",
            border: `1px solid ${AppleColors.border}`,
            marginBottom: "40px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid ${AppleColors.border}`,
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: 0,
              }}
            >
              📋 그룹 목록
            </h2>
          </div>

          <div style={{ padding: "24px" }}>
            {groups.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: AppleColors.secondaryText,
                }}
              >
                생성된 그룹이 없습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    style={{
                      border: `1px solid ${AppleColors.border}`,
                      borderRadius: "8px",
                      padding: "20px",
                      backgroundColor: AppleColors.inputBackground,
                    }}
                  >
                    {/* 그룹 기본 정보 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
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
                              fontSize: "14px",
                              color: AppleColors.secondaryText,
                              backgroundColor: AppleColors.cardBackground,
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {getGroupTypeDisplay(group.groupType)}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "14px",
                            color: AppleColors.secondaryText,
                            marginBottom: "8px",
                          }}
                        >
                          URL 코드: <strong>{group.uniqueCode}</strong>
                        </div>

                        <div
                          style={{
                            fontSize: "14px",
                            color: AppleColors.secondaryText,
                          }}
                        >
                          초대장 URL:{" "}
                          <a
                            href={`https://leelee.kr/${group.uniqueCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: AppleColors.primary,
                              textDecoration: "none",
                            }}
                          >
                            https://leelee.kr/{group.uniqueCode}
                          </a>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleViewGroupRsvps(group.id!)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: AppleColors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          RSVP 보기
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteGroup(group.id!, group.groupName)
                          }
                          style={{
                            padding: "8px 16px",
                            backgroundColor: AppleColors.destructive,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* 인사말 섹션 */}
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: AppleColors.text,
                          marginBottom: "8px",
                        }}
                      >
                        인사말:
                      </div>
                      {editingGroupId === group.id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <textarea
                            value={editingGreeting}
                            onChange={(e) => setEditingGreeting(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              border: `1px solid ${AppleColors.border}`,
                              borderRadius: "6px",
                              fontSize: "14px",
                              minHeight: "60px",
                              fontFamily: systemFont,
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <button
                              onClick={() =>
                                handleUpdateGreeting(group.id!, editingGreeting)
                              }
                              style={{
                                padding: "6px 12px",
                                backgroundColor: AppleColors.success,
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingGroupId(null)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: AppleColors.secondaryButton,
                                color: AppleColors.text,
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              color: AppleColors.secondaryText,
                              lineHeight: "1.5",
                              flex: 1,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {group.greetingMessage || "인사말이 설정되지 않았습니다."}
                          </div>
                          <button
                            onClick={() => startEditingGreeting(group)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: AppleColors.secondaryButton,
                              color: AppleColors.text,
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                              marginLeft: "8px",
                            }}
                          >
                            편집
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 그룹 기능 설정 */}
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: AppleColors.text,
                          marginBottom: "12px",
                        }}
                      >
                        기능 설정:
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {[
                          { key: "showRsvpForm", label: "RSVP 폼 표시" },
                          { key: "showAccountInfo", label: "계좌 정보 표시" },
                          { key: "showShareButton", label: "공유 버튼 표시" },
                          { key: "showVenueInfo", label: "장소 정보 표시" },
                          { key: "showPhotoGallery", label: "사진 갤러리 표시" },
                          { key: "showCeremonyProgram", label: "식순 표시" },
                        ].map((feature) => (
                          <label
                            key={feature.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "14px",
                              color: AppleColors.text,
                              cursor: "pointer",
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
                              style={{ cursor: "pointer" }}
                            />
                            {feature.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================== 📊 RSVP 응답 섹션 ==================== */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "12px",
            border: `1px solid ${AppleColors.border}`,
            marginBottom: "40px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid ${AppleColors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: 0,
              }}
            >
              📊 RSVP 응답 관리
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setSelectedGroupForRsvp(null);
                  fetchAllRsvps();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: AppleColors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                전체 보기
              </button>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {rsvpLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: AppleColors.secondaryText,
                }}
              >
                RSVP 데이터를 불러오는 중...
              </div>
            ) : !rsvpData || rsvpData.responses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: AppleColors.secondaryText,
                }}
              >
                RSVP 응답이 없습니다.
              </div>
            ) : (
              <div>
                {/* RSVP 요약 통계 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                    padding: "16px",
                    backgroundColor: AppleColors.inputBackground,
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: AppleColors.primary,
                      }}
                    >
                      {rsvpData.summary.totalResponses}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                      }}
                    >
                      총 응답
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    color: AppleColors.success,
  }}
>
  {rsvpData.summary.attendingResponses}  {/* ✅ attendingResponses 사용 */}
</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                      }}
                    >
                      참석
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                   <div
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    color: AppleColors.destructive,
  }}
>
  {rsvpData.summary.notAttendingResponses}  {/* ✅ notAttendingResponses 사용 */}
</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                      }}
                    >
                      불참
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    color: AppleColors.warning,
  }}
>
  {rsvpData.summary.totalPending || 0}  {/* ✅ totalPending 또는 0 */}
</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: AppleColors.secondaryText,
                      }}
                    >
                      미응답
                    </div>
                  </div>
                </div>

                {/* RSVP 응답 목록 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {rsvpData.responses.map((rsvp) => (
  <div
    key={rsvp.id}  {/* ✅ rsvp.id 사용 가능 */}
    style={{
      border: `1px solid ${AppleColors.border}`,
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: AppleColors.cardBackground,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: AppleColors.text,
          }}
        >
          {rsvp.guestName}  {/* ✅ rsvp.guestName 사용 가능 */}
        </span>
        <span
          style={{
            fontSize: "14px",
            color: AppleColors.secondaryText,
            backgroundColor: AppleColors.inputBackground,
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {rsvp.groupName}  {/* ✅ rsvp.groupName 사용 가능 */}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color:
              rsvp.willAttend === true  // ✅ rsvp.willAttend 사용 가능
                ? AppleColors.success
                : rsvp.willAttend === false
                ? AppleColors.destructive
                : AppleColors.warning,
          }}
        >
          {getAttendanceStatus(rsvp.willAttend)}  {/* ✅ rsvp.willAttend 사용 가능 */}
        </span>
      </div>
      <div
        style={{
          fontSize: "14px",
          color: AppleColors.secondaryText,
        }}
      >
        전화번호: {rsvp.phoneNumber || "없음"} | 동행자: {rsvp.companions || 0}명  {/* ✅ 모든 속성 사용 가능 */}
      </div>
      {rsvp.message && (  {/* ✅ rsvp.message 사용 가능 */}
        <div
          style={{
            fontSize: "14px",
            color: AppleColors.text,
            marginTop: "4px",
            fontStyle: "italic",
          }}
        >
          💬 {rsvp.message}  {/* ✅ rsvp.message 사용 가능 */}
        </div>
      )}
    </div>
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() =>
          handleDeleteRsvp(rsvp.id!, rsvp.guestName)  {/* ✅ 모든 속성 사용 가능 */}
        }
        style={{
          padding: "6px 12px",
          backgroundColor: AppleColors.destructive,
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        삭제
      </button>
    </div>
  </div>
))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 🔧 모달들 ==================== */}
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

      {/* 관리자 생성 모달 */}
      {showCreateAdminModal && (
        <CreateAdminModal
          isOpen={showCreateAdminModal}
          onClose={() => setShowCreateAdminModal(false)}
          onSuccess={handleCreateAdminSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;