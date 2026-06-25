import React, { useState, useEffect } from 'react';
import { Icons } from '../ui/Icons';

interface ProcessTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { utrNumber: string; transactionNo: string; date: string; time: string }) => void;
    amount: number;
    recipientName: string;
    walletBalance?: number;
    gst?: number;
    commission?: number;
    bankAccount?: string;
    bankName?: string;
}

export const ProcessTransferModal: React.FC<ProcessTransferModalProps> = ({ 
    isOpen, onClose, onSubmit, amount, recipientName,
    walletBalance, gst, commission, bankAccount, bankName
}) => {
    const [utrNumber, setUtrNumber] = useState('');
    const [transactionNo, setTransactionNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUtrNumber('HDFC' + Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString());
            setTransactionNo('TXN-' + Math.floor(1000000000 + Math.random() * 9000000000).toString());
            setDate(new Date().toISOString().split('T')[0]);
            setTime(new Date().toTimeString().substring(0, 5));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!utrNumber.trim() || !transactionNo.trim() || !date || !time) {
            setError('All fields are required to process this transfer.');
            return;
        }
        const liveDate = new Date().toISOString().split('T')[0];
        const liveTime = new Date().toTimeString().substring(0, 5);
        onSubmit({ utrNumber, transactionNo, date: liveDate, time: liveTime });
        
        // Reset state
        setUtrNumber('');
        setTransactionNo('');
        setError('');
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-evera-card border border-evera-border rounded-2xl shadow-2xl z-50 animate-slide-up overflow-hidden">
                <div className="p-6 border-b border-evera-border/50 flex justify-between items-center bg-black/20">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Icons.CheckCircle2 className="text-evera-primary" size={20} />
                            Process Bank Transfer
                        </h3>
                        <p className="text-xs text-evera-muted mt-1">Record official bank transfer details</p>
                    </div>
                    <button onClick={onClose} className="text-evera-muted hover:text-white transition-colors">
                        <Icons.Reject size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="p-4 bg-evera-primary/10 border border-evera-primary/20 rounded-xl mb-2">
                        <p className="text-sm text-white flex justify-between">
                            <span className="text-evera-muted">Recipient:</span>
                            <span className="font-bold">{recipientName}</span>
                        </p>
                        
                        {(bankName || bankAccount) && (
                            <p className="text-sm text-white flex justify-between mt-1 pt-1 border-t border-evera-primary/10">
                                <span className="text-evera-muted">Bank Details:</span>
                                <span className="font-bold">{bankName} - {bankAccount}</span>
                            </p>
                        )}

                        {walletBalance !== undefined && (
                            <p className="text-sm text-white flex justify-between mt-2">
                                <span className="text-evera-muted">Wallet Balance:</span>
                                <span className="font-bold">₹{walletBalance.toLocaleString()}</span>
                            </p>
                        )}
                        {commission !== undefined && (
                            <p className="text-sm text-white flex justify-between mt-1">
                                <span className="text-evera-muted">Commission Deducted:</span>
                                <span className="font-bold text-red-400">-₹{commission.toLocaleString()}</span>
                            </p>
                        )}
                        {gst !== undefined && (
                            <p className="text-sm text-white flex justify-between mt-1 pb-2 border-b border-evera-primary/10">
                                <span className="text-evera-muted">GST (18%):</span>
                                <span className="font-bold text-red-400">-₹{gst.toLocaleString()}</span>
                            </p>
                        )}

                        <p className="text-lg text-green-400 font-black flex justify-between mt-2">
                            <span className="text-sm text-evera-muted font-normal mt-1">Net Transfer Amount:</span>
                            ₹{amount.toLocaleString()}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-start gap-2">
                            <Icons.AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2 border-t border-evera-border/50 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-evera-primary hover:bg-evera-primary/90 text-black rounded-xl text-sm font-black transition-colors shadow-[0_0_15px_rgba(243,156,18,0.3)]"
                        >
                            Confirm Transfer
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};
