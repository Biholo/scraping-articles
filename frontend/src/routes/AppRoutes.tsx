import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import Profile from '@/features/user/Profile';
import Error from '@/features/Error';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/ui/Loader';
import { useAutoLogin } from '@/api/queries/authQueries';
import { useEffect } from 'react';
import { Marketplace } from '@/features/Marketplace';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  const { refetch: autoLogin, isPending } = useAutoLogin();

  useEffect(() => {
    autoLogin();
  }, [autoLogin]);

  if (isPending) return <Loader />


  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Sidebar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Marketplace />} />
          {/* <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/error" element={<Error />} /> */}
        </Routes>
      </main>
    </div>
  );
};

export default AppRoutes;
