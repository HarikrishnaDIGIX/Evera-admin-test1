import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import * as api from '../../api/service';
import { Column, DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';


export const InvoiceGenerator: React.FC<{ dateRangeLabel?: string, dateRangeValue?: string }> = ({ dateRangeLabel = 'Last 30 Days' }) => {
    const { addNotification, bookings } = useApp();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState<any>(null);
    const [searchBookingId, setSearchBookingId] = useState('');
    const [foundBooking, setFoundBooking] = useState<any>(null);

    useEffect(() => {
        loadInvoices();
    }, [dateRangeLabel]);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchInvoices();
            if (res.success && res.data) {
                setInvoices(res.data);
            } else {
                setInvoices([]);
            }
        } catch (e) {
            console.error(e);
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMail = async (invoice: any, target: 'customer' | 'vendor') => {
        const email = target === 'customer' ? 'customer@example.com' : 'vendor@example.com';
        const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber || invoice.invoice_number} from Evera Platform`);
        const body = encodeURIComponent(`Hello ${target === 'customer' ? 'Customer' : invoice.vendorName || invoice.vendor_name || 'Vendor'},

Please find the full details for your recent invoice below:

--------------------------------------------------
INVOICE SUMMARY
--------------------------------------------------
Invoice No: ${invoice.invoiceNumber || invoice.invoice_number}
Date: ${invoice.generatedDate || invoice.generated_date || invoice.created_at?.split('T')[0] || 'N/A'}
Due Date: ${invoice.dueDate || invoice.due_date || 'N/A'}
Bill To: ${invoice.vendorName || invoice.vendor_name || 'N/A'}

--------------------------------------------------
LINE ITEMS
--------------------------------------------------
1. Platform Services & Booking Fees
   Quantity: 1
   Rate: Rs. ${Number(invoice.amount || (invoice.totalAmount - (invoice.tax || 0)) || 0).toLocaleString()}
   Amount: Rs. ${Number(invoice.amount || (invoice.totalAmount - (invoice.tax || 0)) || 0).toLocaleString()}

--------------------------------------------------
TOTALS
--------------------------------------------------
Subtotal: Rs. ${Number(invoice.amount || (invoice.totalAmount - (invoice.tax || 0)) || 0).toLocaleString()}
Tax (18% GST): Rs. ${Number(invoice.tax || 0).toLocaleString()}
Total Amount: Rs. ${Number(invoice.totalAmount || invoice.total_amount || 0).toLocaleString()}

Thank you for choosing Evera!

Best Regards,
Evera Platform Team`);

        // Use a temporary anchor link to reliably trigger the mailto protocol in all browsers
        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
        const a = document.createElement('a');
        a.href = mailtoLink;
        a.click();

        const res = await api.sendInvoice(invoice.id);
        if (res.success) {
            addNotification(`Opening mail client for ${target}...`);
            loadInvoices();
        }
    };

    const handleRaiseInvoice = async () => {
        if (!foundBooking) return;
        
        const amount = foundBooking.amount || 0;
        const tax = Math.floor(amount * 0.18);
        const totalAmount = amount + tax;

        const newInvoiceNumber = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
        
        const newInvoice: Omit<Invoice, 'id'> = {
            invoiceNumber: newInvoiceNumber,
            vendorId: foundBooking.id,
            vendorName: foundBooking.provider || 'Assigned Vendor',
            amount: amount,
            tax: tax,
            totalAmount: totalAmount,
            status: 'DRAFT',
            generatedDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: []
        };
        
        const res = await api.createInvoice(newInvoice);
        if (res.success && res.data) {
            addNotification(`Created new draft invoice ${newInvoiceNumber} for ${foundBooking.provider || 'Vendor'}`);
            setIsModalOpen(false);
            setFoundBooking(null);
            setSearchBookingId('');
            loadInvoices();
        } else {
            addNotification(`Failed to create invoice`);
        }
    };

    const handleSearchBooking = async () => {
        try {
            const res = await api.fetchPayments();
            if (res.success && res.data) {
                const cleanSearchId = searchBookingId.toLowerCase().replace(/_/g, '');
                
                // First try to find by Booking ID directly
                let matchedPayment = res.data.find((p: any) => p.bookingId.toLowerCase() === searchBookingId.toLowerCase());
                
                // If not found, try by Transaction ID
                if (!matchedPayment) {
                    matchedPayment = res.data.find((p: any) => p.transactionId.toLowerCase().replace(/_/g, '') === cleanSearchId);
                }

                if (matchedPayment) {
                    const synthesizedBooking = {
                        id: matchedPayment.bookingId,
                        customerName: matchedPayment.customer?.name || 'Unknown Customer',
                        customerPhone: matchedPayment.customer?.phone || '+91 98765 43210',
                        provider: matchedPayment.vendor?.name || 'Assigned Vendor',
                        vendorPhone: matchedPayment.vendor?.phone || '+91 91234 56789',
                        serviceType: matchedPayment.serviceName || 'General Service',
                        amount: matchedPayment.amount
                    };
                    setFoundBooking(synthesizedBooking);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to fetch payments for search", e);
        }

        // Fallback: check global bookings array just in case
        const fallbackMatch = bookings.find(b => b.id.toLowerCase() === searchBookingId.toLowerCase());
        if (fallbackMatch) {
            setFoundBooking(fallbackMatch);
            return;
        }

        addNotification('No booking or transaction found with that ID');
        setFoundBooking(null);
    };

    const handleDownload = (invoiceNumber: string) => {
        const blob = new Blob([`Dummy PDF Content for ${invoiceNumber}`], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addNotification(`Downloading ${invoiceNumber}.pdf`);
    };

    const columns: Column<Invoice>[] = [
        { header: 'Invoice #', accessorKey: 'invoiceNumber', cell: (i: any) => i.invoiceNumber || i.invoice_number },
        { header: 'Vendor', accessorKey: 'vendorName', cell: (i: any) => i.vendorName || i.vendor_name || 'System Auto' },
        { header: 'Date', accessorKey: 'generatedDate', cell: (i: any) => i.generatedDate || i.generated_date || i.created_at?.split('T')[0] || 'N/A' },
        { header: 'Due Date', accessorKey: 'dueDate', cell: (i: any) => i.dueDate || i.due_date || 'N/A' },
        { header: 'Amount', accessorKey: 'totalAmount', cell: (i) => `₹${Number(i.totalAmount || (i as any).total_amount || 0).toLocaleString()}` },
        { header: 'Status', accessorKey: 'status', cell: (i) => <StatusBadge status={i.status} /> },
        {
            header: 'Actions',
            cell: (i) => (
                <div className="flex space-x-2">
                    {i.status === 'DRAFT' && (
                        <>
                            <button
                                onClick={() => handleSendMail(i, 'customer')}
                                className="text-xs text-blue-400 hover:text-white transition-colors"
                            >
                                Email Customer
                            </button>
                            <button
                                onClick={() => handleSendMail(i, 'vendor')}
                                className="text-xs text-orange-400 hover:text-white transition-colors"
                            >
                                Email Vendor
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => setViewInvoice(i)}
                        className="text-xs text-evera-primary hover:text-white transition-colors"
                    >
                        View
                    </button>
                    <button 
                        onClick={() => handleDownload(i.invoiceNumber)}
                        className="text-xs text-evera-muted hover:text-white transition-colors"
                    >
                        Download PDF
                    </button>
                </div>
            )
        }
    ];

    if (viewInvoice) {
        return (
            <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewInvoice(null)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">{viewInvoice.invoiceNumber || viewInvoice.invoice_number}</h2>
                        <p className="text-xs text-[#A8A29E]">Invoice details and breakdown</p>
                    </div>
                    <div className="ml-auto">
                        <StatusBadge status={viewInvoice.status} />
                    </div>
                </div>

                <div className="bg-[#1a1512] border border-[#38302C] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-8 md:p-12 space-y-10">
                        {/* Invoice Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[#38302C] pb-8">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-wider mb-2">INVOICE</h1>
                                <p className="text-sm text-evera-muted">Invoice No: <span className="text-white font-medium">{viewInvoice.invoiceNumber || viewInvoice.invoice_number}</span></p>
                                <p className="text-sm text-evera-muted">Date: <span className="text-white font-medium">{viewInvoice.generatedDate || viewInvoice.generated_date || viewInvoice.created_at?.split('T')[0] || 'N/A'}</span></p>
                                <p className="text-sm text-evera-muted">Due Date: <span className="text-white font-medium">{viewInvoice.dueDate || viewInvoice.due_date || 'N/A'}</span></p>
                            </div>
                            <div className="text-left md:text-right">
                                <h2 className="text-xl font-bold text-evera-primary mb-1">Evera Platform</h2>
                                <p className="text-sm text-evera-muted">123 Event Street, Tech Park</p>
                                <p className="text-sm text-evera-muted">Bangalore, Karnataka 560001</p>
                                <p className="text-sm text-evera-muted">contact@evera.com</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div>
                            <p className="text-xs text-evera-muted uppercase tracking-wider font-bold mb-3">Bill To:</p>
                            <h3 className="text-lg font-bold text-white">{viewInvoice.vendorName || viewInvoice.vendor_name || 'N/A'}</h3>
                            <p className="text-sm text-evera-muted mt-1">Vendor / Partner</p>
                            <p className="text-sm text-evera-muted">Registered Provider</p>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-hidden rounded-xl border border-[#38302C]">
                            <table className="w-full text-left text-sm text-white">
                                <thead className="bg-[#241E1B] text-evera-muted text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-[#38302C]">Description</th>
                                        <th className="px-6 py-4 border-b border-[#38302C] text-center">Qty</th>
                                        <th className="px-6 py-4 border-b border-[#38302C] text-right">Rate</th>
                                        <th className="px-6 py-4 border-b border-[#38302C] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#38302C]">
                                    <tr className="bg-[#1a1512]">
                                        <td className="px-6 py-5">
                                            <p className="font-bold">Platform Services & Booking Fees</p>
                                            <p className="text-xs text-evera-muted mt-1">Service facilitation and management charges</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">1</td>
                                        <td className="px-6 py-5 text-right">₹{Number(viewInvoice.amount || (viewInvoice.totalAmount - (viewInvoice.tax || 0)) || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-bold">₹{Number(viewInvoice.amount || (viewInvoice.totalAmount - (viewInvoice.tax || 0)) || 0).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-evera-muted font-bold uppercase tracking-wider">Subtotal</span>
                                    <span className="text-white font-medium">₹{Number(viewInvoice.amount || (viewInvoice.totalAmount - (viewInvoice.tax || 0)) || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm pb-3 border-b border-[#38302C]">
                                    <span className="text-evera-muted font-bold uppercase tracking-wider">Tax (18% GST)</span>
                                    <span className="text-white font-medium">₹{Number(viewInvoice.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm text-evera-muted font-bold uppercase tracking-wider">Total Amount</span>
                                    <span className="text-3xl text-[#f48c25] font-black tracking-tight">₹{Number(viewInvoice.totalAmount || viewInvoice.total_amount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-[#241E1B] border-t border-[#38302C] flex gap-4">
                        <button 
                            onClick={() => handleDownload(viewInvoice.invoiceNumber || viewInvoice.invoice_number)}
                            className="flex-1 bg-[#1a1512] border border-[#38302C] text-white font-bold py-3.5 rounded-xl hover:bg-white/5 transition-colors uppercase tracking-wider text-sm"
                        >
                            Download PDF
                        </button>
                        {viewInvoice.status === 'DRAFT' && (
                            <div className="flex flex-1 gap-4">
                                <button 
                                    onClick={() => {
                                        handleSendMail(viewInvoice, 'customer');
                                        setViewInvoice({ ...viewInvoice, status: 'SENT' });
                                    }}
                                    className="flex-1 bg-[#4F46E5] text-white font-bold py-3.5 rounded-xl hover:bg-[#4338CA] transition-colors uppercase tracking-wider text-sm shadow-lg shadow-indigo-900/20"
                                >
                                    Email Customer
                                </button>
                                <button 
                                    onClick={() => {
                                        handleSendMail(viewInvoice, 'vendor');
                                        setViewInvoice({ ...viewInvoice, status: 'SENT' });
                                    }}
                                    className="flex-1 bg-[#f48c25] text-white font-bold py-3.5 rounded-xl hover:bg-[#d9751a] transition-colors uppercase tracking-wider text-sm shadow-lg shadow-orange-900/20"
                                >
                                    Email Vendor
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Invoices</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-evera-primary px-4 py-2 rounded-lg text-white font-medium hover:bg-orange-600 transition-colors"
                >
                    + Create Invoice
                </button>
            </div>

            <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden shadow-xl">
                <DataTable
                    columns={columns}
                    data={invoices}
                    isLoading={isLoading}
                />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in">
                    <div className="bg-[#1a1512] border border-[#38302C] rounded-2xl w-[500px] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#38302C] flex justify-between items-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Create Invoice</h3>
                            <button onClick={() => { setIsModalOpen(false); setFoundBooking(null); setSearchBookingId(''); }} className="text-gray-400 hover:text-white transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-evera-muted uppercase tracking-wider mb-2">Enter Booking Number</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={searchBookingId}
                                        onChange={e => setSearchBookingId(e.target.value)}
                                        placeholder="e.g. b1000"
                                        className="flex-1 bg-[#241E1B] text-white p-3 rounded-xl border border-[#38302C] focus:border-evera-primary outline-none text-sm"
                                    />
                                    <button 
                                        onClick={handleSearchBooking}
                                        className="bg-[#38302C] text-white px-4 rounded-xl font-bold hover:bg-[#48403C] transition-colors"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                            
                            {foundBooking && (
                                <div className="bg-[#241E1B] p-4 rounded-xl border border-[#38302C] space-y-3">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Customer Name</p>
                                            <p className="text-sm text-white font-bold">{foundBooking.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Customer Number</p>
                                            <p className="text-sm text-white font-bold">{foundBooking.customerPhone || '+91 98765 43210'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Vendor Name</p>
                                            <p className="text-sm text-[#f48c25] font-bold">{foundBooking.provider || 'System Assigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Vendor Number</p>
                                            <p className="text-sm text-white font-bold">{foundBooking.vendorPhone || '+91 91234 56789'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Service Type</p>
                                            <p className="text-sm text-white font-bold">{foundBooking.serviceType}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1">Booking Amount</p>
                                            <p className="text-sm text-white font-bold">₹{foundBooking.amount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleRaiseInvoice}
                                        className="w-full bg-[#f48c25] text-white font-bold py-3 rounded-xl hover:bg-[#d9751a] transition-colors uppercase tracking-wider text-sm shadow-lg shadow-orange-900/20 mt-2"
                                    >
                                        Raise Invoice
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
