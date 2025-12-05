import axiosClient from '@/lib/axiosClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}

export const authApi = {
  // Register
  register: async (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post('/auth/register', {
        email,
        password,
        name,
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      const data = response.data;

      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Store user if provided
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Get user profile
  getProfile: async (): Promise<AuthUser> => {
    try {
      const response = await axiosClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get stored user from localStorage
  getStoredUser: (): AuthUser | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = authApi.getStoredUser();
    return user?.role === 'admin';
  },
};
