// 참석 여부 응답 폼 컴포넌트
import React, { useEffect, useState } from "react";
import { submitRsvp } from "../services/invitationService";
import { RsvpRequest } from "../types";

// Props 타입 정의
interface RsvpFormProps {
  uniqueCode: string; // 청첩장 고유 코드
  onSubmitSuccess?: () => void; // 제출 성공 시 실행할 함수
  onSubmitError?: (error: string) => void; // 제출 실패 시 실행할 함수
}

// 반응형 폰트 사이즈 함수 (PC: px, 모바일: vw)
const getResponsiveFontSize = (pcPx: number, mobileVw: number, isMobile: boolean) => {
  return isMobile ? `${mobileVw}vw` : `${pcPx}px`;
};


const RsvpForm: React.FC<RsvpFormProps> = ({
  uniqueCode,
  onSubmitSuccess,
  onSubmitError,
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState<RsvpRequest>({
    isAttending: true, // 기본값: 참석
    responderName: "", // 🔧 추가: 응답자 이름 초기값
    totalCount: 1, // 기본값: 1명
    adultCount: 1, // 🔧 추가: 성인 인원 초기값
    childrenCount: 0, // 🔧 추가: 자녀 인원 초기값
    attendeeNames: [""], // 기본값: 빈 이름 1개
    phoneNumber: "", // 전화번호 (선택사항)
    message: "", // 메시지 (선택사항)
  });

  // 로딩 및 제출 완료 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMobile, setIsMobile] = useState(false);

  // 참석 여부 변경 처리
  const handleAttendanceChange = (isAttending: boolean) => {
    if (isAttending) {
      // 참석으로 변경 시: 참석자 정보 초기화
      setFormData({
        ...formData,
        isAttending: true,
        totalCount: 1,
        adultCount: 1,
        childrenCount: 0,
        attendeeNames: [formData.responderName || ""], // 기존 응답자 이름을 첫 번째 참석자로 설정
      });
    } else {
      // 🔧 수정: 불참으로 변경 시 - 응답자 이름은 유지하고 참석자 정보만 초기화
      setFormData({
        ...formData,
        isAttending: false,
        totalCount: 0,
        adultCount: 0,
        childrenCount: 0,
        attendeeNames: [], // 빈 배열로 설정
        // responderName은 유지 (사용자가 입력한 값 보존)
      });
    }

    // 🔧 추가: 에러 상태 초기화
    setErrors({});
  };

  // 참석 인원 변경 처리
  const handleCountChange = (count: number) => {
    const newAttendeeNames = Array(count)
      .fill("")
      .map((_, index) => formData.attendeeNames[index] || "");

    setFormData({
      ...formData,
      totalCount: count,
      attendeeNames: newAttendeeNames,
    });

    // 관련 에러 메시지 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.totalCount;
      // 줄어든 인원의 이름 에러도 제거
      Object.keys(newErrors).forEach((key) => {
        if (
          key.startsWith("attendeeName_") &&
          parseInt(key.split("_")[1]) >= count
        ) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // 참석자 이름 변경 처리
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...formData.attendeeNames];
    newNames[index] = name;

    setFormData({
      ...formData,
      attendeeNames: newNames,
    });

    // 해당 이름 필드의 에러 메시지 제거
    if (errors[`attendeeName_${index}`]) {
      setErrors((prev) => ({
        ...prev,
        [`attendeeName_${index}`]: "",
      }));
    }
  };

  // 기타 필드 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 유효성 검사 함수
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 🔧 수정: 불참석인 경우에도 응답자 이름 검증
    if (formData.isAttending === false) {
      // 불참석인 경우 응답자 이름만 검증
      if (!formData.responderName || formData.responderName.trim() === "") {
        newErrors.responderName = "이름을 입력해주세요.";
      } else if (formData.responderName.trim().length < 2) {
        newErrors.responderName = "이름은 2글자 이상 입력해주세요.";
      }
    } else if (formData.isAttending === true) {
      // 참석인 경우 기존 검증 로직
      if (formData.totalCount < 1) {
        newErrors.totalCount = "참석 인원을 선택해주세요.";
      }

      if (formData.totalCount > 10) {
        newErrors.totalCount = "참석 인원은 최대 10명까지 가능합니다.";
      }

      // 각 참석자 이름 검사
      formData.attendeeNames.forEach((name, index) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          newErrors[`attendeeName_${index}`] = `${
            index + 1
          }번째 참석자 이름을 입력해주세요.`;
        } else if (trimmedName.length < 2) {
          newErrors[`attendeeName_${index}`] = `${
            index + 1
          }번째 참석자 이름은 2글자 이상 입력해주세요.`;
        }
      });
    } else {
      // 참석 여부를 선택하지 않은 경우
      newErrors.attendance = "참석 여부를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // 🔧 수정: 참석/불참에 따른 제출 데이터 준비
      let submitData: RsvpRequest;

      if (formData.isAttending === false) {
  // 불참인 경우: attendeeNames는 빈 배열, responderName만 사용
  const responderName = formData.responderName.trim();
  submitData = {
    isAttending: false,
    responderName: responderName,
    totalCount: 0,
    adultCount: 0,
    childrenCount: 0,
    attendeeNames: [], // ✅ 빈 배열로 수정
    phoneNumber: formData.phoneNumber?.trim() || undefined,
    message: formData.message?.trim() || undefined,
  };
} else {
        // 참석인 경우: 기존 로직 유지
        const trimmedNames = formData.attendeeNames.map((name) => name.trim());
        submitData = {
          ...formData,
          responderName: trimmedNames[0] || formData.responderName.trim(),
          attendeeNames: trimmedNames,
          phoneNumber: formData.phoneNumber?.trim() || undefined,
          message: formData.message?.trim() || undefined,
        };
      }

      console.log("📤 제출 데이터:", submitData); // 디버깅용

      // API 호출
      await submitRsvp(uniqueCode, submitData);

      // 성공 처리
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("참석 응답 제출 실패:", error);
      const errorMessage =
        error.message || "참석 응답 제출에 실패했습니다. 다시 시도해주세요.";

      if (onSubmitError) {
        onSubmitError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // 제출 완료 후 화면
  if (isSubmitted) {
    return (
      <div
        style={{
          backgroundColor: formData.isAttending ? "#d4edda" : "#f8d7da", // 참석/불참에 따라 배경색 변경
          border: formData.isAttending
            ? "1px solid #c3e6cb"
            : "1px solid #f5c6cb", // 참석/불참에 따라 테두리색 변경
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          color: formData.isAttending ? "#155724" : "#721c24", // 참석/불참에 따라 텍스트색 변경
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            color: formData.isAttending ? "#155724" : "#721c24",
          }}
        >
          {formData.isAttending
            ? "✅ 참석 응답이 완료되었습니다"
            : "📝 불참 응답이 완료되었습니다"}
        </h3>
        <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "500" }}>
          {/* 🔧 수정: 불참자 이름도 표시 */}
          {formData.isAttending
            ? `${formData.attendeeNames[0] || formData.responderName}님`
            : `${formData.responderName}님`}
        </p>
        <p style={{ margin: 0, fontSize: "14px" }}>
          {formData.isAttending
            ? "결혼식 당일 뵙겠습니다!"
            : "응답해 주셔서 감사합니다."}
        </p>
      </div>
    );
  }

  // 메인 폼 렌더링
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      {/* 안내 메시지 */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ffff",
          borderRadius: "6px",
          paddingBottom: "60px",
          color: "#721c24",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            margin: 0,
            fontSize: getResponsiveFontSize(15, 3.8462, isMobile),
            lineHeight: "1.5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <strong>참석 여부 안내</strong>
          <p style={{ margin: 0 }}>식장이 협소하고 좌석 지정이 필요하여</p>
          <p style={{ margin: 0 }}>정확한 참석 인원 확인이 필요합니다.</p>
          <p style={{ margin: 0 }}>너그러운 양해 부탁드립니다.</p>
        </div>
      </div>

      <h2
        style={{ marginBottom: "40px", color: "#222222", textAlign: "center" }}
      >
        참석 여부 회신
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 참석 여부 선택 */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            참석 여부 *
          </label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <input
                type="radio"
                name="attendance"
                value="true"
                checked={formData.isAttending === true}
                onChange={() => handleAttendanceChange(true)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#007AFF",
                }}
              />
              참석
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <input
                type="radio"
                name="attendance"
                value="false"
                checked={formData.isAttending === false}
                onChange={() => handleAttendanceChange(false)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#007AFF",
                }}
              />
              불참석
            </label>
          </div>
        </div>

        {/* 참석 인원 및 이름 입력 (참석 시만 표시) */}
        {formData.isAttending && (
          <>
            {/* 참석 인원 선택 */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                참석 인원 *
              </label>
              <select
                value={formData.totalCount}
                onChange={(e) => handleCountChange(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: errors.totalCount
                    ? "2px solid #dc3545"
                    : "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
                disabled={isSubmitting}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}명
                  </option>
                ))}
              </select>
              {errors.totalCount && (
                <p
                  style={{
                    color: "#dc3545",
                    fontSize: "14px",
                    margin: "5px 0 0 0",
                  }}
                >
                  {errors.totalCount}
                </p>
              )}
            </div>

            {/* 참석자 이름 입력 */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                참석자 이름 *
              </label>
              {formData.attendeeNames.map((name, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`${index + 1}번째 참석자 이름`}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: errors[`attendeeName_${index}`]
                        ? "2px solid #dc3545"
                        : "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                    disabled={isSubmitting}
                  />
                  {errors[`attendeeName_${index}`] && (
                    <p
                      style={{
                        color: "#dc3545",
                        fontSize: "14px",
                        margin: "5px 0 0 0",
                      }}
                    >
                      {errors[`attendeeName_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {/* 전화번호 (선택사항) */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                전화번호 (선택사항)
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="연락 가능한 전화번호"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
                disabled={isSubmitting}
              />
            </div>

            {/* 메시지 (선택사항) */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                메시지 (선택사항)
              </label>
              <textarea
                value={formData.message || ""}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="전하고 싶은 말씀이 있다면 적어주세요"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}

        {/* 🔧 추가: 불참석인 경우 이름 입력 필드 */}
        {formData.isAttending === false && (
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              이름 *
            </label>
            <input
              type="text"
              value={formData.responderName || ""}
              onChange={(e) =>
                handleInputChange("responderName", e.target.value)
              }
              placeholder="불참 응답자 이름을 입력해주세요"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                border: `2px solid ${
                  errors.responderName ? "#FF3B30" : "#E5E5EA"
                }`,
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing:"border-box"
              }}
              disabled={isSubmitting}
            />
            {errors.responderName && (
              <p
                style={{
                  color: "#FF3B30",
                  fontSize: "14px",
                  margin: "4px 0 0 0",
                }}
              >
                {errors.responderName}
              </p>
            )}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "제출 중..." : "응답 제출하기"}
        </button>
      </form>
    </div>
  );
};

export default RsvpForm;
