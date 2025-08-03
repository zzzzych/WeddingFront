import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getInvitationByCode } from "../services/invitationService";
import { InvitationAPIResponse, InvitationResponse, GroupType } from "../types"; // ✅ InvitationAPIResponse 추가
import RsvpForm from "../components/RsvpForm";
import VenueInfo from "../components/VenueInfo";
import PhotoGallery from "../components/PhotoGallery";
import ShareButton from "../components/ShareButton"; // ✅ 추가

const InvitationPage: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  // ✅ 디버깅 코드 추가
  console.log("🔍 현재 URL:", window.location.pathname);
  console.log("🔍 uniqueCode 파라미터:", uniqueCode);
  console.log("🔍 모든 params:", useParams());

  // ... 나머지 코드

  // ✅ state 타입 수정
  const [invitationData, setInvitationData] =
    useState<InvitationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 참석 응답 성공/실패 메시지 상태
  const [rsvpMessage, setRsvpMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 컴포넌트 마운트 시 청첩장 데이터 로드
  useEffect(() => {
    // ✅ 실제 서버 API 호출로 변경
    const loadInvitationData = async () => {
      try {
        setLoading(true);

        // 실제 서버 API 호출
        const response = await fetch(
          `https://api.leelee.kr/api/invitation/${uniqueCode}`
        );

        if (!response.ok) {
          throw new Error("청첩장 정보를 불러올 수 없습니다.");
        }

        // 서버에서 받은 데이터를 그대로 사용
        const serverData = await response.json();

        // ✅ 실제 백엔드 응답 구조에 맞게 수정
        const transformedData: InvitationResponse = {
          weddingInfo: {
            groomName: serverData.weddingInfo.groomName,
            brideName: serverData.weddingInfo.brideName,
            weddingDate: serverData.weddingInfo.weddingDate,
            weddingLocation:
              serverData.weddingInfo.venueName +
              " " +
              serverData.weddingInfo.venueAddress,
            greetingMessage: serverData.weddingInfo.greetingMessage,
            ceremonyProgram: serverData.weddingInfo.ceremonyProgram,
            accountInfo: serverData.weddingInfo.accountInfo,
            venueName: serverData.weddingInfo.venueName,
            venueAddress: serverData.weddingInfo.venueAddress,
            venueDetail: serverData.weddingInfo.venueDetail,
            kakaoMapUrl: serverData.weddingInfo.kakaoMapUrl,
            naverMapUrl: serverData.weddingInfo.naverMapUrl,
            parkingInfo: serverData.weddingInfo.parkingInfo,
            transportInfo: serverData.weddingInfo.transportInfo,
          },
          groupInfo: {
            groupName: serverData.groupInfo.groupName,
            groupType: serverData.groupInfo.groupType,
            greetingMessage: serverData.groupInfo.greetingMessage,
          },
          showRsvpForm: serverData.availableFeatures.showRsvpForm,
          showAccountInfo: serverData.availableFeatures.showAccountInfo,
          showShareButton: serverData.availableFeatures.showShareButton,
          showCeremonyProgram: serverData.availableFeatures.showCeremonyProgram,
        };

        setInvitationData(transformedData);
        setError(null);
      } catch (err) {
        console.error("청첩장 데이터 로드 실패:", err);
        setError("청첩장 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadInvitationData();
  }, [uniqueCode]);

  // 참석 응답 제출 성공 처리
  const handleRsvpSuccess = () => {
    setRsvpMessage({
      type: "success",
      text: "참석 응답이 성공적으로 제출되었습니다!",
    });

    // 3초 후 메시지 제거
    setTimeout(() => {
      setRsvpMessage(null);
    }, 3000);
  };

  // 참석 응답 제출 실패 처리
  const handleRsvpError = (errorMessage: string) => {
    setRsvpMessage({
      type: "error",
      text: errorMessage,
    });

    // 5초 후 메시지 제거
    setTimeout(() => {
      setRsvpMessage(null);
    }, 5000);
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        청첩장을 불러오는 중...
      </div>
    );
  }

  // 에러 발생 시 표시
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#d32f2f",
        }}
      >
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!invitationData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        청첩장 정보를 찾을 수 없습니다.
      </div>
    );
  }

  // 메인 청첩장 렌더링
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 전역 메시지 표시 */}
      {rsvpMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor:
              rsvpMessage.type === "success" ? "#d4edda" : "#f8d7da",
            color: rsvpMessage.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${
              rsvpMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
            borderRadius: "6px",
            padding: "15px 20px",
            maxWidth: "90%",
            textAlign: "center",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {rsvpMessage.text}
        </div>
      )}

      {/* 헤더 영역 */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{ fontSize: "28px", color: "#2c3e50", marginBottom: "10px" }}
        >
          {invitationData.weddingInfo.groomName} ♥{" "}
          {invitationData.weddingInfo.brideName}
        </h1>
        <p style={{ fontSize: "16px", color: "#7f8c8d" }}>
          {invitationData.groupInfo.groupName}
        </p>
      </div>

      {/* 인사말 영역 */}
      {/* 인사말 영역 - 그룹별 개별 인사말 표시 */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "15px", color: "#2c3e50" }}>💝 인사말</h3>
        <p style={{ lineHeight: "1.6", color: "#495057" }}>
          {/* ✅ 변경: weddingInfo.greetingMessage → groupInfo.greetingMessage */}
          {invitationData.groupInfo.greetingMessage}
        </p>

        {/* 그룹별 인사말임을 알려주는 작은 힌트 (개발 단계에서만) */}
        <div
          style={{
            fontSize: "11px",
            color: "#6c757d",
            marginTop: "10px",
            fontStyle: "italic",
          }}
        >
          📝 {invitationData.groupInfo.groupName} 전용 인사말
        </div>
      </div>

      {/* 포토 갤러리 (모든 그룹에서 표시) */}
      <PhotoGallery />

      {/* 결혼식 정보 (WEDDING_GUEST 그룹만) */}
      {invitationData.showRsvpForm && (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #bbdefb",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#1565c0" }}>
            💒 결혼식 정보
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "10px",
              fontSize: "15px",
            }}
          >
            <div>
              <strong>📅 일시:</strong>{" "}
              {new Date(
                invitationData.weddingInfo.weddingDate!
              ).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}{" "}
              {new Date(
                invitationData.weddingInfo.weddingDate!
              ).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {invitationData.weddingInfo.venueName && (
              <div>
                <strong>🏛️ 장소:</strong> {invitationData.weddingInfo.venueName}
              </div>
            )}
            {invitationData.weddingInfo.venueAddress && (
              <div>
                <strong>📍 주소:</strong>{" "}
                {invitationData.weddingInfo.venueAddress}
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
      {invitationData.showAccountInfo &&
        invitationData.weddingInfo.accountInfo && (
          <div
            style={{
              backgroundColor: "#d1ecf1",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#0c5460" }}>
              💝 마음을 전할 곳
            </h3>
            {invitationData.weddingInfo.accountInfo.map((account, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom:
                    index < invitationData.weddingInfo.accountInfo!.length - 1
                      ? "8px"
                      : 0,
                  border: "1px solid #bee5eb",
                }}
              >
                {account}
              </div>
            ))}
          </div>
        )}

      {/* 공유 버튼 (PARENTS_GUEST 그룹만) */}
      {invitationData.showShareButton && uniqueCode && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "12px",
            padding: "25px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              marginBottom: "8px",
              color: "#856404",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            📤 청첩장 공유하기
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#6c757d",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}
          >
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
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#6c757d",
              lineHeight: "1.4",
            }}
          >
            💡 <strong>공유 팁:</strong>
            <br />
            • 모바일에서는 설치된 앱으로 바로 공유할 수 있어요
            <br />
            • 링크 복사를 통해 어디든 자유롭게 공유하세요
            <br />• 각 그룹별로 다른 청첩장이 표시됩니다
          </div>
        </div>
      )}

      {/* 개발 정보 (임시) */}
      <div
        style={{
          marginTop: "40px",
          padding: "15px",
          backgroundColor: "#e2e3e5",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <strong>개발 정보:</strong>
        <br />
        그룹 타입: {invitationData.groupInfo.groupType}
        <br />
        고유 코드: {uniqueCode}
        <br />
        참석 응답 폼 표시: {invitationData.showRsvpForm ? "Yes" : "No"}
        <br />
        계좌 정보 표시: {invitationData.showAccountInfo ? "Yes" : "No"}
        <br />
        공유 버튼 표시: {invitationData.showShareButton ? "Yes" : "No"}
        <br />
        <strong>완성된 기능:</strong> 인사말, 포토갤러리 (모든 그룹), 오시는 길
        정보, 참석 응답 폼, 계좌 정보, 공유 버튼
      </div>
    </div>
  );
};

export default InvitationPage;
