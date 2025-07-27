// App.tsx 파일 전체 내용 수정
// React Router를 사용한 청첩장 앱의 메인 라우팅 설정
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 실제 페이지 컴포넌트들
import InvitationPage from './pages/InvitationPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard'; // ✅ 실제 AdminDashboard 컴포넌트 import 추가

// 홈페이지 컴포넌트
const HomePage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>청첩장 앱에 오신 것을 환영합니다!</h1>
    <p>개발 중인 페이지입니다.</p>
    <div style={{ marginTop: '20px' }}>
      <h3>테스트용 링크:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <a href="/invitation/wedding123" style={{ color: '#007bff', textDecoration: 'none' }}>
          🎊 결혼식 초대 그룹 (/invitation/wedding123)
        </a>
        <a href="/invitation/parent456" style={{ color: '#28a745', textDecoration: 'none' }}>
          👨‍👩‍👧‍👦 부모님 그룹 (/invitation/parent456)
        </a>
        <a href="/invitation/company789" style={{ color: '#6f42c1', textDecoration: 'none' }}>
          🏢 회사 그룹 (/invitation/company789)
        </a>
        <a href="/admin" style={{ color: '#dc3545', textDecoration: 'none' }}>
          🔐 관리자 로그인 (/admin)
        </a>
      </div>
    </div>
    <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h4>현재 완성된 기능:</h4>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li>✅ 청첩장 페이지 (그룹별 조건부 표시)</li>
        <li>✅ 참석 응답 폼 (결혼식 초대 그룹만)</li>
        <li>✅ 오시는 길 정보 (결혼식 초대 그룹만)</li>
        <li>✅ 관리자 로그인 페이지</li>
        <li>✅ 관리자 대시보드 ✨ 수정 완료!</li>
        <li>✅ 그룹 생성 기능</li>
        <li>🔄 포토 갤러리 (개발 예정)</li>
      </ul>
    </div>
  </div>
);

// ❌ 기존 임시 AdminDashboard 컴포넌트 제거
// const AdminDashboard = () => ( ... ) 이 부분을 완전히 삭제

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 메인 홈페이지 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 청첩장 페이지 - 고유 코드별로 다른 청첩장 표시 */}
          <Route path="/invitation/:uniqueCode" element={<InvitationPage />} />
          
          {/* 관리자 로그인 페이지 */}
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* ✅ 관리자 대시보드 - 실제 AdminDashboard 컴포넌트 사용 */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* 잘못된 경로 접근 시 홈페이지로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;