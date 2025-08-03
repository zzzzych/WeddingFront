import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getInvitationByCode } from "../services/invitationService";
import { InvitationAPIResponse, InvitationResponse, GroupType } from "../types";
import RsvpForm from "../components/RsvpForm";
import VenueInfo from "../components/VenueInfo";
import ShareButton from "../components/ShareButton";

// Apple 디자인 시스템 색상 팔레트 (HomePage.tsx와 동일)
const AppleColors = {
  primary: "#007AFF",
  primaryDark: "#0051D5",
  background: "#FBFBFD",
  cardBackground: "#FFFFFF",
  text: "#1D1D1F",
  secondaryText: "#86868B",
  border: "#E5E5E7",
  accent: "#30D158",
  gradient: {
    start: "#007AFF",
    middle: "#5856D6",
    end: "#AF52DE",
  },
};

// 시스템 폰트 정의 (HomePage.tsx와 동일)
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';

// 🆕 날짜/시간 포맷팅 유틸리티 함수 추가
const formatWeddingDateTime = (dateTimeString: string) => {
  try {
    const weddingDate = new Date(dateTimeString);
    
    // 유효한 날짜인지 확인
    if (isNaN(weddingDate.getTime())) {
      throw new Error("Invalid date");
    }
    
    // 시간 정보 추출
    const timeStr = weddingDate.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    
    // 날짜 정보 추출
    const dateStr = weddingDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    // 에러 시 기본값 반환
    console.warn("날짜 파싱 실패:", dateTimeString, error);
    return "2025년 10월 25일 토요일 오후 6시";
  }
};

// 사진 데이터 타입 정의 (HomePage.tsx와 동일)
interface Photo {
  id: string;
  url: string;
  alt: string;
}

const InvitationPage: React.FC = () => {
  const { uniqueCode } = useParams<{ uniqueCode: string }>();
  
  // 상태 관리
  const [invitationData, setInvitationData] = useState<InvitationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // 애니메이션용 상태 추가
  
  // 🆕 HomePage.tsx와 동일한 이미지 관련 상태들 추가
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // 참석 응답 성공/실패 메시지 상태
  const [rsvpMessage, setRsvpMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 🆕 모바일 감지 useEffect 추가 (HomePage.tsx와 동일)
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
    };

    // 초기 체크
    checkMobile();

    // 윈도우 리사이즈 이벤트 리스너
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 컴포넌트 마운트 시 청첩장 데이터 로드
  useEffect(() => {
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
        
        // 🆕 디버깅용: 서버 응답 데이터 구조 확인
        console.log("🔍 서버 응답 데이터:", serverData);
        console.log("🔍 결혼식 날짜:", serverData.weddingDate || serverData.weddingInfo?.weddingDate);

        // 🆕 실제 백엔드 응답 구조에 맞게 데이터 변환 (수정된 구조)
        const transformedData: InvitationResponse = {
          weddingInfo: {
            groomName: serverData.groomName || serverData.weddingInfo?.groomName || "지환",
            brideName: serverData.brideName || serverData.weddingInfo?.brideName || "윤진",
            weddingDate: serverData.weddingDate || serverData.weddingInfo?.weddingDate || "2025-10-25T18:00:00",
            weddingLocation: serverData.weddingLocation || serverData.weddingInfo?.weddingLocation || "포포인츠 바이쉐라톤 조선 서울역 19층",
            greetingMessage: serverData.greetingMessage || serverData.weddingInfo?.greetingMessage || "두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n\n지환, 윤진 결혼합니다.",
            ceremonyProgram: serverData.ceremonyProgram || serverData.weddingInfo?.ceremonyProgram || "오후 6시 예식 시작\n오후 7시 축가 및 답사\n오후 7시 30분 식사",
            accountInfo: serverData.accountInfo || serverData.weddingInfo?.accountInfo || [
              "농협 121065-56-105215 (고인옥 / 신랑母)",
            ],
            venueName: serverData.venueName || serverData.weddingInfo?.venueName || "포포인츠 바이쉐라톤 조선 서울역 19층",
            venueAddress: serverData.venueAddress || serverData.weddingInfo?.venueAddress || "서울특별시 용산구 한강대로 366",
            kakaoMapUrl: serverData.kakaoMapUrl || serverData.weddingInfo?.kakaoMapUrl,
            naverMapUrl: serverData.naverMapUrl || serverData.weddingInfo?.naverMapUrl,
            parkingInfo: serverData.parkingInfo || serverData.weddingInfo?.parkingInfo || "포포인츠 바이 쉐라톤 조선 서울역 주차장 지하 2-4층 이용",
            transportInfo: serverData.transportInfo || serverData.weddingInfo?.transportInfo || "서울역 10번 출구쪽 지하 연결 통로 이용 도보 4분, 서울역 12번 출구 도보 2분",
          },
          groupInfo: {
            groupName: serverData.groupName || serverData.groupInfo?.groupName || "소중한 분들",
            groupType: serverData.groupType || serverData.groupInfo?.groupType || GroupType.WEDDING_GUEST,
            greetingMessage: serverData.greetingMessage || serverData.groupInfo?.greetingMessage || "저희의 소중한 날에 함께해주셔서 감사합니다.",
          },
          showRsvpForm: serverData.showRsvpForm ?? serverData.availableFeatures?.showRsvpForm ?? true,
          showAccountInfo: serverData.showAccountInfo ?? serverData.availableFeatures?.showAccountInfo ?? false,
          showShareButton: serverData.showShareButton ?? serverData.availableFeatures?.showShareButton ?? false,
          showCeremonyProgram: serverData.showCeremonyProgram ?? serverData.availableFeatures?.showCeremonyProgram ?? true,
        };

        setInvitationData(transformedData);
        setError(null);

        // 🆕 실제 이미지 데이터도 서버에서 가져오도록 개선
        // 향후 서버에 이미지 목록 API가 추가되면 여기서 호출
        // 현재는 기본 이미지들 사용
        const photoList = [];
        for (let i = 1; i <= 8; i++) {
          photoList.push({
            id: `wedding-${i}`,
            url: `/images/wedding-${i}.jpeg`,
            alt: `웨딩 사진 ${i}`,
          });
        }
        setPhotos(photoList);

      } catch (err) {
        console.error("청첩장 데이터 로드 실패:", err);
        setError("청첩장 정보를 불러올 수 없습니다.");
        
        // 🆕 에러 시 기본값으로 fallback (더 안전한 처리)
        setInvitationData({
          weddingInfo: {
            groomName: "지환",
            brideName: "윤진",
            weddingDate: "2025-10-25T18:00:00",
            weddingLocation: "포포인츠 바이쉐라톤 조선 서울역 19층",
            greetingMessage: "두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n\n지환, 윤진 결혼합니다.",
            ceremonyProgram: "오후 6시 예식 시작\n오후 7시 축가 및 답사\n오후 7시 30분 식사",
            accountInfo: ["농협 121065-56-105215 (고인옥 / 신랑母)"],
            venueName: "포포인츠 바이쉐라톤 조선 서울역 19층",
            venueAddress: "서울특별시 용산구 한강대로 366",
            parkingInfo: "포포인츠 바이 쉐라톤 조선 서울역 주차장 지하 2-4층 이용",
            transportInfo: "서울역 10번 출구쪽 지하 연결 통로 이용 도보 4분, 서울역 12번 출구 도보 2분",
          },
          groupInfo: {
            groupName: "소중한 분들",
            groupType: GroupType.WEDDING_GUEST,
            greetingMessage: "저희의 소중한 날에 함께해주셔서 감사합니다.",
          },
          showRsvpForm: true,
          showAccountInfo: false,
          showShareButton: false,
          showCeremonyProgram: true,
        });
        
        // 기본 이미지들 로드
        const photoList = [];
        for (let i = 1; i <= 8; i++) {
          photoList.push({
            id: `wedding-${i}`,
            url: `/images/wedding-${i}.jpeg`,
            alt: `웨딩 사진 ${i}`,
          });
        }
        setPhotos(photoList);
      } finally {
        setLoading(false);
      }
    };

    loadInvitationData();
  }, [uniqueCode]);

  // 애니메이션 로드 효과
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 🆕 HomePage.tsx와 동일한 이미지 모달 기능들 추가
  // 이미지 클릭 시 모달 열기
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    // 배경 스크롤 방지
    document.body.style.overflow = "hidden";
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
    // 배경 스크롤 복원
    document.body.style.overflow = "unset";
  };

  // 이전 이미지로 이동
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  // 다음 이미지로 이동
  const goToNext = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 모바일용 이전/다음 함수
  const goToPreviousMobile = () => {
    setMobileCurrentIndex((prevIndex: number) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNextMobile = () => {
    setMobileCurrentIndex((prevIndex: number) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 🆕 키보드 이벤트 처리 (HomePage.tsx와 동일)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        switch (event.key) {
          case "Escape":
            closeModal();
            break;
          case "ArrowLeft":
            goToPrevious();
            break;
          case "ArrowRight":
            goToNext();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, photos.length]);

  // 참석 응답 제출 성공 처리
  const handleRsvpSuccess = () => {
    setRsvpMessage({
      type: "success",
      text: "참석 응답이 성공적으로 제출되었습니다!",
    });

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

    setTimeout(() => {
      setRsvpMessage(null);
    }, 5000);
  };

  // 로딩 중 표시 (Apple 스타일)
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: AppleColors.background,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: systemFont,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: AppleColors.text,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            💌
          </div>
          <div style={{ fontSize: "18px", fontWeight: "500" }}>
            청첩장을 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생 시 표시 (Apple 스타일)
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: AppleColors.background,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: systemFont,
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            padding: "40px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>😔</div>
          <h2
            style={{
              fontSize: "24px",
              color: AppleColors.text,
              marginBottom: "12px",
              fontFamily: systemFont,
            }}
          >
            오류가 발생했습니다
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: AppleColors.secondaryText,
              lineHeight: "1.5",
              margin: "0",
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 (Apple 스타일)
  if (!invitationData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: AppleColors.background,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: systemFont,
        }}
      >
        <div style={{ textAlign: "center", color: AppleColors.text }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
          <div style={{ fontSize: "18px" }}>청첩장 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  // 메인 청첩장 렌더링 (Apple 스타일)
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: AppleColors.background,
        fontFamily: systemFont,
      }}
    >
      {/* 전역 성공/실패 메시지 표시 */}
      {rsvpMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor:
              rsvpMessage.type === "success"
                ? AppleColors.accent
                : "#FF3B30",
            color: "white",
            borderRadius: "12px",
            padding: "16px 24px",
            maxWidth: "90%",
            textAlign: "center",
            zIndex: 1000,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
            fontFamily: systemFont,
            fontWeight: "500",
          }}
        >
          {rsvpMessage.text}
        </div>
      )}

      {/* 헤더 섹션 (HomePage와 동일한 그라데이션 스타일) */}
      <div
        style={{
          background: `linear-gradient(135deg, ${AppleColors.gradient.start} 0%, ${AppleColors.gradient.middle} 50%, ${AppleColors.gradient.end} 100%)`,
          color: "white",
          textAlign: "center",
          padding: "80px 20px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              margin: "0",
              fontFamily: systemFont,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {invitationData.weddingInfo.groomName} ♥{" "}
            {invitationData.weddingInfo.brideName}
          </h1>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "300",
              marginTop: "16px",
              opacity: 0.9,
              fontFamily: systemFont,
            }}
          >
            Wedding Invitation
          </div>

          {/* 그룹 이름 표시 */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: "400",
              marginTop: "12px",
              opacity: 0.85,
              fontFamily: systemFont,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "8px 16px",
              borderRadius: "20px",
              display: "inline-block",
            }}
          >
            {invitationData.groupInfo.groupName}
          </div>

          {/* 결혼식 일자 표시 - 🆕 서버 데이터 기반으로 동적 생성 (개선된 버전) */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: "400",
              marginTop: "20px",
              opacity: 0.95,
              fontFamily: systemFont,
              letterSpacing: "0.5px",
            }}
          >
            {formatWeddingDateTime(invitationData.weddingInfo.weddingDate)}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        {/* 인사말 섹션 (Apple 카드 스타일) */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "60px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.3s",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            💌
          </div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 24px 0",
              fontFamily: systemFont,
            }}
          >소중한 분들께</h2>
          <div
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: AppleColors.text,
              fontFamily: systemFont,
              whiteSpace: "pre-line",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {invitationData.groupInfo.greetingMessage}
          </div>
        </div>

        {/* 포토 갤러리 (모든 그룹에서 표시) - HomePage.tsx와 동일한 기능 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "60px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.6s",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 32px 0",
              textAlign: "center",
              fontFamily: systemFont,
            }}
          >
            📸 우리의 이야기
          </h2>

          {/* 조건부 렌더링: 모바일이면 슬라이드, 데스크톱이면 그리드 */}
          {photos.length > 0 ? (
            isMobile ? (
              // 🔥 모바일: 슬라이드 레이아웃
              <div>
                {/* 슬라이드 컨테이너 */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "350px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {/* 메인 이미지 */}
                  <img
                    src={photos[mobileCurrentIndex]?.url}
                    alt={photos[mobileCurrentIndex]?.alt}
                    onClick={() => openModal(mobileCurrentIndex)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                      transition: "opacity 0.3s ease",
                    }}
                  />

                  {/* 이전 버튼 */}
                  {photos.length > 1 && (
                    <button
                      onClick={goToPreviousMobile}
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        fontSize: "18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        transition: "background 0.2s ease",
                      }}
                    >
                      ‹
                    </button>
                  )}

                  {/* 다음 버튼 */}
                  {photos.length > 1 && (
                    <button
                      onClick={goToNextMobile}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        fontSize: "18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        transition: "background 0.2s ease",
                      }}
                    >
                      ›
                    </button>
                  )}

                  {/* 인디케이터 */}
                  {photos.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "15px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "8px",
                        zIndex: 10,
                      }}
                    >
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setMobileCurrentIndex(index)}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor:
                              index === mobileCurrentIndex
                                ? "white"
                                : "rgba(255, 255, 255, 0.5)",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* 이미지 카운터 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      background: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontFamily: systemFont,
                      zIndex: 10,
                    }}
                  >
                    {mobileCurrentIndex + 1} / {photos.length}
                  </div>
                </div>

                {/* 썸네일 네비게이션 (모바일용) */}
                {photos.length > 1 && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingBottom: "8px",
                    }}
                  >
                    {/* 썸네일 컨테이너 */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        overflowX: "auto",
                        paddingBottom: "8px",
                        scrollbarWidth: "thin",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          onClick={() => setMobileCurrentIndex(index)}
                          style={{
                            minWidth: "70px",
                            width: "70px",
                            height: "70px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            cursor: "pointer",
                            border:
                              index === mobileCurrentIndex
                                ? `3px solid ${AppleColors.primary}`
                                : "3px solid transparent",
                            transition: "all 0.3s ease",
                            flexShrink: 0,
                            boxShadow:
                              index === mobileCurrentIndex
                                ? "0 4px 12px rgba(0, 123, 255, 0.3)"
                                : "none",
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 🔥 데스크톱: 그리드 레이아웃
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                  marginTop: "32px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => openModal(index)}
                    style={{
                      position: "relative",
                      height: "300px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      backgroundColor: "#f8f9fa",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            // 🔥 이미지가 없을 때 표시
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: AppleColors.secondaryText,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(50px)",
                transition: "all 1s ease 0.6s",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "24px",
                  opacity: 0.3,
                }}
              >
                📸
              </div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: AppleColors.secondaryText,
                  margin: "0 0 16px 0",
                  fontFamily: systemFont,
                }}
              >
                포토 갤러리 준비 중
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  color: AppleColors.secondaryText,
                  margin: 0,
                  fontFamily: systemFont,
                }}
              >
                소중한 순간들을 곧 만나보실 수 있습니다
              </p>
            </div>
          )}
        </div>

        {/* 오시는 길 정보 (모든 그룹) */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "60px",
            border: `1px solid ${AppleColors.border}`,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.9s",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 32px 0",
              textAlign: "center",
              fontFamily: systemFont,
            }}
          >
            🗺️ 오시는 길
          </h2>
          <VenueInfo invitationData={invitationData} />
        </div>

        {/* 참석 응답 폼 (WEDDING_GUEST 그룹만) */}
        {invitationData.showRsvpForm && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "60px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease 1.2s",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0 0 32px 0",
                textAlign: "center",
                fontFamily: systemFont,
              }}
            >
              💒 참석 여부
            </h2>
            <RsvpForm
              uniqueCode={uniqueCode!}
              onSubmitSuccess={handleRsvpSuccess}
              onSubmitError={handleRsvpError}
            />
          </div>
        )}

        {/* 본식 순서 (showCeremonyProgram이 true인 그룹만) */}
        {invitationData.showCeremonyProgram && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "60px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease 1.5s",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0 0 32px 0",
                textAlign: "center",
                fontFamily: systemFont,
              }}
            >
              📋 본식 순서
            </h2>
            <div
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: AppleColors.text,
                fontFamily: systemFont,
                whiteSpace: "pre-line",
                textAlign: "center",
              }}
            >
              {invitationData.weddingInfo.ceremonyProgram}
            </div>
          </div>
        )}

        {/* 계좌 정보 (showAccountInfo가 true인 그룹만) */}
        {invitationData.showAccountInfo && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "60px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease 1.8s",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0 0 32px 0",
                textAlign: "center",
                fontFamily: systemFont,
              }}
            >
              💳 마음 전하실 곳
            </h2>
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {invitationData.weddingInfo.accountInfo.map((account, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: AppleColors.background,
                    padding: "20px",
                    borderRadius: "12px",
                    border: `1px solid ${AppleColors.border}`,
                    fontSize: "16px",
                    fontFamily: systemFont,
                    textAlign: "center",
                    color: AppleColors.text,
                  }}
                >
                  {account}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 공유 버튼 (showShareButton이 true인 그룹만) */}
        {invitationData.showShareButton && uniqueCode && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "60px",
              border: `1px solid ${AppleColors.border}`,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              textAlign: "center",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease 2.1s",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: AppleColors.text,
                margin: "0 0 16px 0",
                fontFamily: systemFont,
              }}
            >
              📤 청첩장 공유하기
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: AppleColors.secondaryText,
                marginBottom: "32px",
                lineHeight: "1.5",
                fontFamily: systemFont,
              }}
            >
              소중한 분들에게 우리의 행복한 소식을 전해주세요
            </p>

            <ShareButton
              uniqueCode={uniqueCode}
              groomName={invitationData.weddingInfo.groomName}
              brideName={invitationData.weddingInfo.brideName}
              weddingDate={invitationData.weddingInfo.weddingDate}
              venueName={invitationData.weddingInfo.venueName || "포포인츠 바이쉐라톤 조선 서울역 19층"}
            />

            <div
              style={{
                marginTop: "24px",
                padding: "20px",
                backgroundColor: AppleColors.background,
                borderRadius: "12px",
                fontSize: "14px",
                color: AppleColors.secondaryText,
                lineHeight: "1.5",
                fontFamily: systemFont,
              }}
            >
              💡 <strong>공유 팁:</strong>
              <br />
              모바일에서는 설치된 앱으로 바로 공유할 수 있고,
              <br />
              링크 복사를 통해 어디든 자유롭게 공유하세요.
            </div>
          </div>
        )}
      </div>

      {/* 🆕 이미지 모달 (HomePage.tsx와 동일) */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeModal} // 배경 클릭 시 닫기
        >
          {/* 모달 컨텐츠 */}
          <div
            style={{
              position: "relative",
              width: "95vw",
              height: "95vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
          >
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(0, 0, 0, 0.6)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 1001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
            >
              ×
            </button>

            {/* 이전 버튼 */}
            {photos.length > 1 && (
              <button
                onClick={goToPrevious}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  fontSize: "30px",
                  cursor: "pointer",
                  zIndex: 1001,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s ease",
                }}
                className="modal-button"
              >
                ‹
              </button>
            )}

            {/* 다음 버튼 */}
            {photos.length > 1 && (
              <button
                onClick={goToNext}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  fontSize: "30px",
                  cursor: "pointer",
                  zIndex: 1001,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s ease",
                }}
                className="modal-button"
              >
                ›
              </button>
            )}

            {/* 메인 이미지 */}
            <img
              src={photos[currentImageIndex]?.url}
              alt={photos[currentImageIndex]?.alt}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              }}
            />

            {/* 이미지 정보 */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.6)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "16px",
                fontSize: "14px",
                fontFamily: systemFont,
              }}
            >
              {currentImageIndex + 1} / {photos.length}
            </div>

            {/* 썸네일 네비게이션 (데스크톱용) */}
            {photos.length > 1 && !isMobile && (
              <div
                style={{
                  position: "absolute",
                  bottom: "60px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                  maxWidth: "80%",
                  overflowX: "auto",
                  padding: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "12px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      minWidth: "60px",
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        index === currentImageIndex
                          ? "3px solid white"
                          : "3px solid transparent",
                      transition: "border 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS 애니메이션 (HomePage.tsx와 동일) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* 모바일에서 모달 버튼 크기 조정 */
        @media (max-width: 768px) {
          .modal-button {
            width: 45px !important;
            height: 45px !important;
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvitationPage;