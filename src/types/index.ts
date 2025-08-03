// src/types/index.ts
// 청첩장 관련 타입 정의들 (서버 응답에 맞춰 업데이트)

// 그룹 타입 enum
export enum GroupType {
  WEDDING_GUEST = 'WEDDING_GUEST',
  PARENTS_GUEST = 'PARENTS_GUEST', 
  COMPANY_GUEST = 'COMPANY_GUEST'
}

// ✅ 서버 응답에 맞춘 기능 플래그 타입
export interface InvitationFeatures {
  showVenueInfo: boolean;
  showShareButton: boolean;
  showCeremonyProgram: boolean;
  showRsvpForm: boolean;
  showAccountInfo: boolean;
  showPhotoGallery: boolean;
}

// ✅ 서버에서 실제로 반환하는 청첩장 응답 타입
export interface InvitationAPIResponse {
  greetingMessage: string;        // 그룹별 인사말
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingLocation: string;        // 통합된 웨딩홀 정보
  groupType: GroupType;
  groupName: string;
  accountInfo: string[];
  ceremonyProgram: string;
  features: InvitationFeatures;   // 기능 플래그들
}

// 기존 타입들도 유지 (필요시 사용)
export interface WeddingInfo {
  id?: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  kakaoMapUrl?: string;
  naverMapUrl?: string;
  parkingInfo?: string;
  transportInfo?: string;
  ceremonyProgram: string;
  accountInfo: string[];
}

//초대 그룹
export interface InvitationGroup {
  id?: string;
  groupName: string;
  groupType: GroupType;
  uniqueCode: string;
  greetingMessage: string;
  
  // 🆕 기능 설정 필드들 추가
  showVenueInfo?: boolean;
  showShareButton?: boolean;
  showCeremonyProgram?: boolean;
  showRsvpForm?: boolean;
  showAccountInfo?: boolean;
  showPhotoGallery?: boolean;
}

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

export interface RsvpRequest {
  responderName: string;
  isAttending: boolean;
  adultCount: number;
  childrenCount: number;
}

// ✅ 누락된 타입들 추가

// 관리자 인증 타입
export interface AdminCredentials {
  username: string;
  password: string;
}

// 그룹 생성 요청 타입
export interface CreateGroupRequest {
  groupName: string;
  groupType: GroupType;
  greetingMessage: string;
}

// ✅ 서버 응답에 맞춘 InvitationResponse 타입 (기존 컴포넌트용)
export interface InvitationResponse {
  weddingInfo: {
    groomName: string;
    brideName: string;
    weddingDate: string;
    weddingLocation: string;        // 통합된 장소 정보
    greetingMessage: string;
    ceremonyProgram: string;
    accountInfo: string[];
    // ✅ 서버에는 없지만 컴포넌트에서 필요한 필드들 (옵셔널로 처리)
    venueName?: string;
    venueAddress?: string;
    kakaoMapUrl?: string;
    naverMapUrl?: string;
    parkingInfo?: string;
    transportInfo?: string;
  };
  // ✅ 그룹 정보 추가
  groupInfo: {
    groupName: string;
    groupType: GroupType;
    greetingMessage: string;
  };
  showRsvpForm: boolean;
  showAccountInfo: boolean;
  showShareButton: boolean;
  showCeremonyProgram: boolean;
}

// 그룹 업데이트 요청 타입 (완전한 정의)
export interface UpdateGroupRequest {
  groupName?: string;
  greetingMessage?: string;
  uniqueCode?: string;
  
  // 🆕 기능 설정 필드들 추가
  showVenueInfo?: boolean;
  showShareButton?: boolean;
  showCeremonyProgram?: boolean;
  showRsvpForm?: boolean;
  showAccountInfo?: boolean;
  showPhotoGallery?: boolean;
}

// 그룹별 인사말 수정 전용 요청
export interface UpdateGroupGreetingRequest {
  greetingMessage: string;
}

// 관리자 로그인 응답 타입 (서버와 일치해야 함)
export interface LoginResponse {
  token: string;
  expiresAt: string;  // Date를 JSON으로 직렬화하면 string이 됨
  username: string;
}

// src/types/index.ts 파일 하단에 추가할 타입들

// ✅ 관리자 생성 관련 타입들 추가
export interface CreateAdminRequest {
  username: string;
  password: string;
  role: string;
}

export interface AdminCreateResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string; // ISO 문자열 형태
  message: string;
}

export interface AdminInfo {
  id: string;
  username: string;
  role: string;
  createdAt: string; // ISO 문자열 형태
  lastLoginAt?: string; // 옵셔널
}

export interface AdminListResponse {
  admins: AdminInfo[];
  totalCount: number;
}

export type AdminRole = 'admin' | 'super_admin' | 'manager';

export interface AdminRoleOption {
  value: AdminRole;
  label: string;
  description: string;
}

// ✅ 관리자 역할 옵션 상수
export const ADMIN_ROLE_OPTIONS: AdminRoleOption[] = [
  {
    value: 'admin',
    label: '일반 관리자',
    description: '기본 관리 권한'
  },
  {
    value: 'super_admin',
    label: '슈퍼 관리자', 
    description: '모든 권한 (다른 관리자 생성 가능)'
  },
  {
    value: 'manager',
    label: '매니저',
    description: '제한된 관리 권한'
  }
];

// ✅ 역할별 권한 설명 함수
export const getAdminRoleDescription = (role: string): string => {
  const roleOption = ADMIN_ROLE_OPTIONS.find(option => option.value === role);
  return roleOption ? roleOption.description : '알 수 없는 역할';
};

// ✅ 역할별 라벨 함수  
export const getAdminRoleLabel = (role: string): string => {
  const roleOption = ADMIN_ROLE_OPTIONS.find(option => option.value === role);
  return roleOption ? roleOption.label : role;
};