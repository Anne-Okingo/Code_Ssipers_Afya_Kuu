'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedPage from './UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'doctor' | 'admin';
  showUnauthorizedPage?: boolean; // If true, shows 404 page instead of redirecting
}

export default function ProtectedRoute({
  children,
  requiredUserType,
  showUnauthorizedPage = false // Default to redirecting instead of showing 404
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [unauthorizedReason, setUnauthorizedReason] = useState<'not_authenticated' | 'wrong_user_type' | 'access_denied'>('not_authenticated');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setUnauthorizedReason('not_authenticated');
        if (showUnauthorizedPage) {
          setIsChecking(false);
          return;
        } else {
          // Redirect to assessment page (login/signup)
          router.push('/assessment');
          return;
        }
      }

      if (requiredUserType && user?.userType !== requiredUserType) {
        setUnauthorizedReason('wrong_user_type');
        if (showUnauthorizedPage) {
          setIsChecking(false);
          return;
        } else {
          // Redirect to correct dashboard based on user type
          if (user?.userType === 'doctor') {
            router.push('/dashboard/doctor');
          } else if (user?.userType === 'admin') {
            router.push('/dashboard/admin');
          }
          return;
        }
      }

      setIsChecking(false);
    }
  }, [isLoading, isAuthenticated, user, requiredUserType, router, showUnauthorizedPage]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Afya Kuu</h2>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized page if user doesn't have access
  if (!isAuthenticated || (requiredUserType && user?.userType !== requiredUserType)) {
    return <UnauthorizedPage reason={unauthorizedReason} />;
  }

  // If we reach here, user is authenticated and has correct permissions
  return <>{children}</>;
}
