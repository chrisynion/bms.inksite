import { Link } from '@inertiajs/react';
import DonutChartCard from './DonutChartCard';
import SummaryBanner from './SummaryBanner';
import { formatPeso } from './formatters';

const STAGE_COLUMNS = [
    { key: 'quote', label: 'QUOTE' },
    { key: 'pending', label: 'QUEUED' },
    { key: 'in_progress', label: 'PRINTING' },
    { key: 'ready', label: 'READY' },
];

const HEALTH_CELL_STYLES = {
    on: 'bg-emerald-50/70 border-emerald-300/80 text-emerald-700 dark:bg-emerald-900/25 dark:border-emerald-700/70 dark:text-emerald-300',
    watch: 'bg-amber-50/80 border-amber-300/80 text-amber-700 dark:bg-amber-900/25 dark:border-amber-700/70 dark:text-amber-300',
    over: 'bg-rose-50/80 border-rose-300/80 text-rose-700 dark:bg-rose-900/25 dark:border-rose-700/70 dark:text-rose-300',
};

export default function PipelineReport({ data = {}, isAdmin = false }) {
    const totalVal = data.total_value || 0;
    const weightedVal = data.weighted_value || 0;
    const atRiskVal = data.at_risk_value || 0;

    const vsPct = data.vs_last_month_pct;
    const vsPill =
        vsPct !== null && vsPct !== undefined
            ? `${vsPct >= 0 ? '+' : ''}${vsPct}% vs last month`
            : `${data.open_jobs_count || 0} open jobs`;

    const summaryItems = [
        {
            label: 'PIPELINE VALUE',
            value: isAdmin ? formatPeso(totalVal, true) : `${data.open_jobs_count || 0} Jobs`,
            pill: vsPill,
            tone: vsPct !== null && vsPct < 0 ? 'amber' : 'green',
        },
        {
            label: 'WEIGHTED',
            value: isAdmin ? formatPeso(weightedVal, true) : `${data.weighted_pct || 0}%`,
            pill: `${data.weighted_pct || 0}% of pipeline`,
            tone: 'blue',
        },
        {
            label: 'AT RISK',
            value: isAdmin ? formatPeso(atRiskVal, true) : `${data.at_risk_count || 0} Jobs`,
            pill:
                (data.at_risk_count || 0) > 0
                    ? `${data.at_risk_count} ${data.at_risk_count === 1 ? 'job' : 'jobs'} overdue (7d+)`
                    : 'All jobs on track',
            tone: (data.at_risk_count || 0) > 0 ? 'red' : 'green',
        },
    ];

    const stages = data.stages || [];
    const clients = data.clients || [];

    return (
        <div>
            <SummaryBanner items={summaryItems} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Active Print Pipeline Matrix */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Active print pipeline
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-gray-300">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                On
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                Watch
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                Over
                            </span>
                        </div>
                    </div>

                    {clients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-2 border-spacing-x-1.5">
                                <thead>
                                    <tr>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 pb-2 pr-3">
                                            CLIENT
                                        </th>
                                        {STAGE_COLUMNS.map((col) => (
                                            <th
                                                key={col.key}
                                                className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 pb-2 px-1"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.customer_id || client.name}>
                                            <td className="py-1 pr-3 text-sm font-semibold text-slate-700 dark:text-gray-200 max-w-[140px] truncate" title={client.name}>
                                                {client.name}
                                            </td>
                                            {STAGE_COLUMNS.map((col) => {
                                                const cell = client.stages?.[col.key];
                                                const hasData = cell && cell.count > 0;
                                                const health = cell?.health || 'on';

                                                if (!hasData) {
                                                    return (
                                                        <td key={col.key} className="py-0.5">
                                                            <div className="h-11 rounded-xl border border-slate-100 dark:border-gray-700/70 bg-slate-50/70 dark:bg-gray-700/30 flex items-center justify-center text-slate-300 dark:text-gray-500 text-sm font-medium">
                                                                –
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={col.key} className="py-0.5">
                                                        <div
                                                            className={`relative h-11 rounded-xl border px-2.5 flex items-center justify-center text-sm font-bold transition hover:shadow-sm ${
                                                                HEALTH_CELL_STYLES[health] || HEALTH_CELL_STYLES.on
                                                            }`}
                                                            title={`${cell.count} ${cell.count === 1 ? 'job' : 'jobs'} • ${formatPeso(cell.value)}`}
                                                        >
                                                            {health === 'over' && (
                                                                <span
                                                                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-800"
                                                                    aria-label="Overdue job"
                                                                />
                                                            )}
                                                            <span>
                                                                {isAdmin
                                                                    ? formatPeso(cell.value, true)
                                                                    : `${cell.count} ${cell.count === 1 ? 'job' : 'jobs'}`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                No active print jobs in the pipeline right now.
                            </p>
                            <Link
                                href={route('orders.create')}
                                className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Create Print Order →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right: By stage Donut Chart */}
                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="By stage"
                        badge="OPEN"
                        centerValue={isAdmin ? formatPeso(totalVal, true) : `${data.open_jobs_count || 0}`}
                        centerLabel={isAdmin ? 'PIPELINE' : 'OPEN JOBS'}
                        segments={stages.map((s) => ({
                            label: s.label,
                            value: isAdmin ? s.value : s.count,
                            pct: s.pct,
                        }))}
                        emptyText="No open print jobs to chart."
                    />
                </div>
            </div>
        </div>
    );
}
