import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './ui/Icons';
import { Worker, WorkerStatus, UserRole, AdminRole } from '../types';
import * as api from '../api/service';

interface UserManagementProps {
    onBack: () => void;
}

type SortOption = 'RECENT' | 'RATING' | 'EXPERIENCE' | 'STATUS';

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { workers, refreshData, addNotification, adminUser } = useApp();
  const userRole = adminUser?.role;
  const isSupportRole = adminUser?.role === 'SUPPORT_ADMIN' || adminUser?.role === 'SUPPORT_WORKER';
  const [filter, setFilter] = useState<'ALL' | WorkerStatus>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('STATUS');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{id: string, name: string, prevStatus: WorkerStatus} | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Computed Vendors List
  const filteredWorkers = useMemo(() => {
    let result = workers.filter(w => {
        if (isSupportRole && w.status !== WorkerStatus.ACTIVE) return false;
        if (filter !== 'ALL' && w.status !== filter) return false;
        if (debouncedSearch) {
             const term = debouncedSearch.toLowerCase();
             const matchesName = w.name.toLowerCase().includes(term);
             const matchesRole = w.role.toLowerCase().includes(term);
             const matchesEmail = w.email?.toLowerCase().includes(term) ?? false;
             // We'll safely check for phone or other properties we might add
             const matchesPhone = ('phone' in w && typeof w.phone === 'string') ? w.phone.toLowerCase().includes(term) : false;
             
             if (!matchesName && !matchesRole && !matchesEmail && !matchesPhone) return false;
        }
        return true;
      });

    // Sort Logic
    return result.sort((a, b) => {
        switch (sortOption) {
            case 'RATING':
                return b.rating - a.rating;
            case 'EXPERIENCE': // Jobs Completed as proxy for experience
                return b.jobsCompleted - a.jobsCompleted;
            case 'RECENT':
                // String comparison of ISO dates works for YYYY-MM-DD
                return b.joinedDate.localeCompare(a.joinedDate);
            case 'STATUS':
            default:
                 // Sort Pending first
                if (a.status === WorkerStatus.PENDING && b.status !== WorkerStatus.PENDING) return -1;
                if (a.status !== WorkerStatus.PENDING && b.status === WorkerStatus.PENDING) return 1;
                return 0;
        }
    });
  }, [workers, filter, debouncedSearch, sortOption]);

  const handleStatusChange = async (id: string, newStatus: WorkerStatus) => {
    if (userRole !== AdminRole.SUPER_ADMIN && newStatus === WorkerStatus.DELETED) {
      alert("Only Admins can delete vendors.");
      return;
    }

    setProcessingId(id);
    const worker = workers.find(w => w.id === id);
    
    const res = newStatus === WorkerStatus.DELETED 
      ? await api.deleteWorker(id)
      : await api.updateWorkerStatus(id, newStatus);
    
    setProcessingId(null);

    if (res.success) {
      addNotification(`Vendor ${newStatus.toLowerCase()} successfully`);
      if (newStatus === WorkerStatus.DELETED && worker) {
        setToast({ id, name: worker.name, prevStatus: worker.status });
        setTimeout(() => setToast(null), 7000);
      }
      refreshData();
    } else {
      alert(res.error);
    }
  };

  const handleUndo = async () => {
    if (!toast) return;
    setToast(null);
    await api.undoDeleteWorker(toast.id, toast.prevStatus);
    refreshData();
    addNotification(`Restored ${toast.name}`);
  };

  const cycleSort = () => {
      const options: SortOption[] = ['STATUS', 'RECENT', 'RATING', 'EXPERIENCE'];
      const currentIdx = options.indexOf(sortOption);
      const nextIdx = (currentIdx + 1) % options.length;
      setSortOption(options[nextIdx]);
  }

  const getSortLabel = () => {
      switch(sortOption) {
          case 'STATUS': return 'Status (Pending First)';
          case 'RECENT': return 'Recently Active';
          case 'RATING': return 'Highest Rating';
          case 'EXPERIENCE': return 'Most Experience';
      }
  }

  const selectedVendor = workers.find(w => w.id === selectedVendorId);

  return (
    <div className="pb-20 animate-fade-in min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
            <button onClick={onBack} className="text-evera-muted hover:text-white"><Icons.ChevronDown className="rotate-90" /></button>
            <h1 className="text-xl font-bold text-white">Vendor Management</h1>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex space-x-3 mb-6">
        <div className="flex-1 bg-evera-card border border-evera-border rounded-lg flex items-center px-3 py-3">
            <Icons.Search size={18} className="text-evera-muted" />
            <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                className="bg-transparent border-none outline-none text-white ml-2 w-full placeholder-evera-muted text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Filter Tabs */}
      {!isSupportRole && (
          <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
            {(['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED'] as const).map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f === 'ALL' ? 'ALL' : f as WorkerStatus)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        (filter === f || (filter === 'ALL' && f === 'ALL')) 
                        ? 'bg-evera-primary text-white' 
                        : 'bg-evera-card text-evera-muted border border-evera-border'
                    }`}
                >
                    {f === 'ALL' ? 'All Vendors' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
            ))}
          </div>
      )}

      {/* Stats Mini Cards */}
      <div className={`grid ${!isSupportRole ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
        {!isSupportRole && (
            <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
                <p className="text-evera-muted text-xs mb-1">Total Vendors</p>
                <div className="flex items-baseline">
                    <span className="text-xl font-bold text-white">{workers.length}</span>
                    <span className="text-green-500 text-xs ml-2 font-medium">+12%</span>
                </div>
            </div>
        )}
        <div className="bg-evera-card p-4 rounded-xl border border-evera-border">
            <p className="text-evera-muted text-xs mb-1">Active Vendors</p>
            <div className="flex items-baseline">
                <span className="text-xl font-bold text-white">{workers.filter(w => w.status === WorkerStatus.ACTIVE).length}</span>
                <span className="text-green-500 text-xs ml-2 font-medium">+5%</span>
            </div>
        </div>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">All Vendors</h2>
        <button onClick={cycleSort} className="text-xs text-evera-muted hover:text-white transition-colors">
            Sorted by: <span className="font-semibold text-evera-primary">{getSortLabel()}</span>
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-evera-card rounded-xl p-4 border border-evera-border group relative">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="relative">
                            <img src={worker.avatar} alt={worker.name} className="w-12 h-12 rounded-full object-cover bg-gray-700" />
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-evera-card ${
                                worker.status === WorkerStatus.ACTIVE ? 'bg-green-500' :
                                worker.status === WorkerStatus.PENDING ? 'bg-orange-500' : 'bg-red-500'
                            }`}></span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-white font-semibold">{worker.name}</h3>
                            <p className="text-evera-muted text-xs">{worker.email}</p>
                            <span className={`text-xs mt-1 inline-block ${
                                worker.status === WorkerStatus.ACTIVE ? 'text-blue-400' :
                                worker.status === WorkerStatus.PENDING ? 'text-evera-primary' : 'text-red-400'
                            }`}>
                                {worker.role} {worker.status === WorkerStatus.SUSPENDED && '(Suspended)'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-evera-border my-3 opacity-50"></div>

                {/* Info Row */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-evera-muted uppercase tracking-wider font-semibold mb-0.5">
                            {worker.status === WorkerStatus.PENDING ? 'STATUS' : 'TOTAL EARNED'}
                        </p>
                        <p className="text-white font-bold text-sm">
                            {worker.status === WorkerStatus.PENDING ? 'Policy Check...' : `₹${worker.totalEarned.toLocaleString()}`}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {worker.status === WorkerStatus.PENDING ? (
                            <button 
                                onClick={() => handleStatusChange(worker.id, WorkerStatus.ACTIVE)}
                                disabled={!!processingId}
                                className="bg-green-900/30 text-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-900/50 transition-colors flex items-center"
                            >
                                <Icons.Check size={14} className="mr-1.5" /> Approve
                            </button>
                        ) : worker.status === WorkerStatus.SUSPENDED ? (
                             <button 
                                onClick={() => handleStatusChange(worker.id, WorkerStatus.ACTIVE)}
                                className="bg-green-900/30 text-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-900/50 transition-colors flex items-center"
                            >
                                <Icons.Undo size={14} className="mr-1.5" /> Reactivate
                            </button>
                        ) : (
                            <div className="flex items-center text-sm font-bold text-yellow-500">
                                <span className="mr-1">★</span> {worker.rating}
                            </div>
                        )}
                        
                        <button 
                            onClick={() => setSelectedVendorId(worker.id)}
                            className="bg-evera-bg text-evera-primary border border-evera-border px-3 py-2 rounded-lg text-xs font-medium hover:bg-evera-cardHover transition-colors"
                        >
                            View Profile
                        </button>
                        
                        {/* Admin Only Delete */}
                        {userRole === AdminRole.SUPER_ADMIN && worker.status !== WorkerStatus.PENDING && (
                             <button 
                                onClick={() => handleStatusChange(worker.id, WorkerStatus.DELETED)}
                                className="p-2 text-evera-muted hover:text-red-500 transition-colors"
                                title="Delete Vendor"
                            >
                                <Icons.Delete size={16} />
                            </button>
                        )}
                        
                         {/* Reject Pending */}
                        {worker.status === WorkerStatus.PENDING && (
                             <button 
                                onClick={() => handleStatusChange(worker.id, WorkerStatus.SUSPENDED)}
                                className="p-2 text-evera-muted hover:text-red-500 transition-colors"
                            >
                                <Icons.Reject size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ))}

        {filteredWorkers.length === 0 && (
            <div className="text-center py-10 text-evera-muted">
                No vendors found matching filters.
            </div>
        )}
      </div>

      {/* Undo Toast */}
      {toast && (
          <div className="fixed bottom-24 left-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex justify-between items-center z-50 border border-gray-700 animate-slide-up">
              <span>{toast.name} deleted.</span>
              <button onClick={handleUndo} className="text-evera-primary font-bold text-sm uppercase">Undo</button>
          </div>
      )}

      {/* Floating Add Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-evera-primary rounded-full shadow-lg shadow-orange-900/50 flex items-center justify-center text-white hover:bg-evera-primaryHover transition-transform active:scale-95">
        <Icons.Check className="rotate-45" size={28} />
      </button>

      {/* Vendor Profile Modal */}
      {selectedVendor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendorId(null)}>
              <div className="bg-evera-card w-full max-w-md rounded-2xl border border-evera-border overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="h-24 bg-gradient-to-r from-evera-primary to-orange-700 relative">
                        <button onClick={() => setSelectedVendorId(null)} className="absolute top-2 right-2 p-2 bg-black/20 text-white rounded-full hover:bg-black/40">
                            <Icons.Reject size={20} />
                        </button>
                  </div>
                  <div className="px-6 pb-6 relative">
                      <div className="relative -top-10 mb-[-30px]">
                           <img src={selectedVendor.avatar} className="w-20 h-20 rounded-full border-4 border-evera-card bg-gray-800" alt={selectedVendor.name} />
                      </div>
                      <div className="mt-2 mb-6">
                        <h2 className="text-2xl font-bold text-white">{selectedVendor.name}</h2>
                        <p className="text-evera-muted">{selectedVendor.role}</p>
                        <div className="flex items-center mt-2 space-x-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                selectedVendor.status === WorkerStatus.ACTIVE ? 'bg-green-900/40 text-green-500' :
                                selectedVendor.status === WorkerStatus.PENDING ? 'bg-orange-900/40 text-orange-500' : 'bg-red-900/40 text-red-500'
                             }`}>
                                 {selectedVendor.status}
                             </span>
                             <span className="text-evera-muted text-sm flex items-center"><Icons.Calendar size={12} className="mr-1"/> Joined {selectedVendor.joinedDate}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between p-3 bg-evera-bg rounded-lg border border-evera-border">
                                <span className="text-evera-muted text-sm">Rating</span>
                                <span className="text-white font-bold flex items-center"><span className="text-yellow-500 mr-1">★</span> {selectedVendor.rating}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-evera-bg rounded-lg border border-evera-border">
                                <span className="text-evera-muted text-sm">Jobs Completed</span>
                                <span className="text-white font-bold">{selectedVendor.jobsCompleted}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-evera-bg rounded-lg border border-evera-border">
                                <span className="text-evera-muted text-sm">Total Earnings</span>
                                <span className="text-white font-bold">₹{selectedVendor.totalEarned.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-evera-bg rounded-lg border border-evera-border">
                                <span className="text-evera-muted text-sm">Email</span>
                                <span className="text-white text-sm truncate max-w-[200px]">{selectedVendor.email}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};