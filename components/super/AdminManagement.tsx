import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { AdminUser, AdminRole, Permission } from '../../types';
import * as api from '../../api/service';
import { Icons } from '../ui/Icons';
import { Power, Edit3 } from 'lucide-react';
import { AdminRoleOverview } from './AdminRoleOverview';
import { AdminDetailView } from './AdminDetailView';

export const AdminManagement = ({ dateRangeLabel }: { dateRangeLabel?: string }) => {
    const { addNotification } = useApp();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'directory' | 'governance'>('directory');
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | 'NEW' | null>(null);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchAdmins();
            if (res.success && res.data) {
                const sanitized = res.data.map(a => ({
                    ...a,
                    isActive: a.isActive !== undefined ? a.isActive : true,
                    department: a.department || (a.role === AdminRole.FINANCE_ADMIN ? 'Finance' : a.role === AdminRole.OPERATIONS_ADMIN ? 'Operations' : 'Administration')
                }));
                setAdmins(sanitized);
            }
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleRoleChangeLocal = async (id: string, newRole: AdminRole) => {
        setAdmins(prev => prev.map(a => {
            if (a.id === id) {
                const newDept = newRole === AdminRole.FINANCE_ADMIN ? 'Finance' : newRole === AdminRole.OPERATIONS_ADMIN ? 'Operations' : newRole === AdminRole.SUPPORT_ADMIN ? 'Support' : 'Administration';
                return { ...a, role: newRole, department: newDept };
            }
            return a;
        }));
        try {
            const res = await api.updateAdmin(id, { role: newRole });
            if (res.success) {
                addNotification(`Admin role updated to ${newRole.replace('_', ' ')}`);
                loadAdmins();
            } else {
                addNotification('Failed to update role in backend');
            }
        } catch (e) {
            console.error(e);
            addNotification('Failed to update role in backend');
        }
    };

    const handleToggleStatus = async (id: string) => {
        const admin = admins.find(a => a.id === id);
        if (!admin) return;
        const nextStatus = !admin.isActive;
        setAdmins(prev => prev.map(a => {
            if (a.id === id) {
                return { ...a, isActive: nextStatus };
            }
            return a;
        }));
        try {
            const res = await api.updateAdmin(id, { status: nextStatus ? 'ACTIVE' : 'INACTIVE' });
            if (res.success) {
                addNotification(`Admin ${admin.name} is now ${nextStatus ? 'active' : 'inactive'}`);
                loadAdmins();
            } else {
                addNotification('Failed to update status in backend');
            }
        } catch (e) {
            console.error(e);
            addNotification('Failed to update status in backend');
        }
    };

    const handleOpenAdd = () => {
        setSelectedAdmin('NEW');
    };

    const handleOpenEdit = (admin: AdminUser) => {
        setSelectedAdmin(admin);
    };

    const handleSaveAdmin = async (formData: any, permissions: Record<string, string[]>) => {
        setIsLoading(true);
        try {
            let res;
            if (selectedAdmin !== 'NEW' && selectedAdmin) {
                res = await api.updateAdmin(selectedAdmin.id, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
                    password: formData.password || undefined
                });
            } else {
                res = await api.createAdmin({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    isActive: formData.isActive,
                    password: formData.password || 'admin123'
                });
            }
            if (res.success) {
                addNotification(selectedAdmin !== 'NEW' ? `Admin ${formData.name} updated successfully` : `Admin ${formData.name} created successfully`);
                await loadAdmins();
            } else {
                addNotification(res.error || 'Failed to save admin');
            }
        } catch (e) {
            console.error(e);
            addNotification('Network error saving admin');
        } finally {
            setIsLoading(false);
            setSelectedAdmin(null);
        }
    };

    const columns: Column<AdminUser>[] = [
        {
            header: 'Administrator',
            cell: (a) => (
                <div className="flex items-center space-x-3">
                    <img 
                        src={a.avatar || `https://ui-avatars.com/api/?name=${a.name.replace(' ', '+')}`} 
                        alt="" 
                        className="w-9 h-9 rounded-xl border border-evera-border object-cover" 
                    />
                    <div>
                        <div className="font-bold text-white text-sm">{a.name}</div>
                        <div className="text-xs text-evera-muted">{a.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Department',
            cell: (a) => <span className="text-xs text-gray-300 font-medium">{a.department || 'Administration'}</span>
        },
        {
            header: 'System Role',
            cell: (a) => (
                <select
                    value={a.role}
                    onChange={(e) => handleRoleChangeLocal(a.id, e.target.value as AdminRole)}
                    className="bg-[#161210] border border-[#38302C] rounded-lg text-xs px-2.5 py-1.5 text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value={AdminRole.OPERATIONS_ADMIN}>Operations Admin</option>
                    <option value={AdminRole.FINANCE_ADMIN}>Finance Admin</option>
                    <option value={AdminRole.SUPPORT_ADMIN}>Support Admin</option>
                </select>
            )
        },
        { 
            header: 'Last Session', 
            accessorKey: 'lastLogin', 
            cell: (a) => <span className="text-xs text-[#A8A29E] font-mono">{a.lastLogin || 'Never'}</span>
        },
        {
            header: 'Status',
            cell: (a) => (
                <div className="flex items-center gap-2">
                    <StatusBadge status={a.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(a.id);
                        }}
                        className={`p-1 rounded-lg border transition-all ${
                            a.isActive 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                        }`}
                        title={a.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                        <Power size={13} />
                    </button>
                </div>
            )
        },
        {
            header: 'Actions',
            cell: (a) => (
                <button 
                    onClick={() => handleOpenEdit(a)}
                    className="text-xs text-[#f48c25] hover:underline font-bold flex items-center gap-1"
                >
                    <Edit3 size={12} />
                    <span>Edit</span>
                </button>
            )
        }
    ];

    const filteredAdmins = admins.filter(a =>
        a.role !== AdminRole.SUPER_ADMIN &&
        (a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.department && a.department.toLowerCase().includes(search.toLowerCase())))
    );

    if (selectedAdmin) {
        return (
            <AdminDetailView 
                admin={selectedAdmin === 'NEW' ? 'NEW' : selectedAdmin}
                onBack={() => setSelectedAdmin(null)}
                onSave={handleSaveAdmin}
                dateRangeLabel={dateRangeLabel}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Platform Administrator Governance</h2>
                    <p className="text-xs text-[#A8A29E]">Manage admin users, assign system roles, view last access records, and moderate security parameters.</p>
                </div>
                {activeTab === 'directory' && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search admins or departments..."
                                className="w-full bg-[#241E1B] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f48c25] placeholder-[#A8A29E]/50"
                            />
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-evera-primary hover:bg-[#d9751a] px-4 py-2 text-xs rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20 whitespace-nowrap"
                        >
                            + Add Administrator
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-[#161210] border border-[#38302C] p-1 rounded-xl flex items-center gap-1 shadow-inner max-w-sm">
                <button
                    onClick={() => setActiveTab('directory')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all text-center ${
                        activeTab === 'directory' 
                            ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md animate-fade-in' 
                            : 'text-evera-muted hover:text-white'
                    }`}
                >
                    Admin Directory
                </button>
                <button
                    onClick={() => setActiveTab('governance')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all text-center ${
                        activeTab === 'governance' 
                            ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md animate-fade-in' 
                            : 'text-evera-muted hover:text-white'
                    }`}
                >
                    Role & Department Governance
                </button>
            </div>

            {activeTab === 'directory' ? (
                <div className="card bg-evera-card border-evera-border p-1 animate-fade-in">
                    <DataTable
                        columns={columns}
                        data={filteredAdmins}
                        isLoading={isLoading}
                        emptyMessage="No administrators configured"
                        onRowClick={(admin) => handleOpenEdit(admin)}
                    />
                </div>
            ) : (
                <div className="animate-fade-in">
                    <AdminRoleOverview />
                </div>
            )}
        </div>
    );
};
