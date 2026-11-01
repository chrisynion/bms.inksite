import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, orders }) {
    const { delete: destroy } = useForm();

    const deleteOrder = (id) => {
        if (confirm('Are you sure you want to delete this order?')) {
            destroy(route('orders.destroy', id));
        }
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Orders Management</h2>}
        >
            <Head title="Orders" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <Link href={route('orders.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm font-medium">Create New Order</Link>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col sm:rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="p-0 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                                        <th className="w-48 max-w-[12rem] px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No orders found. Create your first order to get started.</td>
                                        </tr>
                                    ) : (
                                        orders.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#053a8078] transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                                                    <Link href={route('orders.edit', item.id)}>{item.order_number}</Link>
                                                </td>
                                                <td className="w-48 max-w-[12rem] px-6 py-4 whitespace-nowrap">
                                                     <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.customer?.name}>{item.customer?.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.customer?.company_name}>{item.customer?.company_name}</div>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                                    ₱{parseFloat(item.order_total).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end gap-3">
                                                    <Link href={route('orders.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition">Edit / View</Link>
                                                    <button onClick={() => deleteOrder(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition">Delete</button>
                                                </td>
                                            </tr>
                                        ))
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
