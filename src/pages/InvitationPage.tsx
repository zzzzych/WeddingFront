// 파일 상단의 import 부분에 ShareButton 추가
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvitationByCode } from '../services/invitationService';
import { InvitationResponse, GroupType } from '../types';
import RsvpForm from '../components/RsvpForm';
import VenueInfo from '../components/VenueInfo';
import PhotoGallery from '../components/PhotoGallery';
import ShareButton from '../components/ShareButton';

const InvitationPage: React.FC = () => {
  // URL에서 uniqueCode 파라미터 추출
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  
  // 상태 관리
  const [invitationData, setInvitationData] = useState<InvitationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 참석 응답 성공/실패 메시지 상태
  const [rsvpMessage, setRsvpMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 컴포넌트 마운트 시 청첩장 데이터 로드
  useEffect(() => {
    const loadInvitationData = async () => {
      if (!uniqueCode) {
        setError('유효하지 않은 접근입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // ===== 임시 데이터 (백엔드 연결 전까지 사용) =====
        // 실제 API 호출은 백엔드 연결 후 사용
        // const data = await getInvitationByCode(uniqueCode);
        
        // uniqueCode에 따라 다른 그룹 타입 시뮬레이션
        let groupType: GroupType = GroupType.WEDDING_GUEST;
        let groupName = '신랑 대학 동기';
        let showRsvp = true;
        let showAccount = false;
        let showShare = false;
        
        if (uniqueCode.includes('parent')) {
          groupType = GroupType.PARENTS_GUEST;
          groupName = '부모님';
          showRsvp = false;
          showAccount = true;
          showShare = true;
        } else if (uniqueCode.includes('company')) {
          groupType = GroupType.COMPANY_GUEST;
          groupName = '회사 동료';
          showRsvp = false;
          showAccount = false;
          showShare = false;
        }
        
        const mockData: InvitationResponse = {
          groupInfo: {
            id: '1',
            groupName: groupName,
            groupType: groupType,
            uniqueCode: uniqueCode
          },
          weddingInfo: {
            groomName: '김신랑',
            brideName: '이신부',
            weddingDate: '2025-10-25T17:00:00Z',
            greetingMessage: '저희 두 사람, 새로운 시작을 함께 축복해주세요. 소중한 분들과 함께하는 이 특별한 날, 여러분의 축복과 사랑으로 더욱 빛나는 하루가 되길 바랍니다.',
            venueName: '그랜드 웨딩홀',
            venueAddress: '서울특별시 강남구 테헤란로 123',
            venueDetail: '지하 1층 그랜드홀 (엘리베이터 이용)',
            venuePhone: '02-1234-5678',
            kakaoMapUrl: 'https://map.kakao.com/',
            naverMapUrl: 'https://map.naver.com/',
            googleMapUrl: 'https://maps.google.com/',
            parkingInfo: '웨딩홀 지하 1~3층 무료 주차 가능 (총 150대)\n- 발렛파킹 서비스 제공\n- 주차권은 별도로 받으시기 바랍니다.',
            transportInfo: '지하철 2호선 강남역 3번 출구에서 도보 5분\n버스 정류장: 강남역사거리 (간선 146, 360, 740)\n공항버스 6001번 강남역 하차',
            accountInfo: ['신한은행 110-xxx-xxxxxx (신랑)', '카카오뱅크 3333-xx-xxxxxxx (신부)']
          },
          showRsvpForm: showRsvp,
          showAccountInfo: showAccount,
          showShareButton: showShare,
          showCeremonyProgram: false
        };
        
        setInvitationData(mockData);
        setError(null);
        
      } catch (err) {
        console.error('청첩장 데이터 로드 실패:', err);
        setError('청첩장 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitationData();
  }, [uniqueCode]);

  // 참석 응답 제출 성공 처리
  const handleRsvpSuccess = () => {
    setRsvpMessage({
      type: 'success',
      text: '참석 응답이 성공적으로 제출되었습니다!'
    });
    
    // 3초 후 메시지 제거
    setTimeout(() => {
      setRsvpMessage(null);
    }, 3000);
  };

  // 참석 응답 제출 실패 처리
  const handleRsvpError = (errorMessage: string) => {
    setRsvpMessage({
      type: 'error',
      text: errorMessage
    });
    
    // 5초 후 메시지 제거
    setTimeout(() => {
      setRsvpMessage(null);
    }, 5000);
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        청첩장을 불러오는 중...
      </div>
    );
  }

  // 에러 발생 시 표시
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f'
      }}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!invitationData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        청첩장 정보를 찾을 수 없습니다.
      </div>
    );
  }

  // 메인 청첩장 렌더링
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 전역 메시지 표시 */}
      {rsvpMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: rsvpMessage.type === 'success' ? '#d4edda' : '#f8d7da',
          color: rsvpMessage.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${rsvpMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px',
          padding: '15px 20px',
          maxWidth: '90%',
          textAlign: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {rsvpMessage.text}
        </div>
      )}

      {/* 헤더 영역 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '10px' }}>
          {invitationData.weddingInfo.groomName} ♥ {invitationData.weddingInfo.brideName}
        </h1>
        <p style={{ fontSize: '16px', color: '#7f8c8d' }}>
          {invitationData.groupInfo.groupName}
        </p>
      </div>

      {/* 인사말 영역 */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>💝 인사말</h3>
        <p style={{ lineHeight: '1.6', color: '#495057' }}>
          {invitationData.weddingInfo.greetingMessage}
        </p>
      </div>

      {/* 포토 갤러리 (모든 그룹에서 표시) */}
      <PhotoGallery />

      {/* 결혼식 정보 (WEDDING_GUEST 그룹만) */}
      {invitationData.showRsvpForm && (
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#1565c0' }}>💒 결혼식 정보</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '10px',
            fontSize: '15px'
          }}>
            <div>
              <strong>📅 일시:</strong> {new Date(invitationData.weddingInfo.weddingDate!).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })} {new Date(invitationData.weddingInfo.weddingDate!).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {invitationData.weddingInfo.venueName && (
              <div>
                <strong>🏛️ 장소:</strong> {invitationData.weddingInfo.venueName}
              </div>
            )}
            {invitationData.weddingInfo.venueAddress && (
              <div>
                <strong>📍 주소:</strong> {invitationData.weddingInfo.venueAddress}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 오시는 길 정보 (WEDDING_GUEST 그룹만) */}
      {invitationData.showRsvpForm && (
        <VenueInfo invitationData={invitationData} />
      )}

      {/* 참석 응답 폼 (WEDDING_GUEST 그룹만) */}
      {invitationData.showRsvpForm && uniqueCode && (
        <RsvpForm
          uniqueCode={uniqueCode}
          onSubmitSuccess={handleRsvpSuccess}
          onSubmitError={handleRsvpError}
        />
      )}

      {/* 계좌 정보 (PARENTS_GUEST 그룹만) */}
      {invitationData.showAccountInfo && invitationData.weddingInfo.accountInfo && (
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#0c5460' }}>💝 마음을 전할 곳</h3>
          {invitationData.weddingInfo.accountInfo.map((account, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: index < invitationData.weddingInfo.accountInfo!.length - 1 ? '8px' : 0,
              border: '1px solid #bee5eb'
            }}>
              {account}
            </div>
          ))}
        </div>
      )}

      {/* 공유 버튼 (PARENTS_GUEST 그룹만) */}
      {invitationData.showShareButton && uniqueCode && (
        <div style={{ 
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginBottom: '8px', 
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            📤 청첩장 공유하기
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            소중한 분들에게 우리의 행복한 소식을 전해주세요
          </p>
          
          {/* ShareButton 컴포넌트 사용 */}
            <ShareButton
            uniqueCode={uniqueCode}
            groomName={invitationData.weddingInfo.groomName}
            brideName={invitationData.weddingInfo.brideName}
            weddingDate={invitationData.weddingInfo.weddingDate}
            venueName={invitationData.weddingInfo.venueName}
            />

          {/* 추가 안내 메시지 */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#6c757d',
            lineHeight: '1.4'
          }}>
            💡 <strong>공유 팁:</strong><br />
            • 모바일에서는 설치된 앱으로 바로 공유할 수 있어요<br />
            • 링크 복사를 통해 어디든 자유롭게 공유하세요<br />
            • 각 그룹별로 다른 청첩장이 표시됩니다
          </div>
        </div>
      )}

      {/* 개발 정보 (임시) */}
      <div style={{ 
        marginTop: '40px', 
        padding: '15px', 
        backgroundColor: '#e2e3e5', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>개발 정보:</strong><br />
        그룹 타입: {invitationData.groupInfo.groupType}<br />
        고유 코드: {uniqueCode}<br />
        참석 응답 폼 표시: {invitationData.showRsvpForm ? 'Yes' : 'No'}<br />
        계좌 정보 표시: {invitationData.showAccountInfo ? 'Yes' : 'No'}<br />
        공유 버튼 표시: {invitationData.showShareButton ? 'Yes' : 'No'}<br />
        <strong>완성된 기능:</strong> 인사말, 포토갤러리 (모든 그룹), 오시는 길 정보, 참석 응답 폼, 계좌 정보, 공유 버튼
      </div>
    </div>
  );
};

export default InvitationPage;