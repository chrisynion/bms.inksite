import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchableSelect from '@/Components/SearchableSelect';

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

export default function Edit({ auth, order, customers, employees, services, payment_modes, flash }) {
    const [deletingKeys, setDeletingKeys] = useState([]);
    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id || '',
        assigned_to: order.assigned_to || '',
        order_date: order.order_date ? (typeof order.order_date === 'string' ? order.order_date.split('T')[0] : order.order_date) : '',
        status: order.status || 'pending',
        order_total: order.order_total || 0,
        payment_status: order.payment_status || 'unpaid',
        payments: order.payments?.length > 0 
            ? order.payments.map(p => ({
                id: p.id,
                _key: p.id || `init-${Date.now()}-${Math.random()}`,
                payment_mode: p.payment_mode,
                amount: p.amount,
                reference_number: p.reference_number || '',
                payment_date: p.payment_date ? p.payment_date.split('T')[0] : new Date().toISOString().split('T')[0]
            }))
            : [],
        order_notes: order.order_notes || '',
        items: order.items.length > 0 
            ? order.items.map((i, idx) => ({...i, _key: i.id || `init-${idx}`, width: i.width || '', height: i.height || ''})) 
            : [{ _key: 'init-0', id: null, service_id: '', description: '', quantity: 1, unit_price: 0, width: '', height: '' }]
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
        setData('items', [...data.items, { _key: `new-${Date.now()}`, id: null, service_id: '', description: '', quantity: 1, unit_price: 0, width: '', height: '' }]);
    };

    const removeItem = (index) => {
        const itemKey = data.items[index]._key;
        if (deletingKeys.includes(itemKey)) return;

        setDeletingKeys(prev => [...prev, itemKey]);
        
        setTimeout(() => {
            const newItems = [...data.items];
            const actualIndex = newItems.findIndex(item => item._key === itemKey);
            if (actualIndex > -1) {
                newItems.splice(actualIndex, 1);
                const newTotal = calculateTotal(newItems);
                setData(d => {
                    let newPayments = d.payments;
                    if (d.payment_status === 'paid' && d.payments.length === 1) {
                        newPayments = [{ ...d.payments[0], amount: newTotal }];
                    }
                    return { 
                        ...d, 
                        items: newItems, 
                        order_total: newTotal,
                        payments: newPayments,
                    };
                });
            }
            setDeletingKeys(prev => prev.filter(k => k !== itemKey));
        }, 500);
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
        setData(d => {
            let newPayments = d.payments;
            if (d.payment_status === 'paid' && d.payments.length === 1) {
                newPayments = [{ ...d.payments[0], amount: newTotal }];
            }
            return { 
                ...d, 
                items: newItems, 
                order_total: newTotal,
                payments: newPayments,
            };
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (data.status === 'completed' && data.payment_status !== 'paid') {
            return;
        }
        put(route('orders.update', order.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Order: {order.order_number}</h2>}>
            <Head title={`Edit Order ${order.order_number}`} />

            <form onSubmit={submit}>
                {/* Sticky Action Bar */}
                <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 mb-4 transition-all">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Grand Total:</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ₱{parseFloat(data.order_total || 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {order.invoice ? (
                                <Link 
                                    href={route('invoices.show', order.invoice.id)} 
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition font-medium text-sm inline-flex items-center"
                                >
                                    View Invoice
                                </Link>
                            ) : (
                                <Link 
                                    href={route('invoices.store')} 
                                    method="post" 
                                    data={{ order_id: order.id }} 
                                    as="button" 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition font-medium text-sm inline-flex items-center"
                                >
                                    Generate Invoice
                                </Link>
                            )}
                            <Link 
                                href={route('orders.index')} 
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pb-12">
                    {(flash?.success || auth?.flash?.success) && (
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mb-6 px-4">
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium text-sm">{flash?.success || auth?.flash?.success}</span>
                            </div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Master Order Info */}
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm flex flex-col sm:rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 dark:border-gray-700">Order Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer *</label>
                                        <button type="button" onClick={() => setShowQuickCustomer(true)} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">+ Quick Add</button>
                                    </div>
                                    <SearchableSelect 
                                        options={customers.map(c => ({ 
                                            id: c.id, 
                                            name: `${c.name} ${c.company_name ? `(${c.company_name})` : ''}` 
                                        }))}
                                        value={data.customer_id}
                                        onChange={(val) => setData('customer_id', val)}
                                        placeholder="-- Search Customer --"
                                        className="mt-1"
                                    />
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Date</label>
                                    <input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                    {errors.order_date && <div className="text-red-500 mt-1 text-sm">{errors.order_date}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Status *</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="quote">Quote / Estimate</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="in_progress">In Progress (Production)</option>
                                        <option value="ready">Ready for Pickup/Delivery</option>
                                        <option value="completed" disabled={data.payment_status !== 'paid'}>Completed {data.payment_status !== 'paid' ? '(Requires Fully Paid)' : ''}</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {data.payment_status !== 'paid' && (
                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Status cannot be "COMPLETED" unless payment status is "Fully Paid".</p>
                                    )}
                                    {errors.status && <div className="text-red-500 mt-1 text-sm">{errors.status}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status *</label>
                                    <select value={data.payment_status} onChange={e => {
                                        const status = e.target.value;
                                        setData(d => {
                                            let newPayments = [...d.payments];
                                            let newStatus = d.status;
                                            if (status !== 'paid' && newStatus === 'completed') {
                                                newStatus = 'ready';
                                            }
                                            if (status === 'paid') {
                                                if (newPayments.length === 0) {
                                                    newPayments = [{ _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: d.order_total, reference_number: '', payment_date: new Date().toISOString().split('T')[0] }];
                                                } else if (newPayments.length === 1) {
                                                    newPayments[0] = { ...newPayments[0], amount: d.order_total };
                                                } else {
                                                    const alreadyPaid = newPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                                                    const diff = Math.max(0, parseFloat(d.order_total) - alreadyPaid);
                                                    if (diff > 0) {
                                                        newPayments.push({ _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: diff.toFixed(2), reference_number: 'Balance Payment', payment_date: new Date().toISOString().split('T')[0] });
                                                    }
                                                }
                                            } else if (status === 'partial' && newPayments.length === 0) {
                                                newPayments = [{ _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: '', reference_number: '', payment_date: new Date().toISOString().split('T')[0] }];
                                            }
                                            return { ...d, status: newStatus, payment_status: status, payments: newPayments };
                                        });
                                    }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial / Deposit Paid</option>
                                        <option value="paid">Fully Paid</option>
                                    </select>
                                    {errors.payment_status && <div className="text-red-500 mt-1 text-sm">{errors.payment_status}</div>}
                                    {order.fully_paid_at && (
                                        <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 inline text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            Fully Paid: {new Date(order.fully_paid_at).toLocaleDateString()} {new Date(order.fully_paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                                {data.payment_status !== 'unpaid' && (
                                    <div className="md:col-span-3 border-t pt-4 mt-2 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payments</label>
                                            <button type="button" onClick={() => {
                                                setData('payments', [...data.payments, { _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: '', reference_number: '', payment_date: new Date().toISOString().split('T')[0] }]);
                                            }} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">+ Add Payment Mode</button>
                                        </div>
                                        {data.payments.length === 0 && (
                                            <p className="text-sm text-red-500 mb-2">Please add at least one payment mode.</p>
                                        )}
                                        <div className="space-y-3">
                                            {data.payments.map((p, idx) => (
                                                <div key={p._key || idx} className="flex flex-wrap md:flex-nowrap items-end gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                                                    <div className="w-full md:w-1/4">
                                                        <label className="block text-xs text-gray-500 mb-1">Mode *</label>
                                                        <select value={p.payment_mode} onChange={e => {
                                                            const newP = [...data.payments]; newP[idx].payment_mode = e.target.value; setData('payments', newP);
                                                        }} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" required>
                                                            {payment_modes.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-full md:w-1/4">
                                                        <label className="block text-xs text-gray-500 mb-1">Amount *</label>
                                                        <input type="number" step="0.01" min="0" value={p.amount} onChange={e => {
                                                            const newP = [...data.payments]; newP[idx].amount = e.target.value; setData('payments', newP);
                                                        }} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" required />
                                                    </div>
                                                    <div className="w-full md:w-1/4">
                                                        <label className="block text-xs text-gray-500 mb-1">Ref No. (Optional)</label>
                                                        <input type="text" value={p.reference_number || ''} onChange={e => {
                                                            const newP = [...data.payments]; newP[idx].reference_number = e.target.value; setData('payments', newP);
                                                        }} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" />
                                                    </div>
                                                    <div className="w-full md:w-1/4">
                                                        <label className="block text-xs text-gray-500 mb-1">Date *</label>
                                                        <input type="date" value={p.payment_date || ''} onChange={e => {
                                                            const newP = [...data.payments]; newP[idx].payment_date = e.target.value; setData('payments', newP);
                                                        }} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 text-sm" required />
                                                    </div>
                                                    <div>
                                                        <button type="button" onClick={() => {
                                                            setData('payments', data.payments.filter((_, i) => i !== idx));
                                                        }} className="text-red-500 hover:text-red-700 p-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {errors.payments && <div className="text-red-500 text-sm mt-1">{errors.payments}</div>}
                                        </div>
                                    </div>
                                )}
                                 <div className="flex flex-col">
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calculated Total</label>
                                     <div className="mt-1 block w-full py-2 px-3 bg-gray-100 rounded-md border border-transparent dark:bg-gray-700 dark:text-gray-300 text-lg font-bold">
                                         ₱{data.order_total}
                                     </div>
                                     {data.payment_status === 'partial' && (
                                         <div className="mt-2 text-sm">
                                             <span className="text-gray-500 dark:text-gray-400">Balance Due: </span>
                                             <span className="font-bold text-red-600 dark:text-red-400">₱{(data.order_total - data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toFixed(2)}</span>
                                         </div>
                                     )}
                                     {data.payment_status === 'paid' && (data.order_total - data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)) > 0.01 && (
                                         <div className="mt-2 text-xs flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                                             <span>Payment records short by ₱{(data.order_total - data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toFixed(2)}</span>
                                             <button
                                                 type="button"
                                                 onClick={() => {
                                                     const alreadyPaid = data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                                                     const diff = Math.max(0, parseFloat(data.order_total) - alreadyPaid);
                                                     if (data.payments.length === 0 || data.payments.length === 1) {
                                                         setData('payments', [{ ...(data.payments[0] || {}), _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: data.order_total, reference_number: data.payments[0]?.reference_number || '', payment_date: data.payments[0]?.payment_date || new Date().toISOString().split('T')[0] }]);
                                                     } else {
                                                         setData('payments', [...data.payments, { _key: Date.now(), payment_mode: payment_modes[0] || 'Cash', amount: diff.toFixed(2), reference_number: 'Balance Payment', payment_date: new Date().toISOString().split('T')[0] }]);
                                                     }
                                                 }}
                                                 className="font-bold underline text-amber-900 dark:text-amber-200 ml-2"
                                             >
                                                 Auto-fill Balance
                                             </button>
                                         </div>
                                     )}
                                     <input type="hidden" value={data.order_total} />
                                 </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Notes (Internal)</label>
                                    <textarea value={data.order_notes} onChange={e => setData('order_notes', e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm flex flex-col sm:rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Line Items</h3>
                                <button type="button" onClick={addItem} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
                                    + Add Item
                                </button>
                            </div>
                            
                            {errors.items && <div className="text-red-500 mb-4">{errors.items}</div>}

                            <div className="space-y-4">
                                {data.items.map((item, index) => {
                                    const isDeleting = deletingKeys.includes(item._key);
                                    return (
                                        <div 
                                            key={item._key} 
                                            className={`relative ${index % 2 === 0 ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50/80 dark:bg-gray-900/50'} p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-500 shadow-sm hover:shadow-md ${isDeleting ? 'opacity-0 -translate-x-8 scale-95 pointer-events-none' : 'opacity-100'}`}
                                            style={{ zIndex: data.items.length - index }}
                                        >
                                            {isDeleting && (
                                                <div className="absolute inset-0 bg-red-50/50 dark:bg-red-900/10 flex items-center justify-center backdrop-blur-[1px] z-10 rounded-lg">
                                                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg flex items-center gap-2">
                                                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Removing...
                                                    </span>
                                                </div>
                                            )}
                                        <div className="grid grid-cols-12 gap-4 items-end mb-4">
                                            <div className="col-span-12 md:col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Service</label>
                                                <SearchableSelect 
                                                    options={[
                                                        { id: '', name: '-- Custom Item --' },
                                                        ...services.map(s => ({ 
                                                            id: s.id, 
                                                            name: `${s.name}${s.deleted_at ? ' (Deleted)' : ''} (₱${parseFloat(s.price || 0).toFixed(2)})` 
                                                        }))
                                                    ]}
                                                    value={item.service_id || ''}
                                                    onChange={(val) => updateItem(index, 'service_id', val)}
                                                    placeholder="-- Search Service --"
                                                    className="mt-1"
                                                />
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
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 mt-6 items-center">
                            <span className="text-xl font-bold dark:text-white mr-6">Grand Total: ₱{parseFloat(data.order_total || 0).toFixed(2)}</span>
                            <Link href={route('orders.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-lg disabled:opacity-50">Save Changes</button>
                        </div>
                    </div>
                </div>
            </form>

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
