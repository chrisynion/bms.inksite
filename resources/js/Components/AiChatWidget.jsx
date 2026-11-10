import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const STORAGE_KEY = 'bms_ai_chat_history_v1';
const PROVIDER_KEY = 'bms_ai_chat_provider_v1';

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [provider, setProvider] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(PROVIDER_KEY) || 'gemini';
        }
        return 'gemini';
    });
    const [messages, setMessages] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem(STORAGE_KEY);
                return saved ? JSON.parse(saved) : [];
            } catch {
                return [];
            }
        }
        return [];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            window.dispatchEvent(new CustomEvent('bms-ai-chat-updated'));
        } catch {
            // ignore storage quota errors
        }
    }, [messages]);

    useEffect(() => {
        const syncFromOtherTabs = () => {
            try {
                const saved = sessionStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (JSON.stringify(parsed) !== JSON.stringify(messages)) {
                        setMessages(parsed);
                    }
                }
            } catch {
                // ignore
            }
        };
        window.addEventListener('bms-ai-chat-updated', syncFromOtherTabs);
        return () => window.removeEventListener('bms-ai-chat-updated', syncFromOtherTabs);
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    const handleProviderChange = (val) => {
        setProvider(val);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(PROVIDER_KEY, val);
        }
    };

    const sendMessage = async (textOverride = null) => {
        const content = (textOverride ?? input).trim();
        if (!content || loading) return;

        const nextMessages = [...messages, { role: 'user', content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        setMessages(nextMessages);
        if (!textOverride) setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('reports.generate'), {
                messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
                provider,
            });

            setMessages([
                ...nextMessages,
                {
                    role: 'assistant',
                    content: response.data.reply || response.data.report_markdown,
                    model: response.data.model,
                    provider: response.data.provider,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to reach AI provider. Check your API key in System Settings.');
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const quickPrompts = [
        "What's our net cashflow and account balance summary this month?",
        'Which customers have unpaid orders right now?',
        'Any low-stock inventory items I need to reorder?',
        'Summarize employee workload and overtime pay this month.',
    ];

    return (
        <div className="fixed bottom-5 right-5 z-50 print:hidden">
            {isOpen ? (
                <div
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
                        isExpanded
                            ? 'w-[92vw] sm:w-[680px] h-[80vh]'
                            : 'w-[92vw] sm:w-[420px] h-[560px]'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-bold leading-tight">Inksite AI Analyst</div>
                                <div className="text-[11px] text-indigo-100 flex items-center gap-1.5">
                                    <span>Live BMS Data</span>
                                    <span>•</span>
                                    <select
                                        value={provider}
                                        onChange={(e) => handleProviderChange(e.target.value)}
                                        className="bg-indigo-700/80 text-white text-[11px] rounded px-1.5 py-0.5 border border-indigo-400/40 focus:outline-none"
                                    >
                                        <option value="gemini">Gemini</option>
                                        <option value="claude">Claude</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearChat}
                                    title="Clear conversation"
                                    className="p-1.5 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-500/50 text-xs"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                title={isExpanded ? 'Restore size' : 'Expand window'}
                                className="p-1.5 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-500/50 hidden sm:inline-flex"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Minimize chat"
                                className="p-1.5 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-500/50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {messages.length === 0 ? (
                            <div className="space-y-3 py-2">
                                <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Hi! I have live read access to your <strong>Orders</strong>, <strong>Cashbook</strong>, <strong>Inventory</strong>, <strong>Customers</strong>, and <strong>Employees</strong>. Ask me anything or pick a starter below:
                                </div>
                                <div className="space-y-1.5">
                                    {quickPrompts.map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => sendMessage(q)}
                                            className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {msg.role === 'user' ? 'You' : `${msg.provider?.toUpperCase() || 'AI'}`} {msg.timestamp ? `• ${msg.timestamp}` : ''}
                                    </span>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex items-start">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                    Analyzing live BMS data...
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                                {error}{' '}
                                <Link href={route('settings.index')} className="underline font-semibold ml-1">
                                    Open Settings
                                </Link>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question or follow-up..."
                            className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shrink-0"
                        >
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-sm font-semibold">Ask AI</span>
                    {messages.length > 0 && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-white text-indigo-700 rounded-full">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
