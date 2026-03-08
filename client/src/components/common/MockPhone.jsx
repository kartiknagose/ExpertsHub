import { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, X, ChevronUp, ChevronDown, Check } from 'lucide-react';
import axiosInstance from '../../api/axios';

export function MockPhoneGateway() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/notifications/mock-gateway');
            setMessages(data.messages || []);
        } catch (e) {
            console.error('Failed to fetch mock messages', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl transition-all"
                >
                    <div className="relative">
                        <Smartphone size={20} className="text-brand-400" />
                        {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                            </span>
                        )}
                    </div>
                    <span className="font-semibold text-sm">Simulated Phone</span>
                </button>
            )}

            {/* Simulated Phone UI */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-900 w-80 md:w-96 h-[500px] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-slate-100 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center rounded-t-[2.5rem]">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-slate-500" />
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Device Inbox</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 hide-scrollbar">
                        {loading && messages.length === 0 && (
                            <div className="text-center text-xs text-slate-400 py-10">Syncing with Carrier...</div>
                        )}

                        {messages.length === 0 && !loading && (
                            <div className="text-center text-xs text-slate-400 py-10">No messages received yet.</div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                                    <span>{msg.type === 'WHATSAPP' ? '🟢 WhatsApp' : '💬 SMS'}</span>
                                    <span>•</span>
                                    <span>To: {msg.to}</span>
                                    <span>•</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className={`p-3 rounded-2xl rounded-tl-sm text-sm border shadow-sm relative ${msg.type === 'WHATSAPP'
                                        ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50 text-green-900 dark:text-green-100'
                                        : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.message}</div>
                                    <div className="flex justify-end mt-1">
                                        <Check size={12} className="text-blue-500" />
                                        <Check size={12} className="-ml-1 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-950 p-2 border-t border-slate-200 dark:border-slate-800 flex justify-center pb-4 rounded-b-[2.5rem]">
                        <div className="w-24 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
