import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, metrics = {}, recent_orders = [], low_stock_items = [], account_balances = [] }) {
    
    const formattedRevenue = '₱' + new Intl.NumberFormat('en-PH').format(metrics.current_month_revenue || 0);

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard Overview</h2>}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">Welcome back, {auth.user.name}!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Here is what's happening with your print shop this month.</p>
                    </div>

                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Revenue Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative z-10">
                                <p className="text-indigo-100 font-semibold uppercase tracking-wider text-xs mb-1">Monthly Gross Income</p>
                                <h4 className="text-3xl font-black">{formattedRevenue}</h4>
                            </div>
                            <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" transform="rotate(-90 12 12)" /></svg>
                        </div>

                        {/* Active Orders Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-lg shadow-blue-200 dark:shadow-none text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative z-10">
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-xs mb-1">Active Production</p>
                                <h4 className="text-3xl font-black">{metrics.active_orders_count || 0} <span className="text-lg font-normal opacity-80">Jobs</span></h4>
                            </div>
                            <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>

                        {/* Pending Orders Card */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg shadow-amber-200 dark:shadow-none text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative z-10">
                                <p className="text-amber-100 font-semibold uppercase tracking-wider text-xs mb-1">Pending Approvals</p>
                                <h4 className="text-3xl font-black">{metrics.pending_orders_count || 0} <span className="text-lg font-normal opacity-80">Quotes</span></h4>
                            </div>
                            <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>

                        {/* Total Customers Card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg shadow-emerald-200 dark:shadow-none text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative z-10">
                                <p className="text-emerald-100 font-semibold uppercase tracking-wider text-xs mb-1">Total Audience</p>
                                <h4 className="text-3xl font-black">{metrics.total_customers || 0} <span className="text-lg font-normal opacity-80">Clients</span></h4>
                            </div>
                            <svg className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>

                    {/* Account Balances Section */}
                    {account_balances?.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Balances</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {account_balances.map(account => (
                                    <div key={account.name} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col justify-center">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">{account.name}</div>
                                        <div className="text-2xl font-black text-gray-900 dark:text-white">₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(account.balance)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Area Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        
                        {/* Recent Orders Table (Takes up 2/3 space on large screens) */}
                        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-gray-900 dark:text-gray-100">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-bold">Recent Orders</h3>
                                <Link href={route('orders.index')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">View All →</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 font-bold border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_orders.length > 0 ? recent_orders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-200">#{order.id.toString().padStart(4, '0')}</td>
                                                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{order.customer?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-200">₱{parseFloat(order.order_total).toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        order.status === 'ready' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={route('orders.edit', order.id)} className="text-gray-400 hover:text-indigo-600 transition">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">No recent orders found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Low Stock Alerts (Takes 1/3 space on large screens) */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden text-gray-900 dark:text-gray-100 flex flex-col">
                            <div className="p-6 border-b border-red-100 dark:border-red-900/30 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
                                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Low Stock Alerts
                                </h3>
                                <Link href={route('inventory.index')} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">View Inventory</Link>
                            </div>
                            <div className="p-2 flex-grow overflow-y-auto">
                                {low_stock_items.length > 0 ? (
                                    <ul className="space-y-1">
                                        {low_stock_items.map(item => (
                                            <li key={item.id} className="flex justify-between items-center p-4 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ref: {item.form || 'Item'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-black rounded text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 shadow-sm border border-red-200 dark:border-red-800">
                                                        {item.stock} LEFT
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-70">
                                        <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Inventory looks healthy!</p>
                                        <p className="text-xs text-gray-500 mt-1">No items are below the minimum threshold.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
