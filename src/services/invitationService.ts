// API 서비스 함수들
import { apiGet, apiPost } from './api';
import { 
  InvitationAPIResponse,  // ✅ 변경: InvitationResponse → InvitationAPIResponse
  InvitationResponse,     // ✅ 추가: 기존 컴포넌트용
  RsvpRequest, 
  RsvpResponse,
  AdminCredentials,
  LoginResponse,
  CreateGroupRequest,
  InvitationGroup
} from '../types';

// ✅ 청첩장 정보 조회 (서버 API 직접 호출)
// ✅ 타입 매개변수 제거
export const getInvitationByCode = async (uniqueCode: string): Promise<InvitationAPIResponse> => {
  return apiGet(`/invitation/${uniqueCode}`);
};

// 참석 여부 응답 제출 (하객용)
export const submitRsvp = async (uniqueCode: string, rsvpData: RsvpRequest): Promise<RsvpResponse> => {
  try {
    // POST /api/invitation/:uniqueCode/rsvp
    const response = await apiPost(`/api/invitation/${uniqueCode}/rsvp`, rsvpData);
    return response;
  } catch (error) {
    console.error('참석 응답 제출 실패:', error);
    throw error;
  }
};

// 관리자 로그인
export const adminLogin = async (credentials: AdminCredentials): Promise<LoginResponse> => {
  try {
    // POST /api/admin/login
    const response = await apiPost('/api/admin/login', credentials);
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
    const response = await apiPost('/api/admin/groups', groupData);
    return response;
  } catch (error) {
    console.error('그룹 생성 실패:', error);
    throw error;
  }
};

// ✅ 이 함수만 남겨두세요 (중복 제거)
export const getAllRsvps = async (): Promise<RsvpResponse[]> => {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/admin/rsvps', {
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

// ✅ 이 함수도 있어야 합니다
export const getAllGroups = async (): Promise<InvitationGroup[]> => {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/admin/groups', {
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
    
    if (data.groups && Array.isArray(data.groups)) {
      return data.groups;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn('예상하지 못한 응답 형식:', data);
    return [];
  } catch (error) {
    console.error('그룹 조회 실패:', error);
    throw error;
  }
};