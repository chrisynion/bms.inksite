import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import RollCalculatorModal from '@/Components/RollCalculatorModal';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Create({ auth }) {
    const [showRollCalc, setShowRollCalc] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '', type: '', color: '', finish: '', thickness: '', width: '', length: '', price: '', stock: '0', location: '', form: '',
        purchase_price: '', roll_width: '', roll_width_unit: '', roll_length: '', roll_length_unit: '',
        price_sqft: '', price_sqin: '', price_sqm: '', price_sqcm: ''
    });

    const handleFormChange = (val) => {
        setData('form', val);
        if (val === 'Roll') {
            setShowRollCalc(true);
        }
    };

    const handleRollSelect = (rollData) => {
        setData(prev => ({
            ...prev,
            price: rollData.price,
            purchase_price: rollData.purchase_price,
            roll_width: rollData.roll_width,
            roll_width_unit: rollData.roll_width_unit,
            roll_length: rollData.roll_length,
            roll_length_unit: rollData.roll_length_unit,
            price_sqft: rollData.price_sqft,
            price_sqin: rollData.price_sqin,
            price_sqm: rollData.price_sqm,
            price_sqcm: rollData.price_sqcm
        }));
        setShowRollCalc(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('inventory.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Add Inventory Item</h2>}>
            <Head title="Create Inventory" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                {errors.name && <div className="text-red-500 mt-1 text-sm">{errors.name}</div>}
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                     <input type="text" value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Form (Material Format)</label>
                                     <SearchableSelect 
                                         options={[
                                             { id: 'Roll', name: 'Roll' },
                                             { id: 'Sheet', name: 'Sheet' },
                                             { id: 'Piece', name: 'Piece / Each' },
                                             { id: 'ml', name: 'ml' }
                                         ]}
                                         value={data.form}
                                         onChange={(val) => handleFormChange(val)}
                                         placeholder="Select Format..."
                                     />
                                 </div>
                                  <div>
                                     <div className="flex justify-between items-center mb-1">
                                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">Default Unit Price (₱) *</label>
                                     </div>
                                     <input type="number" step="0.0001" value={data.price} onChange={e => setData('price', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                     
                                     {data.form === 'Roll' && (
                                         <div className="flex justify-end mt-1">
                                             <button 
                                                 type="button" 
                                                 onClick={() => setShowRollCalc(true)}
                                                 className="text-[11px] px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white rounded shadow hover:bg-indigo-700 dark:hover:bg-indigo-400 transition flex items-center gap-1 font-bold uppercase"
                                             >
                                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                 Open Roll Calculator
                                             </button>
                                         </div>
                                     )}

                                     {errors.price && <div className="text-red-500 mt-1 text-sm">{errors.price}</div>}
 
                                     <RollCalculatorModal 
                                         show={showRollCalc} 
                                         onClose={() => setShowRollCalc(false)} 
                                         materialName={data.name}
                                         onSelect={handleRollSelect} 
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Stock *</label>
                                     <input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                     {errors.stock && <div className="text-red-500 mt-1 text-sm">{errors.stock}</div>}
                                 </div>
                             </div>

                             {data.form === 'Roll' && data.purchase_price && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded border border-indigo-100 dark:border-indigo-900/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase border-b dark:border-indigo-900/50 pb-1 mb-1">Roll Details Tracking</div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Purchase Price</div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">₱{data.purchase_price}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Roll Size</div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.roll_width}{data.roll_width_unit} × {data.roll_length}{data.roll_length_unit}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq Ft Rate</div>
                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₱{data.price_sqft}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq In Rate</div>
                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₱{data.price_sqin}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-4 mt-6">
                                <a href={route('inventory.index')} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
