'use client';
import { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

export default function Providers({ children }) {
  const init      = useAuthStore((s) => s.init);
  const user      = useAuthStore((s) => s.user);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', crypto.randomUUID());
    }
    init();
  }, [init]);

  // Only fetch cart when authenticated — avoids 401 redirect for guests
  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return <>{children}</>;
}
