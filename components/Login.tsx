import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminRole } from '../types';
import { Icons } from './ui/Icons';

export const Login: React.FC = () => {
  const { login, isLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole | 'none'>('none');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'admin' | 'worker'>('admin');
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If a role is explicitly selected from the quick-login dropdown/buttons, use it
    const roleArg = selectedRole !== 'none' ? selectedRole : undefined;

    if (!roleArg && !email) {
      setError('Please enter an email address or select a demo role.');
      return;
    }

    try {
      const res = await login(email, password, roleArg);
      if (res && res.success) {
        if (res.requiresPasswordChange) {
           setShowChangePassword(true);
        }
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
       setError("Passwords do not match!");
       return;
    }
    
    if (newPassword.length < 6) {
       setError("Password must be at least 6 characters long.");
       return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8001/api/v1/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                current_password: password,
                new_password: newPassword
            }),
        });
        
        if (!response.ok) {
            throw new Error("Failed to change password");
        }
        
        const res = await login(email, newPassword, selectedRole !== 'none' ? selectedRole : undefined);
        if (!res || !res.success) {
            setError("Login failed after password change.");
        }
    } catch(err) {
        setError("An error occurred while changing password.");
    }
  };

  const handleQuickLogin = async (role: AdminRole, demoEmail: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword('admin123');
    setSelectedRole(role);
    try {
      const res = await login(demoEmail, 'admin123', role);
      if (res && res.requiresPasswordChange) {
          setShowChangePassword(true);
      }
    } catch (err) {
      setError('Failed to login with demo role.');
    }
  };

  const handleWorkerQuickLogin = async (demoEmail: string) => {
    setError('');
    setEmail(demoEmail);
    setPassword('worker123');
    setSelectedRole('none');
    try {
      const res = await login(demoEmail, 'worker123');
      if (res && res.requiresPasswordChange) {
          setShowChangePassword(true);
      }
    } catch (err) {
      setError('Failed to login with demo worker.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#161210] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-950/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#f48c25]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#241E1B] border border-[#38302C] rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#f48c25]/10 border border-[#f48c25]/20 rounded-2xl flex items-center justify-center text-[#f48c25] mb-4 shadow-inner">
            <Icons.Briefcase size={32} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">EVERA ADMIN</h1>
          <p className="text-sm text-[#A8A29E] mt-1">Sign in to manage your operations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-3">
            <Icons.Reject size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Type Tabs */}
        <div className="flex p-1 bg-[#161210] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'admin' 
                ? 'bg-[#f48c25] text-white shadow-md shadow-orange-950/20' 
                : 'text-[#A8A29E] hover:text-white'
            }`}
          >
            Admin Portal
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'worker' 
                ? 'bg-[#f48c25] text-white shadow-md shadow-orange-950/20' 
                : 'text-[#A8A29E] hover:text-white'
            }`}
          >
            Worker Portal
          </button>
        </div>

        {showChangePassword ? (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
                <p className="text-xs text-[#A8A29E]">Please choose a new password for your account to continue.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A8A29E]">
                  <Icons.Settings size={18} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161210] border border-[#38302C] rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#A8A29E]/50 focus:outline-none focus:border-[#f48c25] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A8A29E]">
                  <Icons.Settings size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161210] border border-[#38302C] rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#A8A29E]/50 focus:outline-none focus:border-[#f48c25] transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f48c25] hover:bg-[#d9751a] disabled:bg-[#f48c25]/50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-950/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Icons.Undo className="animate-spin" size={18} />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Login</span>
                  <Icons.ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A8A29E]">
                <Icons.Users size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (selectedRole !== 'none') setSelectedRole('none');
                }}
                placeholder={activeTab === 'admin' ? "admin@evera.com" : "worker@evera.com"}
                className="w-full bg-[#161210] border border-[#38302C] rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#A8A29E]/50 focus:outline-none focus:border-[#f48c25] transition-all text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A8A29E]">
                <Icons.Settings size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161210] border border-[#38302C] rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#A8A29E]/50 focus:outline-none focus:border-[#f48c25] transition-all text-sm"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#f48c25] hover:bg-[#d9751a] disabled:bg-[#f48c25]/50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-950/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Icons.Undo className="animate-spin" size={18} />
                <span>Logging you in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <Icons.ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#38302C]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#241E1B] px-3 text-[#A8A29E]">Quick Dev Login</span>
          </div>
        </div>

        {/* Quick select buttons */}
        {activeTab === 'admin' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin(AdminRole.OPERATIONS_ADMIN, 'ops@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Operations</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">ops@evera.com</span>
            </button>
  
            <button
              type="button"
              onClick={() => handleQuickLogin(AdminRole.FINANCE_ADMIN, 'finance@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Finance</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">finance@evera.com</span>
            </button>
  
            <button
              type="button"
              onClick={() => handleQuickLogin(AdminRole.SUPPORT_ADMIN, 'support@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Support</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">support@evera.com</span>
            </button>
  
            <button
              type="button"
              onClick={() => handleQuickLogin(AdminRole.SUPER_ADMIN, 'super@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Super Admin</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">super@evera.com</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleWorkerQuickLogin('ops_worker@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Operations Worker</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">ops_worker@evera.com</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleWorkerQuickLogin('support_worker@evera.com')}
              className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/40 text-left p-2.5 rounded-xl transition-all group flex flex-col justify-between h-20"
            >
              <span className="text-[9px] uppercase font-bold text-[#f48c25] tracking-wider">Support Agent</span>
              <span className="text-[10px] font-semibold text-white group-hover:text-[#f48c25] transition-colors truncate">support_worker@evera.com</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
