// 참석 여부 응답 폼 컴포넌트
import React, { useState } from 'react';
import { submitRsvp } from '../services/invitationService';
import { RsvpRequest } from '../types';

// Props 타입 정의
interface RsvpFormProps {
  uniqueCode: string;                    // 청첩장 고유 코드
  onSubmitSuccess?: () => void;          // 제출 성공 시 실행할 함수
  onSubmitError?: (error: string) => void; // 제출 실패 시 실행할 함수
}

const RsvpForm: React.FC<RsvpFormProps> = ({ 
  uniqueCode, 
  onSubmitSuccess, 
  onSubmitError 
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState<RsvpRequest>({
    responderName: '',
    isAttending: true,      // 기본값: 참석
    adultCount: 1,          // 기본값: 성인 1명
    childrenCount: 0        // 기본값: 자녀 0명
  });

  // 로딩 및 제출 완료 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 입력값 변경 처리
  const handleInputChange = (field: keyof RsvpRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 해당 필드의 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 이름 검사
    if (!formData.responderName.trim()) {
      newErrors.responderName = '이름을 입력해주세요.';
    } else if (formData.responderName.trim().length < 2) {
      newErrors.responderName = '이름은 2글자 이상 입력해주세요.';
    }

    // 참석하는 경우 인원수 검사
    if (formData.isAttending) {
      if (formData.adultCount < 1) {
        newErrors.adultCount = '성인 인원은 최소 1명 이상이어야 합니다.';
      }
      if (formData.childrenCount < 0) {
        newErrors.childrenCount = '자녀 인원은 0명 이상이어야 합니다.';
      }
      if (formData.adultCount > 10) {
        newErrors.adultCount = '성인 인원은 최대 10명까지 가능합니다.';
      }
      if (formData.childrenCount > 10) {
        newErrors.childrenCount = '자녀 인원은 최대 10명까지 가능합니다.';
      }
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

      // 불참석 시 인원수 0으로 설정
      const submitData: RsvpRequest = {
        ...formData,
        responderName: formData.responderName.trim(),
        adultCount: formData.isAttending ? formData.adultCount : 0,
        childrenCount: formData.isAttending ? formData.childrenCount : 0
      };

      // API 호출
      const submitDataWithCode: RsvpRequest = {
        ...submitData,
        // uniqueCode를 어떻게 처리할지에 따라 달라짐
        // 서버에서 uniqueCode로 그룹을 찾는 경우라면 다른 API 엔드포인트가 필요
      };

      await submitRsvp(uniqueCode, submitData);

      // 성공 처리
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error: any) {
      console.error('참석 응답 제출 실패:', error);
      const errorMessage = error.message || '참석 응답 제출에 실패했습니다. 다시 시도해주세요.';
      
      if (onSubmitError) {
        onSubmitError(errorMessage);
      } else {
        // 기본 에러 처리
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 제출 완료 후 화면
  if (isSubmitted) {
    return (
      <div style={{
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#155724'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>
          ✅ 응답이 완료되었습니다
        </h3>
        <p style={{ margin: 0 }}>
          소중한 답변 감사합니다. 결혼식 당일 뵙겠습니다!
        </p>
      </div>
    );
  }

  // 메인 폼 렌더링
  return (
    <div style={{
      backgroundColor: '#ffffff',
      // border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* 안내 메시지 */}
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '20px',
        color: '#721c24'
      }}>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          <strong>참석 여부 안내</strong><br />
          식장이 협소하고 좌석 지정이 필요하여 정확한 참석 인원 확인이 필요합니다.<br />
          너그러운 양해 부탁드립니다.
        </p>
      </div>

      <h3 style={{ marginBottom: '20px', color: '#856404' }}>참석 여부 회신</h3>

      <form onSubmit={handleSubmit}>
        {/* 이름 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            이름 *
          </label>
          <input
            type="text"
            value={formData.responderName}
            onChange={(e) => handleInputChange('responderName', e.target.value)}
            placeholder="참석자 이름을 입력해주세요"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.responderName ? '2px solid #dc3545' : '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            disabled={isSubmitting}
          />
          {errors.responderName && (
            <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
              {errors.responderName}
            </p>
          )}
        </div>

        {/* 참석 여부 선택 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            참석 여부 *
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="isAttending"
                checked={formData.isAttending === true}
                onChange={() => handleInputChange('isAttending', true)}
                style={{ marginRight: '6px' }}
                disabled={isSubmitting}
              />
              참석
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="isAttending"
                checked={formData.isAttending === false}
                onChange={() => handleInputChange('isAttending', false)}
                style={{ marginRight: '6px' }}
                disabled={isSubmitting}
              />
              불참석
            </label>
          </div>
        </div>

        {/* 인원수 입력 (참석 시만 표시) */}
        {formData.isAttending && (
          <>
            {/* 성인 인원 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#495057'
              }}>
                성인 인원 *
              </label>
              <select
                value={formData.adultCount}
                onChange={(e) => handleInputChange('adultCount', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.adultCount ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                disabled={isSubmitting}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
              {errors.adultCount && (
                <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
                  {errors.adultCount}
                </p>
              )}
            </div>

            {/* 자녀 인원 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#495057'
              }}>
                자녀 인원
              </label>
              <select
                value={formData.childrenCount}
                onChange={(e) => handleInputChange('childrenCount', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.childrenCount ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                disabled={isSubmitting}
              >
                {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
              {errors.childrenCount && (
                <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
                  {errors.childrenCount}
                </p>
              )}
            </div>
          </>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting ? '제출 중...' : '응답 제출하기'}
        </button>
      </form>
    </div>
  );
};

export default RsvpForm;