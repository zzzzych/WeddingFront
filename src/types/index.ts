// src/types/index.ts
// 청첩장 관련 타입 정의들 (서버 응답에 맞춰 업데이트)

// ==================== 📋 기본 ENUM 정의 ====================

// 그룹 타입 enum
export enum GroupType {
  WEDDING_GUEST = 'WEDDING_GUEST',    // 결혼식 하객 (참석 응답 가능)
  PARENTS_GUEST = 'PARENTS_GUEST',    // 부모님 지인들 (참석 응답 불가)
  COMPANY_GUEST = 'COMPANY_GUEST'     // 회사 동료들 (참석 응답 불가)
}

// ==================== 🎯 청첩장 관련 타입 ====================

// ✅ 서버 응답에 맞춘 기능 플래그 타입
export interface InvitationFeatures {
  showVenueInfo: boolean;      // 오시는 길 정보 표시 여부
  showShareButton: boolean;    // 공유 버튼 표시 여부
  showCeremonyProgram: boolean; // 예식 순서 표시 여부
  showRsvpForm: boolean;       // 참석 응답 폼 표시 여부
  showAccountInfo: boolean;    // 계좌 정보 표시 여부
  showPhotoGallery: boolean;   // 포토 갤러리 표시 여부
}

// ✅ 서버에서 실제로 반환하는 청첩장 응답 타입
export interface InvitationAPIResponse {
  greetingMessage: string;        // 그룹별 인사말
  groomName: string;              // 신랑 이름
  brideName: string;              // 신부 이름
  weddingDate: string;            // 결혼식 날짜
  weddingLocation: string;        // 통합된 웨딩홀 정보
  groupType: GroupType;           // 그룹 타입
  groupName: string;              // 그룹 이름
  accountInfo: string[];          // 계좌 정보 배열
  ceremonyProgram: string;        // 예식 순서
  features: InvitationFeatures;   // 기능 플래그들
}

// 기존 타입들도 유지 (필요시 사용)
export interface WeddingInfo {
  id?: string;                    // 결혼식 정보 고유 ID
  groomName: string;              // 신랑 이름
  brideName: string;              // 신부 이름
  weddingDate: string;            // 결혼식 날짜
  venueName: string;              // 웨딩홀 이름
  venueAddress: string;           // 웨딩홀 주소
  kakaoMapUrl?: string;           // 카카오맵 URL (선택사항)
  naverMapUrl?: string;           // 네이버맵 URL (선택사항)
  parkingInfo?: string;           // 주차 정보 (선택사항)
  transportInfo?: string;         // 교통 정보 (선택사항)
  ceremonyProgram: string;        // 예식 순서
  accountInfo: string[];          // 계좌 정보 배열
}

// ==================== 👥 그룹 관련 타입 ====================

// 초대 그룹 인터페이스
export interface InvitationGroup {
  id?: string;                    // 그룹 고유 ID
  groupName: string;              // 그룹 이름 (예: "신랑 대학 동기")
  groupType: GroupType;           // 그룹 타입
  uniqueCode: string;             // 고유 접근 코드 (초대장 링크용)
  greetingMessage: string;        // 그룹별 인사말
  
  // 🆕 기능 설정 필드들 추가
  showVenueInfo?: boolean;        // 오시는 길 정보 표시 여부
  showShareButton?: boolean;      // 공유 버튼 표시 여부
  showCeremonyProgram?: boolean;  // 예식 순서 표시 여부
  showRsvpForm?: boolean;         // 참석 응답 폼 표시 여부
  showAccountInfo?: boolean;      // 계좌 정보 표시 여부
  showPhotoGallery?: boolean;     // 포토 갤러리 표시 여부
}

// 그룹 생성 요청 타입
export interface CreateGroupRequest {
  groupName: string;              // 생성할 그룹 이름
  groupType: GroupType;           // 그룹 타입
  greetingMessage: string;        // 그룹별 인사말
}

// ✅ 그룹 생성 응답 타입 추가
export interface CreateGroupResponse {
  id: string;                     // 생성된 그룹 ID
  groupName: string;              // 그룹 이름
  groupType: string;              // 그룹 타입
  uniqueCode: string;             // 고유 코드
  greetingMessage: string;        // 인사말
  message: string;                // 생성 완료 메시지
}

// 그룹 업데이트 요청 타입 (완전한 정의)
export interface UpdateGroupRequest {
  groupName?: string;             // 수정할 그룹 이름 (선택사항)
  greetingMessage?: string;       // 수정할 인사말 (선택사항)
  uniqueCode?: string;            // 수정할 고유 코드 (선택사항)
  
  // 🆕 기능 설정 필드들 추가 (모두 선택사항)
  showVenueInfo?: boolean;        // 오시는 길 정보 표시 여부
  showShareButton?: boolean;      // 공유 버튼 표시 여부
  showCeremonyProgram?: boolean;  // 예식 순서 표시 여부
  showRsvpForm?: boolean;         // 참석 응답 폼 표시 여부
  showAccountInfo?: boolean;      // 계좌 정보 표시 여부
  showPhotoGallery?: boolean;     // 포토 갤러리 표시 여부
}

// 그룹별 인사말 수정 전용 요청
export interface UpdateGroupGreetingRequest {
  greetingMessage: string;        // 수정할 인사말
}

// ==================== 📊 RSVP 관련 타입 (서버와 일치하도록 수정) ====================

// 기존 RSVP 응답 타입 (AdminDashboard에서 사용 중)
export interface RsvpResponse {
  id?: string;                    // 응답 고유 ID
  responderName: string;          // 응답자 이름
  isAttending: boolean;           // 참석 여부 (true: 참석, false: 불참)
  adultCount: number;             // 성인 참석 인원 수
  childrenCount: number;          // 자녀 참석 인원 수
  createdAt?: string;             // 응답 생성 일시
  updatedAt?: string;             // 응답 수정 일시
  groupId: string;                // 속한 그룹 ID
}

// RSVP 제출 요청 타입
export interface RsvpRequest {
  responderName: string;          // 응답자 이름
  isAttending: boolean;           // 참석 여부
  adultCount: number;             // 성인 참석 인원 수
  childrenCount: number;          // 자녀 참석 인원 수
}

// ==================== 📊 RSVP 관련 타입 (새로 추가) ====================

// RSVP 통계 정보 타입
export interface RsvpSummary {
  totalResponses: number;         // 전체 응답 수 (참석 + 불참)
  attendingResponses: number;     // 참석 응답 수 (totalAttending → attendingResponses)
  notAttendingResponses: number;  // 불참 응답 수 (totalNotAttending → notAttendingResponses)
  totalAttendingCount: number;    // 총 참석 예정 인원 (성인 + 자녀)
  totalAdultCount: number;        // 참석 예정 성인 인원
  totalChildrenCount: number;     // 참석 예정 자녀 인원
}

// 간단한 그룹 정보 타입 (서버의 SimpleGroupInfo와 일치)
export interface SimpleGroupInfo {
  id: string;                     // 그룹 고유 ID
  groupName: string;              // 그룹 이름
  groupType: string;              // 그룹 타입 (문자열 형태)
  uniqueCode: string;             // 고유 접근 코드
}

// 간단한 RSVP 응답 타입 (서버의 SimpleRsvpResponse와 일치)
export interface SimpleRsvpResponse {
  id?: string;                    // 응답 고유 ID
  responderName: string;          // 응답자 이름 (guestName → responderName)
  isAttending: boolean;           // 참석 여부 (willAttend → isAttending)
  adultCount: number;             // 성인 참석 인원 수 (companions → adultCount)
  childrenCount: number;          // 자녀 참석 인원 수 (새로 추가)
  submittedAt?: string;           // 응답 제출 일시
  updatedAt?: string;             // 응답 수정 일시
  
  // ✅ 컴포넌트 호환성을 위해 추가 (옵셔널)
  phoneNumber?: string;           // 전화번호
  message?: string;               // 메시지
}

// ✅ RSVP 제출 응답 타입
export interface RsvpSubmitResponse {
  id: string;                     // 생성된 응답 ID
  message: string;                // 제출 완료 메시지
  response: SimpleRsvpResponse;   // 제출된 응답 데이터
}

// 그룹 정보가 포함된 RSVP 응답 타입 (서버의 SimpleRsvpWithGroupInfo와 일치)
export interface SimpleRsvpWithGroupInfo {
  response: SimpleRsvpResponse;   // 응답 정보
  groupInfo: SimpleGroupInfo;     // 그룹 정보
  
  // ✅ 컴포넌트 호환성을 위한 플랫 구조 접근자들 (계산된 속성)
  get id(): string | undefined {
    return this.response.id;
  }
  get guestName(): string {
    return this.response.responderName;
  }
  get willAttend(): boolean {
    return this.response.isAttending;
  }
  get phoneNumber(): string | undefined {
    return this.response.phoneNumber;
  }
  get companions(): number {
    return this.response.adultCount + this.response.childrenCount - 1; // 본인 제외
  }
  get message(): string | undefined {
    return this.response.message;
  }
  get groupName(): string {
    return this.groupInfo.groupName;
  }
}

// 개별 응답 목록과 통계가 포함된 전체 응답 데이터 (서버의 RsvpListResponse와 일치)
export interface RsvpListResponse {
  responses: SimpleRsvpWithGroupInfo[];  // 개별 응답 목록 (그룹 정보 포함)
  summary: RsvpSummary;                  // 전체 응답 통계 정보
}

// ✅ 초대장 코드로 조회 응답 타입
export interface InvitationByCodeResponse {
  greetingMessage: string;        // 그룹별 인사말
  groomName: string;              // 신랑 이름
  brideName: string;              // 신부 이름
  weddingDate: string;            // 결혼식 날짜
  weddingLocation: string;        // 통합된 웨딩홀 정보
  groupType: string;              // 그룹 타입
  groupName: string;              // 그룹 이름
  accountInfo: string[];          // 계좌 정보 배열
  ceremonyProgram: string;        // 예식 순서
  features: {                     // 기능 플래그들
    showVenueInfo: boolean;
    showShareButton: boolean;
    showCeremonyProgram: boolean;
    showRsvpForm: boolean;
    showAccountInfo: boolean;
    showPhotoGallery: boolean;
  };
}

// ==================== 👤 관리자 관련 타입 ====================

// 관리자 인증 타입
export interface AdminCredentials {
  username: string;               // 관리자 사용자명
  password: string;               // 관리자 비밀번호
}

// 관리자 로그인 응답 타입 (서버와 일치해야 함)
export interface LoginResponse {
  token: string;                  // JWT 토큰
  expiresAt: string;              // 토큰 만료 일시 (Date를 JSON으로 직렬화하면 string이 됨)
  username: string;               // 로그인한 관리자 사용자명
}

// ✅ 관리자 로그인 요청 타입
export interface AdminLoginRequest {
  username: string;               // 관리자 사용자명
  password: string;               // 관리자 비밀번호
}

// ✅ 관리자 로그인 응답 타입
export interface AdminLoginResponse {
  token: string;                  // JWT 토큰
  expiresAt: string;              // 토큰 만료 일시
  username: string;               // 로그인한 관리자 사용자명
  role: string;                   // 관리자 역할
}

// ✅ 관리자 생성 관련 타입들 추가
export interface CreateAdminRequest {
  username: string;               // 새 관리자 사용자명
  password: string;               // 새 관리자 비밀번호
  role: string;                   // 새 관리자 역할
}

export interface AdminCreateResponse {
  id: string;                     // 생성된 관리자 ID
  username: string;               // 생성된 관리자 사용자명
  role: string;                   // 생성된 관리자 역할
  createdAt: string;              // 생성 일시 (ISO 문자열 형태)
  message: string;                // 생성 완료 메시지
}

export interface AdminInfo {
  id: string;                     // 관리자 ID
  username: string;               // 관리자 사용자명
  role: string;                   // 관리자 역할
  createdAt: string;              // 생성 일시 (ISO 문자열 형태)
  lastLoginAt?: string;           // 마지막 로그인 일시 (옵셔널)
}

export interface AdminListResponse {
  admins: AdminInfo[];            // 관리자 목록
  totalCount: number;             // 총 관리자 수
}

export type AdminRole = 'admin' | 'super_admin' | 'manager';

export interface AdminRoleOption {
  value: AdminRole;               // 역할 값
  label: string;                  // 역할 라벨 (화면 표시용)
  description: string;            // 역할 설명
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

// ==================== 📄 기존 컴포넌트용 타입 (호환성 유지) ====================

// ✅ 서버 응답에 맞춘 InvitationResponse 타입 (기존 컴포넌트용)
export interface InvitationResponse {
  weddingInfo: {
    groomName: string;              // 신랑 이름
    brideName: string;              // 신부 이름
    weddingDate: string;            // 결혼식 날짜
    weddingLocation: string;        // 통합된 장소 정보
    greetingMessage: string;        // 인사말
    ceremonyProgram: string;        // 예식 순서
    accountInfo: string[];          // 계좌 정보
    // ✅ 서버에는 없지만 컴포넌트에서 필요한 필드들 (옵셔널로 처리)
    venueName?: string;             // 웨딩홀 이름
    venueAddress?: string;          // 웨딩홀 주소
    kakaoMapUrl?: string;           // 카카오맵 URL
    naverMapUrl?: string;           // 네이버맵 URL
    parkingInfo?: string;           // 주차 정보
    transportInfo?: string;         // 교통 정보
  };
  // ✅ 그룹 정보 추가
  groupInfo: {
    groupName: string;              // 그룹 이름
    groupType: GroupType;           // 그룹 타입
    greetingMessage: string;        // 그룹별 인사말
  };
  showRsvpForm: boolean;            // 참석 응답 폼 표시 여부
  showAccountInfo: boolean;         // 계좌 정보 표시 여부
  showShareButton: boolean;         // 공유 버튼 표시 여부
  showCeremonyProgram: boolean;     // 예식 순서 표시 여부
}

// RSVP 응답 수정 요청 타입 (서버의 UpdateRsvpRequest와 일치)
export interface UpdateRsvpRequest {
  responderName: string;          // 응답자 이름
  isAttending: boolean;           // 참석 여부
  adultCount: number;             // 성인 참석 인원 수
  childrenCount: number;          // 자녀 참석 인원 수
}

// 그룹 정보가 포함된 RSVP 응답 타입 (서버의 SimpleRsvpWithGroupInfo와 일치)
export interface SimpleRsvpWithGroupInfo {
  response: SimpleRsvpResponse;   // 응답 정보
  groupInfo: SimpleGroupInfo;     // 그룹 정보
}