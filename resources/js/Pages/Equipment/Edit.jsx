import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StickyEditBar from '@/Components/StickyEditBar';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, equipment }) {
    // Format dates for input fields
    const safeDate = (dateString) => dateString ? dateString.substring(0, 10) : '';

    const { data, setData, put, processing, errors } = useForm({
        name: equipment.name || '', type: equipment.type || '', status: equipment.status || 'active', 
        purchase_date: safeDate(equipment.purchase_date), 
        last_maintenance_date: safeDate(equipment.last_maintenance_date), 
        next_maintenance_date: safeDate(equipment.next_maintenance_date), 
        hourly_cost: equipment.hourly_cost || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('equipment.update', equipment.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Equipment: {equipment.name}</h2>}>
            <Head title="Edit Equipment" />
            <form onSubmit={submit}>
                <StickyEditBar backHref={route('equipment.index')} backLabel="Back to Equipment" processing={processing}>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{equipment.name}</span>
                </StickyEditBar>
                <div className="pb-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Machine Name/Model *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipment Type *</label>
                                    <input type="text" value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.type && <div className="text-red-500 mt-1 text-sm">{errors.type}</div>}
                                </div>
                                
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                        <option value="active">Active</option>
                                        <option value="maintenance">In Maintenance</option>
                                        <option value="retired">Retired / Down</option>
                                    </select>
                                </div>
                                 <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hourly Cost (₱)</label>
                                    <input type="number" step="0.01" value={data.hourly_cost} onChange={e => setData('hourly_cost', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</label>
                                    <input type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1 flex flex-col justify-end"></div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Maintenance</label>
                                    <input type="date" value={data.last_maintenance_date} onChange={e => setData('last_maintenance_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Next Scheduled Maintenance</label>
                                    <input type="date" value={data.next_maintenance_date} onChange={e => setData('next_maintenance_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('equipment.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50">{processing ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </form>
        </AuthenticatedLayout>
    );
}
