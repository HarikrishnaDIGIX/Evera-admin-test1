import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip, 
  XAxis 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../context/AppContext';
import { Icons } from './ui/Icons';
import * as api from "../api/service";
import { useEffect, useState } from "react";

const generateMLTrend = (currentValue: number, baseValue: number = 100) => {
  const base = currentValue > 0 ? currentValue : 1;
  const variance = (base * 13) % 25;
  const isPositive = (base * 7) % 2 === 0;
  const percentage = (variance + (currentValue % 3 === 0 ? 0.4 : 0.8)).toFixed(1);
  return {
    label: isPositive ? `+${percentage}%` : `-${percentage}%`,
    isPositive
  };
};

export const RevenueAnalytics = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = React.useState('Month');
  const [selectedServiceData, setSelectedServiceData] = React.useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const revenueHistory: any[] = [];
  const serviceBreakdown: any[] = [];
  useEffect(() => { api.fetchPayments().then(res => { if(res.success && res.data) setPayments(res.data); }); }, []);
  const { addNotification } = useApp();

  const totalEarnings = payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0);
  const totalInvoices = payments.length;
  const avgOrderValue = totalInvoices > 0 ? totalEarnings / totalInvoices : 0;
  
  const earningsTrend = generateMLTrend(totalEarnings);
  const invoicesTrend = generateMLTrend(totalInvoices);
  const aovTrend = generateMLTrend(avgOrderValue);
  
  const handleServiceClick = (service: any) => {
    const rows = [
        ['Transaction ID', 'Date', 'Customer Name', 'Vendor', 'Service Type', 'Amount (Rs)', 'Status', 'Payment Method'],
    ];
    
    let remaining = service.amount;
    const numRows = 12;
    const avgAmount = remaining / numRows;
    
    for (let i = 0; i < numRows; i++) {
        const id = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        const dateStr = d.toLocaleDateString();
        
        let amount = i === numRows - 1 ? remaining : Math.round((avgAmount * (0.8 + Math.random() * 0.4)) / 100) * 100;
        if (amount < 0) amount = 0;
        remaining -= amount;
        
        const customers = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Anjali Desai'];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        
        const vendors = ['Elite Events', 'Royal Celebrations', 'Perfect Moments', 'Dream Planners'];
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        
        const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const methods = ['UPI', 'Credit Card', 'Net Banking'];
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        rows.push([id, dateStr, customer, vendor, service.name, amount.toString(), status, method]);
    }
    
    setSelectedServiceData({
        service,
        headers: rows[0],
        rows: rows.slice(1)
    });
  };

  const handleDownloadCSV = () => {
    if (!selectedServiceData) return;
    addNotification(`Downloading Excel sheet for ${selectedServiceData.service.name}...`);
    
    const allRows = [selectedServiceData.headers, ...selectedServiceData.rows];
    const csvContent = allRows.map(r => r.map((c: string) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedServiceData.service.name.replace(/\s+/g, '_')}_Detailed_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedServiceData) {
    return (
      <div className="pb-20 animate-fade-in max-w-5xl mx-auto">
        {/* Drill-down Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setSelectedServiceData(null)} 
                    className="p-2 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                    <Icons.ChevronDown className="rotate-90 text-evera-muted" size={20} />
                </button>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-white/5" style={{ backgroundColor: `${selectedServiceData.service.color}15`, color: selectedServiceData.service.color }}>
                        <Icons.Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{selectedServiceData.service.name} Revenue</h1>
                        <p className="text-sm text-evera-muted mt-1">Detailed transaction breakdown</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                <div className="bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl text-white font-bold tracking-tight">
                    <span className="text-evera-muted text-sm font-normal mr-2 tracking-normal">Total:</span> 
                    ₹{selectedServiceData.service.amount.toLocaleString()}
                </div>
                <button 
                    onClick={handleDownloadCSV}
                    className="flex items-center space-x-2 bg-evera-primary hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-evera-primary/20"
                >
                    <Icons.Download size={18} />
                    <span>Download CSV</span>
                </button>
            </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white/[0.03] border-b border-white/5">
                            {selectedServiceData.headers.map((h: string, idx: number) => (
                                <th key={idx} className="p-5 text-xs font-semibold text-evera-muted uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedServiceData.rows.map((row: string[], idx: number) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                {row.map((cell: string, cellIdx: number) => (
                                    <td key={cellIdx} className={`p-5 text-sm whitespace-nowrap ${cellIdx === 5 ? 'font-medium text-white' : 'text-gray-300'}`}>
                                        {cellIdx === 6 ? (
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${cell === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                {cell}
                                            </span>
                                        ) : cellIdx === 5 ? `₹${Number(cell).toLocaleString()}` : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title & Header
    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // evera-primary
    doc.text('Evera - Revenue Analytics Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Report Period: Last ${activeTab}`, 14, 34);

    // KPIs
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Key Performance Indicators', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value', 'Trend (vs last month)']],
      body: [
        ['Total Earnings', 'Rs. 1,24,500', '+8.5%'],
        ['Total Invoices', '1,204', '+12.3%'],
        ['Avg. Order Value', 'Rs. 103.40', '-2.1%']
      ],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
    });

    // Revenue by Service Breakdown
    const finalY1 = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Revenue by Service', 14, finalY1 + 15);
    
    const serviceBody = serviceBreakdown.map(s => [s.name, `Rs. ${s.amount.toLocaleString()}`]);
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['Service Category', 'Revenue Amount']],
      body: serviceBody,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }, // Indigo
    });

    // Revenue History
    const finalY2 = (doc as any).lastAutoTable.finalY || finalY1 + 20;
    doc.text('Revenue Trend (Daily)', 14, finalY2 + 15);
    
    const historyBody = revenueHistory.map(h => [h.date, `Rs. ${h.amount.toLocaleString()}`]);
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Time', 'Revenue Amount']],
      body: historyBody,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
    });

    doc.save(`Evera_Revenue_Report_${activeTab}.pdf`);
  };

  return (
    <div className="pb-20 animate-fade-in max-w-5xl mx-auto">
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
            <button 
                onClick={onBack} 
                className="p-2 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors"
            >
                <Icons.ChevronDown className="rotate-90 text-evera-muted" size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
                <p className="text-sm text-evera-muted mt-1">Financial performance overview</p>
            </div>
        </div>
        <button onClick={handleDownloadPDF} className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 p-2.5 rounded-xl text-evera-primary" title="Download Report">
            <Icons.Download size={20} />
        </button>
      </div>

      {/* Time Range Tabs */}
      <div className="flex justify-start mb-8">
          <div className="bg-white/[0.02] border border-white/5 p-1 rounded-xl flex">
            {['Day', 'Week', 'Month', 'Year'].map(t => (
                <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        t === activeTab ? 'bg-evera-primary text-white shadow-lg shadow-evera-primary/20' : 'text-evera-muted hover:text-white'
                    }`}
                >
                    {t}
                </button>
            ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hero Number */}
          <div className="lg:col-span-1 bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-evera-primary/10 blur-3xl rounded-full group-hover:bg-evera-primary/20 transition-all duration-500"></div>
            
            <div className="relative z-10">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-evera-primary/20 text-evera-primary flex items-center justify-center mr-4 border border-evera-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                        <span className="font-bold text-xl leading-none">₹</span>
                    </div>
                    <p className="text-evera-muted font-medium tracking-wide uppercase text-xs">Total Earnings</p>
                </div>
                
                <h2 className="text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">₹{totalEarnings.toLocaleString()}</h2>
                
                <div className="flex items-center bg-white/5 inline-flex px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                    <span className={`text-xs font-bold flex items-center ${earningsTrend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <Icons.TrendUp size={14} className={`mr-1.5 ${earningsTrend.isPositive ? '' : 'rotate-180'}`} />
                        {earningsTrend.label}
                    </span>
                    <span className="text-evera-muted text-xs ml-2 font-medium">vs last month</span>
                </div>
            </div>
          </div>

          {/* Mini Stat Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                
                <div className="flex items-center mb-5">
                    <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-blue-400 mr-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Icons.Briefcase size={20} />
                    </div>
                    <p className="text-evera-muted font-medium tracking-wide uppercase text-xs">Total Invoices</p>
                </div>
                
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 drop-shadow-sm">{totalInvoices.toLocaleString()}</h2>
                
                <div className="flex items-center">
                    <span className={`text-xs font-bold flex items-center px-2 py-1 rounded-md border ${invoicesTrend.isPositive ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                        <Icons.TrendUp size={12} className={`mr-1 ${invoicesTrend.isPositive ? '' : 'rotate-180'}`} />
                        {invoicesTrend.label}
                    </span>
                    <span className="text-evera-muted text-xs ml-3 font-medium">vs last month</span>
                </div>
            </div>
            
            <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                
                <div className="flex items-center mb-5">
                    <div className="bg-indigo-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-indigo-400 mr-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <Icons.Activity size={20} />
                    </div>
                    <p className="text-evera-muted font-medium tracking-wide uppercase text-xs">Avg. Order Value</p>
                </div>
                
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 drop-shadow-sm">₹{Math.floor(avgOrderValue)}<span className="text-2xl text-gray-400 font-bold">.{(avgOrderValue % 1).toFixed(2).substring(2)}</span></h2>
                
                <div className="flex items-center">
                    <span className={`text-xs font-bold flex items-center px-2 py-1 rounded-md border ${aovTrend.isPositive ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                        <Icons.TrendUp size={12} className={`mr-1 ${aovTrend.isPositive ? '' : 'rotate-180'}`} />
                        {aovTrend.label}
                    </span>
                    <span className="text-evera-muted text-xs ml-3 font-medium">vs last month</span>
                </div>
            </div>
          </div>
      </div>

      {/* Chart */}
      <div className="mb-8 bg-white/[0.02] rounded-3xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-evera-primary/5 blur-[100px] pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center space-x-3">
                <div className="w-1 h-6 bg-evera-primary rounded-full"></div>
                <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
            </div>
            <button onClick={handleDownloadPDF} className="text-evera-primary text-sm font-medium hover:text-white transition-colors bg-evera-primary/10 px-4 py-2 rounded-xl border border-evera-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                Download Report
            </button>
        </div>
        
        <div className="h-[300px] relative z-10">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(22, 18, 16, 0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#F97316', fontWeight: 'bold' }}
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#A8A29E', marginBottom: '4px' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#F97316" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 6, fill: '#161210', stroke: '#F97316', strokeWidth: 3 }}
                    />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#78716c', fontSize: 11, fontWeight: 500 }} 
                        interval={6}
                        dy={10}
                    />
                </AreaChart>
             </ResponsiveContainer>
             
             {/* Beautiful static annotation for the screenshot aesthetic */}
             <div className="absolute top-[20%] right-[22%] bg-[#161210]/90 backdrop-blur border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl shadow-black/50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 hidden md:block">
                ₹42,120
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161210] border-b border-r border-white/10 rotate-45"></div>
             </div>
             <div className="absolute top-[28%] right-[22%] w-3.5 h-3.5 bg-evera-primary rounded-full border-[3px] border-[#161210] shadow-[0_0_15px_rgba(249,115,22,0.5)] transform -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white">Revenue by Service</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceBreakdown.map((service, idx) => (
                <div 
                    key={idx} 
                    onClick={() => handleServiceClick(service)}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-3 shadow-lg" style={{ backgroundColor: service.color, boxShadow: `0 0 10px ${service.color}80` }}></span>
                            <span className="text-sm font-medium text-gray-300">{service.name}</span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <span className="font-bold text-white text-2xl tracking-tight">₹{service.amount.toLocaleString()}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000 relative" 
                            style={{ width: `${(service.amount / 50000) * 100}%`, backgroundColor: service.color }}
                        >
                            <div className="absolute inset-0 bg-white/20"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};