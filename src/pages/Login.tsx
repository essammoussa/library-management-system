import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import { BookOpen } from 'lucide-react';

export default function Login() {
  // Get login function from Role context
  const { login } = useRole();
  // React Router navigation for redirecting after login
  const navigate = useNavigate();

  // Local state for email, password, loading, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles login for given user role
   * @param userRole - 'admin' or 'member'
   */
  const handleLogin = async (userRole: 'admin' | 'member') => {
    // Simple validation: ensure email and password are filled
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true); // Start loading
    setError(''); // Clear previous errors

    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch('/api/auth/login', { ... });

    // Simulate async login
    setTimeout(() => {
      // Call login from Role context to save user info globally
      login(userRole, { 
        email, 
        name: email.split('@')[0], // Use part of email as name
        role: userRole 
      });
      setLoading(false); // Stop loading

      // Navigate to different routes based on role
      navigate(userRole === 'admin' ? '/' : '/user/catalog');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Card container */}
      <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-md border border-border">
        
        {/* Header with icon and welcome text */}
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground">Welcome to the Library</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {/* Display error messages */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
              disabled={loading} // Disable input while loading
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
              disabled={loading} // Disable input while loading
            />
          </div>

          {/* Login buttons */}
          <div className="space-y-3 pt-4">
            {/* Admin login */}
            <button
              onClick={() => handleLogin('admin')}
              disabled={loading} // Disable while loading
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Loading...' : 'Login as Admin'}
            </button>

            {/* Member login */}
            <button
              onClick={() => handleLogin('member')}
              disabled={loading} // Disable while loading
              className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Loading...' : 'Login as Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
