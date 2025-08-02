// API 기본 설정 및 공통 함수들
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.leelee.kr/api';

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
export const apiPost = (endpoint: string, data: any, options: ApiRequestOptions = {}): Promise<any> => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
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