// src/pages/admin/hooks/useAdminDashboard.ts
// 관리자 대시보드의 모든 상태와 로직을 관리하는 커스텀 훅

import { useState, useEffect, useCallback } from "react";
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
  // RSVP 편집 관련 상태
  const [editingRsvpData, setEditingRsvpData] = useState<{
  responderName: string;
  isAttending: boolean;
  totalCount: number;
  attendeeNames: string[];  // 이 줄 추가!
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
          Math.max(0, (item.response.totalCount || 0) - 1) : // 🔧 totalCount - 1로 변경 (대표자 제외)
          0,
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

  /**
 * 그룹의 기능 설정을 업데이트하는 함수
 * @param groupId - 업데이트할 그룹 ID
 * @param features - 업데이트할 기능 설정들
 */
const handleUpdateGroupFeatures = useCallback(
  async (groupId: string, features: Partial<InvitationGroup>) => {
    try {
      console.log('🔧 그룹 기능 설정 업데이트 시작:', { groupId, features });
      
      // 백엔드 API 호출
      await updateGroup(groupId, features);
      
      // 성공 시 로컬 상태 업데이트
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, ...features }
            : group
        )
      );
      
      console.log('✅ 그룹 기능 설정 업데이트 완료');
    } catch (error) {
      console.error('❌ 그룹 기능 설정 업데이트 실패:', error);
      throw error; // 에러를 다시 throw하여 컴포넌트에서 처리할 수 있게 함
    }
  },
  []
);

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
 * RSVP 편집 시작 함수 (수정됨 - 데이터 정확성 및 안정성 개선)
 */
const startEditingRsvp = (rsvp: any) => {
  console.log('🔄 편집 시작 - 원본 데이터:', rsvp); // 디버깅용
  
  try {
    // 🔧 수정: 더 안전한 데이터 추출 로직
    const responseData = rsvp.response || {};
    
    // 참석 여부 결정 (우선순위: willAttend > response.isAttending > 기본값 true)
    let isAttending: boolean;
    if (rsvp.willAttend !== undefined && rsvp.willAttend !== null) {
      isAttending = Boolean(rsvp.willAttend);
    } else if (responseData.isAttending !== undefined && responseData.isAttending !== null) {
      isAttending = Boolean(responseData.isAttending);
    } else {
      isAttending = true; // 기본값
    }
    
    // 총 인원수 결정
    let totalCount: number;
    if (isAttending) {
      totalCount = Math.max(1, responseData.totalCount || 1); // 참석인 경우 최소 1명
    } else {
      totalCount = 0; // 불참인 경우 0명
    }
    
    // 참석자 이름 배열 처리
    let attendeeNames: string[];
    if (isAttending) {
      const originalNames = responseData.attendeeNames || [];
      if (Array.isArray(originalNames) && originalNames.length > 0) {
        // 기존 이름 목록이 있는 경우
        attendeeNames = [...originalNames];
        
        // totalCount와 이름 개수 동기화
        if (attendeeNames.length < totalCount) {
          // 이름이 부족하면 빈 문자열로 채우기
          while (attendeeNames.length < totalCount) {
            attendeeNames.push('');
          }
        } else if (attendeeNames.length > totalCount) {
          // 이름이 많으면 totalCount에 맞춰 자르기
          attendeeNames = attendeeNames.slice(0, totalCount);
        }
      } else {
        // 이름 목록이 없으면 totalCount만큼 빈 문자열 배열 생성
        attendeeNames = new Array(totalCount).fill('');
        
        // 첫 번째 이름은 responderName으로 설정 (있는 경우)
        const responderName = rsvp.guestName || responseData.responderName || '';
        if (responderName && attendeeNames.length > 0) {
          attendeeNames[0] = responderName;
        }
      }
    } else {
      // 불참인 경우 빈 배열
      attendeeNames = [];
    }
    
    // 🔧 수정: 편집 데이터 객체 생성 (더 안전한 방식)
    const editData = {
      responderName: rsvp.guestName || responseData.responderName || attendeeNames[0] || '',
      isAttending: isAttending,
      totalCount: totalCount,
      attendeeNames: attendeeNames,
      phoneNumber: rsvp.phoneNumber || responseData.phoneNumber || '',
      message: rsvp.message || responseData.message || ''
    };
    
    console.log('✅ 편집 데이터 설정 완료:', editData); // 디버깅용
    console.log('📊 데이터 검증:', {
      '참석여부': editData.isAttending,
      '총인원': editData.totalCount,
      '이름개수': editData.attendeeNames.length,
      '이름목록': editData.attendeeNames
    }); // 추가 디버깅
    
    // 🔧 수정: 상태 설정 전 유효성 최종 검증
    if (editData.isAttending && editData.totalCount !== editData.attendeeNames.length) {
      console.warn('⚠️ 데이터 불일치 감지 - 자동 수정:', {
        totalCount: editData.totalCount,
        namesLength: editData.attendeeNames.length
      });
      
      // 자동 수정: totalCount를 이름 개수에 맞춤
      editData.totalCount = Math.max(1, editData.attendeeNames.length);
    }
    
    // 상태 업데이트
    setEditingRsvpId(rsvp.id);
    setEditingRsvpData(editData);
    
    console.log('🎯 편집 상태 설정 완료 - ID:', rsvp.id); // 디버깅용
    
  } catch (error) {
    console.error('❌ RSVP 편집 시작 실패:', error);
    alert('편집을 시작할 수 없습니다. 다시 시도해주세요.');
  }
};

/**
 * RSVP 편집 취소 함수
 */
const cancelEditingRsvp = () => {
  setEditingRsvpId(null);
  setEditingRsvpData(null);
};

/**
 * RSVP 응답 업데이트 함수 (수정됨 - 편집 상태 보존 및 낙관적 업데이트)
 */
const handleUpdateRsvp = async (rsvpId: string, updateData: any) => {
  // 🔧 새로 추가: 편집 중인 데이터 임시 저장 (함수 시작 부분으로 이동)
  const currentEditingId = editingRsvpId;
  const currentEditingData = editingRsvpData;
  
  try {
    console.log(`🔄 RSVP 업데이트: ${rsvpId}`, updateData);
    
    // 서버 API가 기대하는 RsvpRequest 형식으로 데이터 변환 (기존 로직 유지)
    const serverRequestData = {
      isAttending: updateData.isAttending,
      totalCount: updateData.isAttending ? (updateData.totalCount || 1) : 0,
      attendeeNames: updateData.isAttending ? 
        (updateData.attendeeNames && updateData.attendeeNames.length > 0 ? 
          updateData.attendeeNames.filter((name: string) => name.trim() !== '') : 
          ['']) : // 참석이지만 이름이 없으면 빈 문자열 하나라도 넣기
        [], // 불참이면 빈 배열
      phoneNumber: updateData.phoneNumber || null,
      message: updateData.message || null
    };

    // 추가 검증: 참석인 경우 totalCount와 attendeeNames 길이 맞추기 (기존 로직 유지)
    if (serverRequestData.isAttending && serverRequestData.totalCount > 0) {
      const nameCount = serverRequestData.attendeeNames.length;
      const requiredCount = serverRequestData.totalCount;
      
      if (nameCount < requiredCount) {
        // 이름이 부족하면 빈 문자열로 채우기
        while (serverRequestData.attendeeNames.length < requiredCount) {
          serverRequestData.attendeeNames.push('');
        }
      } else if (nameCount > requiredCount) {
        // 이름이 많으면 잘라내기
        serverRequestData.attendeeNames = serverRequestData.attendeeNames.slice(0, requiredCount);
      }
    }

    console.log('🔄 최종 서버 전송 데이터:', serverRequestData); // 디버깅용
    
    // 🔧 수정: 낙관적 업데이트 - 로컬 상태 먼저 업데이트
    if (rsvpData && rsvpData.responses) {
      const updatedResponses = rsvpData.responses.map(item => {
        if (item.id === rsvpId || item.response?.id === rsvpId) {
          return {
            ...item,
            willAttend: updateData.isAttending,
            guestName: updateData.responderName,
            phoneNumber: updateData.phoneNumber,
            message: updateData.message,
            response: {
              ...item.response,
              isAttending: updateData.isAttending,
              responderName: updateData.responderName,
              totalCount: serverRequestData.totalCount,
              attendeeNames: serverRequestData.attendeeNames,
              phoneNumber: updateData.phoneNumber,
              message: updateData.message
            }
          };
        }
        return item;
      });
      
      // 로컬 상태 즉시 업데이트
      setRsvpData({
        ...rsvpData,
        responses: updatedResponses
      });
      
      console.log('✅ 낙관적 업데이트 완료'); // 디버깅용
    }
    
    // 서버 요청
    await updateRsvpResponse(rsvpId, serverRequestData);
    
    // 🔧 수정: 편집 상태 초기화를 먼저 하고
    setEditingRsvpId(null);
    setEditingRsvpData(null);
    
    // 🔧 수정: 약간의 지연 후 서버에서 최신 데이터 가져오기 (편집 상태 충돌 방지)
    setTimeout(async () => {
      try {
        console.log('🔄 서버 데이터 동기화 시작');
        await fetchAllRsvps(); // 서버에서 최신 데이터 가져오기
        console.log('✅ 서버 데이터 동기화 완료');
      } catch (error) {
        console.error('❌ 서버 데이터 동기화 실패:', error);
        // 동기화 실패해도 낙관적 업데이트된 상태 유지
      }
    }, 100); // 100ms 지연
    
    alert("✅ RSVP 응답이 업데이트되었습니다.");
    
  } catch (error: any) {
    console.error("❌ RSVP 업데이트 실패:", error);
    
    // 🔧 새로 추가: 실패 시 편집 상태 복원
    if (currentEditingId && currentEditingData) {
      console.log('🔄 편집 상태 복원');
      setEditingRsvpId(currentEditingId);
      setEditingRsvpData(currentEditingData);
    }
    
    // 🔧 새로 추가: 실패 시 서버에서 최신 데이터 다시 가져오기 (롤백)
    try {
      await fetchAllRsvps();
      console.log('✅ 실패 후 데이터 롤백 완료');
    } catch (rollbackError) {
      console.error('❌ 롤백 실패:', rollbackError);
    }
    
    alert(`❌ RSVP 업데이트에 실패했습니다: ${error.message}`);
  }
};

/**
 * 편집 중인 RSVP 데이터 변경 함수 (수정됨 - 벌크 업데이트 지원)
 */
const updateEditingRsvpData = (field: string, value: any) => {
  console.log(`🔄 필드 업데이트 요청: ${field} =`, value); // 디버깅용
  
  if (editingRsvpData) {
    // 🔧 새로 추가: 벌크 업데이트 지원
    if (field === "_bulk_update" && typeof value === "object") {
      console.log('🔄 벌크 업데이트 실행:', value); // 디버깅용
      setEditingRsvpData(value);
      console.log('✅ 벌크 업데이트 완료'); // 디버깅용
      return;
    }
    
    // 기존 개별 필드 업데이트 로직 유지
    const newData = {
      ...editingRsvpData,
      [field]: value
    };
    console.log('✅ 개별 필드 업데이트 후 데이터:', newData); // 디버깅용
    setEditingRsvpData(newData);
  } else {
    console.error('❌ editingRsvpData가 없습니다'); // 디버깅용
  }
};

// 🔧 추가: 디버깅을 위한 상태 변경 감지 (옵션)
// useEffect(() => {
//   console.log('📊 editingRsvpData 상태 변경:', editingRsvpData);
// }, [editingRsvpData]);

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

  // src/pages/admin/hooks/useAdminDashboard.ts 
// getTotalStats 함수만 수정하면 됩니다

/**
 * 전체 통계 계산 함수 (수정됨 - 총 참석 인원 추가)
 */
const getTotalStats = () => {
  const summary = rsvpData?.summary;
  return {
    totalGroups: groups.length,                           // 총 그룹 수
    totalResponses: summary?.totalResponses || 0,         // 총 응답 수
    totalAttending: summary?.attendingResponses || 0,     // 참석 응답 수
    totalNotAttending: summary?.notAttendingResponses || 0, // 불참 응답 수
    totalPending: 0,                                      // 미응답 수 (현재는 0)
    totalAttendingCount: summary?.totalAttendingCount || 0, // 🆕 총 참석 인원 수 추가
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
    handleUpdateGroupFeatures
  };
};