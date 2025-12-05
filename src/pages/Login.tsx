import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import axiosClient from '@/lib/axiosClient';
import { BookOpen } from 'lucide-react';

type Role = 'admin' | 'member';

interface User {
  email: string;
  password: string;
  name?: string;
  role: Role;
}

const ADMIN_EMAIL = 'superadmin@library.com';

export default function Login() {
  const { login } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //  Get all users (fallback for local storage)
  const getUsers = (): User[] => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  };

  //  Save user (local storage)
  const saveUser = (user: User) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  };

  //  REGISTER (AUTO MEMBER, EXCEPT SECRET ADMIN EMAIL)
  const handleRegister = async () => {
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Determine role based on email
      let role: Role = 'member';
      if (email === ADMIN_EMAIL) {
        role = 'admin';
      }

      // Call backend registration
      const response = await axiosClient.post('/auth/register', {
        email,
        password,
        name: email.split('@')[0],
        role,
      });

      if (response.status === 201) {
        alert('✅ Registration successful! You can now login.');
        setIsRegister(false);
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call backend login
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update role context
      login(user.role, {
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Route based on role
      navigate(user.role === 'admin' ? '/' : '/user/catalog');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-md border border-border">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            {isRegister ? 'Create Account' : 'Login'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRegister ? 'Register a new user' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Buttons */}
          {isRegister ? (
            <button
              onClick={handleRegister}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              Register
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          )}

          {/* Switch */}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="w-full text-sm text-blue-500 text-center"
          >
            {isRegister
              ? 'Already have an account? Login'
              : 'Don’t have an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
