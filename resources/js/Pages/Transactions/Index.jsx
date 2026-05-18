import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Index({ auth, transactions, payment_modes, filters }) {
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Filter Form
    const filterForm = useForm({
        payment_mode: filters.payment_mode || '',
        type: filters.type || '',
    });

    const applyFilters = (e) => {
        e.preventDefault();
        filterForm.get(route('transactions.index'), { preserveState: true });
    };

    const resetFilters = () => {
        filterForm.reset();
        router.get(route('transactions.index'));
    };

    // Shared setup for transaction forms
    const { data: txData, setData: setTxData, post: postTx, processing: txProcessing, errors: txErrors, reset: resetTx } = useForm({
        type: '',
        amount: '',
        payment_mode: payment_modes[0] || '',
        from_account: payment_modes[0] || '',
        to_account: payment_modes[1] || payment_modes[0] || '',
        category: '',
        reference_number: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const closeModals = () => {
        setShowIncomeModal(false);
        setShowExpenseModal(false);
        setShowTransferModal(false);
        resetTx();
    };

    const submitTransaction = (e, type) => {
        e.preventDefault();
        setTxData('type', type);
        
        postTx(route('transactions.store'), {
            onSuccess: () => closeModals(),
        });
    };

    const openIncomeModal = () => {
        resetTx();
        setTxData(data => ({
            ...data,
            type: 'income',
            category: ''
        }));
        setShowIncomeModal(true);
    };

    const openExpenseModal = () => {
        resetTx();
        setTxData(data => ({
            ...data,
            type: 'expense',
            category: ''
        }));
        setShowExpenseModal(true);
    };

    const openTransferModal = () => {
        resetTx();
        setTxData(data => ({
            ...data,
            type: 'transfer',
            category: 'Internal Transfer'
        }));
        setShowTransferModal(true);
    };

    const deleteTransaction = (id) => {
        if (confirm('Are you sure you want to delete this transaction? This might affect your account balances.')) {
            router.delete(route('transactions.destroy', id));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Cashbook & Transactions</h2>}>
            <Head title="Cashbook" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button onClick={openIncomeModal} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Record Income
                        </button>
                        <button onClick={openExpenseModal} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                            Record Expense
                        </button>
                        <button onClick={openTransferModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            Transfer Funds
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                                <select value={filterForm.data.payment_mode} onChange={e => filterForm.setData('payment_mode', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white sm:text-sm">
                                    <option value="">All Accounts</option>
                                    {payment_modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select value={filterForm.data.type} onChange={e => filterForm.setData('type', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white sm:text-sm">
                                    <option value="">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 dark:hover:bg-white">Filter</button>
                                {(filterForm.data.payment_mode || filterForm.data.type) && (
                                    <button type="button" onClick={resetFilters} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">Reset</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Account</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.length > 0 ? transactions.data.map(tx => (
                                        <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    tx.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    tx.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{tx.category}</td>
                                            <td className="px-6 py-4">{tx.payment_mode}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${tx.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-xs">{tx.description || <span className="text-gray-400 italic">No description</span>}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => deleteTransaction(tx.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination placeholder if needed */}
                        {transactions.links && transactions.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1">
                                {transactions.links.map((link, k) => (
                                    <Link key={k} href={link.url || '#'} className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Income Modal */}
            <Modal show={showIncomeModal} onClose={closeModals} maxWidth="md">
                <form onSubmit={e => submitTransaction(e, 'income')} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Record Income</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₱)</label>
                            <input type="number" step="0.01" value={txData.amount} onChange={e => setTxData('amount', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                            {txErrors.amount && <p className="text-red-500 text-xs mt-1">{txErrors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account (Deposit To)</label>
                            <select value={txData.payment_mode} onChange={e => setTxData('payment_mode', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                {payment_modes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <input type="text" value={txData.category} onChange={e => setTxData('category', e.target.value)} placeholder="e.g. Refund, Sale" required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" value={txData.transaction_date} onChange={e => setTxData('transaction_date', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description / Notes</label>
                            <textarea value={txData.description} onChange={e => setTxData('description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModals} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={txProcessing} className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50">Save Income</button>
                    </div>
                </form>
            </Modal>

            {/* Expense Modal */}
            <Modal show={showExpenseModal} onClose={closeModals} maxWidth="md">
                <form onSubmit={e => submitTransaction(e, 'expense')} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Record Expense</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₱)</label>
                            <input type="number" step="0.01" value={txData.amount} onChange={e => setTxData('amount', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                            {txErrors.amount && <p className="text-red-500 text-xs mt-1">{txErrors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account (Withdraw From)</label>
                            <select value={txData.payment_mode} onChange={e => setTxData('payment_mode', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                {payment_modes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <input type="text" value={txData.category} onChange={e => setTxData('category', e.target.value)} placeholder="e.g. Supplies, Payroll, Utilities" required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" value={txData.transaction_date} onChange={e => setTxData('transaction_date', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description / Notes</label>
                            <textarea value={txData.description} onChange={e => setTxData('description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModals} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={txProcessing} className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50">Save Expense</button>
                    </div>
                </form>
            </Modal>

            {/* Transfer Modal */}
            <Modal show={showTransferModal} onClose={closeModals} maxWidth="md">
                <form onSubmit={e => submitTransaction(e, 'transfer')} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transfer Funds</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₱)</label>
                            <input type="number" step="0.01" value={txData.amount} onChange={e => setTxData('amount', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                            {txErrors.amount && <p className="text-red-500 text-xs mt-1">{txErrors.amount}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Account</label>
                                <select value={txData.from_account} onChange={e => setTxData('from_account', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                    {payment_modes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                {txErrors.from_account && <p className="text-red-500 text-xs mt-1">{txErrors.from_account}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Account</label>
                                <select value={txData.to_account} onChange={e => setTxData('to_account', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                    {payment_modes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Category is managed via state initialization in openTransferModal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" value={txData.transaction_date} onChange={e => setTxData('transaction_date', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                            <textarea value={txData.description} onChange={e => setTxData('description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModals} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={txProcessing} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">Complete Transfer</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
