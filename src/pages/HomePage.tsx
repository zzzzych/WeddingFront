// src/pages/HomePage.tsx - 모바일 조건부 렌더링 완전 수정
import React, { useState, useEffect } from "react";

// 시스템 폰트 정의
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';

// 애플 색상 팔레트
const AppleColors = {
  primary: "#007AFF",
  primaryDark: "#0051D5",
  background: "#ffffff",
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

interface WeddingInfo {
  groomName: string;
  brideName: string;
  greetingMessage: string;
}

interface Photo {
  id: string;
  url: string;
  alt: string;
}

const HomePage: React.FC = () => {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo>({
    groomName: "",
    brideName: "",
    greetingMessage: "",
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🆕 이미지 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 🆕 모바일용 currentImageIndex 상태 (모달과 별개)
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);

  // 🆕 모바일 감지 상태
  const [isMobile, setIsMobile] = useState(false);

  // 🆕 모바일 감지 useEffect
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

  useEffect(() => {
  const fetchData = async () => {
    try {
      // HomePage는 기본 정보만 표시하므로 API 호출 없이 기본값 설정
      setWeddingInfo({
        groomName: "지환",
        brideName: "윤진", 
        greetingMessage: `두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n\n지환, 윤진 결혼합니다.`,
      });

      // 실제 이미지 파일들 적용 (wedding-1.jpeg ~ wedding-8.jpeg)
      const photoList = [];
      for (let i = 1; i <= 8; i++) {
        photoList.push({
          id: `wedding-${i}`,
          url: `/images/wedding-${i}.jpeg`,
          alt: `웨딩 사진 ${i}`,
        });
      }

      setPhotos(photoList);
      console.log("HomePage 데이터 로드 완료:", photoList.length, "개 이미지");
      
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
      setError("데이터를 불러오는데 실패했습니다.");

      // 에러 시에도 기본값 설정
      setWeddingInfo({
        groomName: "지환",
        brideName: "윤진",
        greetingMessage: `두 손 잡고 걷다보니 즐거움만 가득\n더 큰 즐거움의 시작에 함께 해주세요.\n\n지환, 윤진 결혼합니다.`,
      });

      // 에러 시에도 이미지는 표시
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

  fetchData();
}, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 🆕 이미지 클릭 시 모달 열기
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    // 배경 스크롤 방지
    document.body.style.overflow = "hidden";
  };

  // 🆕 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
    // 배경 스크롤 복원
    document.body.style.overflow = "unset";
  };

  // 🆕 이전 이미지로 이동
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  // 🆕 다음 이미지로 이동
  const goToNext = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 🆕 모바일용 이전/다음 함수
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

  // 🆕 키보드 이벤트 처리
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: AppleColors.background,
          fontFamily: systemFont,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: AppleColors.secondaryText,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              // border: `3px solid ${AppleColors.border}`,
              borderTop: `3px solid ${AppleColors.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ fontSize: "16px", margin: 0 }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: AppleColors.background,
          fontFamily: systemFont,
          color: AppleColors.text,
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div>
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: AppleColors.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "16px",
              fontFamily: systemFont,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: AppleColors.background,
        fontFamily: systemFont,
      }}
    >
      {/* 헤더 섹션 */}
      <div
        style={{
          // background: `linear-gradient(135deg, ${AppleColors.gradient.start} 0%, ${AppleColors.gradient.middle} 50%, ${AppleColors.gradient.end} 100%)`,
          background: '#ffffff',
          color: "#222222",
          textAlign: "center",
          padding: "80px 20px 60px",
          position: "relative",
          overflow: "hidden",
          // borderBottom: `1px solid #222`,
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
            {weddingInfo.groomName} ♥ {weddingInfo.brideName}
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

          {/* 🆕 결혼식 일자 추가 */}
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
            2025년 10월 25일 토요일 오후 6시
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
        {/* 인사말 섹션 */}
        <div
          style={{
            backgroundColor: AppleColors.cardBackground,
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "60px",
            // border: `1px solid ${AppleColors.border}`,
            // boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(50px)",
            transition: "all 1s ease 0.3s",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: AppleColors.text,
              margin: "0 0 24px 0",
              fontFamily: systemFont,
            }}
          >
            소중한 분들께
          </h2>
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
            {weddingInfo.greetingMessage}
          </div>
        </div>

        {/* 포토 갤러리 섹션 */}
        {photos.length > 0 && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "40px",
              // border: `1px solid ${AppleColors.border}`,
              // boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
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
            {isMobile ? (
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
                    // boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
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
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      ❮
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
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      ❯
                    </button>
                  )}

                  {/* 페이지 인디케이터 */}
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
                            background:
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
                        scrollbarWidth: "thin", // Firefox용만 유지
                        WebkitOverflowScrolling: "touch", // iOS 부드러운 스크롤
                        // 스크롤바 스타일링 제거 (타입 오류 방지)
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
                            // border:
                            //   index === mobileCurrentIndex
                            //     ? `3px solid ${AppleColors.primary}`
                            //     : "3px solid transparent",
                            transition: "all 0.3s ease",
                            flexShrink: 0,
                            // boxShadow:
                            //   index === mobileCurrentIndex
                            //     ? "0 4px 12px rgba(0, 122, 255, 0.3)"
                            //     : "0 2px 8px rgba(0, 0, 0, 0.1)",
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
                              transform:
                                index === mobileCurrentIndex
                                  ? "scale(1.05)"
                                  : "scale(1)",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 🖥️ 데스크톱: 그리드 레이아웃
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => openModal(index)}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      // boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                      aspectRatio: "1 / 1",
                      cursor: "pointer",
                      opacity: isLoaded ? 1 : 0,
                      transform: isLoaded ? "scale(1)" : "scale(0.9)",
                      transition: `all 0.6s ease ${0.8 + index * 0.1}s`,
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 포토 갤러리가 없을 때 플레이스홀더 */}
        {photos.length === 0 && (
          <div
            style={{
              backgroundColor: AppleColors.cardBackground,
              borderRadius: "20px",
              padding: "60px 40px",
              // border: `1px solid ${AppleColors.border}`,
              // boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              textAlign: "center",
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

      {/* 🆕 이미지 모달 */}
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
                top: "10px",
                right: "10px",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
                zIndex: 1001,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
              }}
            >
              ✕
            </button>

            {/* 이전 버튼 */}
            {photos.length > 1 && (
              <button
                className="modal-button"
                onClick={goToPrevious}
                style={{
                  position: "fixed",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  zIndex: 1002,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                }}
              >
                ❮
              </button>
            )}

            {/* 다음 버튼 */}
            {photos.length > 1 && (
              <button
                className="modal-button"
                onClick={goToNext}
                style={{
                  position: "fixed",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  zIndex: 1002,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                }}
              >
                ❯
              </button>
            )}

            {/* 메인 이미지 */}
            <img
              src={photos[currentImageIndex]?.url}
              alt={photos[currentImageIndex]?.alt}
              style={{
                maxWidth: "calc(100% - 120px)",
                maxHeight: "calc(100% - 120px)",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "12px",
                // boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            />

            {/* 이미지 카운터 */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontSize: "16px",
                fontFamily: systemFont,
                background: "rgba(0, 0, 0, 0.7)",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              {currentImageIndex + 1} / {photos.length}
            </div>

            {/* 썸네일 네비게이션 */}
            {photos.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-100px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                  maxWidth: "100%",
                  overflowX: "auto",
                  padding: "10px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      // border:
                      //   index === currentImageIndex
                      //     ? "3px solid white"
                      //     : "3px solid transparent",
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

      {/* CSS 애니메이션 */}
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

export default HomePage;
