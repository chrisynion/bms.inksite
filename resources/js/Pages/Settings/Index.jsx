import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        overtime_multiplier: settings.overtime_multiplier?.value || '1.30',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.update'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">System Settings</h2>}>
            <Head title="System Settings" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">Payroll & Overtime</h3>
                        <form onSubmit={submit} className="max-w-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Logo</label>
                                <input type="file" onChange={e => setData('logo', e.target.files[0])} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload a PNG or JPG to replace the default Laravel icon.</p>
                                {errors.logo && <div className="text-red-500 text-xs mt-1">{errors.logo}</div>}
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overtime Pay Multiplier</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                        x
                                    </span>
                                    <input type="number" step="0.01" value={data.overtime_multiplier} onChange={e => setData('overtime_multiplier', e.target.value)} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Example: Setting this to <code>1.30</code> means overtime is paid at regular hourly rate + 30%.</p>
                                {errors.overtime_multiplier && <div className="text-red-500 text-xs mt-1">{errors.overtime_multiplier}</div>}
                            </div>
                            <div className="mt-8">
                                <button type="submit" disabled={processing} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                    Save Settings
                                </button>
                                {recentlySuccessful && <span className="ml-3 text-sm text-green-600 dark:text-green-400">Saved successfully!</span>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
