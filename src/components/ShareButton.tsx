// 청첩장 공유 버튼 컴포넌트
import React, { useState } from 'react';

// Props 타입 정의 - optional 타입들을 허용하도록 수정
interface ShareButtonProps {
  uniqueCode: string;           // 고유 코드 (필수)
  groomName?: string;          // 신랑 이름 (선택적)
  brideName?: string;          // 신부 이름 (선택적)
  weddingDate?: string;        // 결혼식 날짜 (선택적)
  venueName?: string;          // 웨딩홀 이름 (선택적)
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  uniqueCode, 
  groomName = '신랑',         // 기본값 제공
  brideName = '신부',         // 기본값 제공
  weddingDate = '',           // 기본값 제공
  venueName 
}) => {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  // 공유할 URL과 메시지 생성
const shareUrl = `${window.location.origin}/invitation/${uniqueCode}`;

// 날짜 포맷팅 - weddingDate가 없을 경우 대비
const weddingDateFormatted = weddingDate 
  ? new Date(weddingDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  : '날짜 미정';

const shareTitle = `${groomName} ♥ ${brideName} 결혼식 청첩장`;
const shareText = `💕 ${groomName}과 ${brideName}의 결혼식에 초대합니다\n\n📅 ${weddingDateFormatted}${venueName ? `\n🏛️ ${venueName}` : ''}\n\n소중한 분의 축복을 기다립니다 💒`;

  // 웹 공유 API 지원 여부 확인
  const canUseWebShareAPI = (): boolean => {
    return 'share' in navigator && navigator.share !== undefined;
  };

  // 웹 공유 API 사용
  const handleWebShare = async () => {
    if (!canUseWebShareAPI()) {
      handleFallbackShare();
      return;
    }

    try {
      setIsSharing(true);
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
    } catch (error: any) {
      console.log('공유 취소됨 또는 실패:', error);
      // 사용자가 취소한 경우는 에러로 처리하지 않음
      if (error.name !== 'AbortError') {
        handleFallbackShare();
      }
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  };

  // 폴백 공유 메뉴 표시
  const handleFallbackShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  // URL 복사
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('청첩장 링크가 복사되었습니다!');
    } catch (err) {
      // 폴백: 텍스트 선택 방식
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('청첩장 링크가 복사되었습니다!');
    }
    setShowShareMenu(false);
  };

  // 카카오톡 공유 (웹 링크)
  const shareToKakaoTalk = () => {
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_APP_KEY&validation_action=default&validation_params={}`;
    
    // 실제 구현에서는 카카오 SDK 초기화 필요
    // 현재는 간단한 폴백으로 URL 복사
    copyToClipboard();
  };

  // 문자 메시지 공유
  const shareToSMS = () => {
    const smsText = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const smsUrl = `sms:?body=${smsText}`;
    
    try {
      window.open(smsUrl);
    } catch (error) {
      console.error('SMS 공유 실패:', error);
      copyToClipboard();
    }
    setShowShareMenu(false);
  };

  // 이메일 공유
  const shareToEmail = () => {
    const emailSubject = encodeURIComponent(shareTitle);
    const emailBody = encodeURIComponent(`${shareText}\n\n청첩장 보기: ${shareUrl}`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    
    try {
      window.open(emailUrl);
    } catch (error) {
      console.error('이메일 공유 실패:', error);
      copyToClipboard();
    }
    setShowShareMenu(false);
  };

  // 메인 공유 버튼 클릭 처리
  const handleMainShare = () => {
    if (canUseWebShareAPI()) {
      handleWebShare();
    } else {
      handleFallbackShare();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 메인 공유 버튼 */}
      <button
        onClick={handleMainShare}
        disabled={isSharing}
        style={{
          backgroundColor: isSharing ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isSharing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
        }}
        onMouseOver={(e) => {
          if (!isSharing) {
            e.currentTarget.style.backgroundColor = '#0056b3';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!isSharing) {
            e.currentTarget.style.backgroundColor = '#007bff';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isSharing && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #ffffff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        📤 {isSharing ? '공유 중...' : '청첩장 공유하기'}
      </button>

      {/* 공유 메뉴 */}
      {showShareMenu && (
        <>
          {/* 배경 오버레이 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999
            }}
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* 공유 옵션 메뉴 */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e9ecef',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {/* 메뉴 헤더 */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e9ecef',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              공유 방법 선택
            </div>

            {/* 공유 옵션들 */}
            <div style={{ padding: '8px 0' }}>
              {/* 링크 복사 */}
              <button
                onClick={copyToClipboard}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>🔗</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>링크 복사</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>클립보드에 복사</div>
                </div>
              </button>

              {/* 카카오톡 공유 */}
              <button
                onClick={shareToKakaoTalk}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff3e0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>💬</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>카카오톡</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>친구들에게 전송</div>
                </div>
              </button>

              {/* 문자 메시지 공유 */}
              <button
                onClick={shareToSMS}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>📱</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>문자 메시지</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>SMS로 전송</div>
                </div>
              </button>

              {/* 이메일 공유 */}
              <button
                onClick={shareToEmail}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>📧</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>이메일</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>이메일로 전송</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ShareButton;