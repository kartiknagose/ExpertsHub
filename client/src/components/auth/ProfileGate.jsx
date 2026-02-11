// Profile completion gate for authenticated users

import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCustomerProfile } from '../../api/customers';
import { getMyWorkerProfile } from '../../api/workers';

const customerPaths = ['/profile/setup', '/profile'];
const workerPaths = ['/worker/profile/setup', '/worker/setup-profile', '/worker/profile'];

const isPathAllowed = (path, allowed) => allowed.some((allowedPath) => path.startsWith(allowedPath));

export function ProfileGate({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    let active = true;

    const checkProfile = async () => {
      if (!isAuthenticated || !user?.role) {
        if (active) {
          setChecking(false);
        }
        return;
      }

      try {
        if (user.role === 'CUSTOMER') {
          const data = await getCustomerProfile();
          const hasAddress = Boolean(data?.user?.addresses?.length);
          if (active) {
            setNeedsProfile(!hasAddress);
          }
        } else if (user.role === 'WORKER') {
          const data = await getMyWorkerProfile();
          if (active) {
            setNeedsProfile(!data?.profile);
          }
        } else {
          if (active) {
            setNeedsProfile(false);
          }
        }
      } catch {
        if (active) {
          setNeedsProfile(true);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkProfile();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated || checking) {
    return children;
  }

  const gateKey = user?.id ? `profile-setup-shown:${user.id}` : null;
  const hasShownGate = gateKey ? localStorage.getItem(gateKey) === 'true' : false;

  if (needsProfile && !hasShownGate) {
    if (user?.role === 'CUSTOMER' && !isPathAllowed(location.pathname, customerPaths)) {
      localStorage.setItem(gateKey, 'true');
      return <Navigate to="/profile/setup" replace />;
    }
    if (user?.role === 'WORKER' && !isPathAllowed(location.pathname, workerPaths)) {
      localStorage.setItem(gateKey, 'true');
      return <Navigate to="/worker/profile/setup" replace />;
    }
  }

  return children;
}
