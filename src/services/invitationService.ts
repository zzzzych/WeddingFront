// src/services/invitationService.ts
import {
  CreateGroupRequest,
  CreateGroupResponse,  // ✅ 새로 추가
  InvitationGroup,
  UpdateGroupRequest,
  CreateAdminRequest,
  AdminCreateResponse,
  AdminListResponse,
  RsvpListResponse,
  SimpleRsvpWithGroupInfo,
  UpdateRsvpRequest,
  RsvpRequest,  // ✅ 새로 추가
  RsvpSubmitResponse,  // ✅ 새로 추가
  AdminLoginRequest,  // ✅ 새로 추가
  AdminLoginResponse,  // ✅ 새로 추가
  InvitationByCodeResponse  // ✅ 새로 추가
} from '../types';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ==================== 🔧 공통 API 헬퍼 함수들 ====================

/**
 * GET 요청을 위한 공통 함수
 * @param endpoint - API 엔드포인트
 * @param options - 추가 옵션 (헤더 등)
 * @returns Promise<any> - API 응답 데이터
 */
const apiGet = async (endpoint: string, options: any = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.reason || `HTTP ${response.status} 에러가 발생했습니다.`);
  }

  return response.json();
};

/**
 * POST 요청을 위한 공통 함수
 * @param endpoint - API 엔드포인트
 * @param data - 전송할 데이터
 * @param options - 추가 옵션 (헤더 등)
 * @returns Promise<any> - API 응답 데이터
 */
const apiPost = async (endpoint: string, data: any, options: any = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.reason || `HTTP ${response.status} 에러가 발생했습니다.`);
  }

  return response.json();
};

// ==================== 🎯 그룹 관련 API 함수들 ====================

/**
 * 새 그룹 생성 (수정된 버전 - 올바른 반환 타입)
 * @param groupData - 생성할 그룹 데이터
 * @returns Promise<CreateGroupResponse> - 생성된 그룹 정보
 */
export const createGroup = async (groupData: CreateGroupRequest): Promise<CreateGroupResponse> => {
  try {
    console.log('📝 그룹 생성 요청:', groupData);
    const response = await apiPost('/api/admin/groups', groupData);
    console.log('✅ 그룹 생성 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 그룹 생성 실패:', error);
    throw error;
  }
};

/**
 * 모든 그룹 목록 조회
 * @returns Promise<InvitationGroup[]> - 그룹 목록
 */
export const getAllGroups = async (): Promise<InvitationGroup[]> => {
  try {
    console.log('📋 그룹 목록 조회 시작');
    const response = await fetch(`${API_BASE_URL}/api/admin/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Groups API 응답:', data);
    
    // 단순 배열로 처리
    if (Array.isArray(data)) {
      return data;
    }
    
    // 기존 구조 지원 (data.groups가 있는 경우)
    if (data.groups && Array.isArray(data.groups)) {
      return data.groups;
    }
    
    console.warn('⚠️ 예상하지 못한 응답 형식:', data);
    return [];
  } catch (error) {
    console.error('❌ 그룹 조회 실패:', error);
    throw error;
  }
};

/**
 * 그룹 정보 수정
 * @param groupId - 수정할 그룹 ID
 * @param updateData - 수정할 데이터
 * @returns Promise<InvitationGroup> - 수정된 그룹 정보
 */
export const updateGroup = async (groupId: string, updateData: UpdateGroupRequest): Promise<InvitationGroup> => {
  try {
    console.log(`🔧 그룹 수정 요청: ${groupId}`, updateData);
    const response = await fetch(`${API_BASE_URL}/api/admin/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.reason || '그룹 수정에 실패했습니다.');
    }

    const result = await response.json();
    console.log('✅ 그룹 수정 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 그룹 수정 실패:', error);
    throw error;
  }
};

/**
 * 그룹 삭제 (강제 삭제 옵션 포함)
 * @param groupId - 삭제할 그룹 ID
 * @param forceDelete - 강제 삭제 여부 (기본값: false)
 * @returns Promise<void>
 */
export const deleteGroup = async (
  groupId: string, 
  forceDelete: boolean = false
): Promise<void> => {
  try {
    // 강제 삭제 옵션이 있으면 쿼리 파라미터 추가
    const queryParams = forceDelete ? '?force=true' : '';
    
    console.log(`🗑️ 그룹 삭제 시도: ${groupId}, 강제삭제: ${forceDelete}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/groups/${groupId}${queryParams}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🔍 DELETE 응답 상태:', response.status);

    // 204 No Content는 성공을 의미
    if (response.status === 204) {
      console.log('✅ 그룹 삭제 성공');
      return;
    }

    // 409 Conflict - 응답이 있는 그룹
    if (response.status === 409) {
      let errorMessage = '응답이 있는 그룹은 강제 삭제가 필요합니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.reason || errorData.error || errorMessage;
      } catch (e) {
        console.log('409 에러 응답 파싱 실패, 기본 메시지 사용');
      }
      throw new Error(errorMessage);
    }

    // 기타 에러
    let errorMessage = '그룹 삭제에 실패했습니다.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.reason || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status} 에러가 발생했습니다.`;
    }
    
    throw new Error(errorMessage);

  } catch (error: any) {
    console.error('❌ 그룹 삭제 실패:', error);
    
    // fetch 자체가 실패한 경우 (네트워크 에러 등)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
    }
    
    // 이미 Error 객체인 경우 그대로 전달
    throw error;
  }
};

// ==================== 📊 RSVP 관련 API 함수들 ====================


/**
 * 전체 RSVP 응답 목록과 통계 조회 (수정된 버전)
 * @returns Promise<RsvpListResponse> - RSVP 응답 목록과 통계
 */
export const getAllRsvpsList = async (): Promise<RsvpListResponse> => {
  try {
    console.log('📊 전체 RSVP 데이터 조회 시작');
    const response = await fetch(`${API_BASE_URL}/api/admin/rsvps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 RSVP API 응답:', data);
    
    // ✅ 서버 데이터를 클라이언트 호환 형태로 변환
    const transformedResponses = (data.responses || []).map((item: any) => ({
      response: item.response,
      groupInfo: item.groupInfo,
      // 호환성을 위한 플랫 구조 속성들
      id: item.response.id,
      guestName: item.response.responderName,
      willAttend: item.response.isAttending,
      phoneNumber: item.response.phoneNumber,
      companions: (item.response.adultCount + item.response.childrenCount) - 1,
      message: item.response.message,
      groupName: item.groupInfo.groupName
    }));

    // ✅ RsvpSummary를 클라이언트 호환 형태로 변환
    const transformedSummary = {
      totalResponses: data.summary?.totalResponses || 0,
      totalAttending: data.summary?.attendingResponses || 0,  // attendingResponses → totalAttending
      totalNotAttending: data.summary?.notAttendingResponses || 0,  // notAttendingResponses → totalNotAttending
      totalPending: 0,  // 서버에 없는 필드이므로 0으로 설정
      attendingResponses: data.summary?.attendingResponses || 0,
      notAttendingResponses: data.summary?.notAttendingResponses || 0,
      totalAttendingCount: data.summary?.totalAttendingCount || 0,
      totalAdultCount: data.summary?.totalAdultCount || 0,
      totalChildrenCount: data.summary?.totalChildrenCount || 0
    };
    
    // RsvpListResponse 형태로 반환
    return {
      responses: transformedResponses,
      summary: transformedSummary
    };
  } catch (error) {
    console.error('❌ RSVP 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 그룹의 RSVP 응답 목록 조회 (수정된 버전)
 * @param groupId - 그룹 ID
 * @returns Promise<SimpleRsvpWithGroupInfo[]> - 해당 그룹의 RSVP 응답 목록
 */
export const getRsvpList = async (groupId: string): Promise<SimpleRsvpWithGroupInfo[]> => {
  try {
    console.log(`📋 그룹 ${groupId}의 RSVP 목록 조회`);
    const response = await fetch(`${API_BASE_URL}/api/admin/groups/${groupId}/rsvps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 그룹별 RSVP API 응답:', data);
    
    // 배열 형태로 반환
    if (Array.isArray(data)) {
      // ✅ 서버 데이터를 클라이언트 호환 형태로 변환
      return data.map((item: any) => ({
        response: item.response,
        groupInfo: item.groupInfo,
        // 호환성을 위한 플랫 구조 속성들
        id: item.response.id,
        guestName: item.response.responderName,
        willAttend: item.response.isAttending,
        phoneNumber: item.response.phoneNumber,
        companions: (item.response.adultCount + item.response.childrenCount) - 1,
        message: item.response.message,
        groupName: item.groupInfo.groupName
      }));
    }
    
    if (data.responses && Array.isArray(data.responses)) {
      return data.responses.map((item: any) => ({
        response: item.response,
        groupInfo: item.groupInfo,
        // 호환성을 위한 플랫 구조 속성들
        id: item.response.id,
        guestName: item.response.responderName,
        willAttend: item.response.isAttending,
        phoneNumber: item.response.phoneNumber,
        companions: (item.response.adultCount + item.response.childrenCount) - 1,
        message: item.response.message,
        groupName: item.groupInfo.groupName
      }));
    }

    console.warn('⚠️ 예상하지 못한 RSVP 응답 형식:', data);
    return [];
  } catch (error) {
    console.error('❌ 그룹별 RSVP 조회 실패:', error);
    throw error;
  }
};


/**
 * RSVP 응답 수정 (관리자용)
 * @param rsvpId - 수정할 RSVP ID
 * @param updateData - 수정할 데이터
 * @returns Promise<SimpleRsvpWithGroupInfo> - 수정된 RSVP 정보
 */
export const updateRsvpResponse = async (
  rsvpId: string, 
  updateData: UpdateRsvpRequest
): Promise<SimpleRsvpWithGroupInfo> => {
  try {
    console.log(`🔧 RSVP 응답 수정: ${rsvpId}`, updateData);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/rsvps/${rsvpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.reason || 'RSVP 응답 수정에 실패했습니다.');
    }

    const result = await response.json();
    console.log('✅ RSVP 응답 수정 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ RSVP 응답 수정 실패:', error);
    throw error;
  }
};

/**
 * RSVP 응답 삭제 (관리자용)
 * @param rsvpId - 삭제할 RSVP ID
 * @returns Promise<void>
 */
export const deleteRsvpResponse = async (rsvpId: string): Promise<void> => {
  try {
    console.log(`🗑️ RSVP 응답 삭제 시도: ${rsvpId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/rsvps/${rsvpId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 204 No Content는 성공을 의미
    if (response.status === 204) {
      console.log('✅ RSVP 응답 삭제 성공');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.reason || 'RSVP 응답 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ RSVP 응답 삭제 실패:', error);
    throw error;
  }
};

// ==================== 👤 관리자 관련 API 함수들 ====================

/**
 * 새 관리자 생성 (기존 관리자만 가능)
 * @param adminData - 생성할 관리자 데이터
 * @returns Promise<AdminCreateResponse> - 생성된 관리자 정보
 */
export const createAdmin = async (adminData: CreateAdminRequest): Promise<AdminCreateResponse> => {
  try {
    console.log('👤 관리자 생성 요청:', adminData);
    
    // JWT 토큰을 헤더에 포함해서 요청
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await apiPost('/api/admin/create-admin', adminData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 관리자 생성 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 관리자 생성 실패:', error);
    throw error;
  }
};

/**
 * 관리자 목록 조회 (기존 관리자만 가능)
 * @returns Promise<AdminListResponse> - 관리자 목록
 */
export const getAdminList = async (): Promise<AdminListResponse> => {
  try {
    console.log('📋 관리자 목록 조회 시작');
    
    // JWT 토큰을 헤더에 포함해서 요청
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await apiGet('/api/admin/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 관리자 목록 조회 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 관리자 목록 조회 실패:', error);
    throw error;
  }
};

// ==================== 🔐 인증 관련 헬퍼 함수들 ====================

/**
 * 토큰 유효성 검사 헬퍼 함수
 * @returns boolean - 토큰 유효 여부
 */
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('adminToken');
  const userInfo = localStorage.getItem('adminUser');
  
  if (!token || !userInfo) {
    return false;
  }
  
  try {
    const user = JSON.parse(userInfo);
    const expirationTime = new Date(user.expiresAt);
    const currentTime = new Date();
    
    // 토큰이 만료되었는지 확인 (5분 여유시간 추가)
    return currentTime.getTime() < (expirationTime.getTime() - 5 * 60 * 1000);
  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error);
    return false;
  }
};

/**
 * 인증된 API 요청을 위한 헬퍼 함수
 * @param endpoint - API 엔드포인트
 * @param options - 요청 옵션
 * @returns Promise<any> - API 응답 데이터
 */
export const authenticatedRequest = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  
  if (!isTokenValid()) {
    // 토큰이 만료된 경우 로컬 스토리지 정리
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
  }
  
  // 인증 헤더 추가
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};