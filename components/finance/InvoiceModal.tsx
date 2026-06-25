import React from 'react';
import { Icons } from '../ui/Icons';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'WITHDRAWAL' | 'SETTLEMENT';
    data: {
        id: string;
        recipientName: string;
        amount: number;
        commission?: number;
        gst?: number;
        utrDetails?: {
            utrNumber: string;
            transactionNo: string;
            date: string;
            time: string;
        };
        bankDetails?: {
            bankName: string;
            accountNumber: string;
        };
    };
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, type, data }) => {
    if (!isOpen) return null;

    const invoiceNo = `INV-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${data.id.substring(0, 4).toUpperCase()}`;
    const invoiceDate = data.utrDetails ? data.utrDetails.date : new Date().toISOString().split('T')[0];

    const netAmount = data.amount;
    const commission = data.commission || 0;
    const gst = data.gst || 0;
    const grossAmount = netAmount + commission + gst;

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`Invoice & Payment Receipt: ${invoiceNo}`);
        const body = encodeURIComponent(`Dear ${data.recipientName},\n\nPlease find your payment receipt and invoice attached/below.\n\nInvoice No: ${invoiceNo}\nNet Amount Transferred: ₹${netAmount.toLocaleString()}\nUTR Number: ${data.utrDetails?.utrNumber}\nDate: ${invoiceDate}\n\nThank you for your partnership with Evera!\n\nBest Regards,\nEvera Finance Team`);
        window.location.href = `mailto:vendor@example.com?subject=${subject}&body=${body}`;
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
            <div className="fixed top-8 bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
                
                {/* Header Actions */}
                <div className="bg-black text-white p-4 flex justify-between items-center shrink-0 print:hidden">
                    <h3 className="font-bold flex items-center gap-2">
                        <Icons.FileText size={18} />
                        Invoice Preview
                    </h3>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                            <Icons.Download size={16} /> Save PDF / Print
                        </button>
                        <button onClick={handleSendEmail} className="flex items-center gap-2 px-4 py-2 bg-evera-primary hover:bg-evera-primary/90 text-black rounded-lg text-sm font-bold transition-colors">
                            <Icons.Mail size={16} /> Email to Vendor
                        </button>
                        <button onClick={onClose} className="ml-2 text-evera-muted hover:text-white transition-colors">
                            <Icons.Reject size={20} />
                        </button>
                    </div>
                </div>

                {/* Invoice Printable Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white text-black print:p-0 print:overflow-visible">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tighter mb-1">INVOICE</h1>
                            <p className="text-gray-500 font-mono text-sm">{invoiceNo}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black text-black mb-1">EVERA INC.</h2>
                            <p className="text-sm text-gray-500">123 Mobility Hub, Tech Park</p>
                            <p className="text-sm text-gray-500">New Delhi, India 110001</p>
                            <p className="text-sm text-gray-500 mt-1">GSTIN: 07AABCU9603R1ZX</p>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex justify-between mb-10">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
                            <h3 className="text-lg font-bold text-black">{data.recipientName}</h3>
                            <p className="text-sm text-gray-500 mt-1">Vendor ID: {data.id}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                                <p className="text-sm font-bold text-black">{invoiceDate}</p>
                            </div>
                            {data.utrDetails && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                                    <p className="text-sm font-bold text-green-600 inline-flex items-center gap-1">
                                        <Icons.CheckCircle2 size={14} /> PAID
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-10">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4">
                                        <p className="font-bold text-black">{type === 'WITHDRAWAL' ? 'Wallet Withdrawal' : 'Platform Settlement'}</p>
                                        <p className="text-sm text-gray-500 mt-1">Payout for platform services</p>
                                    </td>
                                    <td className="py-4 text-right font-bold text-black">
                                        ₹{grossAmount.toLocaleString()}
                                    </td>
                                </tr>
                                {commission > 0 && (
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4">
                                            <p className="text-gray-600">Platform Commission Deducted</p>
                                        </td>
                                        <td className="py-4 text-right text-red-500">
                                            -₹{commission.toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                                {gst > 0 && (
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4">
                                            <p className="text-gray-600">GST on Commission (18%)</p>
                                        </td>
                                        <td className="py-4 text-right text-red-500">
                                            -₹{gst.toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2 min-w-[300px]">
                            <div className="flex justify-between items-center py-4 border-t-2 border-black">
                                <span className="text-lg font-black text-black">Net Payment Amount</span>
                                <span className="text-2xl font-black text-black">₹{netAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    {data.utrDetails && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Icons.Activity size={16} /> Payment Log
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Bank</p>
                                    <p className="font-bold text-sm text-black">{data.bankDetails?.bankName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Account</p>
                                    <p className="font-bold text-sm text-black">{data.bankDetails?.accountNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">UTR Number</p>
                                    <p className="font-bold text-sm font-mono text-black">{data.utrDetails.utrNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Transaction ID</p>
                                    <p className="font-bold text-sm font-mono text-black">{data.utrDetails.transactionNo}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">This is an electronically generated document and does not require a signature.</p>
                        <p className="text-sm text-gray-400 mt-1">If you have any questions concerning this invoice, contact support@evera.com.</p>
                    </div>

                </div>
            </div>
            
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * { visibility: hidden; }
                    .animate-slide-up, .animate-slide-up * { visibility: visible; }
                    .animate-slide-up { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        transform: none; 
                        box-shadow: none;
                    }
                }
            `}} />
        </>
    );
};
