import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

const PRESET_SIZES = [
    { name: 'Custom', w: '', h: '' },
    { name: 'A4', w: 8.27, h: 11.69 },
    { name: 'A3', w: 11.69, h: 16.54 },
    { name: 'Letter', w: 8.5, h: 11 },
    { name: 'Legal', w: 8.5, h: 14 },
    { name: '4x6 in', w: 4, h: 6 },
    { name: '5x7 in', w: 5, h: 7 },
    { name: '8x10 in', w: 8, h: 10 },
];

export default function Create({ auth, customers, employees, services }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        assigned_to: '',
        due_date: '',
        status: 'pending',
        order_total: 0,
        payment_status: 'unpaid',
        order_notes: '',
        items: [{ service_id: '', description: '', quantity: 1, unit_price: 0, width: '', height: '' }]
    });

    const [showQuickCustomer, setShowQuickCustomer] = useState(false);
    const [quickCust, setQuickCust] = useState({ name: '', phone: '' });
    const [quickErrors, setQuickErrors] = useState({});
    const [savingCust, setSavingCust] = useState(false);

    const handleQuickCustomer = async (e) => {
        e.preventDefault();
        setSavingCust(true);
        setQuickErrors({});
        try {
            const response = await axios.post(route('customers.store'), quickCust);
            const newCust = response.data;

            // After successful creation, we need to refresh the customers list.
            router.reload({ 
                only: ['customers'],
                onSuccess: () => {
                    setData('customer_id', newCust.id);
                    setSavingCust(false);
                    setShowQuickCustomer(false);
                    setQuickCust({ name: '', phone: '' });
                }
            });
        } catch (err) {
            setSavingCust(false);
            if (err.response?.data?.errors) {
                setQuickErrors(err.response.data.errors);
            }
        }
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => {
            const w = parseFloat(item.width) || 1;
            const h = parseFloat(item.height) || 1;
            const q = parseFloat(item.quantity) || 0;
            const p = parseFloat(item.unit_price) || 0;
            return sum + (w * h * q * p);
        }, 0).toFixed(2);
    };

    const addItem = () => {
        setData('items', [...data.items, { service_id: '', description: '', quantity: 1, unit_price: 0, width: '', height: '' }]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        const newTotal = calculateTotal(newItems);
        setData(d => ({ ...d, items: newItems, order_total: newTotal }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Auto-fill price and description when service is chosen
        if (field === 'service_id' && value) {
            const service = services.find(s => s.id == value);
            if (service) {
                newItems[index].unit_price = service.price;
                newItems[index].description = newItems[index].description || service.name;
            }
        }
        
        const newTotal = calculateTotal(newItems);
        setData(d => ({ ...d, items: newItems, order_total: newTotal }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create Order</h2>}>
            <Head title="Create Order" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Master Order Info */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col sm:rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 dark:border-gray-700">Order Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer *</label>
                                        <button type="button" onClick={() => setShowQuickCustomer(true)} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">+ Quick Add</button>
                                    </div>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="">-- Select Customer --</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
                                    </select>
                                    {errors.customer_id && <div className="text-red-500 mt-1 text-sm">{errors.customer_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To (Employee)</label>
                                    <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                        <option value="">-- Unassigned --</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    {errors.assigned_to && <div className="text-red-500 mt-1 text-sm">{errors.assigned_to}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                                    <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                    {errors.due_date && <div className="text-red-500 mt-1 text-sm">{errors.due_date}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Status *</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="quote">Quote / Estimate</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="in_progress">In Progress (Production)</option>
                                        <option value="ready">Ready for Pickup/Delivery</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status *</label>
                                    <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial / Deposit Paid</option>
                                        <option value="paid">Fully Paid</option>
                                    </select>
                                </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grand Total</label>
                                     <div className="mt-1 block w-full py-2 px-3 bg-gray-100 rounded-md border border-transparent dark:bg-gray-700 dark:text-gray-300 text-lg font-bold">
                                         ₱{data.order_total}
                                     </div>
                                     <input type="hidden" value={data.order_total} />
                                 </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Notes (Internal)</label>
                                    <textarea value={data.order_notes} onChange={e => setData('order_notes', e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex flex-col sm:rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Line Items</h3>
                                <button type="button" onClick={addItem} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
                                    + Add Item
                                </button>
                            </div>
                            
                            {errors.items && <div className="text-red-500 mb-4">{errors.items}</div>}

                                  <div className="space-y-4">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-12 gap-4 items-end mb-4">
                                                <div className="col-span-12 md:col-span-4">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Service</label>
                                                    <select value={item.service_id || ''} onChange={e => updateItem(index, 'service_id', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm">
                                                        <option value="">-- Custom Item --</option>
                                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} (₱{parseFloat(s.price || 0).toFixed(2)})</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-4 md:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Qty *</label>
                                                    <input type="number" step="0.1" min="0.1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" required />
                                                </div>
                                                <div className="col-span-4 md:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Price *</label>
                                                    <input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" required />
                                                </div>
                                                <div className="col-span-4 md:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Service Total</label>
                                                    <div className="block w-full py-2 px-3 bg-gray-50 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm font-semibold">
                                                        ₱{((parseFloat(item.width) || 1) * (parseFloat(item.height) || 1) * parseFloat(item.quantity) * parseFloat(item.unit_price) || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                                    {data.items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 p-2 rounded transition" title="Remove Item">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-12 gap-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                                <div className="col-span-6 md:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Preset Size</label>
                                                    <select 
                                                        onChange={(e) => {
                                                            const preset = PRESET_SIZES.find(p => p.name === e.target.value);
                                                            if (preset) {
                                                                updateItem(index, 'width', preset.w);
                                                                updateItem(index, 'height', preset.h);
                                                            }
                                                        }}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-xs"
                                                    >
                                                        {PRESET_SIZES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3 md:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Width</label>
                                                    <input type="number" step="0.01" value={item.width} onChange={e => updateItem(index, 'width', e.target.value)} placeholder="0" className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-xs" />
                                                </div>
                                                <div className="col-span-3 md:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Height</label>
                                                    <input type="number" step="0.01" value={item.height} onChange={e => updateItem(index, 'height', e.target.value)} placeholder="0" className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-xs" />
                                                </div>
                                                <div className="col-span-12 md:col-span-5">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Description / Notes</label>
                                                    <input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="e.g. Glossy finish" className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 mt-6 items-center">
                            <span className="text-xl font-bold dark:text-white mr-6">Grand Total: ₱{data.order_total}</span>
                            <Link href={route('orders.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium text-lg disabled:opacity-50">Create Order</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Quick Customer Modal */}
            {showQuickCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Add Customer</h3>
                        <form onSubmit={handleQuickCustomer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                                <input type="text" value={quickCust.name} onChange={e => setQuickCust({...quickCust, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 shadow-sm" required autoFocus />
                                {quickErrors.name && <div className="text-red-500 text-xs mt-1">{quickErrors.name[0]}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <input type="text" value={quickCust.phone} onChange={e => setQuickCust({...quickCust, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 shadow-sm" />
                                {quickErrors.phone && <div className="text-red-500 text-xs mt-1">{quickErrors.phone[0]}</div>}
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowQuickCustomer(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Cancel</button>
                                <button type="submit" disabled={savingCust} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition disabled:opacity-50">
                                    {savingCust ? 'Adding...' : 'Save & Select'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
