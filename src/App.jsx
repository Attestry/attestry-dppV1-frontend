import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Screen1PublicPassport from './pages/Screen1PublicPassport';
import Screen2Login from './pages/Screen2Login';
import Screen3RetailIssue from './pages/Screen3RetailIssue';
import Screen4Claim from './pages/Screen4Claim';
import Screen5MyPassports from './pages/Screen5MyPassports';
import Screen6TransferStart from './pages/Screen6TransferStart';
import Screen7TransferAccept from './pages/Screen7TransferAccept';
import Screen8ProviderSubmit from './pages/Screen8ProviderSubmit';
import Screen9ServiceApproval from './pages/Screen9ServiceApproval';
import ScreenABrandMint from './pages/ScreenABrandMint';
import ScreenBBrandRelease from './pages/ScreenBBrandRelease';
import ScreenV2Register from './pages/ScreenV2Register';
import Screen4ClaimEntry from './pages/Screen4ClaimEntry';
import AdminApproval from './pages/AdminApproval';
import AdminUserApproval from './pages/AdminUserApproval';
import ScreenSignup from './pages/ScreenSignup';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/p/:qrPublicCode" element={<Screen1PublicPassport />} />
        <Route path="*" element={
          <>
            <div className="page-container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Screen2Login />} />
                <Route path="/signup" element={<ScreenSignup />} />
                <Route path="/retail/issue-claim" element={<ProtectedRoute allowedRoles={['RETAIL']}><Screen3RetailIssue /></ProtectedRoute>} />
                <Route path="/claim-entry" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen4ClaimEntry /></ProtectedRoute>} />
                <Route path="/claim/:token" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen4Claim /></ProtectedRoute>} />
                <Route path="/me/passports" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen5MyPassports /></ProtectedRoute>} />
                <Route path="/transfer/start/:passportId" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen6TransferStart /></ProtectedRoute>} />
                <Route path="/transfer/:token" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen7TransferAccept /></ProtectedRoute>} />
                <Route path="/transfer/code" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><Screen7TransferAccept /></ProtectedRoute>} />
                <Route path="/provider/service/submit" element={<ProtectedRoute allowedRoles={['PROVIDER']}><Screen8ProviderSubmit /></ProtectedRoute>} />
                <Route path="/service/:caseId" element={<ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'PROVIDER']}><Screen9ServiceApproval /></ProtectedRoute>} />
                <Route path="/brand/mint" element={<ProtectedRoute allowedRoles={['BRAND']}><ScreenABrandMint /></ProtectedRoute>} />
                <Route path="/brand/release" element={<ProtectedRoute allowedRoles={['BRAND']}><ScreenBBrandRelease /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute allowedRoles={['OWNER', 'RETAIL']}><ScreenV2Register /></ProtectedRoute>} />
                <Route path="/admin/approval" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApproval /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUserApproval /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
