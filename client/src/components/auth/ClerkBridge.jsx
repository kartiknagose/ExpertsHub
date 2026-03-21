// ClerkBridge — bridges Clerk session state to our custom AuthContext.
// Rendered inside ClerkProvider + AuthProvider so it can read both.

import { useEffect, useContext } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { AuthContext } from '../../context/AuthContextBase';

export function ClerkBridge() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      auth._hydrateFromClerk();
    } else {
      auth._clearSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  return null;
}
