import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('careerlaunch_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('careerlaunch_token');
      if (storedToken) {
        try {
          const { data } = await getMe();
          setUser(data.user);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err?.message);
          localStorage.removeItem('careerlaunch_token');
          localStorage.removeItem('careerlaunch_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('careerlaunch_token', data.token);
    localStorage.setItem('careerlaunch_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, role = 'user') => {
    const { data } = await registerUser({ name, email, password, role });
    localStorage.setItem('careerlaunch_token', data.token);
    localStorage.setItem('careerlaunch_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('careerlaunch_token');
    localStorage.removeItem('careerlaunch_user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
