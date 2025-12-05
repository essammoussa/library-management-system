import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { authApi } from '@/api/authApi';

// Define the structure of a User object
interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
}

// Define what the RoleContext will provide to the app
interface RoleContextType {
  role: 'admin' | 'member' | null; // Current role of the user
  user: User | null; // Current user info
  login: (userRole: 'admin' | 'member', userData: User) => void; // Login function
  logout: () => void; // Logout function
  isAuthenticated: boolean; // Quick check if user is logged in
}

// Create the context with undefined as default (will throw error if used without provider)
const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Provider component to wrap your app and give access to role context
export const RoleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for role, initialized from localStorage if available
  const [role, setRole] = useState<'admin' | 'member' | null>(() => {
    return (localStorage.getItem('userRole') as 'admin' | 'member') || null;
  });

  // State for user, initialized from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  });

  // State to track if we've checked localStorage/token on mount
  const [isReady, setIsReady] = useState(false);

  // On mount, check if there's a stored auth token
  useEffect(() => {
    const initializeAuth = () => {
      const token = authApi.getToken();
      const storedUser = authApi.getStoredUser();

      if (token && storedUser) {
        // Restore from stored auth data
        setRole(storedUser.role);
        setUser(storedUser);
        localStorage.setItem('userRole', storedUser.role);
        localStorage.setItem('userData', JSON.stringify(storedUser));
      }
      setIsReady(true);
    };

    initializeAuth();
  }, []);

  // Function to log in user: sets state and localStorage
  const login = (userRole: 'admin' | 'member', userData: User) => {
    setRole(userRole);
    setUser(userData);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  // Function to log out user: clears state and localStorage
  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Don't render routes until we've checked auth status
  if (!isReady) {
    return <div>Loading...</div>;
  }

  // Provide all context values to children components
  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        login,
        logout,
        isAuthenticated: !!authApi.getToken(), // Check for actual JWT token
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

// Custom hook to use RoleContext easily in components
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider'); // Guard against missing provider
  }
  return context;
};
