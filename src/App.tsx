/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { FriendRequestsPage } from './pages/FriendRequestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { cn } from './lib/utils';
import { useEffect } from 'react';
import { notificationService } from './lib/notificationService';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Layout } from './components/layout/Layout';
import { ToastContainer } from './components/ui/Toast';
import { IncomingCallModal } from './components/video/IncomingCallModal';
import { CallOverlay } from './components/video/CallOverlay';

function AppRoutes() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.requestPermission();
    }
  }, [isAuthenticated]);

  return (
    <div className={cn('min-h-[100dvh] w-full transition-colors duration-300', theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50')}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Protected Routes with Persistent Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/requests" element={<FriendRequestsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <IncomingCallModal />
      <CallOverlay />
    </div>
  );
}


export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}
