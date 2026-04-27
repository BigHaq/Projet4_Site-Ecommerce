import { useAuthStore } from '../store/authStore.js';
import { authApi } from '../api/auth.js';
import { useToast } from './useToast.js';

export function useAuth() {
  const { user, isAuthenticated, accessToken, refreshToken, setAuth, logout: storeLogout } = useAuthStore();
  const { showToast } = useToast();

  const register = async (data) => {
    const res = await authApi.register(data);
    const { user, accessToken, refreshToken } = res.data.data;
    setAuth(user, accessToken, refreshToken);
    showToast('Bienvenue sur Marché Kora ! 🎉', 'success');
    return user;
  };

  const login = async (data) => {
    const res = await authApi.login(data);
    const { user, accessToken, refreshToken } = res.data.data;
    setAuth(user, accessToken, refreshToken);
    showToast(`Bon retour, ${user.firstName} !`, 'success');
    return user;
  };

  const logout = async () => {
    try { await authApi.logout(refreshToken); } catch {}
    storeLogout();
    showToast('À bientôt !', 'info');
  };

  return { user, isAuthenticated, register, login, logout };
}
