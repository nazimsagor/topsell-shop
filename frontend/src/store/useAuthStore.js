import { create } from 'zustand';
import { authApi } from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,

  init: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return set({ loading: false });
    try {
      const { data } = await authApi.getMe();
      set({ user: data, token, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  loginWithGoogle: async (access_token) => {
    const { data } = await authApi.google({ access_token });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (credentials) => {
    const { data } = await authApi.register(credentials);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
