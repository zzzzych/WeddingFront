// 웨딩홀 정보 및 오시는 길 안내 컴포넌트
import React, { useState } from 'react';
import { InvitationResponse } from '../types';

// Props 타입 정의
interface VenueInfoProps {
  invitationData: InvitationResponse;  // 청첩장 데이터
}

const VenueInfo: React.FC<VenueInfoProps> = ({ invitationData }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'directions' | 'parking'>('info');
  
  const { weddingInfo } = invitationData;

  // 지도 링크 열기
  const openMapLink = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 전화 걸기
  const makePhoneCall = (phoneNumber: string | undefined) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // 주소 복사
  const copyAddress = async () => {
    if (weddingInfo.venueAddress) {
      try {
        await navigator.clipboard.writeText(weddingInfo.venueAddress);
        alert('주소가 복사되었습니다!');
      } catch (err) {
        console.error('주소 복사 실패:', err);
        // 폴백: 텍스트 선택
        const textArea = document.createElement('textarea');
        textArea.value = weddingInfo.venueAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('주소가 복사되었습니다!');
      }
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          fontSize: '24px',
          color: '#856404',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          🏛️ 오시는 길
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          결혼식 장소 및 교통편 안내
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        display: 'flex',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        {[
          { key: 'info', label: '🏛️ 웨딩홀 정보', icon: '🏛️' },
          { key: 'directions', label: '🗺️ 지도 & 길찾기', icon: '🗺️' },
          { key: 'parking', label: '🚗 교통 & 주차', icon: '🚗' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? '#007bff' : '#6c757d',
              border: 'none',
              padding: '12px 8px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'info' && (
        <div>
          {/* 웨딩홀 기본 정보 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{
              fontSize: '18px',
              color: '#2c3e50',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏛️ {weddingInfo.venueName || '웨딩홀'}
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#6c757d', fontSize: '14px', minWidth: '16px' }}>📍</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '15px',
                    lineHeight: '1.5',
                    color: '#495057'
                  }}>
                    {weddingInfo.venueAddress || '서울시 강남구 웨딩홀'}
                  </p>
                  <button
                    onClick={copyAddress}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: 'none',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '2px 0',
                      marginTop: '4px',
                      textDecoration: 'underline'
                    }}
                  >
                    📋 주소 복사
                  </button>
                </div>
              </div>
            </div>

            {weddingInfo.venuePhone && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>📞</span>
                  <span style={{ fontSize: '15px', color: '#495057' }}>
                    {weddingInfo.venuePhone}
                  </span>
                  <button
                    onClick={() => makePhoneCall(weddingInfo.venuePhone)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📞 전화걸기
                  </button>
                </div>
              </div>
            )}

            {weddingInfo.venueDetail && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6c757d',
                  lineHeight: '1.5'
                }}>
                  {weddingInfo.venueDetail}
                </p>
              </div>
            )}
          </div>

          {/* 일시 정보 */}
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #bbdefb'
          }}>
            <h4 style={{
              fontSize: '16px',
              color: '#1565c0',
              margin: '0 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗓️ 결혼식 일정
            </h4>
            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#2c3e50',
              margin: 0
            }}>
              {new Date(weddingInfo.weddingDate!).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <p style={{
              fontSize: '16px',
              color: '#495057',
              margin: '4px 0 0 0'
            }}>
              {new Date(weddingInfo.weddingDate!).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'directions' && (
        <div>
          {/* 지도 링크 버튼들 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* 카카오맵 */}
            <button
              onClick={() => openMapLink(weddingInfo.kakaoMapUrl)}
              disabled={!weddingInfo.kakaoMapUrl}
              style={{
                backgroundColor: weddingInfo.kakaoMapUrl ? '#fee500' : '#e9ecef',
                color: weddingInfo.kakaoMapUrl ? '#3c1e1e' : '#6c757d',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: weddingInfo.kakaoMapUrl ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              🗺️ 카카오맵으로 보기
            </button>

            {/* 네이버맵 */}
            <button
              onClick={() => openMapLink(weddingInfo.naverMapUrl)}
              disabled={!weddingInfo.naverMapUrl}
              style={{
                backgroundColor: weddingInfo.naverMapUrl ? '#03c75a' : '#e9ecef',
                color: weddingInfo.naverMapUrl ? 'white' : '#6c757d',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: weddingInfo.naverMapUrl ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              🧭 네이버맵으로 보기
            </button>

            {/* 구글맵 */}
            <button
              onClick={() => openMapLink(weddingInfo.googleMapUrl)}
              disabled={!weddingInfo.googleMapUrl}
              style={{
                backgroundColor: weddingInfo.googleMapUrl ? '#4285f4' : '#e9ecef',
                color: weddingInfo.googleMapUrl ? 'white' : '#6c757d',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: weddingInfo.googleMapUrl ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              🌐 구글맵으로 보기
            </button>
          </div>

          {/* 길찾기 안내 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{
              fontSize: '16px',
              color: '#2c3e50',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🧭 길찾기 팁
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              fontSize: '14px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#495057' }}>
                  🚗 자동차 이용
                </div>
                <div style={{ color: '#6c757d', fontSize: '13px' }}>
                  네비게이션에 정확한 주소를 입력하세요
                </div>
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#495057' }}>
                  🚇 대중교통 이용
                </div>
                <div style={{ color: '#6c757d', fontSize: '13px' }}>
                  지하철/버스 경로를 확인하세요
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parking' && (
        <div>
          {/* 주차 정보 */}
          {weddingInfo.parkingInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚗 주차 안내
              </h4>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '15px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#856404'
                }}>
                  {weddingInfo.parkingInfo}
                </p>
              </div>
            </div>
          )}

          {/* 대중교통 정보 */}
          {weddingInfo.transportInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚇 대중교통 이용
              </h4>
              <div style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #bbdefb',
                borderRadius: '6px',
                padding: '15px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1565c0'
                }}>
                  {weddingInfo.transportInfo}
                </p>
              </div>
            </div>
          )}

          {/* 기본 안내 (정보가 없을 때) */}
          {!weddingInfo.parkingInfo && !weddingInfo.transportInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              border: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚗</div>
              <p style={{ color: '#6c757d', margin: 0 }}>
                교통 및 주차 정보는 웨딩홀에 직접 문의해주세요.
              </p>
              {weddingInfo.venuePhone && (
                <button
                  onClick={() => makePhoneCall(weddingInfo.venuePhone)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  📞 웨딩홀 전화걸기
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueInfo;