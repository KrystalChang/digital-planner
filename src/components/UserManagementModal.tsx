import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  promptReason?: string | null;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
];

export const UserManagementModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  promptReason
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(currentUser ? 'login' : 'login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTagline, setRegTagline] = useState('Mindful productivity & daily calm.');
  const [regAvatar, setRegAvatar] = useState(AVATAR_OPTIONS[0]);

  // Status & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          tagline: regTagline.trim(),
          avatar: regAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccessMessage(`Account created for ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setLoginEmail('fiona930607@gmail.com');
    setLoginPassword('planner123');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[4px] animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#faf4ec] rounded-2xl shadow-2xl border border-[#d8ccbc] overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f0e5d5] border-b border-[#dfd2c0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8b5e3c]/15 flex items-center justify-center text-[#8b5e3c]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2a221b]">
                {currentUser ? 'My Workspace Account' : 'Digital Planner Sign In'}
              </h3>
              <p className="text-[11px] text-[#6d5e50]">
                Connected with PostgreSQL Cloud SQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7d6f5e] hover:text-[#2a221b] hover:bg-[#e4d6c4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Banner if user tried to act in Demo mode */}
        {promptReason && !currentUser && (
          <div className="px-6 py-3 bg-[#e8f0ec] border-b border-[#c8ded0] flex items-start gap-2.5 text-xs text-[#264e36]">
            <Sparkles className="w-4 h-4 text-[#2b585e] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Sign In Required:</span> {promptReason}
            </div>
          </div>
        )}

        {/* Already Logged In View */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-[#dfd3c3]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border border-[#c4b39e] shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-base font-bold text-[#1f1914] truncate">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-[#6e5e4e] truncate font-mono">
                  {currentUser.email}
                </p>
                {currentUser.tagline && (
                  <p className="text-[11px] text-[#8c7a67] italic truncate mt-0.5">
                    "{currentUser.tagline}"
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-[#5e5142] space-y-1.5 bg-[#f3ebd0]/40 p-3 rounded-xl border border-[#e2d8c3]">
              <div className="flex items-center gap-1.5 font-semibold text-[#3b3228]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud SQL Synchronized</span>
              </div>
              <p className="text-[11px] text-[#6d5f50]">
                Your personal todos, timeline events, and recurring habits are automatically saved to your PostgreSQL account.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#dfd2c0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-[#eae0d2] text-[#4a3f33] text-xs font-semibold rounded-xl border border-[#cfc3b2] transition-colors"
              >
                Back to Planner
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Tabs: Sign In / Register */
          <div className="flex flex-col flex-1">
            {/* Tab switchers */}
            <div className="flex border-b border-[#dfd2c0] bg-[#f5ede2]/60 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2.5 px-3 text-xs font-serif font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  tab === 'login'
                    ? 'border-[#8b5e3c] text-[#8b5e3c]'
                    : 'border-transparent text-[#7d6f5e] hover:text-[#2a221b]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2.5 px-3 text-xs font-serif font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  tab === 'register'
                    ? 'border-[#8b5e3c] text-[#8b5e3c]'
                    : 'border-transparent text-[#7d6f5e] hover:text-[#2a221b]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error & Success notifications */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mx-6 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab 1: Sign In */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8c7e6e]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. fiona930607@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/30 focus:border-[#8b5e3c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#8c7e6e]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cfc3b2] rounded-lg text-xs text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/30 focus:border-[#8b5e3c]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="text-[11px] text-[#8b5e3c] hover:underline font-medium"
                  >
                    Use Sample Account (Fiona)
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#8b5e3c] hover:bg-[#724b2f] text-white text-xs font-serif font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Tab 2: Register */
              <form onSubmit={handleRegister} className="p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-[#8c7e6e]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fiona Lin, Alex Morgan..."
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cfc3b2] rounded-lg text-xs text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8c7e6e]" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cfc3b2] rounded-lg text-xs font-mono text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#8c7e6e]" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 4 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cfc3b2] rounded-lg text-xs text-[#1c1917] focus:outline-none focus:border-[#8b5e3c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a3f33] uppercase tracking-wider mb-1">
                    Select Avatar
                  </label>
                  <div className="flex items-center gap-2">
                    {AVATAR_OPTIONS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRegAvatar(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                          regAvatar === url ? 'border-[#8b5e3c] scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#2b585e] hover:bg-[#204247] text-white text-xs font-serif font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Free Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
