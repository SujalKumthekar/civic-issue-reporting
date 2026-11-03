import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!isMounted) return;

          if (res.ok) {
            const data = await res.json();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            // Token invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch {
          if (!isMounted) return;
          // If profile validation fails, clear stale auth to avoid false "logged-in" UI.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      if (isMounted) setIsLoading(false);
    };
    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (userData, userToken) => {
    setToken(userToken);
    localStorage.setItem('token', userToken);
    // Store user data so it persists across page refreshes
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
