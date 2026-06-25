import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, User, Mail, FileText, Check, AlertTriangle, Plus } from 'lucide-react';

export const CreateTicket: React.FC<{ onBack: () => void; onCreated: () => void }> = ({ onBack, onCreated }) => {
  const { createTicketLocal, addNotification, bookings } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchBookingId, setSearchBookingId] = useState('');
  const [autoFillTarget, setAutoFillTarget] = useState<'customer' | 'vendor'>('customer');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    customerName: '',
    customerEmail: '',
    category: 'SERVICE_QUALITY' as 'BOOKING' | 'PAYMENT' | 'VENDOR' | 'TECHNICAL' | 'SERVICE_QUALITY' | 'OTHER',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    description: '',
  });

  const categories = [
    { value: 'SERVICE_QUALITY', label: 'Service Quality' },
    { value: 'BOOKING', label: 'Booking' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'VENDOR', label: 'Vendor' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'OTHER', label: 'Other' },
  ];

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.subject.trim() || !formData.customerName.trim() || !formData.customerEmail.trim() || !formData.description.trim()) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      await createTicketLocal(formData);
      onCreated();
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'An unexpected error occurred while creating the ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Create New Support Ticket</h2>
          <p className="text-xs text-[#A8A29E]">Manually file a customer support, dispute, or technical service issue.</p>
        </div>
      </div>

      <div className="bg-evera-card border border-evera-border rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Booking Search Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#38302C] pb-2">
              <h3 className="text-sm font-bold text-white">Auto-fill from Booking</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8A29E] font-bold">
                  <input type="radio" checked={autoFillTarget === 'customer'} onChange={() => setAutoFillTarget('customer')} className="accent-[#f48c25]" />
                  Load Customer
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8A29E] font-bold">
                  <input type="radio" checked={autoFillTarget === 'vendor'} onChange={() => setAutoFillTarget('vendor')} className="accent-[#f48c25]" />
                  Load Vendor
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                  type="text" 
                  value={searchBookingId}
                  onChange={e => setSearchBookingId(e.target.value)}
                  placeholder="Enter Booking Number (e.g. b1000)"
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
              />
              <button 
                  type="button"
                  onClick={async () => {
                      try {
                          const res = await import('../../api/service').then(m => m.fetchPayments());
                          if (res.success && res.data) {
                              const match = res.data.find((p: any) => p.bookingId.toLowerCase() === searchBookingId.toLowerCase());
                              
                              if (match) {
                                  if (autoFillTarget === 'customer') {
                                      setFormData(prev => ({
                                          ...prev,
                                          customerName: match.customer?.name || 'Unknown Customer',
                                          customerEmail: `${(match.customer?.name || 'customer').split(' ')[0].toLowerCase()}@example.com`,
                                          subject: `Issue with booking ${searchBookingId.toUpperCase()} (Vendor: ${match.vendor?.name || 'Assigned'})`
                                      }));
                                      addNotification('Auto-filled Customer details');
                                  } else {
                                      setFormData(prev => ({
                                          ...prev,
                                          customerName: match.vendor?.name || 'Assigned Vendor',
                                          customerEmail: `${(match.vendor?.name || 'vendor').split(' ')[0].toLowerCase()}@example.com`,
                                          subject: `Vendor Inquiry for booking ${searchBookingId.toUpperCase()}`
                                      }));
                                      addNotification('Auto-filled Vendor details');
                                  }
                                  return;
                              }
                          }
                      } catch (e) {
                          console.error("Failed to search booking in payments", e);
                      }
                      
                      const fallbackMatch = bookings.find(b => b.id.toLowerCase() === searchBookingId.toLowerCase());
                      if (fallbackMatch) {
                          if (autoFillTarget === 'customer') {
                              setFormData(prev => ({
                                  ...prev,
                                  customerName: fallbackMatch.customerName,
                                  customerEmail: `${fallbackMatch.customerName.split(' ')[0].toLowerCase()}@example.com`,
                                  subject: `Issue with booking ${searchBookingId.toUpperCase()} (Vendor: ${fallbackMatch.provider || 'Assigned'})`
                              }));
                              addNotification('Auto-filled Customer details');
                          } else {
                              setFormData(prev => ({
                                  ...prev,
                                  customerName: fallbackMatch.provider || 'Assigned Vendor',
                                  customerEmail: `${(fallbackMatch.provider || 'vendor').split(' ')[0].toLowerCase()}@example.com`,
                                  subject: `Vendor Inquiry for booking ${searchBookingId.toUpperCase()}`
                              }));
                              addNotification('Auto-filled Vendor details');
                          }
                          return;
                      }

                      addNotification('Booking not found');
                  }}
                  className="bg-[#38302C] text-white px-6 rounded-lg font-bold hover:bg-[#48403C] transition-colors whitespace-nowrap text-sm"
              >
                  Search
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#38302C] pb-2">User Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">User Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">User Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@example.com"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#38302C] pb-2">Ticket Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                >
                  {priorities.map(prio => (
                    <option key={prio.value} value={prio.value}>{prio.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Subject / Issue Summary *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FileText size={14} />
                </span>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Booking payment checkout failure"
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Description / Details *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of the customer dispute, technical glitch, or payment issue..."
                rows={5}
                className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-[#38302C]">
            <button
              type="button"
              onClick={onBack}
              className="bg-[#241E1B] border border-[#38302C] px-6 py-2.5 rounded-lg text-sm text-white font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#f48c25] hover:bg-[#d9751a] px-8 py-2.5 rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Create Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Validation Error Overlay */}
      {validationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161210] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-900/20 max-w-sm w-full overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Validation Error</h3>
                <p className="text-sm text-gray-400 mt-2">{validationError}</p>
              </div>
            </div>
            <div className="p-4 bg-[#241E1B] border-t border-[#38302C]">
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="w-full bg-[#f48c25] hover:bg-[#d9751a] py-2.5 rounded-lg text-sm text-white font-bold transition-colors"
              >
                Okay, I'll fix it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
