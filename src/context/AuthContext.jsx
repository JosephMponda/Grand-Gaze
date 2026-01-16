import { createContext, useState, useEffect, useContext } from 'react';
import { institutionAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await institutionAPI.getMe();
      setInstitution(data.institution);
    } catch (error) {
      setInstitution(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await institutionAPI.login(credentials);
    localStorage.setItem('token', data.token);
    setInstitution(data.institution);
    return data;
  };

  const logout = async () => {
    await institutionAPI.logout();
    localStorage.removeItem('token');
    setInstitution(null);
  };

  const updateInstitution = (updatedData) => {
    setInstitution(updatedData);
  };

  return (
    <AuthContext.Provider value={{ institution, login, logout, updateInstitution, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
