/**
 * 인증 관련 유틸리티 함수들
 * JWT 토큰 관리 및 로그인 상태 처리를 담당
 */

/**
 * 로그아웃 처리 - 모든 인증 정보를 정리하고 로그인 페이지로 이동
 * @param showAlert - 사용자에게 알림을 표시할지 여부 (기본값: true)
 * @param redirectToLogin - 로그인 페이지로 자동 리디렉션할지 여부 (기본값: false)
 */
export const handleLogout = (showAlert: boolean = true, redirectToLogin: boolean = false): void => {
  console.log('🚪 로그아웃 처리 시작');
  
  // 1. 로컬 스토리지에서 모든 인증 정보 제거
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // 2. 사용자에게 알림 표시 (선택적)
  if (showAlert) {
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
  }
  
  // 3. 로그인 페이지로 리디렉션 (선택적)
  if (redirectToLogin) {
    // React Router를 사용하는 경우 navigate를 사용하거나
    // 단순히 window.location을 사용할 수 있습니다
    window.location.href = '/admin/login';
  }
  
  console.log('✅ 로그아웃 처리 완료');
};

/**
 * 토큰 만료 에러인지 확인하는 함수
 * @param error - 확인할 에러 객체
 * @returns boolean - 토큰 만료 에러 여부
 */
export const isTokenExpiredError = (error: any): boolean => {
  if (!error || !error.message) {
    return false;
  }
  
  const message = error.message.toLowerCase();
  
  return (
    message.includes('토큰이 만료되었습니다') ||
    message.includes('인증이 만료되었습니다') ||
    message.includes('다시 로그인해주세요') ||
    message.includes('exp claim verification failed') ||
    message.includes('expired') ||
    message.includes('unauthorized')
  );
};

/**
 * 현재 로그인 상태 확인
 * @returns boolean - 로그인 상태 여부
 */
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('adminToken');
  const userInfo = localStorage.getItem('adminUser');
  
  if (!token || !userInfo) {
    return false;
  }
  
  try {
    const user = JSON.parse(userInfo);
    
    if (!user.expiresAt) {
      return false;
    }
    
    const expirationTime = new Date(user.expiresAt);
    const currentTime = new Date();
    
    // 1분 여유시간을 두고 만료 체크
    return currentTime.getTime() < (expirationTime.getTime() - 60 * 1000);
    
  } catch (error) {
    console.error('❌ 로그인 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 로그인한 사용자 정보 가져오기
 * @returns object | null - 사용자 정보 또는 null
 */
export const getCurrentUser = (): any | null => {
  const userInfo = localStorage.getItem('adminUser');
  
  if (!userInfo) {
    return null;
  }
  
  try {
    return JSON.parse(userInfo);
  } catch (error) {
    console.error('❌ 사용자 정보 파싱 실패:', error);
    return null;
  }
};

/**
 * 토큰 만료까지 남은 시간 계산 (분 단위)
 * @returns number - 남은 시간 (분), 만료된 경우 0
 */
export const getTokenRemainingTime = (): number => {
  const userInfo = localStorage.getItem('adminUser');
  
  if (!userInfo) {
    return 0;
  }
  
  try {
    const user = JSON.parse(userInfo);
    
    if (!user.expiresAt) {
      return 0;
    }
    
    const expirationTime = new Date(user.expiresAt);
    const currentTime = new Date();
    
    const remainingMs = expirationTime.getTime() - currentTime.getTime();
    
    if (remainingMs <= 0) {
      return 0;
    }
    
    return Math.floor(remainingMs / (1000 * 60)); // 분 단위로 변환
    
  } catch (error) {
    console.error('❌ 토큰 잔여 시간 계산 실패:', error);
    return 0;
  }
};