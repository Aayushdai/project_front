import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';  // ✅ default import
import AuditLogs from './AuditLogs';
import ManageBranch from './ManageBranch';
import MyProfile from './MyProfile';
import SystemOverview from './SystemOverview';
import SystemSetting from './SystemSetting';
import FinancialReports from './FinancialReports';
import UserManagement from './UserManagement';

// Import the root CSS file
import './index.css';

function MyRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/manage-branch" element={<ManageBranch />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/system-overview" element={<SystemOverview />} />
        <Route path="/system-setting" element={<SystemSetting />} />
        <Route path="/financial-report" element={<FinancialReports />} />
        <Route path="/user-management" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default MyRoutes;
