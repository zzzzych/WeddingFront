// API 기본 설정 및 공통 함수들
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.leelee.kr';

// API 요청 옵션 타입 정의
interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// HTTP 요청을 위한 기본 함수
const apiRequest = async (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
};

// GET 요청
export const apiGet = (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  return apiRequest(endpoint, { method: 'GET', ...options });
};

// POST 요청
export const apiPost = async (endpoint: string, data: any, options: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 🔥 이 부분이 중요!
        ...options.headers // 추가 헤더들 (Authorization 등)
      },
      body: JSON.stringify(data) // JSON 문자열로 변환
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API POST 요청 실패:', error);
    throw error;
  }
};

// PUT 요청
export const apiPut = (endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<any> => {
  return apiRequest(endpoint, {
    method: 'PUT', 
    body: JSON.stringify(data),
    ...options,
  });
};

// DELETE 요청
export const apiDelete = (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  return apiRequest(endpoint, { method: 'DELETE', ...options });
};

// src/services/api.ts 파일에 추가할 함수

// ✅ 인증이 필요한 API 요청 (JWT 토큰 포함)
export const authenticatedApiRequest = async (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // 인증 실패 시 토큰 제거
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('인증된 API 요청 실패:', error);
    throw error;
  }
};

// ✅ 인증된 POST 요청
export const authenticatedApiPost = (endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<any> => {
  return authenticatedApiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

// ✅ 인증된 GET 요청
export const authenticatedApiGet = (endpoint: string, options: ApiRequestOptions = {}): Promise<any> => {
  return authenticatedApiRequest(endpoint, { method: 'GET', ...options });
};