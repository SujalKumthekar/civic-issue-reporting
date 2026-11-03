import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    if (stored && token) {
      try { setAdmin(JSON.parse(stored)); } catch { localStorage.removeItem('adminUser'); }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setAdmin(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      login,
      logout,
      isAuthenticated: !!admin,
      isLoading,
      isDistrictAuthority: admin?.role === 'DISTRICT_AUTHORITY',
      isNagarpalika: admin?.role === 'NAGARPALIKA',
    }}>
      {!isLoading && children}
    </AdminAuthContext.Provider>
  );
};
