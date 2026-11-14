import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Index({ auth, orders, filters }) {
    const { delete: destroy } = useForm();
    const currentPeriod = filters?.period || 'current_month';

    const periods = [
        { value: 'current_month', label: 'Current Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_3_months', label: 'Last 3 Months' },
        { value: 'last_6_months', label: 'Last 6 Months' },
        { value: 'full_year', label: 'Full Year' },
        { value: 'all', label: 'All Orders' },
    ];

    const handlePeriodChange = (period) => {
        router.get(
            route('orders.index'),
            { period },
            { preserveState: true, replace: true }
        );
    };

    const deleteOrder = (id) => {
        if (confirm('Are you sure you want to delete this order?')) {
            destroy(route('orders.destroy', id), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const formatDateRange = () => {
        if (currentPeriod === 'all' || !filters?.start_date || !filters?.end_date) {
            return 'All recorded orders';
        }
        const [sY, sM, sD] = filters.start_date.split('-');
        const [eY, eM, eD] = filters.end_date.split('-');
        const startDate = new Date(Number(sY), Number(sM) - 1, Number(sD));
        const endDate = new Date(Number(eY), Number(eM) - 1, Number(eD));
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString(undefined, options)} – ${endDate.toLocaleDateString(undefined, options)}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getPaymentModes = (order) => {
        if (order.payments && order.payments.length > 0) {
            const modes = order.payments.map(p => p.payment_mode).filter(Boolean);
            const unique = [...new Set(modes)];
            if (unique.length > 0) return unique;
        }
        if (order.payment_method) {
            return [order.payment_method];
        }
        return [];
    };

    const getPaymentModeBadge = (mode) => {
        const m = (mode || '').toLowerCase();
        if (m.includes('cash')) {
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800';
        }
        if (m.includes('gcash')) {
            return 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-200/60 dark:border-sky-800';
        }
        if (m.includes('bank') || m.includes('transfer')) {
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Orders Management</h2>}
        >
            <Head title="Orders" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Top Filter and Actions Bar */}
                    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Filter by Period */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium text-sm gap-2 shrink-0">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Period:</span>
                                </div>

                                {/* Mobile Select */}
                                <div className="sm:hidden w-full">
                                    <select
                                        value={currentPeriod}
                                        onChange={(e) => handlePeriodChange(e.target.value)}
                                        className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {periods.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tablet / Desktop Filter Buttons */}
                                <div className="hidden sm:flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-lg border border-gray-200 dark:border-gray-700/60">
                                    {periods.map(p => {
                                        const isActive = currentPeriod === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => handlePeriodChange(p.value)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active range info & Create Order */}
                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t border-gray-100 dark:border-gray-700 lg:border-t-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/40 px-3 py-1.5 rounded-md border border-gray-100 dark:border-gray-800">
                                    {formatDateRange()} • <strong className="text-gray-700 dark:text-gray-300">{orders.length}</strong> {orders.length === 1 ? 'order' : 'orders'}
                                </span>
                                <Link
                                    href={route('orders.create')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create New Order</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col sm:rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="p-0 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                                        <th className="w-36 max-w-[9rem] px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Mode</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full mb-3 text-gray-400 dark:text-gray-500">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                                        No orders found for {periods.find(p => p.value === currentPeriod)?.label.toLowerCase() || 'this period'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                                                        There are no orders recorded between {formatDateRange().toLowerCase()}. Switch the filter above to view past orders or create a new order.
                                                    </p>
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        {currentPeriod !== 'full_year' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePeriodChange('full_year')}
                                                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
                                                            >
                                                                View Full Year
                                                            </button>
                                                        )}
                                                        {currentPeriod !== 'all' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePeriodChange('all')}
                                                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
                                                            >
                                                                View All Orders
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('orders.create')}
                                                            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                                                        >
                                                            Create New Order
                                                        </Link>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((item) => {
                                            const modes = getPaymentModes(item);
                                            return (
                                                <tr key={item.id} className="hover:bg-[#053a8078] transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                                                        <Link href={route('orders.edit', item.id)}>{item.order_number}</Link>
                                                    </td>
                                                    <td className="w-36 max-w-[9rem] px-6 py-4 whitespace-nowrap">
                                                        <div className="w-36 max-w-[9rem] overflow-hidden pr-2">
                                                            <div 
                                                                className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden"
                                                                style={{
                                                                    maskImage: 'linear-gradient(to right, black 60%, transparent 95%)',
                                                                    WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 95%)'
                                                                }}
                                                                title={item.customer?.name}
                                                            >
                                                                {item.customer?.name}
                                                            </div>
                                                            {item.customer?.company_name && (
                                                                <div 
                                                                    className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden"
                                                                    style={{
                                                                        maskImage: 'linear-gradient(to right, black 60%, transparent 95%)',
                                                                        WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 95%)'
                                                                    }}
                                                                    title={item.customer?.company_name}
                                                                >
                                                                    {item.customer?.company_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {item.order_date ? new Date(item.order_date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(item.status)}`}>
                                                            {item.status.toUpperCase().replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm w-fit ${item.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : item.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                                {item.payment_status.toUpperCase()}
                                                            </span>
                                                            {item.payment_status === 'paid' && item.fully_paid_at && (
                                                                <span className="text-[10px] text-green-700 dark:text-green-400 font-medium tracking-tight mt-1">
                                                                    {new Date(item.fully_paid_at).toLocaleDateString()} {new Date(item.fully_paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                            {item.payment_status === 'partial' && (
                                                                <div className="mt-1 flex flex-col">
                                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">Paid: ₱{parseFloat(item.payment_amount || 0).toFixed(2)}</span>
                                                                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold tracking-tight">Due: ₱{(parseFloat(item.order_total) - parseFloat(item.payment_amount || 0)).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {modes.length === 0 ? (
                                                            <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1 items-center">
                                                                {modes.map((mode, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        title={
                                                                            item.payments
                                                                                ?.filter(p => p.payment_mode === mode)
                                                                                ?.map(p => `${mode}: ₱${parseFloat(p.amount || 0).toFixed(2)}${p.reference_number ? ` (Ref: ${p.reference_number})` : ''}`)
                                                                                ?.join('\n') || mode
                                                                        }
                                                                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-xs ${getPaymentModeBadge(mode)}`}
                                                                    >
                                                                        {mode}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                                        ₱{parseFloat(item.order_total).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end gap-3">
                                                        <Link href={route('orders.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition">Edit / View</Link>
                                                        <button onClick={() => deleteOrder(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition">Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
