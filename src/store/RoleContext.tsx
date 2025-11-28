import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
}

interface RoleContextType {
  role: 'admin' | 'member' | null;
  user: User | null;
  login: (userRole: 'admin' | 'member', userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'admin' | 'member' | null>(() => {
    return (localStorage.getItem('userRole') as 'admin' | 'member') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  });

  const login = (userRole: 'admin' | 'member', userData: User) => {
    setRole(userRole);
    setUser(userData);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
  };

  return (
    <RoleContext.Provider 
      value={{ 
        role, 
        user, 
        login, 
        logout, 
        isAuthenticated: !!role 
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};