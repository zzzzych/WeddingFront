// src/components/GreetingEditor.tsx
// 관리자가 인사말을 직접 수정할 수 있는 컴포넌트
import React, { useState, useEffect } from 'react';

// Props 타입 정의
interface GreetingEditorProps {
  currentGreeting: string;                          // 현재 인사말 텍스트
  onSave: (newGreeting: string) => void;           // 저장 완료 시 호출할 함수
  onCancel: () => void;                            // 취소 시 호출할 함수
  isLoading?: boolean;                             // 저장 중 로딩 상태
}

const GreetingEditor: React.FC<GreetingEditorProps> = ({
  currentGreeting,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // 상태 관리
  const [greetingText, setGreetingText] = useState<string>(currentGreeting);
  const [error, setError] = useState<string | null>(null);

  // Props가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setGreetingText(currentGreeting);
    setError(null);
  }, [currentGreeting]);

  // 입력 변경 처리
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setGreetingText(newValue);
    
    // 에러 상태 초기화
    if (error) {
      setError(null);
    }
  };

  // 유효성 검사
  const validateGreeting = (): boolean => {
    // 빈 텍스트 검사
    if (!greetingText.trim()) {
      setError('인사말을 입력해주세요.');
      return false;
    }

    // 길이 검사 (최소 10자, 최대 1000자)
    if (greetingText.trim().length < 10) {
      setError('인사말은 최소 10자 이상 입력해주세요.');
      return false;
    }

    if (greetingText.trim().length > 1000) {
      setError('인사말은 최대 1000자까지 입력 가능합니다.');
      return false;
    }

    return true;
  };

  // 저장 처리
  const handleSave = () => {
    if (!validateGreeting()) {
      return;
    }

    // 변경사항이 없는 경우
    if (greetingText.trim() === currentGreeting.trim()) {
      onCancel(); // 편집 모드 종료
      return;
    }

    // 저장 함수 호출
    onSave(greetingText.trim());
  };

  // 취소 처리
  const handleCancel = () => {
    setGreetingText(currentGreeting); // 원래 텍스트로 복원
    setError(null);
    onCancel();
  };

  // 키보드 단축키 처리 (Ctrl+S로 저장, ESC로 취소)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          fontSize: '18px',
          color: '#2c3e50',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ 인사말 수정
        </h3>
        
        <div style={{
          fontSize: '12px',
          color: '#6c757d'
        }}>
          {greetingText.length}/1000자
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          padding: '10px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 텍스트 편집 영역 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#495057'
        }}>
          인사말 내용:
        </label>
        
        <textarea
          value={greetingText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="따뜻한 인사말을 작성해주세요..."
          disabled={isLoading}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: error ? '2px solid #dc3545' : '1px solid #ced4da',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'inherit',
            resize: 'vertical',
            backgroundColor: isLoading ? '#f8f9fa' : 'white',
            color: isLoading ? '#6c757d' : '#495057'
          }}
        />
        
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginTop: '5px'
        }}>
          💡 팁: Ctrl/Cmd + S로 저장, ESC로 취소할 수 있습니다.
        </div>
      </div>

      {/* 실시간 미리보기 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          📋 미리보기:
        </div>
        
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#495057',
          minHeight: '20px',
          whiteSpace: 'pre-wrap' // 줄바꿈 유지
        }}>
          {greetingText || '인사말을 입력하면 여기에 미리보기가 표시됩니다.'}
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ❌ 취소
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading || !greetingText.trim()}
          style={{
            backgroundColor: isLoading ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: (isLoading || !greetingText.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !greetingText.trim()) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {isLoading ? (
            <>
              ⏳ 저장 중...
            </>
          ) : (
            <>
              💾 저장
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GreetingEditor;