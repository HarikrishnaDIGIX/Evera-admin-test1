import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { SearchBar } from '../ui/SearchBar';
import { Icons } from '../ui/Icons';
import { MessageSquare, Calendar, ChevronRight, Hash, Send } from 'lucide-react';

interface Conversation {
    id: number;
    serviceRequestId: string;
    serviceName: string;
    participants: {
        id: number;
        name: string;
        type: 'CUSTOMER' | 'VENDOR';
    }[];
    messageCount: number;
    lastMessage: {
        content: string;
        timestamp: string;
        senderId: number;
    } | null;
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: string;
    type: string;
}

const fetchAdminConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await fetch('http://127.0.0.1:8001/api/admin/messages/conversations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

const fetchConversationMessages = async (conversationId: number): Promise<Message[]> => {
    try {
        const response = await fetch(`http://127.0.0.1:8001/api/admin/messages/${conversationId}/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const Conversations = () => {
    const { addNotification } = useApp();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchAdminConversations();
            setConversations(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleSelectConv = async (conv: Conversation) => {
        setSelectedConv(conv);
        setLoadingMessages(true);
        const msgs = await fetchConversationMessages(conv.id);
        setMessages(msgs);
        setLoadingMessages(false);
    };

    const columns: Column<Conversation>[] = [
        {
            header: 'Participants',
            cell: (c) => (
                <div className="flex flex-col gap-1">
                    {c.participants.map(p => (
                        <div key={p.id} className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-white">{p.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                p.type === 'VENDOR' ? 'bg-[#f48c25]/10 text-[#f48c25] border-[#f48c25]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                                {p.type}
                            </span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            header: 'Service',
            cell: (c) => (
                <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">{c.serviceName || 'General Inquiry'}</span>
                    {c.serviceRequestId && <span className="text-xs text-evera-muted">#{c.serviceRequestId}</span>}
                </div>
            )
        },
        {
            header: 'Last Message',
            cell: (c) => (
                <div className="flex flex-col max-w-xs">
                    <span className="text-sm text-white truncate">
                        {c.lastMessage ? c.lastMessage.content : <span className="italic text-evera-muted">No messages</span>}
                    </span>
                    {c.lastMessage && (
                        <span className="text-[10px] text-evera-muted mt-1">
                            {new Date(c.lastMessage.timestamp).toLocaleString()}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Total',
            accessorKey: 'messageCount',
            className: 'text-evera-primary font-bold'
        },
        {
            header: 'Action',
            cell: (c) => (
                <button
                    onClick={() => handleSelectConv(c)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-evera-primary/10 text-evera-primary rounded-lg hover:bg-evera-primary/20 transition-colors"
                >
                    <span className="text-sm font-medium">View Chat</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            )
        }
    ];

    const filtered = conversations.filter(c => 
        c.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.serviceName && c.serviceName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Conversations</h2>
                    <p className="text-sm text-evera-muted">Monitor user and vendor communications</p>
                </div>
            </div>

            {selectedConv ? (
                <div className="space-y-4">
                    <button 
                        onClick={() => setSelectedConv(null)}
                        className="text-evera-muted hover:text-white flex items-center text-sm font-medium transition-colors"
                    >
                        ← Back to All Conversations
                    </button>
                    
                    <div className="bg-evera-card/50 backdrop-blur-xl border border-evera-border rounded-xl p-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="w-full lg:w-1/3 space-y-6">
                                <div className="bg-evera-card rounded-xl p-4 border border-evera-border/50">
                                    <h3 className="text-white font-semibold mb-4">Participants</h3>
                                    <div className="space-y-4">
                                        {selectedConv.participants.map(p => (
                                            <div key={p.id} className="flex items-center justify-between">
                                                <span className="text-white text-sm">{p.name}</span>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                                                    p.type === 'VENDOR' ? 'bg-[#f48c25]/10 text-[#f48c25] border-[#f48c25]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                }`}>
                                                    {p.type}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-evera-card rounded-xl p-4 border border-evera-border/50">
                                    <h3 className="text-white font-semibold mb-3">Context</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-evera-muted">Service</span>
                                            <span className="text-white font-medium">{selectedConv.serviceName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-evera-muted">Request ID</span>
                                            <span className="text-white font-mono">{selectedConv.serviceRequestId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-2/3">
                                <div className="bg-evera-bg rounded-xl border border-evera-border overflow-hidden flex flex-col h-[600px]">
                                    <div className="bg-evera-card p-4 border-b border-evera-border flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-evera-primary" />
                                        <h3 className="text-white font-medium">Chat Transcript</h3>
                                    </div>
                                    
                                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                        {loadingMessages ? (
                                            <div className="flex justify-center items-center h-full">
                                                <Icons.Spinner className="w-6 h-6 text-evera-primary animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex justify-center items-center h-full text-evera-muted">
                                                No messages in this conversation yet.
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const sender = selectedConv.participants.find(p => p.id.toString() === msg.senderId);
                                                const isVendor = sender?.type === 'VENDOR';
                                                
                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isVendor ? 'items-start' : 'items-end'}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-evera-muted">
                                                                {sender?.name || 'Unknown User'}
                                                            </span>
                                                            <span className="text-[10px] text-evera-muted/50">
                                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                                                            isVendor 
                                                            ? 'bg-evera-card text-white border border-evera-border rounded-tl-sm' 
                                                            : 'bg-evera-primary text-white rounded-tr-sm shadow-md shadow-evera-primary/20'
                                                        }`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    
                                    <div className="p-4 bg-evera-card border-t border-evera-border text-center text-xs text-evera-muted">
                                        Admin View - Read Only
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-evera-card/50 backdrop-blur-xl border border-evera-border rounded-xl overflow-hidden shadow-lg shadow-black/20">
                    <div className="p-4 border-b border-evera-border flex justify-between items-center bg-evera-card/80">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by participant name..."
                        />
                    </div>
                    <DataTable columns={columns} data={filtered} isLoading={loading} />
                </div>
            )}
        </div>
    );
};
