// 관리자 대시보드 페이지
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRsvps } from '../services/invitationService';
import { RsvpResponse, InvitationGroup, GroupType } from '../types';
import CreateGroupModal from '../components/CreateGroupModal';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // 모달 상태
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 통계 상태
  const [stats, setStats] = useState({
    totalResponses: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalGroups: 0
  });

  // 컴포넌트 마운트 시 인증 확인 및 데이터 로드
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // 인증 토큰 확인
      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');
      
      if (!token) {
        navigate('/admin');
        return;
      }

      if (user) {
        setAdminUser(JSON.parse(user));
      }

      // 데이터 로드
      await loadAllData();
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // 모든 데이터 로드
  // 모든 데이터 로드 부분을 다음과 같이 수정
const loadAllData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // ===== 임시 데이터로 대체 (백엔드 연결 전까지) =====
    // const rsvpData = await getAllRsvps(); // 실제 API 호출 주석 처리
    
    // 임시 RSVP 데이터
    const mockRsvps = [
      {
        id: '1',
        responderName: '김철수',
        isAttending: true,
        adultCount: 2,
        childrenCount: 1,
        createdAt: '2025-01-15T10:30:00Z',
        groupId: '1'
      },
      {
        id: '2', 
        responderName: '이영희',
        isAttending: true,
        adultCount: 1,
        childrenCount: 0,
        createdAt: '2025-01-16T14:20:00Z',
        groupId: '1'
      },
      {
        id: '3',
        responderName: '박민수',
        isAttending: false,
        adultCount: 0,
        childrenCount: 0,
        createdAt: '2025-01-17T09:15:00Z',
        groupId: '2'
      }
    ];
    
    setRsvps(mockRsvps);
    
    // 기존 그룹 데이터는 그대로 유지
    const mockGroups = [
      {
        id: '1',
        groupName: '신랑 대학 동기',
        groupType: GroupType.WEDDING_GUEST,
        uniqueCode: 'ABC123'
      },
      {
        id: '2', 
        groupName: '신부 회사 동료',
        groupType: GroupType.WEDDING_GUEST,
        uniqueCode: 'DEF456'
      },
      {
        id: '3',
        groupName: '부모님',
        groupType: GroupType.PARENTS_GUEST,
        uniqueCode: 'GHI789'
      }
    ];
    setGroups(mockGroups);
    
    // 통계 계산
    calculateStats(mockRsvps, mockGroups);
    
  } catch (error: any) {
    console.error('데이터 로드 실패:', error);
    setError(error.message || '데이터를 불러오는데 실패했습니다.');
  } finally {
    setLoading(false);
  }
};

  // 통계 계산
  const calculateStats = (rsvpData: RsvpResponse[], groupData: InvitationGroup[]) => {
    const attending = rsvpData.filter(rsvp => rsvp.isAttending);
    const notAttending = rsvpData.filter(rsvp => !rsvp.isAttending);
    
    const totalAdults = attending.reduce((sum, rsvp) => sum + rsvp.adultCount, 0);
    const totalChildren = attending.reduce((sum, rsvp) => sum + rsvp.childrenCount, 0);
    
    setStats({
      totalResponses: rsvpData.length,
      attendingCount: attending.length,
      notAttendingCount: notAttending.length,
      totalAdults,
      totalChildren,
      totalGroups: groupData.length
    });
  };

  // 그룹 생성 성공 처리
  const handleGroupCreateSuccess = (newGroup: InvitationGroup) => {
    // 그룹 목록에 추가
    setGroups(prev => [...prev, newGroup]);
    
    // 통계 업데이트
    calculateStats(rsvps, [...groups, newGroup]);
    
    // 성공 메시지 표시
    setSuccessMessage(`"${newGroup.groupName}" 그룹이 성공적으로 생성되었습니다!`);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // 그룹 타입별 아이콘 반환
  const getGroupTypeIcon = (groupType: GroupType): string => {
    switch (groupType) {
      case GroupType.WEDDING_GUEST:
        return '🎊';
      case GroupType.PARENTS_GUEST:
        return '👨‍👩‍👧‍👦';
      case GroupType.COMPANY_GUEST:
        return '🏢';
      default:
        return '📋';
    }
  };

  // 그룹 타입별 이름 반환
  const getGroupTypeName = (groupType: GroupType): string => {
    switch (groupType) {
      case GroupType.WEDDING_GUEST:
        return '결혼식 초대';
      case GroupType.PARENTS_GUEST:
        return '부모님';
      case GroupType.COMPANY_GUEST:
        return '회사';
      default:
        return '기타';
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  // 데이터 새로고침
  const handleRefresh = () => {
    loadAllData();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 성공 메시지 */}
        {successMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            padding: '15px 20px',
            maxWidth: '90%',
            textAlign: 'center',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* 헤더 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px 30px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              color: '#2c3e50', 
              margin: '0 0 5px 0',
              fontWeight: 'bold'
            }}>
              관리자 대시보드
            </h1>
            {adminUser && (
              <p style={{ 
                color: '#6c757d', 
                fontSize: '14px',
                margin: 0
              }}>
                안녕하세요, {adminUser.username}님
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              🔄 새로고침
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {/* 총 그룹 수 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6f42c1', marginBottom: '5px' }}>
              {stats.totalGroups}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>총 그룹 수</div>
          </div>

          {/* 총 응답 수 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
              {stats.totalResponses}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>총 응답 수</div>
          </div>

          {/* 참석 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
              {stats.attendingCount}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>참석</div>
          </div>

          {/* 불참석 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
              {stats.notAttendingCount}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>불참석</div>
          </div>

          {/* 총 참석 인원 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', marginBottom: '5px' }}>
              {stats.totalAdults + stats.totalChildren}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              총 참석 인원<br />
              <span style={{ fontSize: '12px' }}>
                (성인 {stats.totalAdults}명, 자녀 {stats.totalChildren}명)
              </span>
            </div>
          </div>
        </div>

        {/* 그룹 관리 섹션 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#2c3e50',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👥 초대 그룹 관리
            </h2>
            
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ➕ 새 그룹 생성
            </button>
          </div>

          {groups.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
              <p>아직 생성된 그룹이 없습니다.</p>
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                첫 번째 그룹 만들기
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>
                      {getGroupTypeIcon(group.groupType as GroupType)}
                    </span>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        margin: '0 0 4px 0'
                      }}>
                        {group.groupName}
                      </h3>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {getGroupTypeName(group.groupType as GroupType)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                      고유 URL
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      fontFamily: 'monospace',
                      color: '#495057',
                      wordBreak: 'break-all'
                    }}>
                      /invitation/{group.uniqueCode}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <button style={{
                      flex: 1,
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      🔗 링크 복사
                    </button>
                    <button style={{
                      flex: 1,
                      backgroundColor: '#ffc107',
                      color: '#212529',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      ✏️ 수정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 참석 응답 현황 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            color: '#2c3e50',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 참석 응답 현황
          </h2>

          {rsvps.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <p>아직 등록된 참석 응답이 없습니다.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      이름
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      참석 여부
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      성인
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      자녀
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold'
                    }}>
                      응답 일시
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp, index) => (
                    <tr 
                      key={rsvp.id || index}
                      style={{
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                      }}
                    >
                      <td style={{ 
                        padding: '12px',
                        fontWeight: '500'
                      }}>
                        {rsvp.responderName}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          backgroundColor: rsvp.isAttending ? '#d4edda' : '#f8d7da',
                          color: rsvp.isAttending ? '#155724' : '#721c24',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {rsvp.isAttending ? '✅ 참석' : '❌ 불참석'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        {rsvp.adultCount}명
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        {rsvp.childrenCount}명
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#6c757d'
                      }}>
                        {rsvp.createdAt ? formatDate(rsvp.createdAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 개발 정보 (임시) */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e2e3e5',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>개발 정보:</strong><br />
          Phase 2 진행 중: 그룹 관리 기능이 추가되었습니다. 다음 단계에서는 오시는 길 정보, 포토 갤러리 등을 구현할 예정입니다.
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={handleGroupCreateSuccess}
      />
    </div>
  );
};

export default AdminDashboard;