import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, service }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: service.name || '', 
        description: service.description || '', 
        price: service.price || '0', 
        duration: service.duration ? service.duration.substring(0, 5) : '', 
        profit_margin: service.profit_margin || ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('services.update', service.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Service</h2>}>
            <Head title="Edit Service" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" rows="3"></textarea>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Price (₱) *</label>
                                    <input type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.price && <div className="text-red-500 mt-1 text-sm">{errors.price}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profit Margin (%)</label>
                                    <input type="number" step="0.01" value={data.profit_margin} onChange={e => setData('profit_margin', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1">
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                min="0"
                                                value={data.duration ? parseInt(data.duration.split(':')[0]) : '0'} 
                                                onChange={e => {
                                                    const mins = data.duration ? data.duration.split(':')[1] : '00';
                                                    setData('duration', `${e.target.value.padStart(2, '0')}:${mins.padStart(2, '0')}`);
                                                }}
                                                className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                            />
                                            <span className="text-[10px] uppercase text-gray-500 font-bold ml-1">Hrs</span>
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                min="0"
                                                max="59"
                                                value={data.duration ? parseInt(data.duration.split(':')[1]) : '0'} 
                                                onChange={e => {
                                                    const hrs = data.duration ? data.duration.split(':')[0] : '00';
                                                    setData('duration', `${hrs.padStart(2, '0')}:${e.target.value.padStart(2, '0')}`);
                                                }}
                                                className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                            />
                                            <span className="text-[10px] uppercase text-gray-500 font-bold ml-1">Mins</span>
                                        </div>
                                    </div>
                                    {errors.duration && <div className="text-red-500 mt-1 text-sm">{errors.duration}</div>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('services.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
