import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StickyEditBar from '@/Components/StickyEditBar';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, user, employees }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '', email: user.email || '', 
        role: user.role || 'staff', employee_id: user.employee_id || '', 
        password: '', password_confirmation: ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit User: {user.name}</h2>}>
            <Head title="Edit User" />
            <form onSubmit={submit}>
                <StickyEditBar backHref={route('users.index')} backLabel="Back to Users" processing={processing}>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                </StickyEditBar>
                <div className="pb-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.email && <div className="text-red-500 mt-1 text-sm">{errors.email}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Role *</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="staff">Staff (Limited Access)</option>
                                        <option value="manager">Manager (Elevated Access)</option>
                                        <option value="admin">Administrator (Full Access)</option>
                                    </select>
                                    {errors.role && <div className="text-red-500 mt-1 text-sm">{errors.role}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link to Employee Profile (Optional)</label>
                                    <select value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                        <option value="">-- No linked employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.position})</option>
                                        ))}
                                    </select>
                                    {errors.employee_id && <div className="text-red-500 mt-1 text-sm">{errors.employee_id}</div>}
                                </div>
                                <div className="col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password (leave blank to keep current)</h3>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                    {errors.password && <div className="text-red-500 mt-1 text-sm">{errors.password}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('users.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
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
