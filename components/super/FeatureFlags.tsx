import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Icons } from '../ui/Icons';
import { ToggleLeft, ToggleRight, Settings2, Sliders, Globe, Layers, Trash2 } from 'lucide-react';

interface FeatureFlag {
    id: string;
    key: string;
    description: string;
    isEnabled: boolean;
    rollout: number; // 0-100%
    environments: ('DEV' | 'STAGING' | 'PROD')[];
}

export const FeatureFlags = () => {
    const { addNotification } = useApp();
    const [flags, setFlags] = useState<FeatureFlag[]>([
        { id: 'f1', key: 'STRIPE_MOCK_PAYMENT_FLOW', description: 'Enable the redesigned Stripe payment verification screen and custom dispute callbacks.', isEnabled: true, rollout: 50, environments: ['DEV', 'STAGING'] },
        { id: 'f2', key: 'KYC_VENDOR_VERIFICATION_V2', description: 'Mandatory Aadhaar background and verification matching API layers.', isEnabled: false, rollout: 0, environments: ['DEV'] },
        { id: 'f3', key: 'CENTRALIZED_THEME_DARK_MODE', description: 'Forces sleek premium HSL color tokens instead of vanilla templates.', isEnabled: true, rollout: 100, environments: ['DEV', 'STAGING', 'PROD'] },
        { id: 'f4', key: 'RECONCILIATION_EXPORT_CSV', description: 'Enables download formats for financial transactions reports inside finance portal.', isEnabled: true, rollout: 80, environments: ['STAGING', 'PROD'] }
    ]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        description: '',
        rollout: 0,
        dev: true,
        staging: true,
        prod: false,
        isEnabled: false
    });

    const handleToggle = (id: string) => {
        setFlags(prev => prev.map(f => {
            if (f.id === id) {
                const nextState = !f.isEnabled;
                addNotification(`Feature flag ${f.key} is now ${nextState ? 'enabled' : 'disabled'}`);
                return { ...f, isEnabled: nextState };
            }
            return f;
        }));
    };

    const handleRolloutChange = (id: string, val: number) => {
        setFlags(prev => prev.map(f => f.id === id ? { ...f, rollout: val } : f));
    };

    const handleDelete = (id: string, key: string) => {
        setFlags(prev => prev.filter(f => f.id !== id));
        addNotification(`Deleted feature flag ${key}`);
    };

    const handleOpenCreate = () => {
        setFormData({
            key: '',
            description: '',
            rollout: 0,
            dev: true,
            staging: true,
            prod: false,
            isEnabled: false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.key) {
            addNotification('Please enter a feature flag key');
            return;
        }

        const formattedKey = formData.key.toUpperCase().replace(/\s+/g, '_');
        
        const envs: ('DEV' | 'STAGING' | 'PROD')[] = [];
        if (formData.dev) envs.push('DEV');
        if (formData.staging) envs.push('STAGING');
        if (formData.prod) envs.push('PROD');

        const newFlag: FeatureFlag = {
            id: `flag-${Date.now()}`,
            key: formattedKey,
            description: formData.description,
            isEnabled: formData.isEnabled,
            rollout: formData.rollout,
            environments: envs
        };

        setFlags(prev => [...prev, newFlag]);
        addNotification(`Feature flag ${formattedKey} registered successfully`);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Dynamic Feature Flags</h2>
                    <p className="text-xs text-[#A8A29E]">Configure runtime feature gates, manage rollout distributions, and specify environment releases.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-evera-primary hover:bg-[#d9751a] px-4 py-2.5 text-xs rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20 whitespace-nowrap self-start sm:self-center"
                >
                    + Create Feature Flag
                </button>
            </div>

            {/* Flags List */}
            <div className="grid grid-cols-1 gap-4">
                {flags.map(flag => (
                    <div key={flag.id} className="card bg-evera-card border-evera-border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-evera-primary/20 transition-all">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-sm text-white font-bold">{flag.key}</span>
                                <StatusBadge status={flag.isEnabled ? 'ACTIVE' : 'INACTIVE'} className="text-[9px]" />
                                
                                {/* Environments */}
                                <div className="flex items-center gap-1">
                                    {flag.environments.map(env => (
                                        <span key={env} className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                                            env === 'PROD' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                            env === 'STAGING' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                        }`}>
                                            {env}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">{flag.description}</p>
                        </div>

                        {/* Rollout slider & controls */}
                        <div className="flex items-center gap-6 w-full md:w-auto self-stretch justify-between md:justify-end border-t md:border-t-0 border-[#38302C]/40 pt-4 md:pt-0">
                            {flag.isEnabled && (
                                <div className="flex-1 md:w-36 flex-shrink-0">
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span className="font-medium">Rollout Allocation</span>
                                        <span className="font-bold font-mono text-white">{flag.rollout}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={flag.rollout}
                                        onChange={(e) => handleRolloutChange(flag.id, parseInt(e.target.value))}
                                        className="w-full accent-evera-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(flag.id)}
                                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${flag.isEnabled ? 'bg-[#f48c25]' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${flag.isEnabled ? 'translate-x-5' : ''}`}></div>
                                </button>
                                
                                <button
                                    onClick={() => handleDelete(flag.id, flag.key)}
                                    className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                    title="Delete feature flag"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Flag Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-[#241E1B] border border-[#38302C] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-evera-border pb-3">
                            <div className="flex items-center gap-2 text-white">
                                <Settings2 size={16} className="text-[#f48c25]" />
                                <h3 className="text-base font-black">Register Feature Flag</h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Icons.Reject size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Key */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Feature Key *</label>
                                <input
                                    type="text"
                                    value={formData.key}
                                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                                    placeholder="e.g. ENABLE_NEW_SCHEDULER"
                                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 px-3 text-xs text-white uppercase focus:outline-none focus:border-[#f48c25]"
                                    required
                                />
                                <p className="text-[9px] text-gray-500">Must be uppercase characters separated by underscores.</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief explanation of feature gate..."
                                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#f48c25] leading-relaxed resize-none"
                                />
                            </div>

                            {/* Environments Checkboxes */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Active Environments</label>
                                <div className="grid grid-cols-3 gap-3 bg-[#161210] p-3 rounded-xl border border-evera-border/30">
                                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.dev}
                                            onChange={() => setFormData(prev => ({ ...prev, dev: !prev.dev }))}
                                            className="accent-evera-primary rounded w-3.5 h-3.5"
                                        />
                                        <span>Dev</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.staging}
                                            onChange={() => setFormData(prev => ({ ...prev, staging: !prev.staging }))}
                                            className="accent-evera-primary rounded w-3.5 h-3.5"
                                        />
                                        <span>Staging</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.prod}
                                            onChange={() => setFormData(prev => ({ ...prev, prod: !prev.prod }))}
                                            className="accent-evera-primary rounded w-3.5 h-3.5"
                                        />
                                        <span>Prod</span>
                                    </label>
                                </div>
                            </div>

                            {/* Initial Rollout */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Initial Rollout Allocation</label>
                                    <span className="text-xs font-bold text-white">{formData.rollout}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={formData.rollout}
                                        onChange={(e) => setFormData(prev => ({ ...prev, rollout: parseInt(e.target.value) }))}
                                        className="accent-evera-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer flex-1"
                                    />
                                </div>
                            </div>

                            {/* Enable Status switch */}
                            <div className="flex items-center justify-between bg-[#161210] p-3 rounded-xl border border-evera-border/30">
                                <div>
                                    <p className="text-xs font-bold text-white">Default Status</p>
                                    <p className="text-[10px] text-gray-400">Initialize feature flag as active</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                                    className={`w-10 h-5.5 rounded-full transition-colors relative ${formData.isEnabled ? 'bg-[#f48c25]' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${formData.isEnabled ? 'translate-x-4.5' : ''}`}></div>
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t border-evera-border pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-transparent border border-evera-border text-xs px-4 py-2.5 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#f48c25] hover:bg-[#d9751a] text-xs px-4 py-2.5 rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20"
                                >
                                    Register Flag
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
