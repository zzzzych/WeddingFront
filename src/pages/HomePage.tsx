import React, { useEffect, useState } from 'react';

// 애플 디자인 색상 팔레트
const AppleColors = {
  background: '#f5f5f7',
  cardBackground: '#ffffff',
  text: '#1d1d1f',
  secondaryText: '#86868b',
  primary: '#007aff',
  primaryHover: '#0056d3',
  secondary: '#5856d6',
  success: '#34c759',
  warning: '#ff9500',
  destructive: '#ff3b30',
  border: '#d2d2d7',
  inputBackground: '#f2f2f7',
  accent: '#ff6b6b'
};

// 시스템 폰트
const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// 결혼식 정보 타입 정의
interface WeddingInfo {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  weddingLocation: string;
  address?: string;
  greetingMessage: string;
}

// 포토 갤러리 타입 정의
interface Photo {
  id: number;
  url: string;
  alt: string;
}

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 결혼식 정보 가져오기
  const fetchWeddingInfo = async () => {
    try {
      const response = await fetch('/api/wedding-info');
      if (!response.ok) {
        throw new Error('결혼식 정보를 가져올 수 없습니다.');
      }
      const data = await response.json();
      setWeddingInfo(data);
    } catch (err) {
      console.error('결혼식 정보 로딩 실패:', err);
      // API 실패 시 기본값 사용
      setWeddingInfo({
        groomName: '이지환',
        brideName: '이윤진',
        weddingDate: '2025-10-25',
        weddingTime: '18:00',
        weddingLocation: '포포인츠 바이쉐라톤 조선 서울역 19층',
        address: '서울특별시 용산구 한강대로 366',
        greetingMessage: '두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n지환, 윤진 결홉합니다.'
      });
    }
  };

  // API에서 포토 갤러리 가져오기
  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('갤러리 정보를 가져올 수 없습니다.');
      }
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error('갤러리 로딩 실패:', err);
      // API 실패 시 기본값 사용
      setPhotos([
        { id: 1, url: 'https://via.placeholder.com/300x400/ff6b6b/white?text=Wedding+Photo+1', alt: '웨딩 사진 1' },
        { id: 2, url: 'https://via.placeholder.com/300x400/4ecdc4/white?text=Wedding+Photo+2', alt: '웨딩 사진 2' },
        { id: 3, url: 'https://via.placeholder.com/300x400/45b7d1/white?text=Wedding+Photo+3', alt: '웨딩 사진 3' },
        { id: 4, url: 'https://via.placeholder.com/300x400/f9ca24/white?text=Wedding+Photo+4', alt: '웨딩 사진 4' },
        { id: 5, url: 'https://via.placeholder.com/300x400/6c5ce7/white?text=Wedding+Photo+5', alt: '웨딩 사진 5' },
        { id: 6, url: 'https://via.placeholder.com/300x400/a29bfe/white?text=Wedding+Photo+6', alt: '웨딩 사진 6' }
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 병렬로 데이터 로딩
        await Promise.all([
          fetchWeddingInfo(),
          fetchPhotos()
        ]);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
        // 데이터 로딩 완료 후 애니메이션 시작
        setTimeout(() => setIsLoaded(true), 100);
      }
    };

    loadData();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // ISO 날짜 형식이면 한국어로 변환
    if (dateString.includes('-')) {
      const date = new Date(dateString);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    return dateString;
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // HH:MM 형식이면 오전/오후로 변환
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${period} ${displayHour}시${minutes !== '00' ? ` ${minutes}분` : ''}`;
    }
    return timeString;
  };

  // 로딩 상태
  if (loading) {
    return (
      <div style={{
        backgroundColor: AppleColors.background,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: systemFont
      }}>
        <div style={{
          textAlign: 'center',
          color: AppleColors.secondaryText
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>
            💕
          </div>
          <div style={{ fontSize: '18px' }}>
            결혼식 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{
        backgroundColor: AppleColors.background,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: systemFont
      }}>
        <div style={{
          textAlign: 'center',
          color: AppleColors.destructive
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😕</div>
          <div style={{ fontSize: '18px' }}>{error}</div>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!weddingInfo) {
    return (
      <div style={{
        backgroundColor: AppleColors.background,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: systemFont
      }}>
        <div style={{
          textAlign: 'center',
          color: AppleColors.secondaryText
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <div style={{ fontSize: '18px' }}>결혼식 정보가 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: AppleColors.background,
      minHeight: '100vh',
      fontFamily: systemFont
    }}>
      {/* 메인 헤더 섹션 */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #e056fd 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 장식 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '120px',
          opacity: 0.1,
          transform: 'rotate(-15deg)'
        }}>
          💕
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '80px',
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>
          🌸
        </div>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            fontFamily: systemFont,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {weddingInfo.groomName} ♥ {weddingInfo.brideName}
          </h1>
          <div style={{
            fontSize: '24px',
            fontWeight: '500',
            margin: '0 0 8px 0',
            fontFamily: systemFont
          }}>
            {formatDate(weddingInfo.weddingDate)} {formatTime(weddingInfo.weddingTime)}
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '400',
            opacity: 0.9,
            fontFamily: systemFont
          }}>
            {weddingInfo.weddingLocation}
            {weddingInfo.address && (
              <div style={{ fontSize: '16px', marginTop: '4px', opacity: 0.8 }}>
                {weddingInfo.address}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        {/* 인사말 섹션 */}
        <div style={{
          backgroundColor: AppleColors.cardBackground,
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '60px',
          border: `1px solid ${AppleColors.border}`,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s ease 0.3s'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '24px'
          }}>
            💌
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: AppleColors.text,
            margin: '0 0 24px 0',
            fontFamily: systemFont
          }}>
            소중한 분들께
          </h2>
          <div style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: AppleColors.text,
            fontFamily: systemFont,
            whiteSpace: 'pre-line',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {weddingInfo.greetingMessage}
          </div>
        </div>

        {/* 포토 갤러리 섹션 */}
        {photos.length > 0 && (
          <div style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: '20px',
            padding: '40px',
            border: `1px solid ${AppleColors.border}`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s ease 0.5s'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                fontSize: '32px',
                marginBottom: '16px'
              }}>
                📸
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: AppleColors.text,
                margin: '0',
                fontFamily: systemFont
              }}>
                우리의 소중한 순간들
              </h2>
            </div>

            {/* 포토 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                    transitionDelay: `${0.7 + index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      // 이미지 로딩 실패 시 기본 이미지로 대체
                      e.currentTarget.src = `https://via.placeholder.com/300x400/e0e0e0/999999?text=Photo+${index + 1}`;
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 갤러리 하단 메시지 */}
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: AppleColors.inputBackground,
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '16px',
                color: AppleColors.secondaryText,
                fontFamily: systemFont,
                lineHeight: '1.6'
              }}>
                저희의 특별한 순간들을 함께 나누고 싶습니다. 💕<br/>
                더 많은 사진들은 결혼식 당일에 공개됩니다!
              </div>
            </div>
          </div>
        )}

        {/* 하단 푸터 */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '40px 0',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease 1.2s'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            💍
          </div>
          <div style={{
            fontSize: '18px',
            color: AppleColors.secondaryText,
            fontFamily: systemFont,
            lineHeight: '1.6'
          }}>
            {weddingInfo.groomName} & {weddingInfo.brideName}의 결혼을 축복해 주세요<br/>
            <span style={{ fontSize: '14px', marginTop: '8px', display: 'block' }}>
              © 2025 Wedding Invitation. Made with ❤️
            </span>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;