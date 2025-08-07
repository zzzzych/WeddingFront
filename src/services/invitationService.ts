// src/services/invitationService.ts
// 청첩장 프로젝트의 모든 API 호출을 관리하는 서비스 파일
// 주요 기능: 그룹 관리, RSVP 처리, 관리자 인증, 청첩장 조회

import {
  // 그룹 관련 타입들
  CreateGroupRequest,
  CreateGroupResponse,
  InvitationGroup,
  UpdateGroupRequest,
  
  // 관리자 관련 타입들
  CreateAdminRequest,
  AdminCreateResponse,
  AdminListResponse,
  AdminCredentials,
  LoginResponse,
  
  // RSVP 관련 타입들
  RsvpListResponse,
  SimpleRsvpWithGroupInfo,
  UpdateRsvpRequest,
  RsvpRequest,
  RsvpSubmitResponse,
  
  // 청첩장 관련 타입들
  InvitationAPIResponse,
  InvitationByCodeResponse,
  
  // 결혼식 정보 관련 타입들 (새로 추가)
  WeddingInfo,
  WeddingInfoUpdateRequest,
  WeddingInfoPatchRequest
} from '../types';

// ==================== 🔧 환경 설정 ====================
// API 기본 URL 설정 (환경 변수 우선, 없으면 개발 서버 URL 사용)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ==================== 🛠️ 공통 API 헬퍼 함수들 ====================

/**
 * GET 요청을 위한 인증된 API 호출 헬퍼 함수
 * @param endpoint - API 엔드포인트
 * @returns Promise<any> - API 응답 데이터
 */
export const apiGet = async (endpoint: string, options: any = {}): Promise<any> => {
  // 토큰 존재 여부 확인
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  
  // 토큰 만료 여부 사전 확인
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
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });

    // 401 Unauthorized 응답 처리 (토큰 만료 등)
    if (response.status === 401) {
      console.error('🔐 인증 실패 - 토큰이 만료되었거나 유효하지 않음');
      
      // 로컬 스토리지에서 인증 정보 제거
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // 사용자에게 재로그인 요청
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 기타 HTTP 에러 처리
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error: any) {
    // 네트워크 에러나 파싱 에러 처리
    if (error.message && error.message.includes('인증이 만료되었습니다')) {
      throw error; // 인증 에러는 그대로 전달
    }
    
    console.error('❌ API GET 요청 실패:', error);
    throw error;
  }
};

/**
 * POST 요청을 위한 공통 함수
 * @param endpoint - API 엔드포인트
 * @param data - 전송할 데이터
 * @param options - 추가 옵션 (헤더, 인증 등)
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

/**
 * PUT 요청을 위한 공통 함수
 * @param endpoint - API 엔드포인트
 * @param data - 전송할 데이터
 * @param options - 추가 옵션
 * @returns Promise<any> - API 응답 데이터
 */
const apiPut = async (endpoint: string, data: any, options: any = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
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

/**
 * DELETE 요청을 위한 공통 함수
 * @param endpoint - API 엔드포인트
 * @param options - 추가 옵션
 * @returns Promise<any> - API 응답 데이터 (또는 void)
 */
const apiDelete = async (endpoint: string, options: any = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // 204 No Content는 성공을 의미하므로 별도 처리
  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.reason || `HTTP ${response.status} 에러가 발생했습니다.`);
  }

  // 응답 본문이 있는 경우에만 JSON 파싱
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
};

// ==================== 🎯 그룹 관리 API 함수들 ====================

/**
 * 새 그룹 생성
 * @param groupData - 생성할 그룹 데이터 (이름, 타입, 인사말 등)
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
 * @returns Promise<InvitationGroup[]> - 전체 그룹 목록
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
    console.log('✅ 그룹 목록 조회 완료:', data);
    return data;
  } catch (error) {
    console.error('❌ 그룹 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 그룹 정보 수정
 * @param groupId - 수정할 그룹 ID
 * @param updateData - 수정할 데이터 (부분 업데이트 가능)
 * @returns Promise<InvitationGroup> - 수정된 그룹 정보
 */
export const updateGroup = async (groupId: string, updateData: UpdateGroupRequest): Promise<InvitationGroup> => {
  try {
    console.log(`🔄 그룹 수정 요청: ${groupId}`, updateData);
    const response = await apiPut(`/api/admin/groups/${groupId}`, updateData);
    console.log('✅ 그룹 수정 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 그룹 수정 실패:', error);
    throw error;
  }
};

/**
 * 그룹 삭제 (일반 삭제 또는 강제 삭제)
 * @param groupId - 삭제할 그룹 ID
 * @param force - 강제 삭제 여부 (true: RSVP 응답이 있어도 삭제)
 * @returns Promise<void>
 */
export const deleteGroup = async (groupId: string, force: boolean = false): Promise<void> => {
  try {
    console.log(`🗑️ 그룹 삭제 시도: ${groupId} (강제: ${force})`);
    
    const endpoint = force 
      ? `/api/admin/groups/${groupId}?force=true` 
      : `/api/admin/groups/${groupId}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 204 No Content는 삭제 성공
    if (response.status === 204) {
      console.log('✅ 그룹 삭제 성공');
      return;
    }

    // 409 Conflict는 응답이 있는 그룹 (강제 삭제 필요)
    if (response.status === 409) {
      let errorMessage = '이 그룹에는 RSVP 응답이 있어서 삭제할 수 없습니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.reason || errorData.error || errorMessage;
      } catch (e) {
        console.log('409 에러 응답 파싱 실패, 기본 메시지 사용');
      }
      throw new Error(errorMessage);
    }

    // 기타 에러 처리
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

// ==================== 📊 RSVP 관리 API 함수들 ====================

/**
 * 전체 RSVP 응답 목록과 통계 조회
 * @returns Promise<RsvpListResponse> - RSVP 응답 목록과 통계
 */
export const getAllRsvpsList = async (): Promise<RsvpListResponse> => {
  try {
    console.log('📊 전체 RSVP 데이터 조회 시작');
    
    // 인증 토큰 확인
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    // 개별 응답 목록과 통계를 모두 가져오기 위해 다른 엔드포인트 시도
    const response = await fetch(`${API_BASE_URL}/api/admin/rsvps/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // 만약 /api/admin/rsvps/list가 없다면 기존 엔드포인트를 사용하되 다른 방식으로 처리
    if (!response.ok) {
      console.log('⚠️ /api/admin/rsvps/list 엔드포인트가 없음, 대안 방식 사용');
      
      // 1. 먼저 통계 정보 가져오기
      const summaryResponse = await fetch(`${API_BASE_URL}/api/admin/rsvps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!summaryResponse.ok) {
        throw new Error(`통계 조회 실패: ${summaryResponse.status}`);
      }
      
      const summaryData = await summaryResponse.json();
      console.log('📊 통계 데이터:', summaryData);
      
      // 2. 모든 그룹의 응답을 가져오기
      const groupsResponse = await fetch(`${API_BASE_URL}/api/admin/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!groupsResponse.ok) {
        throw new Error(`그룹 목록 조회 실패: ${groupsResponse.status}`);
      }
      
      const groupsData = await groupsResponse.json();
      console.log('👥 그룹 데이터:', groupsData);
      
      // 3. 각 그룹의 응답을 수집
      const allResponses = [];
      const groups = groupsData.groups || groupsData;
      
      for (const group of groups) {
        try {
          const groupRsvpResponse = await fetch(`${API_BASE_URL}/api/admin/groups/${group.id}/rsvps`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (groupRsvpResponse.ok) {
            const groupRsvpData = await groupRsvpResponse.json();
            console.log(`📝 그룹 ${group.groupName} 응답:`, groupRsvpData);
            
            // 각 응답에 그룹 정보 추가
            const responsesWithGroup = (groupRsvpData.responses || groupRsvpData || []).map((response: any) => ({
              response: response,
              groupInfo: {
                groupName: group.groupName,
                uniqueCode: group.uniqueCode,
                id: group.id
              },
              // 호환성을 위한 플랫 구조 속성들
              id: response.id,
              guestName: response.responderName,
              willAttend: response.isAttending,
              phoneNumber: response.phoneNumber,
              companions: Math.max(0, (response.adultCount || 0) + (response.childrenCount || 0) - 1),
              message: response.message,
              groupName: group.groupName
            }));
            
            allResponses.push(...responsesWithGroup);
          }
        } catch (error) {
          console.warn(`⚠️ 그룹 ${group.groupName} 응답 조회 실패:`, error);
        }
      }
      
      console.log('📋 전체 수집된 응답:', allResponses);
      
      return {
        responses: allResponses,
        summary: summaryData
      };
    }

    // /api/admin/rsvps/list가 성공한 경우
    const data = await response.json();
    console.log('🔍 RSVP 목록 API 응답:', data);
    
    // 응답 데이터 변환
    const responses = (data.responses || []).map((item: any) => {
      const response = item.response || item;
      const groupInfo = item.groupInfo || { groupName: '알 수 없는 그룹', uniqueCode: '' };
      
      return {
        response: response,
        groupInfo: groupInfo,
        // 호환성을 위한 플랫 구조 속성들
        id: response.id,
        guestName: response.responderName,
        willAttend: response.isAttending,
        phoneNumber: response.phoneNumber,
        companions: Math.max(0, (response.adultCount || 0) + (response.childrenCount || 0) - 1),
        message: response.message,
        groupName: groupInfo.groupName
      };
    });

    return {
      responses: responses,
      summary: data.summary || {
        totalResponses: 0,
        attendingResponses: 0,
        notAttendingResponses: 0,
        totalAttendingCount: 0,
        totalAdultCount: 0,
        totalChildrenCount: 0
      }
    };
    
  } catch (error) {
    console.error('❌ RSVP 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 그룹의 RSVP 응답 목록 조회
 * @param groupId - 조회할 그룹 ID
 * @returns Promise<SimpleRsvpWithGroupInfo[]> - 해당 그룹의 RSVP 응답 목록
 */
export const getRsvpList = async (groupId: string): Promise<SimpleRsvpWithGroupInfo[]> => {
  try {
    console.log(`📋 그룹 ${groupId}의 RSVP 목록 조회`);
    const response = await apiGet(`/api/admin/groups/${groupId}/rsvps`);
    console.log('✅ 그룹별 RSVP 목록 조회 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ 그룹별 RSVP 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * RSVP 응답 수정 (관리자용)
 * @param rsvpId - 수정할 RSVP ID
 * @param updateData - 수정할 데이터
 * @returns Promise<any> - 수정된 RSVP 응답
 */
export const updateRsvpResponse = async (rsvpId: string, updateData: UpdateRsvpRequest): Promise<any> => {
  try {
    console.log(`🔄 RSVP 응답 수정: ${rsvpId}`, updateData);
    const response = await apiPut(`/api/admin/rsvps/${rsvpId}`, updateData);
    console.log('✅ RSVP 응답 수정 성공:', response);
    return response;
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
    await apiDelete(`/api/admin/rsvps/${rsvpId}`);
    console.log('✅ RSVP 응답 삭제 성공');
  } catch (error) {
    console.error('❌ RSVP 응답 삭제 실패:', error);
    throw error;
  }
};

/**
 * 일반 사용자가 RSVP 응답 제출
 * @param uniqueCode - 청첩장 고유 코드
 * @param rsvpData - 제출할 RSVP 응답 데이터
 * @returns Promise<RsvpSubmitResponse> - 제출 결과
 */
export const submitRsvp = async (uniqueCode: string, rsvpData: RsvpRequest): Promise<RsvpSubmitResponse> => {
  try {
    console.log('✉️ RSVP 응답 제출 시작:', { uniqueCode, rsvpData });
    const response = await apiPost(`/api/invitation/${uniqueCode}/rsvp`, rsvpData);
    console.log('✅ RSVP 응답 제출 완료:', response);
    return response;
  } catch (error) {
    console.error('❌ RSVP 응답 제출 실패:', error);
    throw error;
  }
};

// ==================== 🎭 결혼식 기본 정보 관리 API 함수들 ====================

/**
 * 결혼식 기본 정보 조회 (관리자용)
 * @returns Promise<WeddingInfo> - 결혼식 기본 정보
 */
export const getWeddingInfoAdmin = async (): Promise<WeddingInfo> => {
  try {
    console.log('🎭 결혼식 기본 정보 조회 시작 (관리자)');
    
    // 인증된 GET 요청
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/wedding-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ 결혼식 기본 정보 조회 완료:', data);
    return data;
  } catch (error) {
    console.error('❌ 결혼식 기본 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 결혼식 기본 정보 전체 수정 (관리자용)
 * @param weddingData - 수정할 결혼식 정보 전체 데이터
 * @returns Promise<WeddingInfo> - 수정된 결혼식 정보
 */
export const updateWeddingInfo = async (weddingData: WeddingInfoUpdateRequest): Promise<WeddingInfo> => {
  try {
    console.log('🔄 결혼식 기본 정보 전체 수정:', weddingData);
    
    // 🆕 데이터 검증 및 처리
    const processedData = {
      ...weddingData,
      // Date 객체를 ISO 8601 문자열로 변환
      weddingDate: typeof weddingData.weddingDate === 'string' 
        ? new Date(weddingData.weddingDate).toISOString()
        : weddingData.weddingDate,
      
      // 🚨 필수 필드는 빈 문자열이어도 유지 (null로 변환하지 않음)
      groomName: weddingData.groomName || '', // 빈 문자열 허용
      brideName: weddingData.brideName || '', // 빈 문자열 허용
      venueName: weddingData.venueName || '', // 빈 문자열 허용
      venueAddress: weddingData.venueAddress || '', // 빈 문자열 허용
      greetingMessage: weddingData.greetingMessage || '', // 빈 문자열 허용
      ceremonyProgram: weddingData.ceremonyProgram || '', // 빈 문자열 허용
      
      // ✅ 선택적 필드만 빈 문자열을 null로 변환
      kakaoMapUrl: weddingData.kakaoMapUrl?.trim() || null,
      naverMapUrl: weddingData.naverMapUrl?.trim() || null,
      parkingInfo: weddingData.parkingInfo?.trim() || null,
      transportInfo: weddingData.transportInfo?.trim() || null,
      
      // 빈 계좌 정보 제거
      accountInfo: weddingData.accountInfo.filter(info => info.trim() !== '')
    };

    console.log('📝 처리된 데이터:', processedData);
    
    // 🆕 필수 데이터 검증
    const requiredFields = ['groomName', 'brideName', 'venueName', 'venueAddress'];
    const missingFields = requiredFields.filter(field => !processedData[field as keyof typeof processedData]);
    
    if (missingFields.length > 0) {
      throw new Error(`다음 필수 항목을 입력해주세요: ${missingFields.join(', ')}`);
    }
    
    // 인증된 PUT 요청
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/wedding-info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(processedData),
    });

    // 인증 만료 처리
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 400 에러 상세 정보 처리
    if (response.status === 400) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.reason || '요청 데이터에 문제가 있습니다.';
      console.error('❌ 400 Bad Request 상세:', errorData);
      throw new Error(`데이터 검증 실패: ${errorMessage}`);
    }

    // 500 에러 상세 정보 처리
    if (response.status === 500) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.reason || 'Something went wrong.';
      console.error('❌ 500 Internal Server Error 상세:', errorData);
      throw new Error(`서버 에러: ${errorMessage}`);
    }

    // 기타 HTTP 에러 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.reason || response.statusText;
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('✅ 결혼식 기본 정보 수정 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ 결혼식 기본 정보 수정 실패:', error);
    throw error;
  }
};

/**
 * 결혼식 기본 정보 부분 수정 (관리자용)
 * @param patchData - 수정할 결혼식 정보 부분 데이터
 * @returns Promise<WeddingInfo> - 수정된 결혼식 정보
 */
export const patchWeddingInfo = async (patchData: WeddingInfoPatchRequest): Promise<WeddingInfo> => {
  try {
    console.log('🔧 결혼식 기본 정보 부분 수정:', patchData);
    
    // 인증된 PATCH 요청
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/wedding-info`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(patchData),
    });

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ 결혼식 기본 정보 부분 수정 성공:', data);
    return data;
  } catch (error) {
    console.error('❌ 결혼식 기본 정보 부분 수정 실패:', error);
    throw error;
  }
};

// ==================== 👤 관리자 관리 API 함수들 ====================

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

// ==================== 🔐 인증 관련 API 함수들 ====================

/**
 * 관리자 로그인
 * @param credentials - 로그인 자격 증명 (사용자명, 비밀번호)
 * @returns Promise<LoginResponse> - 로그인 결과 (토큰 및 사용자 정보)
 */
export const adminLogin = async (credentials: AdminCredentials): Promise<LoginResponse> => {
  try {
    console.log('🔐 관리자 로그인 시도');
    const response = await apiPost('/api/admin/login', credentials);
    console.log('✅ 관리자 로그인 성공');
    return response;
  } catch (error) {
    console.error('❌ 관리자 로그인 실패:', error);
    throw error;
  }
};

/**
 * 토큰 유효성 검사 헬퍼 함수
 * @returns boolean - 토큰 유효 여부
 */
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('adminToken');
  const userInfo = localStorage.getItem('adminUser');
  
  if (!token || !userInfo) {
    console.log('🔍 토큰 또는 사용자 정보가 없음');
    return false;
  }
  
  try {
    const user = JSON.parse(userInfo);
    
    // expiresAt 필드 존재 여부 확인
    if (!user.expiresAt) {
      console.log('🔍 사용자 정보에 만료 시간이 없음');
      return false;
    }
    
    const expirationTime = new Date(user.expiresAt);
    const currentTime = new Date();
    
    // 현재 시간과 만료 시간 로깅
    console.log('🕐 현재 시간:', currentTime.toISOString());
    console.log('🕐 만료 시간:', expirationTime.toISOString());
    
    // 토큰이 이미 만료되었는지 확인 (1분 여유시간 추가)
    const isValid = currentTime.getTime() < (expirationTime.getTime() - 60 * 1000);
    
    console.log('🔍 토큰 유효성 검사 결과:', isValid);
    
    if (!isValid) {
      console.log('⚠️ 토큰이 만료되었거나 곧 만료됩니다.');
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error);
    return false;
  }
};

/**
 * 인증된 API 요청을 위한 헬퍼 함수
 * @param endpoint - API 엔드포인트
 * @param options - 요청 옵션
 * @returns Promise<Response> - fetch 응답 객체
 */
export const authenticatedRequest = async (endpoint: string, options: any = {}): Promise<Response> => {
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

// ==================== 📋 청첩장 조회 API 함수들 ====================

/**
 * 고유 코드로 청첩장 정보 조회 (일반 사용자용)
 * @param uniqueCode - 청첩장 고유 접근 코드
 * @returns Promise<InvitationByCodeResponse> - 청첩장 정보
 */
export const getInvitationByCode = async (uniqueCode: string): Promise<InvitationByCodeResponse> => {
  try {
    console.log(`📋 청첩장 정보 조회 시작: ${uniqueCode}`);
    const response = await apiGet(`/api/invitation/${uniqueCode}`);
    console.log('✅ 청첩장 정보 조회 완료:', response);
    return response;
  } catch (error) {
    console.error('❌ 청첩장 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 기본 청첩장 정보 조회 (홈페이지용)
 * @returns Promise<InvitationAPIResponse> - 기본 청첩장 정보
 */
export const getWeddingInfo = async (): Promise<InvitationAPIResponse> => {
  try {
    console.log('🏠 기본 청첩장 정보 조회 시작');
    const response = await apiGet('/api/wedding-info');
    console.log('✅ 기본 청첩장 정보 조회 완료:', response);
    return response;
  } catch (error) {
    console.error('❌ 기본 청첩장 정보 조회 실패:', error);
    throw error;
  }
};

// ==================== 🌟 추가 유틸리티 함수들 ====================

/**
 * API 연결 상태 확인
 * @returns Promise<boolean> - 서버 연결 가능 여부
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ API 헬스체크 실패:', error);
    return false;
  }
};

/**
 * 에러 메시지 표준화 함수
 * @param error - 원본 에러 객체
 * @returns string - 사용자 친화적 에러 메시지
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.reason) {
    return error.reason;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// ==================== 📝 개발자 참고 사항 ====================
/*
주요 API 엔드포인트:
- GET /api/wedding-info: 기본 청첩장 정보
- GET /api/invitation/{uniqueCode}: 특정 그룹 청첩장 정보
- POST /api/rsvp: RSVP 응답 제출

관리자 API:
- POST /api/admin/login: 관리자 로그인
- GET /api/admin/groups: 그룹 목록 조회
- POST /api/admin/groups: 새 그룹 생성
- PUT /api/admin/groups/{id}: 그룹 수정
- DELETE /api/admin/groups/{id}: 그룹 삭제
- GET /api/admin/rsvps: 전체 RSVP 목록
- DELETE /api/admin/rsvps/{id}: RSVP 응답 삭제

인증:
- 모든 관리자 API는 JWT 토큰 필요
- 토큰은 localStorage에 'adminToken' 키로 저장
- 토큰 만료 시간은 'adminUser' 객체의 expiresAt 필드로 관리
*/