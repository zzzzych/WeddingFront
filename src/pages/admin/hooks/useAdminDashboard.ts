// src/pages/admin/hooks/useAdminDashboard.ts
// 관리자 대시보드의 모든 상태와 로직을 관리하는 커스텀 훅

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllGroups,
  deleteGroup,
  updateGroup,
  getAllRsvpsList,
  deleteRsvpResponse,
  getAdminList,
  updateRsvpResponse
} from "../../../services/invitationService";
import {
  InvitationGroup,
  RsvpListResponse,
  AdminCreateResponse,
  AdminInfo,
} from "../../../types";

/**
 * 관리자 대시보드 커스텀 훅
 * 모든 상태와 비즈니스 로직을 중앙집중식으로 관리
 */
export const useAdminDashboard = () => {
  const navigate = useNavigate();

  // ==================== 🔄 상태 관리 ====================
  
  // 그룹 관련 상태
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGreeting, setEditingGreeting] = useState("");

  // RSVP 응답 관련 상태
  const [rsvpData, setRsvpData] = useState<RsvpListResponse | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // 관리자 관련 상태
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminList, setAdminList] = useState<AdminInfo[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminList, setShowAdminList] = useState(false);

  // RSVP 편집 관련 상태
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null);
  const [editingRsvpData, setEditingRsvpData] = useState<{
    responderName: string;
    isAttending: boolean;
    adultCount: number;
    childrenCount: number;
    phoneNumber?: string;
    message?: string;
  } | null>(null);

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
   * 전체 RSVP 응답 목록과 통계를 가져오는 함수
   */
  const fetchAllRsvps = async () => {
    try {
      setRsvpLoading(true);
      console.log("📊 전체 RSVP 데이터 조회 시작");
      const data = await getAllRsvpsList();
      
      // 서버 응답을 클라이언트 호환 형태로 변환
      const transformedResponses = data.responses.map((item: any) => ({
        ...item,
        // 플랫 구조 속성들 (기존 컴포넌트 호환성)
        id: item.response?.id,
        guestName: item.response?.responderName,
        willAttend: item.response?.isAttending,
        phoneNumber: item.response?.phoneNumber,
        companions: item.response ? 
          Math.max(0, (item.response.adultCount + item.response.childrenCount) - 1) : 0,
        message: item.response?.message,
        groupName: item.groupInfo?.groupName
      }));

      setRsvpData({
        responses: transformedResponses,
        summary: data.summary
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
 * 관리자 목록을 서버에서 가져오는 함수
 */
const fetchAdminList = async () => {
  try {
    console.log('📋 관리자 목록 조회 시작');
    
    // 토큰 유효성 사전 체크
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('❌ 인증 토큰이 없음');
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      // 로그인 페이지로 리디렉션 로직 추가 가능
      return;
    }
    
    // API 호출
    const response = await getAdminList();
    
    console.log('✅ 관리자 목록 조회 성공:', response);
    
    // 응답 데이터 구조에 따라 처리
    if (response.admins && Array.isArray(response.admins)) {
      setAdminList(response.admins);
    } else if (Array.isArray(response)) {
      setAdminList(response);
    } else {
      console.warn('⚠️ 예상과 다른 응답 구조:', response);
      setAdminList([]);
    }
    
  } catch (error: any) {
    console.error('❌ 관리자 목록 조회 실패:', error);
    
    // 에러 타입별 처리
    if (error.message && (
      error.message.includes('토큰이 만료되었습니다') || 
      error.message.includes('인증이 만료되었습니다') ||
      error.message.includes('다시 로그인해주세요')
    )) {
      // 토큰 만료 에러
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      
      // 로컬 스토리지 정리 (혹시 누락된 경우를 대비)
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // 로그인 페이지로 리디렉션하거나 로그인 상태 초기화
      // 예: window.location.href = '/admin/login';
      
    } else if (error.message && error.message.includes('네트워크')) {
      // 네트워크 에러
      alert('네트워크 연결을 확인해주세요.');
      
    } else {
      // 기타 에러
      alert('관리자 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 에러 발생 시 빈 배열로 초기화
    setAdminList([]);
  }
};

  // ==================== 🔄 컴포넌트 초기화 ====================

  /**
   * 대시보드 초기화 함수
   */
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

  // ==================== 🗑️ 그룹 관리 함수들 ====================

  /**
   * 그룹 삭제 처리 함수
   */
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const confirmDelete = window.confirm(
      `정말로 "${groupName}" 그룹을 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmDelete) return;

    try {
      console.log(`🗑️ 그룹 삭제 시도: ${groupId}`);
      await deleteGroup(groupId, false);
      await fetchGroups();
      await fetchAllRsvps();
      alert("✅ 그룹이 성공적으로 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ 그룹 삭제 실패:", error);
      
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
   */
  const handleForceDeleteGroup = async (groupId: string, groupName: string) => {
    try {
      console.log(`💥 그룹 강제 삭제 시도: ${groupId}`);
      await deleteGroup(groupId, true);
      await fetchGroups();
      await fetchAllRsvps();
      alert("✅ 그룹과 모든 관련 데이터가 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ 강제 삭제 실패:", error);
      alert(`❌ 강제 삭제에 실패했습니다.\n\n${error.message}`);
    }
  };

  // ==================== ✏️ 그룹 정보 업데이트 함수들 ====================

  /**
   * 인사말 업데이트 함수
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

  // ==================== 📝 RSVP 응답 관리 함수들 ====================

  /**
   * RSVP 응답 삭제 함수
   */
  const handleDeleteRsvp = async (rsvpId: string, guestName: string) => {
    const confirmDelete = window.confirm(
      `정말로 "${guestName}"님의 응답을 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmDelete) return;

    try {
      console.log(`🗑️ RSVP 응답 삭제 시도: ${rsvpId}`);
      await deleteRsvpResponse(rsvpId);
      await fetchAllRsvps();
      alert("✅ RSVP 응답이 삭제되었습니다.");
    } catch (error: any) {
      console.error("❌ RSVP 응답 삭제 실패:", error);
      alert(`❌ RSVP 응답 삭제에 실패했습니다: ${error.message}`);
    }
  };

  /**
 * RSVP 편집 시작 함수
 */
const startEditingRsvp = (rsvp: any) => {
  setEditingRsvpId(rsvp.id);
  setEditingRsvpData({
    responderName: rsvp.guestName || rsvp.response?.responderName,
    isAttending: rsvp.willAttend ?? rsvp.response?.isAttending,
    adultCount: rsvp.response?.adultCount || 1,
    childrenCount: rsvp.response?.childrenCount || 0,
    phoneNumber: rsvp.phoneNumber || rsvp.response?.phoneNumber || '',
    message: rsvp.message || rsvp.response?.message || ''
  });
};

/**
 * RSVP 편집 취소 함수
 */
const cancelEditingRsvp = () => {
  setEditingRsvpId(null);
  setEditingRsvpData(null);
};

/**
 * RSVP 응답 업데이트 함수
 */
const handleUpdateRsvp = async (rsvpId: string, updateData: any) => {
  try {
    console.log(`🔄 RSVP 업데이트: ${rsvpId}`, updateData);
    await updateRsvpResponse(rsvpId, updateData);
    await fetchAllRsvps(); // 데이터 새로고침
    setEditingRsvpId(null);
    setEditingRsvpData(null);
    alert("✅ RSVP 응답이 업데이트되었습니다.");
  } catch (error: any) {
    console.error("❌ RSVP 업데이트 실패:", error);
    alert(`❌ RSVP 업데이트에 실패했습니다: ${error.message}`);
  }
};

/**
 * 편집 중인 RSVP 데이터 변경 함수
 */
const updateEditingRsvpData = (field: string, value: any) => {
  if (editingRsvpData) {
    setEditingRsvpData({
      ...editingRsvpData,
      [field]: value
    });
  }
};

  // ==================== 👥 관리자 관련 함수들 ====================

  /**
   * 관리자 목록 토글 함수
   */
  const toggleAdminList = () => {
    if (!showAdminList) {
      fetchAdminList();
    }
    setShowAdminList(!showAdminList);
  };

  /**
   * 관리자 생성 성공 처리 함수
   */
  const handleCreateAdminSuccess = (newAdmin: AdminCreateResponse) => {
    console.log("🎉 새 관리자 생성 완료:", newAdmin);
    if (showAdminList) {
      fetchAdminList();
    }
  };

  // ==================== 🔧 유틸리티 함수들 ====================

  /**
   * 인사말 편집 시작 함수
   */
  const startEditingGreeting = (group: InvitationGroup) => {
    setEditingGroupId(group.id || null);
    setEditingGreeting(group.greetingMessage || "");
  };

  /**
   * 전체 통계 계산 함수
   */
  const getTotalStats = () => {
    const summary = rsvpData?.summary;
    return {
      totalGroups: groups.length,
      totalResponses: summary?.totalResponses || 0,
      totalAttending: summary?.attendingResponses || 0,
      totalNotAttending: summary?.notAttendingResponses || 0,
      totalPending: 0,
    };
  };

  /**
   * 로그아웃 처리 함수
   */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/012486/login");
  };

  // ==================== 📤 반환 값 ====================
  
  return {
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
    setEditingGreeting,
    setShowCreateAdminModal,
    setEditingRsvpId,
  setEditingRsvpData,

    // 데이터 로딩 함수들
    fetchGroups,
    fetchAllRsvps,
    fetchAdminList,

    // 비즈니스 로직 함수들
    handleDeleteGroup,
    handleForceDeleteGroup,
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
  cancelEditingRsvp,
  handleUpdateRsvp,
  updateEditingRsvpData,
  };
};