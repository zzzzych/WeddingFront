// API 서비스 함수들
import { apiGet, apiPost } from './api';
import { 
  InvitationAPIResponse,  // ✅ 변경: InvitationResponse → InvitationAPIResponse
  InvitationResponse,     // ✅ 추가: 기존 컴포넌트용
  UpdateGroupRequest,
  RsvpRequest, 
  RsvpResponse,
  AdminCredentials,
  LoginResponse,
  CreateGroupRequest,
  InvitationGroup,
  CreateAdminRequest,
  AdminCreateResponse,
  AdminListResponse
} from '../types';

const API_BASE_URL = 'https://api.leelee.kr';

// ✅ 청첩장 정보 조회 (서버 API 직접 호출)
// ✅ 타입 매개변수 제거
export const getInvitationByCode = async (uniqueCode: string): Promise<InvitationAPIResponse> => {
  // 수정 전: return apiGet(`/invitation/${uniqueCode}`);
  // 수정 후:
  return apiGet(`/invitation/${uniqueCode}`);
};


// 참석 여부 응답 제출 (하객용)
export const submitRsvp = async (uniqueCode: string, rsvpData: RsvpRequest): Promise<RsvpResponse> => {
  try {
    // POST /api/invitation/:uniqueCode/rsvp
    const response = await apiPost(`/invitation/${uniqueCode}/rsvp`, rsvpData);
    return response;
  } catch (error) {
    console.error('참석 응답 제출 실패:', error);
    throw error;
  }
};

// 관리자 로그인
export const adminLogin = async (credentials: AdminCredentials): Promise<LoginResponse> => {
  try {
    // ✅ 수정 전: const response = await apiPost('/admin/login', credentials);
    // ✅ 수정 후: /api/admin/login으로 변경 (백엔드 라우트와 일치)
    const response = await apiPost('/admin/login', credentials);
    return response;
  } catch (error) {
    console.error('관리자 로그인 실패:', error);
    throw error;
  }
};



// 새 그룹 생성 (관리자용)
export const createGroup = async (groupData: CreateGroupRequest): Promise<InvitationGroup> => {
  try {
    // POST /api/admin/groups
    const response = await apiPost('/admin/groups', groupData);
    return response;
  } catch (error) {
    console.error('그룹 생성 실패:', error);
    throw error;
  }
};


export const getAllRsvps = async (): Promise<RsvpResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/rsvps`, {
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
    
    // 백엔드가 통계 데이터만 반환하므로 빈 배열 반환
    console.log('🔍 RSVP API 응답:', data);

    // 통계 데이터는 정상이지만 개별 응답 목록이 없는 경우
    if (data.totalResponses !== undefined) {
      console.log('📊 RSVP 통계:', data);
      return []; // 현재는 통계만 있으므로 빈 배열 반환
    }

    // 기존 로직 유지
    if (data.responses && Array.isArray(data.responses)) {
      return data.responses;
    }

    if (Array.isArray(data)) {
      return data;
    }

    console.warn('예상하지 못한 RSVP 응답 형식:', data);
    return [];
  } catch (error) {
    console.error('참석 응답 조회 실패:', error);
    throw error;
  }
};

export const getAllGroups = async (): Promise<InvitationGroup[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/groups`, {
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
    
    // ✅ 단순 배열로 처리
    if (Array.isArray(data)) {
      return data;
    }
    
    // 기존 구조 지원
    if (data.groups && Array.isArray(data.groups)) {
      return data.groups;
    }
    
    console.warn('예상하지 못한 응답 형식:', data);
    return [];
  } catch (error) {
    console.error('그룹 조회 실패:', error);
    throw error;
  }
};

// ✅ 그룹 수정 API 함수 추가
export const updateGroup = async (groupId: string, updateData: UpdateGroupRequest): Promise<InvitationGroup> => {
  const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}`, {
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

  return response.json();
};

// 그룹 삭제 함수 (관리자용)
export const deleteGroup = async (
  groupId: string, 
  forceDelete: boolean = false
): Promise<void> => {
  try {
    // 강제 삭제 옵션이 있으면 쿼리 파라미터 추가
    const queryParams = forceDelete ? '?force=true' : '';
    
    console.log(`🗑️ 그룹 삭제 시도: ${groupId}, 강제삭제: ${forceDelete}`);
    
    const response = await fetch(
      `${API_BASE_URL}/admin/groups/${groupId}${queryParams}`, 
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

// src/services/invitationService.ts 파일에 추가할 함수들

// ✅ 새 관리자 생성 (기존 관리자만 가능)
export const createAdmin = async (adminData: CreateAdminRequest): Promise<AdminCreateResponse> => {
  try {
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
    
    return response;
  } catch (error) {
    console.error('관리자 생성 실패:', error);
    throw error;
  }
};

// ✅ 관리자 목록 조회 (기존 관리자만 가능)
export const getAdminList = async (): Promise<AdminListResponse> => {
  try {
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
    
    return response;
  } catch (error) {
    console.error('관리자 목록 조회 실패:', error);
    throw error;
  }
};

// ✅ 토큰 유효성 검사 헬퍼 함수
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
    console.error('토큰 검증 실패:', error);
    return false;
  }
};

// ✅ 인증된 API 요청을 위한 헬퍼 함수
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
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
};