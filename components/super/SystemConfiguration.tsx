import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../ui/Icons';
import { Save, RefreshCw, LayoutGrid, Sliders, BellRing, Settings2, FileCode } from 'lucide-react';

interface ConfigItem {
    id: string;
    key: string;
    value: any;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
    description: string;
    category: 'General' | 'Bookings' | 'Business' | 'Integrations';
}

export const SystemConfiguration = () => {
    const { addNotification } = useApp();
    const [activeTab, setActiveTab] = useState<'all' | 'General' | 'Bookings' | 'Business' | 'Integrations'>('all');
    const [isSaving, setIsSaving] = useState(false);
    
    const [configs, setConfigs] = useState<ConfigItem[]>([
        // General
        { id: 'c1', key: 'PLATFORM_NAME', value: 'Evera Platform', type: 'STRING', description: 'Public facing customer & vendor platform identity name.', category: 'General' },
        { id: 'c2', key: 'SUPPORT_EMAIL', value: 'support@evera.com', type: 'STRING', description: 'Destination address for customer complaint filings.', category: 'General' },
        { id: 'c3', key: 'SYSTEM_MAINTENANCE_MODE', value: false, type: 'BOOLEAN', description: 'Locks down all client apps and displays server maintenance message.', category: 'General' },
        
        // Bookings
        { id: 'c4', key: 'MAX_BOOKING_RANGE_DAYS', value: 30, type: 'NUMBER', description: 'How far in advance (in days) customers can schedule recurring vendor sessions.', category: 'Bookings' },
        { id: 'c5', key: 'DEFAULT_DISPATCH_RADIUS_KM', value: 15, type: 'NUMBER', description: 'Maximum radius to search for nearby matching service providers.', category: 'Bookings' },
        { id: 'c6', key: 'ALLOW_MULTI_SERVICE_BOOKINGS', value: true, type: 'BOOLEAN', description: 'Allows customers to queue separate service categories inside a single cart flow.', category: 'Bookings' },
        
        // Business
        { id: 'c7', key: 'PLATFORM_COMMISSION_PCT', value: 15.5, type: 'NUMBER', description: 'Evera commission fee deducted from booking totals prior to vendor payment.', category: 'Business' },
        { id: 'c8', key: 'CANCELLATION_FREE_WINDOW_HOURS', value: 24, type: 'NUMBER', description: 'Hours before service time where cancellation incurs no customer fees.', category: 'Business' },
        { id: 'c9', key: 'MINIMUM_PAYOUT_THRESHOLD_USD', value: 50, type: 'NUMBER', description: 'Minimum accumulated vendor wallet earnings required to trigger payouts.', category: 'Business' },
        
        // Integrations / JSON
        { 
            id: 'c10', 
            key: 'TWILIO_DISPATCH_CONFIG', 
            value: JSON.stringify({ "smsTemplate": "Hello {name}, your booking {id} is confirmed.", "retryAttempts": 3, "voiceFallback": false }, null, 2), 
            type: 'JSON', 
            description: 'SMS notification templates and retry configurations for vendor job dispatches.', 
            category: 'Integrations' 
        }
    ]);

    const handleFieldChange = (id: string, newVal: any) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, value: newVal } : c));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        // Simulate network delay
        // Removed delay
        setIsSaving(false);
        addNotification('System configuration parameters saved');
    };

    const renderInput = (config: ConfigItem) => {
        if (config.type === 'BOOLEAN') {
            const isTrue = config.value === true || config.value === 'true';
            return (
                <button
                    onClick={() => handleFieldChange(config.id, !isTrue)}
                    className={`w-12 h-6.5 rounded-full transition-colors relative flex-shrink-0 ${isTrue ? 'bg-[#f48c25]' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-transform ${isTrue ? 'translate-x-5.5' : ''}`}></div>
                </button>
            );
        }
        if (config.type === 'NUMBER') {
            return (
                <input
                    type="number"
                    value={config.value}
                    onChange={(e) => handleFieldChange(config.id, Number(e.target.value))}
                    className="bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-white text-xs w-32 focus:outline-none focus:border-[#f48c25]"
                />
            );
        }
        if (config.type === 'JSON') {
            return (
                <textarea
                    rows={4}
                    value={config.value}
                    onChange={(e) => handleFieldChange(config.id, e.target.value)}
                    className="bg-[#161210] border border-[#38302C] rounded-lg p-3 text-white text-xs w-full font-mono focus:outline-none focus:border-[#f48c25] leading-relaxed resize-none"
                    placeholder="Enter valid JSON..."
                />
            );
        }
        return (
            <input
                type="text"
                value={config.value}
                onChange={(e) => handleFieldChange(config.id, e.target.value)}
                className="bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-white text-xs w-full focus:outline-none focus:border-[#f48c25]"
            />
        );
    };

    const filteredConfigs = activeTab === 'all' 
        ? configs 
        : configs.filter(c => c.category === activeTab);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'General': return <Settings2 size={14} />;
            case 'Bookings': return <Sliders size={14} />;
            case 'Business': return <Sliders size={14} />;
            case 'Integrations': return <FileCode size={14} />;
            default: return <LayoutGrid size={14} />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-evera-border pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">System Parameters & Configuration</h2>
                    <p className="text-xs text-[#A8A29E]">Adjust central booking weights, payout limits, platform defaults, and webhook values.</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-[#f48c25] hover:bg-[#d9751a] disabled:bg-[#f48c25]/50 px-4 py-2.5 text-xs rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20 flex items-center justify-center gap-2 self-start sm:self-center"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="animate-spin" size={14} />
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            <span>Save Configurations</span>
                        </>
                    )}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'General', 'Bookings', 'Business', 'Integrations'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            activeTab === tab 
                                ? 'bg-evera-primary/10 border-evera-primary text-evera-primary' 
                                : 'bg-[#241E1B] border-[#38302C] text-[#A8A29E] hover:text-white'
                        }`}
                    >
                        {getCategoryIcon(tab)}
                        <span className="capitalize">{tab === 'all' ? 'All Settings' : tab}</span>
                    </button>
                ))}
            </div>

            {/* Settings Card Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredConfigs.map((config) => (
                    <div key={config.id} className="card bg-evera-card border-evera-border p-5 hover:border-evera-primary/20 transition-all">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs text-[#f48c25] bg-[#f48c25]/10 border border-[#f48c25]/20 px-2 py-0.5 rounded font-bold">
                                        {config.key}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold bg-[#161210] border border-[#38302C] px-2 py-0.5 rounded uppercase">
                                        {config.category}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">
                                        Type: {config.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                                    {config.description}
                                </p>
                            </div>
                            
                            <div className={`flex justify-start md:justify-end ${config.type === 'JSON' ? 'w-full md:w-1/2' : 'w-full md:w-1/3'}`}>
                                {renderInput(config)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
