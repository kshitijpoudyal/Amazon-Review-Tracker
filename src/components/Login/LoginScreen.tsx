import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, loading: authLoading } = useAuth();

  // Call onLoginSuccess when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      setLoading(false);
      onLoginSuccess();
    }
  }, [user, authLoading, onLoginSuccess]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Don't call onLoginSuccess immediately - let useAuth handle the state change
      // onLoginSuccess will be called automatically when user state is set
    } catch (error: any) {
      setError(error.message);
      setLoading(false); // Only set loading to false on error
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      // Don't call onLoginSuccess immediately - let useAuth handle the state change
      // onLoginSuccess will be called automatically when user state is set
    } catch (error: any) {
      setError(error.message);
      setLoading(false); // Only set loading to false on error
    }
  };  
  
  return (
    <div className="min-h-screen bg-[#eae8e2] flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-[#ffffff] rounded-3xl shadow-[0_24px_64px_rgba(2,36,72,0.10)] overflow-hidden">
        {/* Header */}
        <div className="gradient-bg text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Amazon Review Tracker
          </h1>
          <p className="text-white/70 text-sm font-label uppercase tracking-widest">Sign in to manage your products</p>
        </div>

        {/* Form */}
        <div className="p-8 bg-[#fbf9f3]">
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-label font-semibold text-[#43474e] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#e4e2dd] border-0 text-[#1b1c19] placeholder-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#022448] text-base transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-label font-semibold text-[#43474e] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#e4e2dd] border-0 text-[#1b1c19] placeholder-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#022448] text-base transition-all"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#ffdad6] text-[#ba1a1a] px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white rounded-full hover:from-[#1e3a5f] hover:to-[#022448] focus:outline-none focus:ring-2 focus:ring-[#022448] font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_16px_rgba(2,36,72,0.2)]"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(196,198,207,0.3)]"></div>
            <span className="text-[#74777f] text-sm font-label uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[rgba(196,198,207,0.3)]"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full px-4 py-3 bg-[#eae8e2] text-[#1b1c19] rounded-full hover:bg-[#e4e2dd] focus:outline-none focus:ring-2 focus:ring-[#022448] font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3 shadow-[0_2px_8px_rgba(2,36,72,0.06)]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#006a68] hover:text-[#022448] text-sm font-medium transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"
              }
            </button>
          </div>

          {/* Powered by KshitijStudio */}
          <div className="mt-8 pt-6 border-t border-[rgba(196,198,207,0.3)] text-center">
            <a
              href="https://www.kshitijstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#74777f] hover:text-[#022448] transition-colors font-label uppercase tracking-wider"
            >
              <span>Powered by</span>
              <span className="font-semibold text-[#022448]">KshitijStudio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
