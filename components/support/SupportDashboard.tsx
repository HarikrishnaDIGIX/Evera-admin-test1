import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../ui/Icons';
import { Ticket } from '../../types';
import * as api from '../../api/service';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { X, FileText } from 'lucide-react';

interface SupportDashboardProps {
  onNavigate?: (screen: string) => void;
}

export const SupportDashboard: React.FC<SupportDashboardProps> = ({ onNavigate }) => {
  const { addNotification, supportWorkers, claimTicketLocal, adminUser, tickets } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<{title: string, filterFn: (t: Ticket) => boolean} | null>(null);

  // Derive counts and stats
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const urgentCount = tickets.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length;

  const workerMetrics = supportWorkers.map(w => {
    const workerTickets = tickets.filter(t => t.assignedWorkerId === w.id);
    const activeLoad = workerTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER').length;
    const claimed = workerTickets.length;
    const resolved = tickets.filter(t => t.resolvedByWorkerId === w.id || (t.assignedWorkerId === w.id && (t.status === 'RESOLVED' || t.status === 'CLOSED'))).length;
    const escalations = tickets.filter(t => t.assignedWorkerId === w.id && (t.status === 'ESCALATED' || t.escalationLevel === 'SUPPORT_ADMIN' || t.escalationLevel === 'SUPER_ADMIN')).length;
    
    const avgSpeed = '1.5 hrs';
    const csat = '4.8';

    return {
      ...w,
      activeLoad,
      claimed,
      resolved,
      escalations,
      avgSpeed,
      csat
    };
  });

  const departmentInbox = tickets.filter(t => t.assignedDepartment === 'SUPPORT' || t.assignedDepartment === 'TECHNICAL');

  const kpis = [
    { name: 'Active Tickets', value: openTickets, trend: 'Requires attention', color: '#f48c25', icon: Icons.Chat, filterFn: (t: Ticket) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER' },
    { name: 'Avg Response Time', value: '1h 35m', trend: 'SLA: under 2h', color: '#10b981', icon: Icons.Check, filterFn: (t: Ticket) => !!t.assignedWorkerId && (t.status === 'RESOLVED' || t.status === 'CLOSED') },
    { name: 'SLA Compliance', value: '96.8%', trend: 'Target 95.0%', color: '#3b82f6', icon: Icons.TrendUp, filterFn: (t: Ticket) => t.escalationLevel !== 'SUPER_ADMIN' && t.priority !== 'URGENT' },
    { name: 'Urgent Tickets', value: urgentCount, trend: `${tickets.filter(t => t.priority === 'URGENT').length} Escalated`, color: '#ef4444', icon: Icons.Bell, filterFn: (t: Ticket) => t.priority === 'URGENT' },
  ];

  // Recharts Chart Data
  const responseTimeData = [
    { day: 'Mon', time: 110 },
    { day: 'Tue', time: 95 },
    { day: 'Wed', time: 105 },
    { day: 'Thu', time: 80 },
    { day: 'Fri', time: 70 },
    { day: 'Sat', time: 90 },
    { day: 'Sun', time: 60 },
  ];

  const priorityCounts = tickets.reduce((acc: any, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityPieData = [
    { name: 'Urgent', value: priorityCounts['URGENT'] || 0, color: '#ef4444' },
    { name: 'High', value: priorityCounts['HIGH'] || 0, color: '#f97316' },
    { name: 'Medium', value: priorityCounts['MEDIUM'] || 0, color: '#3b82f6' },
    { name: 'Low', value: priorityCounts['LOW'] || 0, color: '#10b981' },
  ].filter(p => p.value > 0);

  const filteredTickets = selectedFilter ? tickets.filter(selectedFilter.filterFn) : [];

  const ticketColumns: Column<Ticket>[] = [
    { header: 'Ticket ID', cell: (t) => <span className="text-white font-bold">{t.ticketNumber || t.id}</span> },
    { header: 'Subject', cell: (t) => <span className="text-gray-300">{t.subject}</span> },
    { header: 'Status', cell: (t) => <StatusBadge status={t.status} /> },
    { header: 'Priority', cell: (t) => <StatusBadge status={t.priority} /> },
    { header: 'Assigned To', cell: (t) => <span className="text-gray-400">{t.assignedToName || 'Unassigned'}</span> }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Support Command Center</h2>
          <p className="text-xs text-[#A8A29E]">Overview of active user support issues, SLA commitments, and resolution statistics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedFilter({ title: kpi.name, filterFn: kpi.filterFn })}
            className="card stat-card relative overflow-hidden group hover:border-evera-primary/50 cursor-pointer hover:bg-white/5 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
                <kpi.icon size={20} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: kpi.name === 'Urgent Tickets' && urgentCount > 0 ? '#ef4444' : '#10b981' }}>{kpi.trend}</span>
            </div>
            <div>
              <p className="stat-label mb-1 uppercase tracking-tighter text-[10px] font-bold text-[#A8A29E]">{kpi.name}</p>
              <h3 className="stat-value text-white text-2xl font-black">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Response Time Chart */}
        <div className="col-span-12 lg:col-span-8 card bg-evera-card border-evera-border p-5">
          <h3 className="font-bold text-white mb-6">Avg Response Time Trend (Minutes)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38302C" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: '#241E1B', borderRadius: '12px', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                <Line type="monotone" dataKey="time" name="Avg Response Time (mins)" stroke="#f48c25" strokeWidth={3} dot={{ r: 4, fill: '#f48c25' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Donut Chart */}
        <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border p-5">
          <h3 className="font-bold text-white mb-6">Priority Distribution</h3>
          {priorityPieData.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityPieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {priorityPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#241E1B', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {priorityPieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium truncate">{item.name}</p>
                      <p className="text-xs font-bold text-white">{item.value} Tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-evera-muted text-center py-20">No active priorities to display</p>
          )}
        </div>
      </div>

      {/* Support Worker Load & Performance Tracker & Technical Escalation Queue */}
      <div className="grid grid-cols-12 gap-6">
        {/* Support Worker Load Tracker */}
        <div className="col-span-12 lg:col-span-7 card bg-evera-card border-evera-border p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                <Icons.Users size={16} />
              </span>
              <span>👥 Support Worker Load & Performance Tracker</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A8A29E] bg-[#161210] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Worker</th>
                  <th className="px-4 py-2.5 text-center">Claimed</th>
                  <th className="px-4 py-2.5 text-center">Active Load</th>
                  <th className="px-4 py-2.5 text-center">Resolved</th>
                  <th className="px-4 py-2.5 text-center">Escalated</th>
                  <th className="px-4 py-2.5 text-center">Avg Speed</th>
                  <th className="px-4 py-2.5 text-center">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {workerMetrics.map((worker) => (
                  <tr 
                    key={worker.id} 
                    onClick={() => setSelectedFilter({ title: `Tickets for ${worker.name}`, filterFn: t => t.assignedWorkerId === worker.id })}
                    className="border-b border-[#38302C]/40 hover:bg-white/5 last:border-none cursor-pointer transition-all"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-evera-primary/20 text-[#f48c25] flex items-center justify-center font-bold text-xs">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{worker.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{worker.employeeId} • {worker.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-white">
                      {worker.claimed}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        worker.activeLoad > 5 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        worker.activeLoad > 2 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {worker.activeLoad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-white">
                      {worker.resolved}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-red-400">
                      {worker.escalations}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                      {worker.avgSpeed}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-yellow-400 font-bold">
                      ★ {worker.csat}
                    </td>
                  </tr>
                ))}
                {workerMetrics.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-xs text-evera-muted text-center py-6">No support workers registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical & Support Escalation Inbox */}
        <div className="col-span-12 lg:col-span-5 card bg-evera-card border-evera-border p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <Icons.Bell size={16} />
              </span>
              <span>💻 Tech & Support Escalation Queue</span>
            </h3>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('tickets')} 
                className="text-[10px] text-evera-primary font-bold hover:underline"
              >
                View Workspace
              </button>
            )}
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {departmentInbox.map((ticket, i) => (
              <div key={i} className="flex items-center gap-4 justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-evera-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-evera-primary">{ticket.ticketNumber}</span>
                    <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-1.5 py-0.2 rounded border border-red-500/20 uppercase">
                      {ticket.assignedDepartment}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-1">{ticket.subject}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">Cust: {ticket.customerName}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    ticket.priority === 'URGENT' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    ticket.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {ticket.priority}
                  </span>
                  {onNavigate && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (claimTicketLocal && adminUser) {
                            await claimTicketLocal(ticket.id);
                            addNotification(`Ticket ${ticket.ticketNumber} assigned to you`);
                          }
                        }}
                        className="text-[9px] bg-[#38302C] hover:bg-[#f48c25] hover:text-white text-gray-300 px-2 py-0.5 rounded font-bold transition-all border border-[#f48c25]/20 hover:border-[#f48c25]"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => onNavigate('tickets')}
                        className="text-[9px] bg-evera-primary hover:bg-[#d9751a] text-white px-2 py-0.5 rounded font-bold transition-all"
                      >
                        Handle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {departmentInbox.length === 0 && (
              <div className="text-center py-12 text-xs text-evera-muted border border-dashed border-evera-border rounded-xl">
                No active escalations in Technical or Support departments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Ticket Activity */}
      <div className="card bg-evera-card border-evera-border p-5 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white">Recent Support Activity</h3>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('tickets')} 
              className="text-xs text-evera-primary font-bold hover:underline"
            >
              Manage Tickets
            </button>
          )}
        </div>
        <div className="space-y-4">
          {tickets.slice(0, 4).map((ticket, i) => (
            <div key={i} className="flex items-center gap-4 justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                  ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  <Icons.Chat size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{ticket.subject}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{ticket.ticketNumber} • Customer: {ticket.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  ticket.priority === 'URGENT' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  ticket.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  ticket.status === 'OPEN' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-stone-500/10 border-stone-500/30 text-stone-400'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-xs text-evera-muted text-center py-6">No recent support activity.</p>
          )}
        </div>
      </div>

      {/* Tickets List Modal */}
      {selectedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-evera-card border border-evera-border rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-evera-border bg-[#161210]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText size={18} className="text-evera-primary" />
                {selectedFilter.title} ({filteredTickets.length})
              </h3>
              <button 
                onClick={() => setSelectedFilter(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#0d0a09]">
              <DataTable
                columns={ticketColumns}
                data={filteredTickets}
                emptyMessage="No tickets found for this selection."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
