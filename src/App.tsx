import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InvitationPage from './pages/InvitationPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 메인 홈페이지 - leelee.kr 접속 시 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 그룹별 청첩장 페이지 */}
          <Route path="/invitation/:code" element={<InvitationPage />} />

          {/* 보안 강화된 관리자 로그인 */}
          <Route path="/012486/login" element={<AdminLogin />} />
          
          {/* 보안 강화된 관리자 대시보드 */}
          <Route path="/012486" element={<AdminDashboard />} />
          
          {/* 기존 admin 경로 제거 - 보안상 접근 불가 */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          
          {/* 404 페이지 대신 홈페이지로 리다이렉트 */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;