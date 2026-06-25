import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ShieldAlert, KeyRound, Monitor, Shield, Sparkles, Ban, Loader2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import * as api from '../../api/service';

interface SessionItem {
    id: string;
    adminName: string;
    role: string;
    device: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
}

export const SecuritySettings = () => {
    const { addNotification } = useApp();
    const [policy, setPolicy] = useState({
        twoFactorAuth: true,
        passwordExpiration: 90,
        sessionTimeout: 30,
        ipWhitelisting: false,
        maxLoginAttempts: 3,
        minPasswordLength: 10,
        requireSpecialChar: true,
        requireUppercase: true,
    });

    const [sessions, setSessions] = useState<SessionItem[]>([
        { id: 's1', adminName: 'Super Admin', role: 'Super Admin', device: 'Chrome / macOS (14.2)', ip: '192.168.1.1', lastActive: 'Active Now', isCurrent: true },
        { id: 's2', adminName: 'Ops Manager', role: 'Operations Admin', device: 'Firefox / Windows 11', ip: '103.45.12.82', lastActive: '12 mins ago', isCurrent: false },
        { id: 's3', adminName: 'Finance Manager', role: 'Finance Admin', device: 'Safari / iPhone 15', ip: '192.168.1.20', lastActive: '1 hour ago', isCurrent: false }
    ]);

    const [alerts] = useState([
        { id: 'a1', event: 'Multiple failed login attempts detected', location: 'Kiev, Ukraine (IP: 109.112.45.89)', date: 'May 19, 2026 15:42', severity: 'HIGH' },
        { id: 'a2', event: 'Password complexity requirements updated', location: 'Super Admin (IP: 192.168.1.1)', date: 'May 18, 2026 11:20', severity: 'LOW' }
    ]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            const res = await api.fetchSettings();
            if (res.success && res.data) {
                setPolicy(res.data);
            }
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const handleToggle = (key: keyof typeof policy) => {
        setPolicy(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            return updated;
        });
        addNotification('Security setting toggled');
    };

    const handleChange = (key: keyof typeof policy, val: any) => {
        setPolicy(prev => ({ ...prev, [key]: val }));
    };

    const handleRevokeSession = (id: string, name: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        addNotification(`Session revoked for ${name}`);
    };

    const handleSaveChanges = async () => {
        const res = await api.updateSettings(policy);
        if (res.success) {
            addNotification('Security policies updated successfully');
        } else {
            addNotification('Failed to update security policies');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-evera-muted">
                <Loader2 className="animate-spin w-8 h-8 text-evera-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-evera-border pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Platform Security Controls</h2>
                    <p className="text-xs text-[#A8A29E]">Adjust admin authentication factors, password policies, session lifetimes, and active VPN listings.</p>
                </div>
                <button
                    onClick={handleSaveChanges}
                    className="bg-[#f48c25] hover:bg-[#d9751a] px-4 py-2.5 text-xs rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20"
                >
                    Save Security Policies
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Panel: Security Parameters & Policies */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    {/* Basic Toggles */}
                    <div className="card bg-evera-card border-evera-border p-6 space-y-5">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-[#38302C] pb-3">
                            <Shield size={16} className="text-[#f48c25]" />
                            <span>Authentication Policies</span>
                        </h3>
                        
                        {/* 2FA */}
                        <div className="flex justify-between items-center pb-4 border-b border-evera-border/20">
                            <div>
                                <h4 className="font-bold text-white text-xs">Require Two-Factor Authentication (2FA)</h4>
                                <p className="text-[10px] text-evera-muted mt-0.5">Enforces mandatory Google/Microsoft Authenticator OTP setup for all administrators.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('twoFactorAuth')}
                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${policy.twoFactorAuth ? 'bg-[#f48c25]' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${policy.twoFactorAuth ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>

                        {/* IP Whitelisting */}
                        <div className="flex justify-between items-center pb-4 border-b border-evera-border/20">
                            <div>
                                <h4 className="font-bold text-white text-xs">Corporate IP Whitelisting</h4>
                                <p className="text-[10px] text-evera-muted mt-0.5">Locks admin access down strictly to registered corporate VPN gateways and Office IPs.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('ipWhitelisting')}
                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${policy.ipWhitelisting ? 'bg-[#f48c25]' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${policy.ipWhitelisting ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>

                        {/* Numeric configs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Session Timeout</label>
                                <div className="flex items-center bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs">
                                    <input
                                        type="number"
                                        value={policy.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', Number(e.target.value))}
                                        className="w-full bg-transparent text-white font-bold outline-none text-center"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">mins</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Password Lifespan</label>
                                <div className="flex items-center bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs">
                                    <input
                                        type="number"
                                        value={policy.passwordExpiration}
                                        onChange={(e) => handleChange('passwordExpiration', Number(e.target.value))}
                                        className="w-full bg-transparent text-white font-bold outline-none text-center"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">days</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Max Lockout Trials</label>
                                <div className="flex items-center bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs">
                                    <input
                                        type="number"
                                        value={policy.maxLoginAttempts}
                                        onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))}
                                        className="w-full bg-transparent text-white font-bold outline-none text-center"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">tries</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Policy */}
                    <div className="card bg-evera-card border-evera-border p-6 space-y-4">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-[#38302C] pb-3">
                            <KeyRound size={16} className="text-[#f48c25]" />
                            <span>Complexity Requirements</span>
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-300 font-medium">Minimum Password Character Length:</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="8" max="24"
                                        value={policy.minPasswordLength}
                                        onChange={(e) => handleChange('minPasswordLength', Number(e.target.value))}
                                        className="accent-evera-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer w-28"
                                    />
                                    <span className="font-bold text-white font-mono w-4">{policy.minPasswordLength}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2.5 border-t border-[#38302C]/40 text-xs">
                                <span className="text-gray-300 font-medium">Require Uppercase & Lowercase (A-z)</span>
                                <input
                                    type="checkbox"
                                    checked={policy.requireUppercase}
                                    onChange={() => handleToggle('requireUppercase')}
                                    className="accent-evera-primary rounded w-4 h-4 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between py-2.5 border-t border-[#38302C]/40 text-xs">
                                <span className="text-gray-300 font-medium">Require Special Characters (#, $, %, !)</span>
                                <input
                                    type="checkbox"
                                    checked={policy.requireSpecialChar}
                                    onChange={() => handleToggle('requireSpecialChar')}
                                    className="accent-evera-primary rounded w-4 h-4 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sessions & Alerts */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Active Sessions */}
                    <div className="card bg-evera-card border-evera-border p-6 space-y-4">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-[#38302C] pb-3">
                            <Monitor size={16} className="text-[#f48c25]" />
                            <span>Active Admin Sessions</span>
                        </h3>
                        <div className="space-y-3">
                            {sessions.map((sess) => (
                                <div key={sess.id} className="p-3 bg-[#161210] rounded-xl border border-evera-border/40 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <span>{sess.adminName}</span>
                                            {sess.isCurrent && (
                                                <span className="text-[9px] bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-1.5 py-0.5 rounded">
                                                    Current
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-evera-muted font-mono">{sess.device} | {sess.ip}</p>
                                        <p className="text-[9px] text-gray-500">Last activity: {sess.lastActive}</p>
                                    </div>
                                    {!sess.isCurrent && (
                                        <button
                                            onClick={() => handleRevokeSession(sess.id, sess.adminName)}
                                            className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                            title="Revoke session tokens"
                                        >
                                            <Ban size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Alerts */}
                    <div className="card bg-evera-card border-evera-border p-6 space-y-4">
                        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-[#38302C] pb-3">
                            <ShieldAlert size={16} className="text-[#f48c25]" />
                            <span>Platform Security Anomalies</span>
                        </h3>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-3 bg-[#161210] rounded-xl border border-evera-border/40 text-xs space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                            alert.severity === 'HIGH' 
                                                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                        }`}>
                                            {alert.severity} SEVERITY
                                        </span>
                                        <span className="text-[9px] text-gray-500">{alert.date}</span>
                                    </div>
                                    <p className="font-bold text-white">{alert.event}</p>
                                    <p className="text-[10px] text-evera-muted font-mono">{alert.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
