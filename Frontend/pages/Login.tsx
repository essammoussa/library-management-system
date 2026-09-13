import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import axiosClient from '@/lib/axiosClient';

type Role = 'admin' | 'member';

const ADMIN_EMAIL = "superadmin@library.com";

export default function Login() {
  const { login } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-switch to register if mode=register is in URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsRegister(true);
    }
  }, [location]);

  // REGISTER (AUTO MEMBER, EXCEPT SECRET ADMIN EMAIL)
  const handleRegister = async () => {
    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const name = email.split('@')[0];
      await axiosClient.post('/auth/register', {
        name,
        email: email.trim().toLowerCase(),
        password,
      });

      toast({ title: "Success", description: "✅ Registration successful! You can now login." });
      setIsRegister(false);
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
      const res = await axiosClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user));
        const userRole: Role = user.role === 'admin' ? 'admin' : 'member';
        login(userRole, {
          id: user.id || user._id,
          email: user.email,
          name: user.name,
          role: userRole,
        });

        toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
        navigate(userRole === 'admin' ? '/admin' : '/user/catalog');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-bg parchment-pattern flex items-center justify-center p-4 font-sans-ui text-ink-primary">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md border border-border-archival relative overflow-hidden">
        {/* Subtle accent border at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-archival-teal via-gilded-amber to-archival-teal" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-archival-teal text-white flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-white">
            <svg fill="none" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#063b36" height="48" rx="8" width="48" />
              <path d="M12 34V15.5C12 14.12 13.12 13 14.5 13H22C23.1 13 24 13.9 24 15V33C24 33.55 23.55 34 23 34H12Z" fill="#ffffff" fillOpacity="0.95" />
              <path d="M36 34V15.5C36 14.12 34.88 13 33.5 13H26C24.9 13 24 13.9 24 15V33C24 33.55 24.45 34 25 34H36Z" fill="#ffffff" fillOpacity="0.8" />
              <circle cx="24" cy="11" fill="#d97706" r="2.5" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gilded-light text-gilded-amber text-[10px] font-bold uppercase tracking-wider border border-gilded-amber/20 mb-2">
            Athenaeum Library • Est. 1884
          </div>

          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-archival-teal">
            {isRegister ? 'Join Scholar Registry' : 'Patron Desk Sign-In'}
          </h1>
          <p className="font-serif-body text-xs italic text-ink-muted mt-1">
            {isRegister
              ? 'Enroll for institutional borrowing privileges and archive access.'
              : 'Authenticate credentials to manage loans, holds, and research folios.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Patron Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-ink-muted text-[18px]">
                mail
              </span>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-parchment-subtle border border-border-archival rounded-lg text-xs font-sans-ui text-ink-primary placeholder:text-ink-muted/70 focus:outline-none focus:bg-white focus:ring-1 focus:ring-archival-teal transition-all"
                placeholder="scholar@athenaeum.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Secret Passkey
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-ink-muted text-[18px]">
                lock
              </span>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-parchment-subtle border border-border-archival rounded-lg text-xs font-sans-ui text-ink-primary placeholder:text-ink-muted/70 focus:outline-none focus:bg-white focus:ring-1 focus:ring-archival-teal transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    isRegister ? handleRegister() : handleLogin();
                  }
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          {isRegister ? (
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-archival-deep text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>{loading ? 'Enrolling...' : 'Complete Registration'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#0f766e] hover:bg-archival-deep text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>{loading ? 'Authenticating...' : 'Sign In to Patron Console'}</span>
            </button>
          )}

          {/* Switch mode */}
          <div className="pt-2 text-center border-t border-border-archival/60">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs font-semibold text-archival-teal hover:text-gilded-amber transition-colors"
            >
              {isRegister
                ? 'Already a registered scholar? Sign In'
                : 'Need a library research card? Enroll Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
