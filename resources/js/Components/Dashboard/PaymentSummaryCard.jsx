import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { formatPesoExact } from './formatters';

const PERIOD_OPTIONS = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom' },
];

export default function PaymentSummaryCard({ summary }) {
    const modes = summary?.modes || [];
    const defaultMode = summary?.default_mode || 'Cash';
    const currentPeriod = summary?.period || 'today';
    const periodLabel = summary?.period_label || 'Today';

    const [selectedMode, setSelectedMode] = useState(defaultMode);
    const [showCustomDates, setShowCustomDates] = useState(currentPeriod === 'custom');
    const [startDate, setStartDate] = useState(summary?.start_date || '');
    const [endDate, setEndDate] = useState(summary?.end_date || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (modes.length > 0 && !modes.some((m) => m.name === selectedMode)) {
            setSelectedMode(defaultMode);
        }
    }, [modes, selectedMode, defaultMode]);

    useEffect(() => {
        setStartDate(summary?.start_date || '');
        setEndDate(summary?.end_date || '');
        setShowCustomDates(summary?.period === 'custom');
    }, [summary?.start_date, summary?.end_date, summary?.period]);

    if (!summary) {
        return null;
    }

    const fetchPeriod = (period, customStart = startDate, customEnd = endDate) => {
        const params = { payment_period: period };
        if (period === 'custom') {
            if (customStart) params.payment_start_date = customStart;
            if (customEnd) params.payment_end_date = customEnd;
        }

        setIsLoading(true);
        router.get(route('dashboard'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['payment_summary'],
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePeriodClick = (periodId) => {
        if (periodId === 'custom') {
            setShowCustomDates(true);
            return;
        }
        setShowCustomDates(false);
        fetchPeriod(periodId);
    };

    const handleApplyCustom = (e) => {
        e.preventDefault();
        fetchPeriod('custom', startDate, endDate);
    };

    const activeMode = modes.find((m) => m.name === selectedMode) || {
        name: selectedMode,
        total: 0,
        count: 0,
        all_time_total: 0,
        all_time_count: 0,
    };

    const periodTotal = Number(summary.total || 0);
    const allTimeTotal = Number(summary.all_time_total || 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 mb-6">
            {/* Header + Duration Filter + Mode Switcher */}
            <div className="flex flex-col gap-4 mb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Payments Summary
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            Showing <span className="font-semibold text-slate-700 dark:text-gray-200">{periodLabel}</span> • Default: {defaultMode}
                        </p>
                    </div>

                    {/* Duration Selector */}
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Payment duration">
                        {PERIOD_OPTIONS.map((opt) => {
                            const isActive = opt.id === 'custom' ? showCustomDates : currentPeriod === opt.id && !showCustomDates;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => handlePeriodClick(opt.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                                        isActive
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                            : 'bg-slate-100 dark:bg-gray-700/60 text-slate-600 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Date Range Inputs */}
                {showCustomDates && (
                    <form
                        onSubmit={handleApplyCustom}
                        className="flex flex-wrap items-end gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-200/70 dark:border-gray-700"
                    >
                        <div>
                            <label htmlFor="payment-start-date" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1">
                                From
                            </label>
                            <input
                                id="payment-start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs focus:border-sky-500 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="payment-end-date" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1">
                                To
                            </label>
                            <input
                                id="payment-end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs focus:border-sky-500 focus:ring-sky-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-gradient-to-b from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-60 transition"
                        >
                            {isLoading ? 'Loading...' : 'Apply Range'}
                        </button>
                    </form>
                )}

                {/* Payment Mode Switcher */}
                {modes.length > 0 && (
                    <div
                        className="flex flex-wrap items-center gap-1.5"
                        role="tablist"
                        aria-label="Filter payment mode"
                    >
                        {modes.map((mode) => {
                            const isSelected = mode.name === activeMode.name;
                            return (
                                <button
                                    key={mode.name}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => setSelectedMode(mode.name)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-gray-700/60 text-slate-600 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {mode.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Highlight Row: Selected Mode (Default: Cash) vs Total Payment */}
            <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-gray-700 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20 mb-5 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
                <div className="p-5 text-center flex flex-col items-center justify-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">
                        {activeMode.name} Payments ({periodLabel})
                    </p>
                    <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {formatPesoExact(activeMode.total)}
                    </p>
                    <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                        {activeMode.count} {activeMode.count === 1 ? 'payment' : 'payments'} • All-time:{' '}
                        {formatPesoExact(activeMode.all_time_total)}
                    </span>
                </div>

                <div className="p-5 text-center flex flex-col items-center justify-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">
                        Total Payment ({periodLabel})
                    </p>
                    <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {formatPesoExact(periodTotal)}
                    </p>
                    <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {summary.count} {summary.count === 1 ? 'payment' : 'payments'} • All-time:{' '}
                        {formatPesoExact(allTimeTotal)}
                    </span>
                </div>
            </div>

            {/* Per Payment Mode Breakdown */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
                {modes.map((mode) => {
                    const isSelected = mode.name === activeMode.name;
                    const sharePct =
                        periodTotal > 0 ? Math.round((Number(mode.total) / periodTotal) * 100) : 0;

                    return (
                        <button
                            key={mode.name}
                            type="button"
                            onClick={() => setSelectedMode(mode.name)}
                            className={`text-left rounded-xl border p-3.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                                isSelected
                                    ? 'border-sky-300 bg-sky-50/50 dark:border-sky-600 dark:bg-sky-900/20 shadow-sm'
                                    : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-slate-200 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 truncate">
                                    {mode.name}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500">
                                    {sharePct}%
                                </span>
                            </div>
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                                {formatPesoExact(mode.total)}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                                {mode.count} {mode.count === 1 ? 'payment' : 'payments'} • All-time: {formatPesoExact(mode.all_time_total)}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
