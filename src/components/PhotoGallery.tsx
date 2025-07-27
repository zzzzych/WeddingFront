// 포토 갤러리 컴포넌트
import React, { useState, useEffect } from 'react';

// 사진 데이터 타입 정의
interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

// Props 타입 정의
interface PhotoGalleryProps {
  photos?: Photo[];  // 선택적 props (기본 샘플 이미지 사용)
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  // 상태 관리
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // 샘플 이미지 데이터 (실제로는 서버에서 가져올 예정)
  const defaultPhotos: Photo[] = [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
      alt: '웨딩 사진 1',
      caption: '프로포즈 순간'
    },
    {
      id: '2', 
      src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=600&fit=crop',
      alt: '웨딩 사진 2',
      caption: '약혼식'
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=600&fit=crop',
      alt: '웨딩 사진 3',
      caption: '웨딩드레스 피팅'
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop',
      alt: '웨딩 사진 4',
      caption: '스튜디오 촬영'
    },
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=400&h=600&fit=crop',
      alt: '웨딩 사진 5',
      caption: '야외 촬영'
    },
    {
      id: '6',
      src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=600&fit=crop',
      alt: '웨딩 사진 6',
      caption: '커플 사진'
    }
  ];

  const displayPhotos = photos || defaultPhotos;

  // 이미지 로드 에러 처리
const handleImageError = (photoId: string) => {
setImageLoadErrors(prev => {
    const newSet = new Set(prev);  // 기존 Set을 복사
    newSet.add(photoId);           // 새 항목 추가
    return newSet;
});
};
  // 사진 클릭 처리 (확대 보기)
  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // 이전 사진으로 이동
  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : displayPhotos.length - 1;
    setCurrentIndex(newIndex);
    setSelectedPhoto(displayPhotos[newIndex]);
  };

  // 다음 사진으로 이동
  const goToNext = () => {
    const newIndex = currentIndex < displayPhotos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedPhoto(displayPhotos[newIndex]);
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedPhoto) {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedPhoto, currentIndex]);

  // 빈 갤러리일 때
  if (displayPhotos.length === 0) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '12px',
        padding: '40px 25px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📷</div>
        <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>포토 갤러리</h3>
        <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
          아직 업로드된 사진이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          fontSize: '24px',
          color: '#2c3e50',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📷 포토 갤러리
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '14px',
          margin: 0
        }}>
          사진을 클릭하면 크게 볼 수 있습니다
        </p>
      </div>

      {/* 사진 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.id}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: '#e9ecef',
              border: '2px solid transparent',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handlePhotoClick(photo, index)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#007bff';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {!imageLoadErrors.has(photo.id) ? (
              <img
                src={photo.src}
                alt={photo.alt}
                onError={() => handleImageError(photo.id)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                <div style={{ fontSize: '12px', textAlign: 'center' }}>
                  이미지를 불러올 수 없습니다
                </div>
              </div>
            )}

            {/* 호버 오버레이 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              color: 'white',
              fontSize: '24px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
            >
              🔍
            </div>
          </div>
        ))}
      </div>

      {/* 사진 개수 표시 */}
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        총 {displayPhotos.length}장의 사진
      </div>

      {/* 확대 보기 모달 */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          {/* 모달 컨텐츠 */}
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                zIndex: 2001
              }}
            >
              ×
            </button>

            {/* 이전 버튼 */}
            {displayPhotos.length > 1 && (
              <button
                onClick={goToPrevious}
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '50%',
                  zIndex: 2001
                }}
              >
                ‹
              </button>
            )}

            {/* 다음 버튼 */}
            {displayPhotos.length > 1 && (
              <button
                onClick={goToNext}
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '50%',
                  zIndex: 2001
                }}
              >
                ›
              </button>
            )}

            {/* 확대된 이미지 */}
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            {/* 캡션 */}
            {selectedPhoto.caption && (
              <div style={{
                marginTop: '15px',
                color: 'white',
                fontSize: '16px',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 16px',
                borderRadius: '20px'
              }}>
                {selectedPhoto.caption}
              </div>
            )}

            {/* 사진 번호 표시 */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {currentIndex + 1} / {displayPhotos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;