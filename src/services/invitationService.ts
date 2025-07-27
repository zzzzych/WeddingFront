// API 서비스 함수들
import { apiGet, apiPost } from './api';
import { 
  InvitationAPIResponse,  // ✅ 변경: InvitationResponse → InvitationAPIResponse
  InvitationResponse,     // ✅ 추가: 기존 컴포넌트용
  RsvpRequest, 
  RsvpResponse,
  AdminCredentials,
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
export const adminLogin = async (credentials: AdminCredentials): Promise<{ token: string; user: any }> => {
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

// 모든 참석 응답 조회 (관리자용)
export const getAllRsvps = async (): Promise<RsvpResponse[]> => {
  try {
    // GET /api/admin/rsvps
    const response = await apiGet('/api/admin/rsvps');
    return response;
  } catch (error) {
    console.error('참석 응답 조회 실패:', error);
    throw error;
  }
};