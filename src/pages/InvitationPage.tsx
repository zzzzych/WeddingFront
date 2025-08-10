import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getInvitationByCode } from "../services/invitationService";
import { InvitationAPIResponse, InvitationResponse, GroupType } from "../types";
import RsvpForm from "../components/RsvpForm";
import VenueInfo from "../components/VenueInfo";
import ShareButton from '../components/ShareButton';

// Apple 디자인 시스템 색상 팔레트 (HomePage.tsx와 동일)
const AppleColors = {
  primary: "#007AFF",
  primaryDark: "#0051D5",
  background: "#fff",
  cardBackground: "#FFFFFF",
  text: "#1D1D1F",
  secondaryText: "#86868B",
  border: "#fff",
  accent: "#30D158",
  gradient: {
    start: "#007AFF",
    middle: "#5856D6",
    end: "#AF52DE",
  },
};

// 반응형 이미지 스타일 정의
const getWeddingImageStyle = (isMobile: boolean) => ({
  width: isMobile ? "100%" : "40%", // 모바일: 100%, PC: 40%
  height: "auto", // 비율 유지
  display: "block", // 블록 요소로 설정
  margin: "0 auto", // 중앙 정렬
});

// 반응형 폰트 사이즈 함수 (PC: px, 모바일: vw)
const getResponsiveFontSize = (pcPx: number, mobileVw: number, isMobile: boolean) => {
  return isMobile ? `${mobileVw}vw` : `${pcPx}px`;
};

// 시스템 폰트 정의 (HomePage.tsx와 동일)
const systemFont = "SeoulNamsanM";

// 🆕 날짜/시간 포맷팅 유틸리티 함수 (디버깅 버전)
const formatWeddingDateTime = (dateTimeString: string) => {
  // 🔍 디버깅: 받은 데이터 확인
  console.log("🔍 받은 날짜 데이터:", dateTimeString);
  console.log("🔍 데이터 타입:", typeof dateTimeString);

  try {
    const weddingDate = new Date(dateTimeString);

    // 🔍 디버깅: 파싱된 날짜 확인
    console.log("🔍 파싱된 날짜:", weddingDate);
    console.log("🔍 날짜 유효성:", !isNaN(weddingDate.getTime()));

    // 유효한 날짜인지 확인
    if (isNaN(weddingDate.getTime())) {
      console.error("❌ 잘못된 날짜 형식:", dateTimeString);
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

    const result = `${dateStr} ${timeStr}`;
    console.log("✅ 최종 포맷된 결과:", result);
    return result;
  } catch (error) {
    // 에러 시 기본값 반환
    console.warn("❌ 날짜 파싱 실패:", dateTimeString, error);
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
  const [invitationData, setInvitationData] =
    useState<InvitationResponse | null>(null);
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
  // InvitationPage.tsx에서 기존 useEffect 부분을 다음 코드로 교체

  useEffect(() => {
    // 2. useEffect 내의 loadInvitationData 함수를 다음 코드로 완전히 교체:

    const loadInvitationData = async () => {
      if (!uniqueCode) {
        console.error("고유 코드가 없습니다.");
        setError("잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 🆕 invitationService의 타입 안전한 API 함수 사용
        console.log(`📋 청첩장 데이터 로딩 시작: ${uniqueCode}`);
        const serverData = await getInvitationByCode(uniqueCode);

        console.log("✅ 서버에서 받은 데이터:", serverData);

        // InvitationPage.tsx의 loadInvitationData 함수 내에서
        // "console.log("✅ 서버에서 받은 데이터:", serverData);" 다음에 추가:

        // 🔍 상세 디버깅: wedding_infos 테이블 데이터 확인

        // InvitationPage.tsx의 loadInvitationData 함수 내에서
        // "console.log("✅ 서버에서 받은 데이터:", serverData);" 바로 다음에 추가:

        // 🔍 서버 응답 원본 구조 상세 분석
        console.group("🔍 서버 응답 원본 분석");
        console.log("📦 전체 응답 객체:", JSON.stringify(serverData, null, 2));
        console.log("🔑 응답 객체의 모든 키:", Object.keys(serverData));
        console.log("📊 각 필드별 값과 타입:");
        Object.entries(serverData).forEach(([key, value]) => {
          console.log(`  ${key}: ${value} (타입: ${typeof value})`);
        });
        console.groupEnd();

        // 🆕 InvitationByCodeResponse 타입에 맞춘 정확한 데이터 변환
        // 🆕 타입 안전한 데이터 변환 (InvitationByCodeResponse → InvitationResponse)
        // 🆕 서버 응답 구조에 맞춘 정확한 데이터 변환
        const transformedData: InvitationResponse = {
          weddingInfo: {
            // 서버 응답의 weddingInfo 객체에서 데이터 추출
            groomName: serverData.weddingInfo?.groomName || "지환",
            brideName: serverData.weddingInfo?.brideName || "윤진",
            weddingDate:
              serverData.weddingInfo?.weddingdate || "2025-10-25T18:00:00", // 서버에서 소문자 사용
            weddingLocation:
              serverData.weddingInfo?.venueName || "포포인츠 바이 쉐라톤 조선 서울역 19층",
            greetingMessage:
              serverData.weddingInfo?.greetingMessage || "두 손 잡고 걷다보니 즐거움만 가득 \n 더 큰 즐거움의 시작에 함께 해주세요. \n 지환, 윤진 결혼합니다.",
            ceremonyProgram: serverData.weddingInfo?.ceremonyProgram || "예식 순서",
            accountInfo: ["농협 121065-56-105215 (고인옥 / 신랑母)"], // 기본값

            // 상세 장소 정보들 추가
            venueName: serverData.weddingInfo?.venueName,
            venueAddress: serverData.weddingInfo?.venueAddress,
            kakaoMapUrl: serverData.weddingInfo?.kakaoMapUrl,
            naverMapUrl: serverData.weddingInfo?.naverMapUrl,
            parkingInfo: serverData.weddingInfo?.parkingInfo,
            transportInfo: serverData.weddingInfo?.transportInfo,
          },
          groupInfo: {
            // 서버 응답의 groupInfo에서 그룹 정보 추출
            groupName: serverData.groupInfo?.groupName || "기본 그룹",
            groupType: (serverData.groupInfo?.groupType as GroupType) || GroupType.WEDDING_GUEST,
            greetingMessage: serverData.groupInfo?.greetingMessage || "초대합니다.",
          },
          // ✅ 수정: 서버에서 받은 실제 그룹 기능 설정값 사용
          showRsvpForm: serverData.groupInfo?.showRsvpForm ?? true,
          showAccountInfo: serverData.groupInfo?.showAccountInfo ?? false,
          showShareButton: serverData.groupInfo?.showShareButton ?? false,
          showCeremonyProgram: serverData.groupInfo?.showCeremonyProgram ?? true,
          showVenueInfo: serverData.groupInfo?.showVenueInfo ?? true,
          showPhotoGallery: serverData.groupInfo?.showPhotoGallery ?? true,
        };

        console.log("🔄 변환 완료된 데이터:", transformedData);
        setInvitationData(transformedData);
        setError(null);

        // 🆕 이미지 데이터 로딩 (향후 서버 API 연동 예정)
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
        console.error("❌ 청첩장 데이터 로드 실패:", err);

        // 🔧 invitationService에서 처리된 에러 메시지 사용
        const errorMessage =
          err instanceof Error
            ? err.message
            : "청첩장 정보를 불러올 수 없습니다.";
        setError(errorMessage);

        // ❌ 에러 시에는 기본값 설정하지 않음 (정확한 에러 표시)
        setInvitationData(null);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvitationData();
  }, [uniqueCode]); // uniqueCode가 변경될 때마다 데이터 다시 로딩

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
          <div style={{ fontSize: "18px" }}>
            청첩장 정보를 찾을 수 없습니다.
          </div>
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
              rsvpMessage.type === "success" ? AppleColors.accent : "#FF3B30",
            color: "white",
            borderRadius: "12px",
            padding: "16px 24px",
            maxWidth: "90%",
            textAlign: "center",
            zIndex: 1000,
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
          background: `#ffffff`,
          color: "#222",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          height: "100vh",
          display: "flex",
          alignItems: "center",
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
            // 🔧 PC/모바일 반응형 너비 설정 추가
            maxWidth: isMobile ? "390px" : "1200px",
            margin: "0 auto",
            padding: isMobile ? "20px" : "40px 60px",
            width: "100%",
          }}
        >
          <h1
            style={{
              margin: "40px 0",
            }}
          >
            <img 
              src="/images/wedding.png" 
              style={getWeddingImageStyle(isMobile)} // 반응형 스타일 적용
              alt="웨딩 이미지" // 접근성을 위한 alt 텍스트 추가
            />
          </h1>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "300",
              opacity: 0.9,
              fontFamily: systemFont,
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, lineHeight: 1 }}>
              {invitationData.weddingInfo.groomName} ♥{" "}
              {invitationData.weddingInfo.brideName}
            </div>
            <div style={{ lineHeight: 2 }}>Wedding Invitation</div>
          </div>
        </div>
      </div>
      {/* 메인 컨텐츠 섹션들 - 기능 설정에 따라 조건부 렌더링 */}
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
            padding: "40px 0 120px",
            textAlign: "center",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.3s",
          }}
        >
          <div
            style={{
              fontSize: getResponsiveFontSize(18, 4.6154, isMobile),
              lineHeight: "1.8",
              color: AppleColors.text,
              fontFamily: systemFont,
              whiteSpace: "pre-line",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {/* {invitationData.groupInfo.greetingMessage} */}
            소중한 주말 저녁, <br />
            저희의 결혼을 축복하기 위해 <br />
            귀한 발걸음을 해주셔서 진심으로 감사드립니다. <br />
            <br />
            오시는 길이 헛되지 않도록 정성껏 준비했으니, 부디 즐거운 마음으로
            함께해주시면 <br />
            더없는 기쁨이겠습니다. <br />
            <br />
            저희의 새로운 시작을 <br />
            따뜻한 마음으로 지켜봐 주세요.
          </div>
        </div>

        {/* 포토 갤러리 (모든 그룹에서 표시) - HomePage.tsx와 동일한 기능 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.6s",
          }}
        >
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
                    height: "auto",
                    borderRadius: "16px",
                    overflow: "hidden",
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
                            transition: "all 0.3s ease",
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
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      backgroundColor: "#f8f9fa",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
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
        {/* 웨딩 일정 정보 */}
        <div
          style={{
            textAlign: "center",
            lineHeight: 1.25,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "11px",
            paddingTop: "120px",
          }}
        >

        <div style={{
          padding: "0 0 120px", 
          fontSize: getResponsiveFontSize(20, 5.128, isMobile),
          fontWeight: "700",
          fontFamily: systemFont,
          letterSpacing: "0.5px",
          width:"65%"
        }}>
          {/* 첫 번째 줄 - 이광수 고인옥의 아들 지환 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0",
            width: "100%"
          }}>
            <span style={{flex: "0 0 auto"}}>이광수 고인옥<span style={{fontSize:getResponsiveFontSize(16, 4.1026, isMobile)}}>의</span></span>
            <span style={{flex: "0 0 auto", margin: "0 10px", fontSize:getResponsiveFontSize(16, 4.1026, isMobile)}}>아들</span>
            <span style={{flex: "0 0 auto"}}>지환</span>
          </div>
          
          {/* 두 번째 줄 - 이재관 배연수의 딸 윤진 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0",
            width: "100%"
          }}>
            <span style={{flex: "0 0 auto"}}>이재관 배연수<span style={{fontSize:getResponsiveFontSize(16, 4.1026, isMobile)}}>의</span></span>
            <span style={{flex: "0 0 auto", margin: "0 10px", fontSize:getResponsiveFontSize(16, 4.1026, isMobile)}}>딸</span>
            <span style={{flex: "0 0 auto"}}>윤진</span>
          </div>
        </div>
          <div
            style={{
              fontSize: getResponsiveFontSize(20, 5.128, isMobile),
              fontWeight: "700",
              opacity: 0.95,
              fontFamily: systemFont,
              letterSpacing: "0.5px",
              lineHeight: 1.25,
            }}
          >
            {formatWeddingDateTime(invitationData.weddingInfo.weddingDate)}
          </div>
          <div
            style={{
              fontSize: getResponsiveFontSize(20, 5.128, isMobile),
              fontWeight: "700",
              opacity: 0.95,
              fontFamily: systemFont,
              letterSpacing: "0.5px",
              lineHeight: 1.25,
            }}
          >
            {invitationData.weddingInfo.venueName}
          </div>

          <div
            style={{
              fontSize:getResponsiveFontSize(17, 4.359, isMobile),
              fontWeight: "700",
              opacity: 0.95,
              fontFamily: systemFont,
              letterSpacing: "0.5px",
              lineHeight: 1.25,
            }}
          >
            🌸 화환은 정중히 거절합니다 🌸
          </div>
        </div>
        {/* 오시는 길 정보 (모든 그룹) */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            paddingTop: "120px",
            marginBottom: "60px",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.9s",
          }}
        >
          {/* 🔍 오시는 길 정보 - showVenueInfo가 true일 때만 표시 */}
              {invitationData?.showVenueInfo && (
                <VenueInfo invitationData={invitationData} />
              )}
        </div>
        {/* 참석 응답 폼 (WEDDING_GUEST 그룹만) */}
        {invitationData.showRsvpForm && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              marginBottom: "60px",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(50px)",
              transition: "all 1s ease 1.2s",
            }}
          >
      {/* 📝 참석 응답 폼 - showRsvpForm이 true일 때만 표시 */}
      {invitationData?.showRsvpForm && (
        <RsvpForm
          uniqueCode={uniqueCode!}
          onSubmitSuccess={handleRsvpSuccess}
          onSubmitError={handleRsvpError}
        />
      )}
          </div>
        )}

        {/* 공유 버튼 - showShareButton이 true일 때만 표시 */}
        {invitationData.showShareButton && (
          <div style={{display:"flex", justifyContent:"center", width:"100%"}}>
            <ShareButton 
              uniqueCode={uniqueCode!}
              groomName={invitationData.weddingInfo.groomName}
              brideName={invitationData.weddingInfo.brideName}
              weddingDate={invitationData.weddingInfo.weddingDate}
              venueName={invitationData.weddingInfo.venueName}
            />
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
