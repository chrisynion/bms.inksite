import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, employee }) {
    const formattedDate = employee.hire_date ? employee.hire_date.substring(0, 10) : '';
    
    // Employee Form

    const { data, setData, put, processing, errors } = useForm({
        name: employee.name || '', role: employee.role || '', 
        email: employee.email || '', phone: employee.phone || '', 
        hire_date: formattedDate, hourly_rate: employee.hourly_rate || '', 
        status: employee.status || 'active'
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('employees.update', employee.id));
    };

    // Overtime Form
    const { data: otData, setData: setOtData, post: postOt, processing: otProcessing, reset: resetOt, errors: otErrors } = useForm({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        notes: ''
    });

    const submitOvertime = (e) => {
        e.preventDefault();
        postOt(route('employee-overtimes.store', employee.id), {
            preserveScroll: true,
            onSuccess: () => resetOt('hours', 'notes')
        });
    };

    const deleteOvertime = (id) => {
        if(confirm('Delete this overtime record?')) {
            router.delete(route('employee-overtimes.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Employee: {employee.name}</h2>}>
            <Head title="Edit Employee" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role/Title *</label>
                                    <input type="text" value={data.role} onChange={e => setData('role', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                    {errors.role && <div className="text-red-500 mt-1 text-sm">{errors.role}</div>}
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hire Date</label>
                                    <input type="date" value={data.hire_date} onChange={e => setData('hire_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Rate (₱)</label>
                                    <input type="number" step="0.01" value={data.hourly_rate} onChange={e => setData('hourly_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                    {errors.hourly_rate && <div className="text-red-500 mt-1 text-sm">{errors.hourly_rate}</div>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('employees.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">Save Changes</button>
                            </div>
                        </form>
                    </div>

                    {/* Overtime Section */}
                    <div className="mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Overtime Logs</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Log Form */}
                            <div className="col-span-1 border-r pr-6 dark:border-gray-700">
                                <form onSubmit={submitOvertime} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
                                        <input type="date" value={otData.date} onChange={e => setOtData('date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                        {otErrors.date && <div className="text-red-500 text-xs mt-1">{otErrors.date}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours *</label>
                                        <input type="number" step="0.1" value={otData.hours} onChange={e => setOtData('hours', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                        {otErrors.hours && <div className="text-red-500 text-xs mt-1">{otErrors.hours}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                        <textarea value={otData.notes} onChange={e => setOtData('notes', e.target.value)} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <button type="submit" disabled={otProcessing} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition disabled:opacity-50">Log Overtime</button>
                                </form>
                            </div>

                            {/* Logs Table */}
                            <div className="col-span-1 md:col-span-2">
                                {(!employee.overtimes || employee.overtimes.length === 0) ? (
                                    <p className="text-gray-500 text-sm italic dark:text-gray-400">No overtime records found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {employee.overtimes.map(ot => (
                                                    <tr key={ot.id}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(ot.date).toLocaleDateString()}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">{ot.hours}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">₱{ot.rate_applied}/hr</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-right font-bold">₱{ot.total_pay}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => deleteOvertime(ot.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">&times;</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <td className="px-3 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">Totals:</td>
                                                    <td className="px-3 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                        {employee.overtimes.reduce((sum, ot) => sum + parseFloat(ot.hours), 0).toFixed(1)}h
                                                    </td>
                                                    <td></td>
                                                    <td className="px-3 py-3 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                                                        ₱{employee.overtimes.reduce((sum, ot) => sum + parseFloat(ot.total_pay), 0).toFixed(2)}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
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
