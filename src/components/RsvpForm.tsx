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
    isAttending: true,          // 기본값: 참석
    totalCount: 1,              // 기본값: 1명
    attendeeNames: [''],        // 기본값: 빈 이름 1개
    phoneNumber: '',            // 전화번호 (선택사항)
    message: ''                 // 메시지 (선택사항)
  });

  // 로딩 및 제출 완료 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 참석 여부 변경 처리
  const handleAttendanceChange = (isAttending: boolean) => {
    if (isAttending) {
      // 참석 선택 시: 기본 1명으로 설정
      setFormData({
        ...formData,
        isAttending: true,
        totalCount: 1,
        attendeeNames: ['']
      });
    } else {
      // 불참 선택 시: 인원과 이름 초기화
      setFormData({
        ...formData,
        isAttending: false,
        totalCount: 0,
        attendeeNames: []
      });
    }
    // 에러 메시지 초기화
    setErrors({});
  };

  // 참석 인원 변경 처리
  const handleCountChange = (count: number) => {
    const newAttendeeNames = Array(count).fill('').map((_, index) => 
      formData.attendeeNames[index] || ''
    );
    
    setFormData({
      ...formData,
      totalCount: count,
      attendeeNames: newAttendeeNames
    });
    
    // 관련 에러 메시지 제거
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.totalCount;
      // 줄어든 인원의 이름 에러도 제거
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith('attendeeName_') && parseInt(key.split('_')[1]) >= count) {
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
      attendeeNames: newNames
    });
    
    // 해당 이름 필드의 에러 메시지 제거
    if (errors[`attendeeName_${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`attendeeName_${index}`]: ''
      }));
    }
  };

  // 기타 필드 변경 처리
  const handleInputChange = (field: string, value: string) => {
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

    if (formData.isAttending) {
      // 참석하는 경우 유효성 검사
      if (formData.totalCount < 1) {
        newErrors.totalCount = '참석 인원은 최소 1명 이상이어야 합니다.';
      }
      
      if (formData.totalCount > 10) {
        newErrors.totalCount = '참석 인원은 최대 10명까지 가능합니다.';
      }

      // 각 참석자 이름 검사
      formData.attendeeNames.forEach((name, index) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          newErrors[`attendeeName_${index}`] = `${index + 1}번째 참석자 이름을 입력해주세요.`;
        } else if (trimmedName.length < 2) {
          newErrors[`attendeeName_${index}`] = `${index + 1}번째 참석자 이름은 2글자 이상 입력해주세요.`;
        }
      });
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

      // 제출 데이터 준비 (이름들 trim 처리)
      const submitData: RsvpRequest = {
        ...formData,
        attendeeNames: formData.attendeeNames.map(name => name.trim())
      };

      // API 호출
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
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {/* 안내 메시지 */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ffff',
        borderRadius: '6px',
        paddingBottom: '60px',
        color: '#721c24',
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ 
          margin: 0, 
          fontSize: '14px', 
          lineHeight: '1.5', 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center" 
        }}>
          <strong>참석 여부 안내</strong>
          <p style={{margin: 0}}>식장이 협소하고 좌석 지정이 필요하여</p>
          <p style={{margin: 0}}>정확한 참석 인원 확인이 필요합니다.</p>
          <p style={{margin: 0}}>너그러운 양해 부탁드립니다.</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '40px', color: '#856404', textAlign: "center" }}>참석 여부 회신</h3>

      <form onSubmit={handleSubmit}>
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
                onChange={() => handleAttendanceChange(true)}
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
                onChange={() => handleAttendanceChange(false)}
                style={{ marginRight: '6px' }}
                disabled={isSubmitting}
              />
              불참석
            </label>
          </div>
        </div>

        {/* 참석 인원 및 이름 입력 (참석 시만 표시) */}
        {formData.isAttending && (
          <>
            {/* 참석 인원 선택 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#495057'
              }}>
                참석 인원 *
              </label>
              <select
                value={formData.totalCount}
                onChange={(e) => handleCountChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.totalCount ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                disabled={isSubmitting}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
              {errors.totalCount && (
                <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
                  {errors.totalCount}
                </p>
              )}
            </div>

            {/* 참석자 이름 입력 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#495057'
              }}>
                참석자 이름 *
              </label>
              {formData.attendeeNames.map((name, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`${index + 1}번째 참석자 이름`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors[`attendeeName_${index}`] ? '2px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    disabled={isSubmitting}
                  />
                  {errors[`attendeeName_${index}`] && (
                    <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0 0 0' }}>
                      {errors[`attendeeName_${index}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 전화번호 (선택사항) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            전화번호 (선택사항)
          </label>
          <input
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="연락 가능한 전화번호"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* 메시지 (선택사항) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#495057'
          }}>
            메시지 (선택사항)
          </label>
          <textarea
            value={formData.message || ''}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="전하고 싶은 말씀이 있다면 적어주세요"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? '제출 중...' : '응답 제출하기'}
        </button>
      </form>
    </div>
  );
};

export default RsvpForm;