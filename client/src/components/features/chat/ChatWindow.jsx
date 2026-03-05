import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { getConversationByBooking as fetchConversation, getMessages as fetchMessages, sendMessage as postMessage } from '../../../api';
import { queryKeys } from '../../../utils/queryKeys';

export function ChatWindow({ bookingId, onClose }) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const scrollRef = useRef(null);
    const queryClient = useQueryClient();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // 1. Get Conversation
    const { data: conversation, isLoading: convLoading } = useQuery({
        queryKey: queryKeys.chat.booking(bookingId),
        queryFn: () => fetchConversation(bookingId).then(d => d.conversation),
        enabled: !!bookingId
    });

    // 2. Get Messages
    const { data: messages = [], isLoading: msgLoading } = useQuery({
        queryKey: queryKeys.chat.messages(conversation?.id),
        queryFn: () => fetchMessages(conversation.id).then(d => d.messages),
        enabled: !!conversation?.id
    });

    const mutation = useMutation({
        mutationFn: postMessage,
        onSuccess: ({ message: newMessage }) => {
            queryClient.setQueryData(queryKeys.chat.messages(conversation.id), (old) => [...(old || []), newMessage]);
            setMessage('');
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleNewMessage = (event) => {
            const newMessage = event.detail;
            if (newMessage.conversationId === conversation?.id) {
                if (newMessage.senderId !== user.id) {
                    queryClient.setQueryData(queryKeys.chat.messages(conversation.id), (old) => [...(old || []), newMessage]);
                }
            }
        };

        window.addEventListener('upro:chat-message', handleNewMessage);
        return () => window.removeEventListener('upro:chat-message', handleNewMessage);
    }, [conversation?.id, queryClient, user.id]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || mutation.isPending) return;
        mutation.mutate({ conversationId: conversation.id, content: message });
    };

    // Render via a portal to document.body so that `fixed` positioning
    // is always relative to the viewport — escaping any parent CSS transforms
    // (e.g. `active:scale-[0.99]` on booking cards) which would otherwise
    // shift the window and prevent the close button from being clickable.
    const content = convLoading ? (
        <div className="fixed bottom-4 right-4 w-80 h-96 rounded-2xl shadow-2xl flex items-center justify-center z-[9999] bg-white border dark:bg-dark-900 dark:border-0">
            <Loader2 className="animate-spin text-brand-500" />
        </div>
    ) : (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl z-[9999] overflow-hidden border bg-white border-gray-200 dark:bg-dark-900 dark:border-dark-700">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-brand-600 text-white dark:bg-dark-800/50 dark:border-dark-700">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    <span className="font-bold text-sm tracking-tight">Booking Chat</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full transition-colors hover:bg-black/20 active:bg-black/30"
                    aria-label="Close chat"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {msgLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 opacity-50 space-y-2">
                        <MessageSquare className="mx-auto" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                        <p className="text-[10px]">Start the conversation about your booking.</p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = m.senderId === user.id;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                    ? 'bg-brand-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none border dark:bg-dark-800 dark:text-gray-200 dark:border-dark-700'
                                    }`}>
                                    <p className="font-medium leading-relaxed">{m.content}</p>
                                    <p className={`text-[9px] mt-1 opacity-60 font-bold uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t shrink-0 bg-gray-50 border-gray-100 dark:border-dark-700 dark:bg-dark-800/10">
                <div className="relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/50 bg-white text-gray-900 border-gray-200 dark:bg-dark-800 dark:text-white dark:border-dark-600 dark:focus:bg-dark-700"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || mutation.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </form>
        </div>
    );

    return createPortal(content, document.body);
}

export function ChatToggle({ bookingId, label = "Chat with Provider" }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all active:scale-95 shadow-lg bg-white border-gray-200 text-gray-900 hover:bg-gray-50 dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:hover:bg-dark-700 dark:shadow-black/20"
            >
                <MessageSquare size={16} className="text-brand-500" />
                {label}
            </button>

            {isOpen && <ChatWindow bookingId={bookingId} onClose={() => setIsOpen(false)} />}
        </>
    );
}
