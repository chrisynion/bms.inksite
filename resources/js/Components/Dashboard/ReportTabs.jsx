import { Link } from '@inertiajs/react';
import DonutChartCard from './DonutChartCard';
import SummaryBanner from './SummaryBanner';
import { SEMANTIC_DONUT_COLORS, formatPeso, formatPesoExact } from './formatters';

export function RevenueReport({ data = {} }) {
    const vsPct = data.vs_last_month_pct;
    const summaryItems = [
        {
            label: 'COLLECTED THIS MONTH',
            value: formatPeso(data.collected_this_month || 0, true),
            pill:
                vsPct !== null && vsPct !== undefined
                    ? `${vsPct >= 0 ? '+' : ''}${vsPct}% vs last month`
                    : `${data.orders_count_this_month || 0} orders`,
            tone: vsPct !== null && vsPct < 0 ? 'amber' : 'green',
        },
        {
            label: 'BILLED ORDERS',
            value: formatPeso(data.billed_this_month || 0, true),
            pill: `${data.collection_rate_pct || 0}% collection rate`,
            tone: 'blue',
        },
        {
            label: 'AVG ORDER VALUE',
            value: formatPeso(data.avg_order_value || 0),
            pill: `${data.orders_count_this_month || 0} print orders`,
            tone: 'slate',
        },
    ];

    const topServices = data.top_services || [];

    return (
        <div>
            <SummaryBanner items={summaryItems} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Top print services revenue
                        </h3>
                        <Link
                            href={route('services.index')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Manage Services →
                        </Link>
                    </div>
                    {topServices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="py-2.5 pr-3">Service</th>
                                        <th className="py-2.5 px-2 text-right">Qty</th>
                                        <th className="py-2.5 px-2 text-right">Revenue</th>
                                        <th className="py-2.5 pl-2 text-right">Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-gray-700/50">
                                    {topServices.map((svc) => (
                                        <tr key={svc.service_id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30">
                                            <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-gray-200">
                                                {svc.service_name}
                                            </td>
                                            <td className="py-3 px-2 text-right text-slate-600 dark:text-gray-300">
                                                {Number(svc.total_quantity).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">
                                                {formatPesoExact(svc.total_revenue)}
                                            </td>
                                            <td className="py-3 pl-2 text-right">
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                                                    {svc.share_pct}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="py-12 text-center text-sm text-slate-500">
                            No service revenue recorded this month yet.
                        </p>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="By print service"
                        badge="THIS MONTH"
                        centerValue={formatPeso(data.total_service_revenue || 0, true)}
                        centerLabel="SERVICES"
                        segments={data.by_service_donut || []}
                        emptyText="No service breakdown available this month."
                    />
                </div>
            </div>
        </div>
    );
}

export function FinancialReport({ data = {} }) {
    const net = Number(data.net_cashflow || 0);
    const summaryItems = [
        {
            label: 'TOTAL CASH IN',
            value: formatPeso(data.total_cash_in || 0, true),
            pill: `${data.payment_modes_count || 0} active accounts`,
            tone: 'green',
        },
        {
            label: 'EXPENSES',
            value: formatPeso(data.ledger_expenses || 0, true),
            pill: `${data.expense_ratio_pct || 0}% of cash in`,
            tone: (data.expense_ratio_pct || 0) > 75 ? 'amber' : 'blue',
        },
        {
            label: 'RECEIVABLES',
            value: formatPeso(data.outstanding_receivables || 0, true),
            pill: `${data.unpaid_orders_count || 0} unpaid orders`,
            tone: (data.unpaid_orders_count || 0) > 0 ? 'red' : 'green',
        },
    ];

    const accounts = data.account_balances || [];

    return (
        <div>
            <SummaryBanner items={summaryItems} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                Payment accounts & cashflow
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                Net cashflow this month:{' '}
                                <span className={`font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatPesoExact(net)}
                                </span>
                            </p>
                        </div>
                        <Link
                            href={route('transactions.index')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Cashbook →
                        </Link>
                    </div>

                    {accounts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {accounts.map((acc) => (
                                <div
                                    key={acc.name}
                                    className="rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50/60 dark:bg-gray-700/30 p-4 flex items-center justify-between"
                                >
                                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-200 truncate pr-2">
                                        {acc.name}
                                    </span>
                                    <span className="text-base font-black text-slate-900 dark:text-white shrink-0">
                                        {formatPesoExact(acc.balance)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-12 text-center text-sm text-slate-500">No payment accounts configured.</p>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="Expenses by category"
                        badge="THIS MONTH"
                        centerValue={formatPeso(data.ledger_expenses || 0, true)}
                        centerLabel="EXPENSES"
                        segments={data.expenses_by_category || []}
                        emptyText="No expenses recorded this month."
                    />
                </div>
            </div>
        </div>
    );
}

const HEALTH_BADGES = {
    on: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    watch: 'bg-amber-50 text-amber-700 border-amber-200',
    over: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function OperationsReport({ data = {} }) {
    const eq = data.equipment_summary || {};
    const summaryItems = [
        {
            label: 'ACTIVE PRINT QUEUE',
            value: `${data.active_jobs_count || 0} Jobs`,
            pill:
                (data.watch_or_over_count || 0) > 0
                    ? `${data.watch_or_over_count} aging (4d+)`
                    : 'All on schedule',
            tone: (data.watch_or_over_count || 0) > 0 ? 'amber' : 'green',
        },
        {
            label: 'COMPLETED THIS MONTH',
            value: `${data.completed_this_month || 0} Jobs`,
            pill: `${data.on_time_rate_pct ?? 100}% queue healthy`,
            tone: 'blue',
        },
        {
            label: 'LOW STOCK MATERIALS',
            value: `${data.low_stock_count || 0} SKUs`,
            pill:
                (data.out_of_stock_count || 0) > 0
                    ? `${data.out_of_stock_count} out of stock`
                    : `${eq.operational || 0}/${eq.total || 0} machines operational`,
            tone: (data.out_of_stock_count || 0) > 0 ? 'red' : 'amber',
        },
    ];

    const queue = data.active_queue || [];
    const donutSegments = (data.inventory_donut || []).map((seg, idx) => ({
        ...seg,
        color:
            idx === 0
                ? SEMANTIC_DONUT_COLORS.emerald
                : idx === 1
                ? SEMANTIC_DONUT_COLORS.amber
                : SEMANTIC_DONUT_COLORS.rose,
    }));

    return (
        <div>
            <SummaryBanner items={summaryItems} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Production queue & turnaround
                        </h3>
                        <Link
                            href={route('orders.index')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            All Orders →
                        </Link>
                    </div>
                    {queue.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="py-2.5 pr-3">Job</th>
                                        <th className="py-2.5 px-2">Client</th>
                                        <th className="py-2.5 px-2">Operator</th>
                                        <th className="py-2.5 px-2">Stage</th>
                                        <th className="py-2.5 pl-2 text-right">Age</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-gray-700/50">
                                    {queue.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30">
                                            <td className="py-2.5 pr-3 font-bold text-slate-800 dark:text-gray-200">
                                                <Link href={route('orders.edit', job.id)} className="hover:text-blue-600">
                                                    {job.order_number || `#${job.id}`}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 px-2 text-slate-600 dark:text-gray-300 truncate max-w-[140px]">
                                                {job.customer_name}
                                            </td>
                                            <td className="py-2.5 px-2 text-slate-500 dark:text-gray-400 text-xs">
                                                {job.assigned_to}
                                            </td>
                                            <td className="py-2.5 px-2 capitalize text-xs font-semibold text-slate-700 dark:text-gray-300">
                                                {job.status.replace('_', ' ')}
                                            </td>
                                            <td className="py-2.5 pl-2 text-right">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${
                                                        HEALTH_BADGES[job.health] || HEALTH_BADGES.on
                                                    }`}
                                                >
                                                    {job.age_days}d
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="py-12 text-center text-sm text-slate-500">Production queue is clear!</p>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="Material & ink stock health"
                        badge="INVENTORY"
                        centerValue={`${data.total_sku_count || 0}`}
                        centerLabel="TOTAL SKUS"
                        segments={donutSegments}
                        emptyText="No inventory items tracked yet."
                    />
                </div>
            </div>
        </div>
    );
}

export function CustomersReport({ data = {}, isAdmin = false }) {
    const summaryItems = [
        {
            label: 'TOTAL CLIENTS',
            value: `${data.total_customers || 0}`,
            pill: `+${data.new_this_month || 0} new this month`,
            tone: 'green',
        },
        {
            label: 'REPEAT CLIENTS',
            value: `${data.repeat_customers || 0}`,
            pill: `${data.repeat_rate_pct || 0}% repeat rate`,
            tone: 'blue',
        },
        {
            label: isAdmin ? 'OUTSTANDING BALANCES' : 'CLIENTS WITH BALANCE',
            value: isAdmin
                ? formatPeso(data.total_outstanding_balance || 0, true)
                : `${data.customers_with_balance_count || 0}`,
            pill: `${data.customers_with_balance_count || 0} clients pending`,
            tone: (data.customers_with_balance_count || 0) > 0 ? 'red' : 'green',
        },
    ];

    const clients = data.top_clients || [];

    return (
        <div>
            <SummaryBanner items={summaryItems} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Top print clients
                        </h3>
                        <Link
                            href={route('customers.index')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            All Clients →
                        </Link>
                    </div>
                    {clients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="py-2.5 pr-3">Client</th>
                                        <th className="py-2.5 px-2 text-center">Segment</th>
                                        <th className="py-2.5 px-2 text-right">Orders</th>
                                        {isAdmin && <th className="py-2.5 pl-2 text-right">Paid</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-gray-700/50">
                                    {clients.map((c) => (
                                        <tr key={c.customer_id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30">
                                            <td className="py-3 pr-3">
                                                <div className="font-semibold text-slate-800 dark:text-gray-200">
                                                    {c.name}
                                                </div>
                                                {c.company_name && (
                                                    <div className="text-xs text-slate-400">{c.company_name}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span
                                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        c.segment === 'Repeat'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : c.segment === 'One-time'
                                                            ? 'bg-sky-50 text-sky-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {c.segment}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right font-semibold text-slate-700 dark:text-gray-300">
                                                {c.orders_count}
                                            </td>
                                            {isAdmin && (
                                                <td className="py-3 pl-2 text-right font-bold text-slate-900 dark:text-white">
                                                    {formatPesoExact(c.total_paid || 0)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="py-12 text-center text-sm text-slate-500">No customers found.</p>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="Client mix"
                        badge="ALL TIME"
                        centerValue={`${data.total_customers || 0}`}
                        centerLabel="CLIENTS"
                        segments={data.mix_donut || []}
                        emptyText="No customer segments available."
                    />
                </div>
            </div>
        </div>
    );
}

export function PeopleReport({ data = {}, isAdmin = false }) {
    const summaryItems = [
        {
            label: 'ACTIVE STAFF',
            value: `${data.active_staff_count || 0}`,
            pill: `${data.total_staff_count || 0} total team`,
            tone: 'green',
        },
        {
            label: 'ASSIGNED ACTIVE JOBS',
            value: `${data.assigned_active_jobs || 0}`,
            pill:
                (data.unassigned_active_jobs || 0) > 0
                    ? `${data.unassigned_active_jobs} unassigned`
                    : 'All jobs assigned',
            tone: (data.unassigned_active_jobs || 0) > 0 ? 'amber' : 'blue',
        },
        {
            label: 'OVERTIME THIS MONTH',
            value: `${data.overtime_hours_this_month || 0} hrs`,
            pill: isAdmin
                ? `${formatPesoExact(data.overtime_pay_this_month || 0)} OT pay`
                : 'Logged this month',
            tone: 'slate',
        },
    ];

    const operators = data.operators || [];
    const totalQueueJobs = (data.assigned_active_jobs || 0) + (data.unassigned_active_jobs || 0);

    return (
        <div>
            <SummaryBanner items={summaryItems} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">
                            Print operator workload
                        </h3>
                        <Link
                            href={route('employees.index')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Manage Team →
                        </Link>
                    </div>
                    {operators.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-700 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="py-2.5 pr-3">Operator</th>
                                        <th className="py-2.5 px-2">Role</th>
                                        <th className="py-2.5 px-2 text-right">Active</th>
                                        <th className="py-2.5 px-2 text-right">Done (Mo)</th>
                                        <th className="py-2.5 pl-2 text-right">OT Hrs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-gray-700/50">
                                    {operators.map((emp) => (
                                        <tr key={emp.employee_id} className="hover:bg-slate-50/70 dark:hover:bg-gray-700/30">
                                            <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-gray-200">
                                                {emp.name}
                                            </td>
                                            <td className="py-3 px-2 text-xs text-slate-500 dark:text-gray-400">
                                                {emp.role || 'Staff'}
                                            </td>
                                            <td className="py-3 px-2 text-right font-bold text-blue-600 dark:text-blue-400">
                                                {emp.currently_active_orders}
                                            </td>
                                            <td className="py-3 px-2 text-right text-slate-700 dark:text-gray-300">
                                                {emp.completed_in_period}
                                            </td>
                                            <td className="py-3 pl-2 text-right text-slate-600 dark:text-gray-300">
                                                {emp.overtime_hours_in_period}h
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="py-12 text-center text-sm text-slate-500">No employees found.</p>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <DonutChartCard
                        title="Active jobs by operator"
                        badge="OPEN"
                        centerValue={`${totalQueueJobs}`}
                        centerLabel="JOBS"
                        segments={data.jobs_donut || []}
                        emptyText="No active jobs assigned right now."
                    />
                </div>
            </div>
        </div>
    );
}
