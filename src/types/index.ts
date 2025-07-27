// 청첩장 관련 타입 정의들

// 그룹 타입 enum
export enum GroupType {
  WEDDING_GUEST = 'WEDDING_GUEST',
  PARENTS_GUEST = 'PARENTS_GUEST', 
  COMPANY_GUEST = 'COMPANY_GUEST'
}

// 청첩장 정보 타입
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
  greetingMessage: string;
  ceremonyProgram: string;
  accountInfo: string[];
}

// 초대 그룹 타입
export interface InvitationGroup {
  id?: string;
  groupName: string;
  groupType: GroupType;
  uniqueCode: string;
}

// 청첩장 응답 타입 (그룹별로 필터링된 정보)
export interface InvitationResponse {
  groupInfo: InvitationGroup;
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

export interface CreateGroupRequest {
  groupName: string;
  groupType: GroupType;
}