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
 * RSVP 응답 수정 처리 함수 (개선됨 - 데이터 검증 및 보정 강화)
 * @param rsvpId - 수정할 RSVP ID
 * @param updateData - 수정할 데이터
 */
const handleUpdateRsvp = async (rsvpId: string, updateData: any) => {
  try {
    console.log('🔄 RSVP 응답 수정 시작:', { rsvpId, updateData });
    
    // 🔧 추가: 데이터 검증 및 보정
    const validatedData = { ...updateData };
    
    // 참석 여부에 따른 데이터 보정
    if (validatedData.isAttending === false) {
      // 불참인 경우 - 인원 수를 0으로, 이름 배열은 대표자 이름만 유지
      validatedData.totalCount = 0;
      validatedData.attendeeNames = validatedData.responderName 
        ? [validatedData.responderName] 
        : [];
      
      console.log('📝 불참 데이터 보정:', validatedData);
    } else if (validatedData.isAttending === true) {
      // 참석인 경우 - 최소 인원 수 및 이름 검증
      const totalCount = Math.max(1, Number(validatedData.totalCount) || 1);
      validatedData.totalCount = totalCount;
      
      // attendeeNames 배열 검증 및 보정
      let attendeeNames = validatedData.attendeeNames || [];
      
      // 배열 크기 조정
      if (attendeeNames.length < totalCount) {
        // 부족한 만큼 빈 문자열로 채우기
        while (attendeeNames.length < totalCount) {
          attendeeNames.push('');
        }
      } else if (attendeeNames.length > totalCount) {
        // 초과하는 부분 제거
        attendeeNames = attendeeNames.slice(0, totalCount);
      }
      
      // 대표자 이름 확인 및 보정
      if (!attendeeNames[0] || attendeeNames[0].trim() === '') {
        if (validatedData.responderName && validatedData.responderName.trim() !== '') {
          attendeeNames[0] = validatedData.responderName;
        } else {
          throw new Error('대표자 이름은 필수입니다.');
        }
      }
      
      // responderName을 첫 번째 attendeeName과 동기화
      validatedData.responderName = attendeeNames[0];
      validatedData.attendeeNames = attendeeNames;
      
      console.log('📝 참석 데이터 보정:', validatedData);
    }
    
    // 🔧 추가: 최종 데이터 검증
    if (!validatedData.responderName || validatedData.responderName.trim() === '') {
      throw new Error('응답자 이름은 필수입니다.');
    }
    
    // API 호출
    await updateRsvpResponse(rsvpId, validatedData);
    
    console.log('✅ RSVP 응답 수정 완료');
    alert('✅ RSVP 응답이 성공적으로 수정되었습니다.');
    
    // 편집 모드 종료
    setEditingRsvpId(null);
    setEditingRsvpData(null);
    
    // 목록 새로고침
    await fetchAllRsvps();
    
  } catch (error: any) {
    console.error('❌ RSVP 응답 수정 실패:', error);
    
    // 사용자 친화적인 에러 메시지 표시
    const errorMessage = error.message || 'RSVP 응답 수정에 실패했습니다.';
    alert(`❌ ${errorMessage}`);
  }
};

/**
 * RSVP 편집 데이터 업데이트 함수 (수정됨 - _bulk_update 지원 추가)
 * @param field - 수정할 필드명 또는 "_bulk_update"
 * @param value - 새로운 값 또는 전체 데이터 객체
 */
const updateEditingRsvpData = (field: string, value: any) => {
  if (!editingRsvpData) return;
  
  setEditingRsvpData(prev => {
    // null 체크
    if (!prev) return null;
    
    // 🆕 _bulk_update 처리 추가
    if (field === "_bulk_update") {
      console.log('🔄 벌크 업데이트 실행:', value); // 디버깅용
      return { ...value }; // 전체 객체를 교체
    }
    
    const updated = { ...prev, [field]: value };
    
    // 🔧 수정: totalCount 변경 시 attendeeNames 배열 자동 조정
    if (field === 'totalCount') {
      const newCount = Number(value) || 0;
      const currentNames = prev.attendeeNames || [];
      
      if (newCount > 0) {
        // 참석인 경우 - attendeeNames 배열 조정
        if (newCount > currentNames.length) {
          // 인원이 늘어난 경우 - 빈 문자열로 채우기
          const additionalNames = new Array(newCount - currentNames.length).fill('');
          updated.attendeeNames = [...currentNames, ...additionalNames];
        } else if (newCount < currentNames.length) {
          // 인원이 줄어든 경우 - 배열 자르기
          updated.attendeeNames = currentNames.slice(0, newCount);
        }
        // 크기가 같으면 그대로 유지
      } else {
        // 불참인 경우 - 빈 배열
        updated.attendeeNames = [];
      }
    }
    
    // 🔧 수정: isAttending 변경 시 attendeeNames 배열 조정
    if (field === 'isAttending') {
      if (value === false) {
        // 불참으로 변경된 경우
        updated.totalCount = 0;
        updated.attendeeNames = [];
      } else {
        // 참석으로 변경된 경우
        if (updated.totalCount === 0) {
          updated.totalCount = 1; // 최소 1명으로 설정
        }
        const currentNames = prev.attendeeNames || [];
        const requiredCount = updated.totalCount || 1;
        
        if (currentNames.length < requiredCount) {
          // 이름 배열이 부족하면 빈 문자열로 채우기
          const additionalNames = new Array(requiredCount - currentNames.length).fill('');
          updated.attendeeNames = [...currentNames, ...additionalNames];
        }
      }
    }
    
    console.log('🔄 편집 데이터 업데이트:', { field, value, updated }); // 디버깅용
    return updated;
  });
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