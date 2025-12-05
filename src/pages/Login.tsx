import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import { BookOpen } from 'lucide-react';

type Role = 'admin' | 'member';

interface User {
  email: string;
  password: string;
  role: Role;
}

const ADMIN_EMAIL = "superadmin@library.com";

export default function Login() {
  const { login } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //  Get all users
  const getUsers = (): User[] => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  };

  //  Save user
  const saveUser = (user: User) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  };

  //  REGISTER (AUTO MEMBER, EXCEPT SECRET ADMIN EMAIL)
  const handleRegister = () => {
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    const users = getUsers();

    //  Email must be unique
    if (users.find(u => u.email === email)) {
      setError('Email already exists');
      return;
    }

    //  Prevent registering admin unless it's the secret email
    let role: Role = 'member';

    if (email === ADMIN_EMAIL) {
      if (users.find(u => u.role === 'admin')) {
        setError('Admin already exists');
        return;
      }
      role = 'admin';
    }

    saveUser({ email, password, role });

    alert('✅ Registration successful! You can now login.');
    setIsRegister(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    const users = getUsers();
    const user = users.find(
      u => u.email === email && u.password === password
    );

    setTimeout(() => {
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      login(user.role, {
        email: user.email,
        name: user.email.split('@')[0],
        role: user.role,
      });

      setLoading(false);
      navigate(user.role === 'admin' ? '/' : '/user/catalog');
    }, 500);
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
            onChange={e => setEmail(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
