import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ auth, invoice }) {
    const { order, payments } = invoice;
    const { customer } = order;
    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    // Payment Form
    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_id: invoice.id,
        amount: invoice.total_amount - payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: ''
    });

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => {
                setShowPaymentModal(false);
                reset();
            }
        });
    };

    const deletePayment = (id) => {
        if(confirm('Delete this payment record?')) {
            router.delete(route('payments.destroy', id));
        }
    };
    
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const amountDue = invoice.total_amount - totalPaid;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Invoice {invoice.invoice_number}</h2>}>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="py-12 max-w-5xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                
                {/* Left: Invoice Document View */}
                <div className="flex-1 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-gray-100 dark:border-gray-700 p-8">
                    <div className="flex justify-between items-start border-b pb-6 dark:border-gray-700">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
                            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{invoice.invoice_number}</p>
                            <div className="mt-4">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">{invoice.status}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Print Shop Pro</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">123 Printing Ave</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">City, State 12345</p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <p className="font-bold text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.company_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold text-gray-700 dark:text-gray-300">Issue Date:</span> {new Date(invoice.issue_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400"><span className="font-semibold text-gray-700 dark:text-gray-300">Due Date:</span> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</p>
                            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400"><span className="font-semibold text-gray-700 dark:text-gray-300">Linked Order:</span> <Link href={route('orders.edit', order.id)} className="text-blue-500 hover:underline">{order.order_number}</Link></p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mb-8 mt-4">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Description</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Rate</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{item.description}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 text-right">₱{parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 text-right">₱{parseFloat(item.total_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end border-t pt-4 dark:border-gray-700">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal:</span>
                                <span>₱{parseFloat(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            {invoice.tax_amount > 0 && <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Tax ({invoice.tax_rate}%):</span>
                                <span>₱{parseFloat(invoice.tax_amount).toFixed(2)}</span>
                            </div>}
                            {invoice.discount_amount > 0 && <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Discount:</span>
                                <span>-₱{parseFloat(invoice.discount_amount).toFixed(2)}</span>
                            </div>}
                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                                <span>Total:</span>
                                <span>₱{parseFloat(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 pt-1">
                                <span>Paid:</span>
                                <span>-₱{totalPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-red-600 dark:text-red-400 pt-2 border-t dark:border-gray-700">
                                <span>Amount Due:</span>
                                <span>₱{amountDue > 0 ? amountDue.toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {amountDue <= 0 && (
                        <div className="mt-8 transform -rotate-12 absolute opacity-20 pointer-events-none">
                            <span className="border-8 border-green-500 text-green-500 text-6xl font-black uppercase p-4 tracking-widest inline-block rounded">PAID IN FULL</span>
                        </div>
                    )}
                </div>

                {/* Right: Payments Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 mb-4 dark:border-gray-700">Payments</h3>
                        
                        {payments.length === 0 ? (
                            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">No payments recorded yet.</p>
                        ) : (
                            <div className="space-y-4 mb-4">
                                {payments.map(p => (
                                    <div key={p.id} className="text-sm border p-3 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                        <div className="flex justify-between font-bold dark:text-white">
                                            <span>₱{parseFloat(p.amount).toFixed(2)}</span>
                                            <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-gray-500 text-xs mt-1 dark:text-gray-400 flex justify-between items-center">
                                            <span>{p.payment_method.toUpperCase()} - {p.reference_number || 'No Ref'}</span>
                                            <button onClick={() => deletePayment(p.id)} className="text-red-500 hover:text-red-700 ml-2" title="Delete PaymentRecord">
                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {amountDue > 0 && (
                            <button onClick={() => setShowPaymentModal(!showPaymentModal)} className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition">
                                Record Payment
                            </button>
                        )}
                        <button onClick={() => window.print()} className="w-full mt-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            Print Invoice
                        </button>
                    </div>

                    {/* Payment Recording Form Dropdown */}
                    {showPaymentModal && amountDue > 0 && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-green-200 dark:border-green-900 p-6 animate-fade-in-up">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4 text-green-600 dark:text-green-400">New Payment</h3>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₱)</label>
                                    <input type="number" step="0.01" max={amountDue} value={data.amount} onChange={e => setData('amount', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                    {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
                                    <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" required>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                    <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference / Check #</label>
                                    <input type="text" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="pt-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                                    <button type="submit" disabled={processing} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition">Save Payment</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .max-w-5xl > div:first-child, .max-w-5xl > div:first-child * { visibility: visible; }
                    .max-w-5xl > div:first-child { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
                    nav, header, .lg\\:w-80 { display: none !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
