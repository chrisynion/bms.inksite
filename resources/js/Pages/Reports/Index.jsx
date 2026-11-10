import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'bms_ai_chat_history_v1';

export default function Index({ auth, snapshot, filters, ai_config, mcp_info }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [provider, setProvider] = useState(ai_config.provider || 'gemini');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
    const [copiedMcp, setCopiedMcp] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [showMcpPanel, setShowMcpPanel] = useState(false);
    const chatBottomRef = useRef(null);

    const fin = snapshot.financial_summary;
    const ord = snapshot.orders_and_services;
    const inv = snapshot.inventory_report;
    const emp = snapshot.employee_workload;

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            window.dispatchEvent(new CustomEvent('bms-ai-chat-updated'));
        } catch {
            // ignore
        }
    }, [messages]);

    useEffect(() => {
        const syncHandler = () => {
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
        window.addEventListener('bms-ai-chat-updated', syncHandler);
        return () => window.removeEventListener('bms-ai-chat-updated', syncHandler);
    }, [messages]);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const formatCurrency = (val) =>
        '₱' + Number(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const applyDateFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const sendChatMessage = async (presetText = null) => {
        const query = (presetText ?? prompt).trim();
        if (!query || loading) return;

        const nextMessages = [
            ...messages,
            {
                role: 'user',
                content: query,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ];
        setMessages(nextMessages);
        if (!presetText) setPrompt('');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('reports.generate'), {
                messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
                start_date: startDate,
                end_date: endDate,
                provider,
            });

            setMessages([
                ...nextMessages,
                {
                    role: 'assistant',
                    content: response.data.reply || response.data.report_markdown,
                    provider: response.data.provider,
                    model: response.data.model,
                    period: response.data.period,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate AI response. Check your API key in System Settings.');
        } finally {
            setLoading(false);
        }
    };

    const clearConversation = () => {
        setMessages([]);
        setError(null);
        sessionStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('bms-ai-chat-updated'));
    };

    const copyMcpConfig = () => {
        navigator.clipboard.writeText(mcp_info.config_json);
        setCopiedMcp(true);
        setTimeout(() => setCopiedMcp(false), 2000);
    };

    const copyMessageText = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const presetPrompts = [
        {
            title: 'Executive P&L Summary',
            desc: 'Analyze revenue, cashbook expenses, net cashflow, and payment mode balances.',
            prompt: 'Provide a comprehensive Executive Financial & Cashflow Report for this period. Break down order payments collected by payment mode, analyze cashbook expenses by category, evaluate net cashflow, and highlight key financial takeaways.',
        },
        {
            title: 'Receivables & Collections Plan',
            desc: 'Prioritize unpaid orders and customers with outstanding balances.',
            prompt: 'Analyze all outstanding receivables and unpaid orders. List the top customers and specific orders with the highest balances due, and suggest a prioritized collection follow-up plan.',
        },
        {
            title: 'Top Services & Bottlenecks',
            desc: 'Rank highest-earning services and review order pipeline status.',
            prompt: 'Analyze our order pipeline and service performance. Which services generate the most revenue and volume? Are there bottlenecks in pending or in-progress orders?',
        },
        {
            title: 'Inventory & Overtime Audit',
            desc: 'Check low-stock materials and employee workload / overtime costs.',
            prompt: 'Audit our inventory stock alerts and employee workload/overtime costs for this period. Identify urgent restock priorities and evaluate overtime expenses relative to order volume.',
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            AI Reports & Conversational Analyst
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Chat with Gemini or Claude about your live BMS data, or connect via MCP.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowMcpPanel(!showMcpPanel)}
                            className="inline-flex items-center px-3.5 py-2 border border-indigo-200 dark:border-indigo-700 text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 transition"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {showMcpPanel ? 'Hide MCP Setup' : 'Connect MCP Server'}
                        </button>
                        <Link
                            href={route('settings.index')}
                            className="inline-flex items-center px-3.5 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 transition"
                        >
                            AI Settings
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="AI Reports & Chat" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Collapsible MCP Server Connection Card */}
                    {showMcpPanel && (
                        <div className="bg-gray-900 text-gray-100 rounded-lg shadow-md p-6 border border-indigo-500/40">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700 pb-4 mb-4">
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
                                        Model Context Protocol (stdio)
                                    </span>
                                    <h3 className="text-lg font-bold text-white">
                                        Connect Claude Desktop, Antigravity, or Cursor to BMS
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Your BMS includes a native MCP server (<code>php artisan mcp:serve</code>) that exposes live read-only reporting tools.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyMcpConfig}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition shrink-0"
                                >
                                    {copiedMcp ? 'Copied to Clipboard!' : 'Copy MCP JSON Config'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                        MCP Client Configuration Snippet
                                    </p>
                                    <pre className="bg-black/60 p-4 rounded-md text-xs text-green-400 overflow-x-auto border border-gray-800">
                                        {mcp_info.config_json}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                                        Available MCP Tools ({mcp_info.tools.length})
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {mcp_info.tools.map((tool) => (
                                            <div key={tool.name} className="p-2.5 rounded bg-gray-800/80 border border-gray-700">
                                                <div className="font-mono text-xs text-indigo-300 font-semibold">{tool.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{tool.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date Range Filter Bar */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <form onSubmit={applyDateFilter} className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition"
                            >
                                Update Period
                            </button>
                        </form>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Showing snapshot for <span className="font-semibold text-gray-800 dark:text-gray-200">{fin.period.start_date}</span> to{' '}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{fin.period.end_date}</span>
                        </div>
                    </div>

                    {/* Deterministic KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cash In (Period)</div>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatCurrency(fin.total_cash_in)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Orders: {formatCurrency(fin.order_payments_collected)} | Other: {formatCurrency(fin.ledger_other_income)}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cashbook Expenses</div>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                                {formatCurrency(fin.ledger_expenses)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Net Cashflow: <span className="font-semibold">{formatCurrency(fin.net_cashflow)}</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unpaid Receivables</div>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatCurrency(fin.outstanding_receivables_total)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Across {fin.unpaid_orders_count} unpaid/partial orders
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Operations & Alerts</div>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                {ord.total_orders_in_period} Orders
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Low Stock: {inv.low_stock_count} items | OT Pay: {formatCurrency(emp.total_overtime_pay)}
                            </div>
                        </div>
                    </div>

                    {/* Multi-Turn AI Chat & Executive Reports Workspace */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    AI Business Analyst Chat
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Run a preset report or chat back-and-forth with follow-up questions grounded on your live BMS numbers.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {messages.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearConversation}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        Clear Chat
                                    </button>
                                )}
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Model:</label>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="gemini">
                                            Google Gemini ({ai_config.gemini_model}) {ai_config.has_gemini_key ? '✓' : '⚠️ No Key'}
                                        </option>
                                        <option value="claude">
                                            Anthropic Claude ({ai_config.anthropic_model}) {ai_config.has_anthropic_key ? '✓' : '⚠️ No Key'}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* One-Click Preset Reports */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
                            {presetPrompts.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => sendChatMessage(item.prompt)}
                                    className="text-left p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition group disabled:opacity-50"
                                >
                                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {item.desc}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Conversation Thread */}
                        {messages.length > 0 && (
                            <div className="mb-5 space-y-4 max-h-[600px] overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-4xl rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                                                msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm w-full'
                                            }`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>
                                                        <strong className="uppercase text-indigo-600 dark:text-indigo-400">{msg.provider || 'AI'}</strong>{' '}
                                                        {msg.model ? `(${msg.model})` : ''} {msg.timestamp ? `• ${msg.timestamp}` : ''}
                                                    </span>
                                                    <div className="flex items-center gap-2 print:hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => copyMessageText(msg.content, idx)}
                                                            className="px-2.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                        >
                                                            {copiedIdx === idx ? 'Copied!' : 'Copy'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => window.print()}
                                                            className="px-2.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                        >
                                                            Print
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex items-start">
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                                            Analyzing BMS data & preparing response...
                                        </div>
                                    </div>
                                )}

                                <div ref={chatBottomRef} />
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        {/* Chat Input Bar */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendChatMessage();
                            }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={
                                    messages.length > 0
                                        ? 'Ask a follow-up question (e.g., "Draft payment reminders for those top 3 unpaid customers")...'
                                        : 'Ask anything about your revenue, orders, inventory, or staff...'
                                }
                                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition shrink-0"
                            >
                                {loading ? 'Sending...' : messages.length > 0 ? 'Send Reply' : 'Ask AI'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
