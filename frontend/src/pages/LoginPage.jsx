import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '../components/DesignSystem';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@feedbackintel.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate simple client-side JWT authentication check
    setTimeout(() => {
      if (email === 'admin@feedbackintel.io' && password === 'admin123') {
        localStorage.setItem('auth_token', 'mock-jwt-token-xyz');
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Hint: admin@feedbackintel.io / admin123');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 font-sans select-none">
      
      {/* Branding */}
      <div className="flex items-center space-x-3 mb-8">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🔮 Feedback Intel
        </span>
      </div>

      {/* Login Card */}
      <Card className="max-w-sm w-full p-6 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-zinc-200">Sign in to Console</h3>
          <p className="text-[10px] text-zinc-500">Enter credentials to access your workspaces.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10.5px] text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              required
              placeholder="admin@feedbackintel.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/"
            className="text-[10px] text-zinc-500 hover:text-zinc-400 underline font-semibold uppercase tracking-wider"
          >
            Back to Landing Page
          </Link>
        </div>
      </Card>

      <div className="text-[10px] text-zinc-600 mt-6 uppercase tracking-wider font-mono">
        Enterprise Auth node active
      </div>
    </div>
  );
};

export default LoginPage;
