import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StickyEditBar from '@/Components/StickyEditBar';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '', contact_person: supplier.contact_person || '', 
        email: supplier.email || '', phone: supplier.phone || '', 
        website: supplier.website || '', address: supplier.address || '', 
        notes: supplier.notes || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Supplier: {supplier.name}</h2>}>
            <Head title="Edit Supplier" />
            <form onSubmit={submit}>
                <StickyEditBar backHref={route('suppliers.index')} backLabel="Back to Suppliers" processing={processing}>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{supplier.name}</span>
                </StickyEditBar>
                <div className="pb-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                                    <input type="text" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                                    <input type="url" value={data.website} onChange={e => setData('website', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                    <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" rows="2"></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes & Payment Terms</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" rows="3"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('suppliers.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
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
