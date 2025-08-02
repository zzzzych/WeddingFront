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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
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
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // ===== 실제 API 호출로 변경 =====
      const [rsvpData, groupData] = await Promise.all([
        getAllRsvps(),
        getAllGroups(),
      ]);

      console.log("📊 불러온 RSVP 데이터:", rsvpData);
      console.log("👥 불러온 그룹 데이터:", groupData);

      // 서버 응답 구조에 맞게 RSVP 데이터 변환
      let processedRsvps = [];
      if (
        (rsvpData as any).responses &&
        Array.isArray((rsvpData as any).responses)
      ) {
        // 각 응답에서 response 객체 추출
        processedRsvps = (rsvpData as any).responses.map((item: any) => ({
          id: item.response.id,
          responderName: item.response.responderName,
          isAttending: item.response.isAttending,
          adultCount: item.response.adultCount,
          childrenCount: item.response.childrenCount,
          submittedAt: item.response.submittedAt,
        }));
      } else if (Array.isArray(rsvpData)) {
        // 만약 직접 배열로 오는 경우
        processedRsvps = rsvpData;
      }

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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
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
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "28px" }}>
            📊 관리자 대시보드
          </h1>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d" }}>
            {adminUser?.username || "관리자"}님 환영합니다!
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsCreateGroupModalOpen(true)}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✨ 새 그룹 생성
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            🚪 로그아웃
          </button>
        </div>
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
                {rsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
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
    </div>
  );
};

export default AdminDashboard;
