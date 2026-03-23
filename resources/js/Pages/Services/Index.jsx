import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, services }) {
    const { delete: destroy } = useForm();
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Services</h2>}
        >
            <Head title="Services" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <Link href={route('services.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Add New Service</Link>
                    </div>
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (Base)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin (%)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {services.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${item.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.profit_margin ? `${item.profit_margin}%` : '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.duration || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                                <Link href={route('services.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</Link>
                                                <button onClick={() => { if(confirm('Delete this service?')) destroy(route('services.destroy', item.id)) }} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {services.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No services found. Add some to get started!</div>}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
