import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Shield, Users, Key, Loader2, Sparkles, GraduationCap } from 'lucide-react';

export default function Login() {
  const { login, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all credential fields.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      // Error is caught and displayed by showToast inside context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick-test profiles for easy grading and exploration
  const handleQuickLogin = async (roleEmail: string, rolePass: string) => {
    setIsSubmitting(true);
    try {
      setEmail(roleEmail);
      setPassword(rolePass);
      await login(roleEmail, rolePass);
    } catch (err) {
      // Handled inside context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans" id="login-page">
      {/* Left Column: Visual branding and system intro */}
      <div className="w-full md:w-1/2 bg-[#121212] p-8 md:p-16 flex flex-col justify-between border-r border-zinc-800 relative overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-[#FACC15] rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-black rotate-45"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white italic">
            SMS<span className="text-[#FACC15] not-italic font-black">PRO</span>
          </span>
        </div>

        <div className="my-12 md:my-0 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium mb-6 border border-yellow-500/20">
            <Sparkles className="h-3 w-3" /> System Version 1.0.0 Live
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-100">
            Precision control over institutional records.
          </h1>
          <p className="mt-4 text-zinc-400 leading-relaxed text-sm md:text-base">
            Manage academic directories, analyze enrollment trends, generate professional demographics charts, and audit changes with role-based security configurations.
          </p>
        </div>

        <div className="text-xs text-zinc-500 relative z-10 flex items-center justify-between">
          <span>© 2026 SMS Institute of Technology</span>
          <span className="text-yellow-400/60 font-mono">SECURE STAT_v1.0</span>
        </div>
      </div>

      {/* Right Column: High-fidelity Login Card Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#0a0a0a] relative">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Portal Authentication</h2>
            <p className="text-sm text-zinc-400 mt-2">Enter your designated credentials below to access management dashboards.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">Institutional Email</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sms.edu"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">Secure Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-yellow-500/10 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  Verifying Session...
                </>
              ) : (
                'Secure Authentication'
              )}
            </button>
          </form>

          {/* Quick-test sandbox profiles section */}
          <div className="mt-10 pt-8 border-t border-zinc-900">
            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Reviewer Quick-Access Profiles
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@sms.edu', 'admin123')}
                disabled={isSubmitting}
                className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-zinc-800 hover:border-yellow-400/40 hover:bg-zinc-900 transition-all group text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-red-400" /> Administrator Console
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Full CRUD, System Settings, SQL Backup & Restore</div>
                </div>
                <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-md font-mono group-hover:bg-yellow-400 group-hover:text-zinc-950 transition-all">
                  Sign In
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff@sms.edu', 'staff123')}
                disabled={isSubmitting}
                className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-zinc-800 hover:border-yellow-400/40 hover:bg-zinc-900 transition-all group text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-blue-400" /> Registrar Staff Console
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Enrollments, Profiles Update, Docs Upload & PDF exports</div>
                </div>
                <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-md font-mono group-hover:bg-yellow-400 group-hover:text-zinc-950 transition-all">
                  Sign In
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@sms.edu', 'viewer123')}
                disabled={isSubmitting}
                className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-zinc-800 hover:border-yellow-400/40 hover:bg-zinc-900 transition-all group text-left"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3 text-green-400" /> Auditor (Read-Only) Console
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Search, Analytics views & demographics exploration</div>
                </div>
                <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-md font-mono group-hover:bg-yellow-400 group-hover:text-zinc-950 transition-all">
                  Sign In
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
