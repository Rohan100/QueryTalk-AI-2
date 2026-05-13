import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', {
        username: email,
        password: password
      });
      setToken(res.data.access_token);
      navigate('/connect');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Login Card (Glassmorphism) */}
      <main className="relative z-10 w-full max-w-[440px] mx-margin-mobile md:mx-auto">
        <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl shadow-primary/5">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <img alt="QueryTalk AI Logo" className="w-16 h-16 rounded-lg mb-4" src="data:image/png;base64,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" />
            <h1 className="font-display text-headline-md text-primary tracking-tight mb-2">QueryTalk AI</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to your command center</p>
          </div>
          
          {/* Login Form */}
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg font-body-sm text-body-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label-mono text-label-mono text-on-surface-variant block uppercase" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="mail" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>mail</span>
                  <input className="w-full bg-surface-dim border border-white/10 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-body-sm text-body-sm placeholder:text-outline-variant" id="email" placeholder="engineer@querytalk.ai" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-mono text-label-mono text-on-surface-variant block uppercase" htmlFor="password">Password</label>
                  <a className="font-body-sm text-body-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="lock" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                  <input className="w-full bg-surface-dim border border-white/10 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-body-sm text-body-sm placeholder:text-outline-variant" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} type="password"/>
                </div>
              </div>
              
              {/* Primary Login Button */}
              <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-lg text-body-lg font-medium rounded-lg py-3 mt-6 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
                Login
                <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
          </form>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="font-label-mono text-label-mono text-outline uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>
          
          {/* Social Login (Ghost-Glass Button) */}
          <button className="w-full bg-transparent border border-white/10 rounded-lg py-3 font-body-sm text-body-sm text-on-surface hover:bg-white/5 transition-colors flex items-center justify-center gap-3" type="button">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Google
          </button>
          
          {/* Footer Link */}
          <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-8">
            Don't have an account? 
            <a className="text-primary hover:text-primary-container transition-colors font-medium" href="#">Request Access</a>
          </p>
        </div>
      </main>
    </div>
  );
}
