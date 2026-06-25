import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const REVENUE_DATA = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 22000 },
    { month: 'May', amount: 28000 },
    { month: 'Jun', amount: 25000 },
];

export const FinancialReports = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Financial Reports</h2>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted">Total Revenue (YTD)</h3>
                    <div className="text-2xl font-bold text-white mt-1">₹6,45,200</div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted">Pending Settlements</h3>
                    <div className="text-2xl font-bold text-white mt-1">₹42,100</div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                    <h3 className="text-sm text-evera-muted">Platform Fees</h3>
                    <div className="text-2xl font-bold text-white mt-1">₹64,520</div>
                </div>
            </div>

            <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                <h3 className="text-white font-bold mb-4">Monthly Revenue</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_DATA}>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1B', borderColor: '#2A2A2B', color: '#fff' }}
                                cursor={{ fill: '#ffffff10' }}
                            />
                            <Bar dataKey="amount" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
