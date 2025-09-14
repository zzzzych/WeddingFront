// 웨딩홀 정보 및 오시는 길 안내 컴포넌트
import React, { useState, useEffect } from 'react';
import { InvitationResponse } from '../types';

// Props 타입 정의
interface VenueInfoProps {
  invitationData: InvitationResponse;  // 청첩장 데이터
}


// 반응형 폰트 사이즈 함수 (PC: px, 모바일: vw)
const getResponsiveFontSize = (pcPx: number, mobileVw: number, isMobile: boolean) => {
  return isMobile ? `${mobileVw}vw` : `${pcPx}px`;
};

const VenueInfo: React.FC<VenueInfoProps> = ({ invitationData }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'directions' | 'parking' | 'account'>('directions');
  
  const { weddingInfo } = invitationData;

  // 활성화된 기능에 따라 기본 탭 설정
  useEffect(() => {
    // showVenueInfo가 true면 directions를 기본으로, 아니면 showAccountInfo가 true일 때 account를 기본으로
    if (invitationData.showVenueInfo) {
      setActiveTab('directions');
    } else if (invitationData.showAccountInfo) {
      setActiveTab('account');
    }
  }, [invitationData.showVenueInfo, invitationData.showAccountInfo]);

  // 지도 링크 열기
  const openMapLink = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
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
  // showVenueInfo와 showAccountInfo가 모두 false면 컴포넌트를 렌더링하지 않음
  if (!invitationData.showVenueInfo && !invitationData.showAccountInfo) {
    return null;
  }

  // showAccountInfo만 true이고 showVenueInfo가 false인 경우: 탭 없이 바로 계좌 정보 표시
  if (!invitationData.showVenueInfo && invitationData.showAccountInfo) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            fontSize: '24px',
            color: '#222',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            마음 전할 곳
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '14px',
            margin: 0
          }}>
            축하의 마음을 전해주세요
          </p>
        </div>

        {/* 계좌 정보 표시 */}
        {weddingInfo.accountInfo && weddingInfo.accountInfo.length > 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            {/* 관리자에서 입력한 계좌 정보들을 배열로 표시 */}
            {weddingInfo.accountInfo.map((account, index) => (
              <div key={index} style={{
                fontSize: '14px',
                color: '#2c3e50',
                textAlign: 'center',
                marginBottom: '10px',
                padding: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
              }}>
                {account}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6c757d', margin: 0 }}>
              계좌 정보가 없습니다.
            </p>
          </div>
        )}
      </div>
    );
  }

  // showVenueInfo가 true인 경우 (탭 형태로 표시)
  if (invitationData.showVenueInfo && !invitationData.showAccountInfo) {
    return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          fontSize: '24px',
          color: '#222',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          오시는 길
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          결혼식 장소 및 교통편 안내
        </p>
      </div>

      {/* 탭 메뉴 - showVenueInfo와 showAccountInfo가 모두 true일 때만 표시 */}
      {(invitationData.showVenueInfo) && (
        <div style={{
          display: 'flex',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          {[
            { key: 'directions', label: '지도 & 길찾기', icon: '🗺️' },
            { key: 'parking', label: '교통 & 주차', icon: '🚗' },
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
      )}

      {/* 지도 & 길찾기 탭 */}
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
          </div>
        </div>
      )}

      {/* 교통 & 주차 탭 */}
      {activeTab === 'parking' && (
        <div>
          {/* 주차 정보 */}
          {weddingInfo.parkingInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '15px',
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚗 주차 안내
              </h4>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                justifyContent:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222',
                  textAlign:"center"
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
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚇 대중교통 이용
              </h4>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                textAlign:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222'
                }}>
                  서울역 10번 출구쪽 지하 연결 통로 이용 도보 4분<br/>
                  서울역 12번 출구 도보 2분
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  }

  if(invitationData.showVenueInfo && invitationData.showAccountInfo) {
    return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          fontSize: '24px',
          color: '#222',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          오시는 길
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          결혼식 장소 및 교통편 안내
        </p>
      </div>

      {/* 탭 메뉴 - showVenueInfo와 showAccountInfo가 모두 true일 때만 표시 */}
      {(invitationData.showVenueInfo && invitationData.showAccountInfo) && (
        <div style={{
          display: 'flex',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          {[
            { key: 'directions', label: '지도 & 길찾기', icon: '🗺️' },
            { key: 'parking', label: '교통 & 주차', icon: '🚗' },
            { key: 'account', label: '마음 전할 곳', icon: '💝' }
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
      )}

      {/* 지도 & 길찾기 탭 */}
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
          </div>
        </div>
      )}

      {/* 교통 & 주차 탭 */}
      {activeTab === 'parking' && (
        <div>
          {/* 주차 정보 */}
          {weddingInfo.parkingInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '15px',
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚗 주차 안내
              </h4>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                justifyContent:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222',
                  textAlign:"center"
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
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚇 대중교통 이용
              </h4>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                textAlign:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222'
                }}>
                  서울역 10번 출구쪽 지하 연결 통로 이용 도보 4분<br/>
                  서울역 12번 출구 도보 2분
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 계좌 정보 탭 - showAccountInfo가 true일 때만 표시 */}
      {activeTab === 'account' && invitationData.showAccountInfo && (
        <div>
          {/* 계좌 정보 표시 */}
          {weddingInfo.accountInfo && weddingInfo.accountInfo.length > 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                💝 마음 전할 곳
              </h4>
              {/* 관리자에서 입력한 계좌 정보들을 배열로 표시 */}
              {weddingInfo.accountInfo.map((account, index) => (
                <div key={index} style={{
                  fontSize: '14px',
                  color: '#2c3e50',
                  textAlign: 'center',
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                }}>
                  {account}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6c757d', margin: 0 }}>
                계좌 정보가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
  }
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          fontSize: '24px',
          color: '#222',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          오시는 길
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          결혼식 장소 및 교통편 안내
        </p>
      </div>

      {/* 탭 메뉴 - showVenueInfo와 showAccountInfo가 모두 true일 때만 표시 */}
      {(invitationData.showVenueInfo && invitationData.showAccountInfo) && (
        <div style={{
          display: 'flex',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          {[
            { key: 'directions', label: '지도 & 길찾기', icon: '🗺️' },
            { key: 'parking', label: '교통 & 주차', icon: '🚗' },
            { key: 'account', label: '마음 전할 곳', icon: '💝' }
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
      )}

      {/* 지도 & 길찾기 탭 */}
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
          </div>
        </div>
      )}

      {/* 교통 & 주차 탭 */}
      {activeTab === 'parking' && (
        <div>
          {/* 주차 정보 */}
          {weddingInfo.parkingInfo && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '15px',
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚗 주차 안내
              </h4>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                justifyContent:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222',
                  textAlign:"center"
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
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent:"center"
              }}>
                🚇 대중교통 이용
              </h4>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                textAlign:"center"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#222'
                }}>
                  서울역 10번 출구쪽 지하 연결 통로 이용 도보 4분<br/>
                  서울역 12번 출구 도보 2분
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 계좌 정보 탭 - showAccountInfo가 true일 때만 표시 */}
      {activeTab === 'account' && invitationData.showAccountInfo && (
        <div>
          {/* 계좌 정보 표시 */}
          {weddingInfo.accountInfo && weddingInfo.accountInfo.length > 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h4 style={{
                fontSize: '16px',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                💝 마음 전할 곳
              </h4>
              {/* 관리자에서 입력한 계좌 정보들을 배열로 표시 */}
              {weddingInfo.accountInfo
              .filter((_, index) => {
                if (invitationData.groupInfo.groupName === "윤진 회사 공유용") {
                  return index !== 0; // 0번 빼고 나머지
                } else {
                  return index === 0; // 0번만
                }
              })
              .map((account, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: "14px",
                    color: "#2c3e50",
                    textAlign: "center",
                    marginBottom: "10px",
                    padding: "8px",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                  }}
                >
                  {account}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6c757d', margin: 0 }}>
                계좌 정보가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueInfo;