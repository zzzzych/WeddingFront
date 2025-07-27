// src/types/index.ts
// 청첩장 관련 타입 정의들 (그룹별 개별 인사말 버전)

// 그룹 타입 enum
export enum GroupType {
  WEDDING_GUEST = 'WEDDING_GUEST',
  PARENTS_GUEST = 'PARENTS_GUEST', 
  COMPANY_GUEST = 'COMPANY_GUEST'
}

// 청첩장 정보 타입 (공통 정보만 포함)
export interface WeddingInfo {
  id?: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueDetail: string;
  venuePhone?: string;
  kakaoMapUrl?: string;
  naverMapUrl?: string;
  googleMapUrl?: string;
  parkingInfo?: string;
  transportInfo?: string;
  ceremonyProgram: string;
  accountInfo: string[];
  // ❌ greetingMessage 제거 - 이제 각 그룹별로 개별 관리
}

// ✅ 초대 그룹 타입 (개별 인사말 추가)
export interface InvitationGroup {
  id?: string;
  groupName: string;
  groupType: GroupType;
  uniqueCode: string;
  greetingMessage: string;  // ✨ 새로 추가: 각 그룹별 개별 인사말
}

// 청첩장 응답 타입 (그룹별로 필터링된 정보)
export interface InvitationResponse {
  groupInfo: InvitationGroup;  // 이제 greetingMessage 포함
  weddingInfo: Partial<WeddingInfo>;
  showRsvpForm: boolean;
  showAccountInfo: boolean;
  showShareButton: boolean;
  showCeremonyProgram: boolean;
}

// 참석 응답 타입
export interface RsvpResponse {
  id?: string;
  responderName: string;
  isAttending: boolean;
  adultCount: number;
  childrenCount: number;
  createdAt?: string;
  updatedAt?: string;
  groupId: string;
}

// API 요청 타입들
export interface RsvpRequest {
  responderName: string;
  isAttending: boolean;
  adultCount: number;
  childrenCount: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

// ✅ 그룹 생성 요청 (개별 인사말 추가)
export interface CreateGroupRequest {
  groupName: string;
  groupType: GroupType;
  greetingMessage: string;  // ✨ 새로 추가: 그룹 생성 시 인사말도 함께 설정
}

// ✅ 그룹 수정 요청 (개별 인사말 수정)
export interface UpdateGroupRequest {
  groupName?: string;
  greetingMessage?: string;  // ✨ 새로 추가: 그룹별 인사말 수정
}

// ✅ 그룹별 인사말 수정 전용 요청
export interface UpdateGroupGreetingRequest {
  greetingMessage: string;
}