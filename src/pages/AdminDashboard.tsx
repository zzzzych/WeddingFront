// 관리자 대시보드 페이지
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRsvps } from "../services/invitationService";
import { RsvpResponse, InvitationGroup, GroupType } from "../types";
import CreateGroupModal from "../components/CreateGroupModal";
import GreetingEditor from "../components/GreetingEditor";
import GroupFeatureSettings from '../components/GroupFeatureSettings';


// 그룹 기능 설정 인터페이스 추가
interface GroupFeatures {
  showRsvpForm: boolean;
  showAccountInfo: boolean;
  showShareButton: boolean;
  showVenueInfo: boolean;
  showPhotoGallery: boolean;
  showCeremonyProgram: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [editingGroupGreeting, setEditingGroupGreeting] = useState<
    string | null
  >(null);
  const [isUpdatingGreeting, setIsUpdatingGreeting] = useState<boolean>(false);
  const [editingGroupFeatures, setEditingGroupFeatures] = useState<string | null>(null);
const [isUpdatingFeatures, setIsUpdatingFeatures] = useState<boolean>(false);
const [groupFeatures, setGroupFeatures] = useState<{ [groupId: string]: GroupFeatures }>({
  '1': {
    showRsvpForm: true,
    showAccountInfo: false,
    showShareButton: false,
    showVenueInfo: true,
    showPhotoGallery: true,
    showCeremonyProgram: true
  },
  '2': {
    showRsvpForm: true,
    showAccountInfo: false,
    showShareButton: false,
    showVenueInfo: true,
    showPhotoGallery: true,
    showCeremonyProgram: true
  },
  '3': {
    showRsvpForm: false,
    showAccountInfo: true,
    showShareButton: true,
    showVenueInfo: false,
    showPhotoGallery: true,
    showCeremonyProgram: false
  }
});

// 그룹 기능 설정 편집 시작
const handleGroupFeaturesEdit = (groupId: string) => {
  setEditingGroupFeatures(groupId);
};

// 그룹 기능 설정 저장
const handleGroupFeaturesSave = async (groupId: string, features: GroupFeatures) => {
  try {
    setIsUpdatingFeatures(true);
    
    // ===== 임시 처리 (백엔드 연결 시 실제 API 호출) =====
    // const response = await updateGroupFeatures(groupId, features);
    
    // 임시로 로컬 상태 업데이트
    setGroupFeatures(prev => ({
      ...prev,
      [groupId]: features
    }));
    
    // 성공 메시지
    setSuccessMessage('그룹 기능 설정이 성공적으로 업데이트되었습니다!');
    setTimeout(() => setSuccessMessage(null), 3000);
    
    // 편집 모드 종료
    setEditingGroupFeatures(null);
    
  } catch (error: any) {
    console.error('그룹 기능 설정 실패:', error);
    setError(error.message || '그룹 기능 설정에 실패했습니다.');
  } finally {
    setIsUpdatingFeatures(false);
  }
};

// 그룹 기능 설정 편집 취소
const handleGroupFeaturesCancel = () => {
  setEditingGroupFeatures(null);
};

  // 그룹별 인사말 수정 함수
  const handleGroupGreetingEdit = (groupId: string) => {
    setEditingGroupGreeting(groupId);
  };

  // 그룹별 인사말 저장 함수
  const handleGroupGreetingSave = async (
    groupId: string,
    newGreeting: string
  ) => {
    try {
      setIsUpdatingGreeting(true);

      // ===== 임시 처리 (백엔드 연결 시 실제 API 호출) =====
      // const response = await updateGroupGreeting(groupId, newGreeting);

      // 임시로 로컬 상태 업데이트
      const updatedGroups = groups.map((group) =>
        group.id === groupId
          ? { ...group, greetingMessage: newGreeting }
          : group
      );
      setGroups(updatedGroups);

      // 성공 메시지 표시
      setSuccessMessage("인사말이 성공적으로 수정되었습니다!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // 편집 모드 종료
      setEditingGroupGreeting(null);
    } catch (error: any) {
      console.error("인사말 수정 실패:", error);
      setError(error.message || "인사말 수정에 실패했습니다.");
    } finally {
      setIsUpdatingGreeting(false);
    }
  };

  // 그룹별 인사말 편집 취소 함수
  const handleGroupGreetingCancel = () => {
    setEditingGroupGreeting(null);
  };
  // 모달 상태
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] =
    useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 통계 상태
  const [stats, setStats] = useState({
    totalResponses: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalGroups: 0,
  });

  // 컴포넌트 마운트 시 인증 확인 및 데이터 로드
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // 인증 토큰 확인
      const token = localStorage.getItem("adminToken");
      const user = localStorage.getItem("adminUser");

      if (!token) {
        navigate("/admin");
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

  // AdminDashboard.tsx의 loadAllData 함수 수정
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 임시 RSVP 데이터 (기존과 동일)
      const mockRsvps: RsvpResponse[] = [
        {
          id: "1",
          responderName: "김철수",
          isAttending: true,
          adultCount: 2,
          childrenCount: 1,
          createdAt: "2025-01-15T10:30:00Z",
          groupId: "1",
        },
        {
          id: "2",
          responderName: "이영희",
          isAttending: true,
          adultCount: 1,
          childrenCount: 0,
          createdAt: "2025-01-16T14:20:00Z",
          groupId: "1",
        },
        {
          id: "3",
          responderName: "박민수",
          isAttending: false,
          adultCount: 0,
          childrenCount: 0,
          createdAt: "2025-01-17T09:15:00Z",
          groupId: "2",
        },
        {
          id: "4",
          responderName: "정미영",
          isAttending: true,
          adultCount: 2,
          childrenCount: 2,
          createdAt: "2025-01-18T11:45:00Z",
          groupId: "1",
        },
        {
          id: "5",
          responderName: "최준호",
          isAttending: true,
          adultCount: 1,
          childrenCount: 0,
          createdAt: "2025-01-19T16:30:00Z",
          groupId: "3",
        },
        {
          id: "6",
          responderName: "윤서희",
          isAttending: false,
          adultCount: 0,
          childrenCount: 0,
          createdAt: "2025-01-20T08:20:00Z",
          groupId: "2",
        },
      ];

      setRsvps(mockRsvps);

      // ✅ 그룹 데이터에 개별 인사말 추가
      const mockGroups: InvitationGroup[] = [
        {
          id: "1",
          groupName: "신랑 대학 동기",
          groupType: GroupType.WEDDING_GUEST,
          uniqueCode: "wedding123",
          greetingMessage:
            "소중한 친구들을 저희 결혼식에 초대합니다. 여러분의 축복 속에서 더욱 의미있는 하루가 되길 바랍니다.",
        },
        {
          id: "2",
          groupName: "신부 회사 동료",
          groupType: GroupType.WEDDING_GUEST,
          uniqueCode: "company789",
          greetingMessage:
            "함께 일하며 소중한 인연을 맺어온 동료 여러분을 저희 결혼식에 초대합니다. 새로운 시작을 함께 축복해주세요.",
        },
        {
          id: "3",
          groupName: "부모님",
          groupType: GroupType.PARENTS_GUEST,
          uniqueCode: "parent456",
          greetingMessage:
            "오늘까지 키워주시고 사랑해주신 부모님께 깊은 감사를 드리며, 저희의 새로운 출발을 함께 기뻐해주시길 바랍니다.",
        },
      ];

      setGroups(mockGroups);
      calculateStats(mockRsvps, mockGroups);

      console.log("✅ 그룹별 개별 인사말 데이터 로드 완료:", {
        rsvps: mockRsvps.length,
        groups: mockGroups.length,
      });
    } catch (error: any) {
      console.error("❌ 데이터 로드 실패:", error);
      setError(error.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const calculateStats = (
    rsvpData: RsvpResponse[],
    groupData: InvitationGroup[]
  ) => {
    const attending = rsvpData.filter((rsvp) => rsvp.isAttending);
    const notAttending = rsvpData.filter((rsvp) => !rsvp.isAttending);

    const totalAdults = attending.reduce(
      (sum, rsvp) => sum + rsvp.adultCount,
      0
    );
    const totalChildren = attending.reduce(
      (sum, rsvp) => sum + rsvp.childrenCount,
      0
    );

    setStats({
      totalResponses: rsvpData.length,
      attendingCount: attending.length,
      notAttendingCount: notAttending.length,
      totalAdults,
      totalChildren,
      totalGroups: groupData.length,
    });
  };

  // 그룹 생성 성공 처리
  const handleGroupCreateSuccess = (newGroup: InvitationGroup) => {
    // 그룹 목록에 추가
    setGroups((prev) => [...prev, newGroup]);

    // 통계 업데이트
    calculateStats(rsvps, [...groups, newGroup]);

    // 성공 메시지 표시
    setSuccessMessage(
      `"${newGroup.groupName}" 그룹이 성공적으로 생성되었습니다!`
    );

    // 3초 후 메시지 제거
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // 그룹 타입별 아이콘 반환
  const getGroupTypeIcon = (groupType: GroupType): string => {
    switch (groupType) {
      case GroupType.WEDDING_GUEST:
        return "🎊";
      case GroupType.PARENTS_GUEST:
        return "👨‍👩‍👧‍👦";
      case GroupType.COMPANY_GUEST:
        return "🏢";
      default:
        return "📋";
    }
  };

  // 그룹 타입별 이름 반환
  const getGroupTypeName = (groupType: GroupType): string => {
    switch (groupType) {
      case GroupType.WEDDING_GUEST:
        return "결혼식 초대";
      case GroupType.PARENTS_GUEST:
        return "부모님";
      case GroupType.COMPANY_GUEST:
        return "회사";
      default:
        return "기타";
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  // 데이터 새로고침
  const handleRefresh = () => {
    loadAllData();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* 성공 메시지 */}
        {successMessage && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb",
              borderRadius: "6px",
              padding: "15px 20px",
              maxWidth: "90%",
              textAlign: "center",
              zIndex: 1000,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            ✅ {successMessage}
          </div>
        )}

        {/* 헤더 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px 30px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                color: "#2c3e50",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              관리자 대시보드
            </h1>
            {adminUser && (
              <p
                style={{
                  color: "#6c757d",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                안녕하세요, {adminUser.username}님
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🔄 새로고침
            </button>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 통계 카드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          {/* 총 그룹 수 */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#6f42c1",
                marginBottom: "5px",
              }}
            >
              {stats.totalGroups}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>총 그룹 수</div>
          </div>

          {/* 총 응답 수 */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#007bff",
                marginBottom: "5px",
              }}
            >
              {stats.totalResponses}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>총 응답 수</div>
          </div>

          {/* 참석 */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#28a745",
                marginBottom: "5px",
              }}
            >
              {stats.attendingCount}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>참석</div>
          </div>

          {/* 불참석 */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#dc3545",
                marginBottom: "5px",
              }}
            >
              {stats.notAttendingCount}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>불참석</div>
          </div>

          {/* 총 참석 인원 */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#17a2b8",
                marginBottom: "5px",
              }}
            >
              {stats.totalAdults + stats.totalChildren}
            </div>
            <div style={{ fontSize: "14px", color: "#6c757d" }}>
              총 참석 인원
              <br />
              <span style={{ fontSize: "12px" }}>
                (성인 {stats.totalAdults}명, 자녀 {stats.totalChildren}명)
              </span>
            </div>
          </div>
        </div>

        {/* 그룹 관리 섹션 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                color: "#2c3e50",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              👥 초대 그룹 관리
            </h2>

            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ➕ 새 그룹 생성
            </button>
          </div>

          {groups.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#6c757d",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>👥</div>
              <p>아직 생성된 그룹이 없습니다.</p>
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                {/*첫 번째 그룹 만들기*/}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "15px",
              }}
            >
              {groups.map((group) => (
  <div key={group.id} style={{ marginBottom: '20px' }}>
    {/* 기본 그룹 카드 */}
    <div
      style={{
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}
    >
      {/* 그룹 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>
          {getGroupTypeIcon(group.groupType)}
        </span>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>
            {group.groupName}
          </h4>
          <span style={{
            fontSize: '12px',
            color: 'white',
            backgroundColor: group.groupType === GroupType.WEDDING_GUEST ? '#007bff' : 
                            group.groupType === GroupType.PARENTS_GUEST ? '#28a745' : '#6f42c1',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {getGroupTypeName(group.groupType)}
          </span>
        </div>
      </div>

      {/* 그룹별 인사말 표시 및 편집 */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#6c757d'
          }}>
            💝 그룹 인사말
          </span>
          
          {editingGroupGreeting !== group.id && (
            <button
              onClick={() => handleGroupGreetingEdit(group.id!)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #007bff',
                color: '#007bff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ✏️ 수정
            </button>
          )}
        </div>
        
        {editingGroupGreeting === group.id ? (
          // 인사말 편집 모드
          <GreetingEditor
            currentGreeting={group.greetingMessage}
            onSave={(newGreeting) => handleGroupGreetingSave(group.id!, newGreeting)}
            onCancel={handleGroupGreetingCancel}
            isLoading={isUpdatingGreeting}
          />
        ) : (
          // 인사말 보기 모드
          <div style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#495057',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '60px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {group.greetingMessage}
            {group.greetingMessage.length > 80 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'linear-gradient(to right, transparent, #f8f9fa)',
                padding: '0 5px',
                fontSize: '11px',
                color: '#6c757d'
              }}>
                ...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 활성화된 기능 요약 */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #bbdefb',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#1565c0'
          }}>
            ⚙️ 활성화된 기능
          </span>
          
          {editingGroupFeatures !== group.id && (
            <button
              onClick={() => handleGroupFeaturesEdit(group.id!)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #1565c0',
                color: '#1565c0',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ⚙️ 설정
            </button>
          )}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#1976d2',
          lineHeight: '1.4'
        }}>
          {Object.entries(groupFeatures[group.id!] || {})
            .filter(([_, enabled]) => enabled)
            .map(([key, _]) => {
              const featureNames: { [key: string]: string } = {
                showRsvpForm: '📝 참석응답',
                showAccountInfo: '💳 계좌정보',
                showShareButton: '📤 공유',
                showVenueInfo: '📍 오시는길',
                showPhotoGallery: '📸 갤러리',
                showCeremonyProgram: '📋 본식순서'
              };
              return featureNames[key];
            })
            .join(' • ') || '활성화된 기능이 없습니다'}
        </div>
      </div>

      {/* 고유 URL 정보 */}
      <div style={{
        fontSize: '12px',
        color: '#6c757d',
        marginBottom: '12px'
      }}>
        <strong>고유 URL:</strong><br />
        /invitation/{group.uniqueCode}
      </div>

      {/* 버튼 그룹 */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button style={{
          flex: 1,
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}>
          📋 링크 복사
        </button>
        <button style={{
          flex: 1,
          backgroundColor: '#ffc107',
          color: '#212529',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}>
          ⚙️ 수정
        </button>
      </div>
    </div>

    {/* 그룹 기능 설정 편집 모드 */}
    {editingGroupFeatures === group.id && (
      <GroupFeatureSettings
        group={group}
        currentFeatures={groupFeatures[group.id!] || {
          showRsvpForm: false,
          showAccountInfo: false,
          showShareButton: false,
          showVenueInfo: false,
          showPhotoGallery: true,
          showCeremonyProgram: false
        }}
        onSave={handleGroupFeaturesSave}
        onCancel={handleGroupFeaturesCancel}
        isLoading={isUpdatingFeatures}
      />
    )}
  </div>
))}

        {/* 참석 응답 현황 테이블 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              color: "#2c3e50",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📋 참석 응답 현황
          </h2>

          {rsvps.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#6c757d",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
              <p>아직 등록된 참석 응답이 없습니다.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "bold",
                      }}
                    >
                      이름
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "bold",
                      }}
                    >
                      참석 여부
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "bold",
                      }}
                    >
                      성인
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "bold",
                      }}
                    >
                      자녀
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "bold",
                      }}
                    >
                      응답 일시
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp, index) => (
                    <tr
                      key={rsvp.id || index}
                      style={{
                        borderBottom: "1px solid #dee2e6",
                        backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {rsvp.responderName}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: rsvp.isAttending
                              ? "#d4edda"
                              : "#f8d7da",
                            color: rsvp.isAttending ? "#155724" : "#721c24",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {rsvp.isAttending ? "✅ 참석" : "❌ 불참석"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {rsvp.adultCount}명
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {rsvp.childrenCount}명
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontSize: "13px",
                          color: "#6c757d",
                        }}
                      >
                        {rsvp.createdAt ? formatDate(rsvp.createdAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 개발 정보 (임시) */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e2e3e5",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>개발 정보:</strong>
          <br />
          Phase 2 진행 중: 그룹 관리 기능이 추가되었습니다. 다음 단계에서는
          오시는 길 정보, 포토 갤러리 등을 구현할 예정입니다.
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
