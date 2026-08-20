import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  isLoading: boolean;
  loginAs: (user: User) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const users = await api.getDemoUsers();
        setDemoUsers(users);

        const savedUserId = localStorage.getItem('buildflow_active_user_id') || 'u-pm';
        const found = users.find((u) => u.id === savedUserId) || users[1] || users[0];
        
        if (found) {
          setCurrentUser(found);
          localStorage.setItem('buildflow_active_user_id', found.id);
        }
      } catch (err) {
        console.error('Failed to initialize demo auth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const loginAs = async (user: User) => {
    setIsLoading(true);
    try {
      await api.login(user.id);
      setCurrentUser(user);
      localStorage.setItem('buildflow_active_user_id', user.id);
    } catch (err) {
      console.error('Failed to login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    const targetUser = demoUsers.find((u) => u.role === role);
    if (targetUser) {
      await loginAs(targetUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('buildflow_active_user_id');
    if (demoUsers.length > 0) {
      loginAs(demoUsers[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers,
        isLoading,
        loginAs,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
