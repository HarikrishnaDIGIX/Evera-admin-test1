import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Tooltip,
    XAxis
} from 'recharts';
import { Icons } from '../ui/Icons';

// Mock data for analytics
const BOOKING_TRENDS = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    count: Math.floor(Math.random() * 50) + 20
}));

export const OperationsAnalytics = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Operations Analytics</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted mb-2">Total Bookings</h3>
                    <div className="text-2xl font-bold text-white">1,432</div>
                    <div className="text-green-500 text-xs mt-1">+12% this month</div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted mb-2">Completion Rate</h3>
                    <div className="text-2xl font-bold text-white">94.8%</div>
                    <div className="text-green-500 text-xs mt-1">+1.2% this month</div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted mb-2">Avg Response Time</h3>
                    <div className="text-2xl font-bold text-white">14m</div>
                    <div className="text-red-500 text-xs mt-1">+2m vs target</div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted mb-2">Active Vendors</h3>
                    <div className="text-2xl font-bold text-white">128</div>
                    <div className="text-evera-muted text-xs mt-1">out of 145 total</div>
                </div>
            </div>

            {/* Booking Trend Chart */}
            <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                <h3 className="font-bold text-white mb-4">Booking Volume (30 Days)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={BOOKING_TRENDS}>
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1B', borderColor: '#2A2A2B', color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3B82F6"
                                fillOpacity={1}
                                fill="url(#colorBookings)"
                            />
                            <XAxis dataKey="date" hide />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Geographic / Misc Analytics Placeholder */}
            <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                <h3 className="font-bold text-white mb-4">Service Performance by Region</h3>
                <div className="space-y-3">
                    {['Downtown', 'North Suburbs', 'West Side', 'Industrial District'].map((region, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{region}</span>
                            <div className="w-1/2 bg-gray-800 rounded-full h-2">
                                <div
                                    className="bg-evera-primary h-2 rounded-full"
                                    style={{ width: `${Math.random() * 80 + 20}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
