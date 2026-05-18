import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import RollCalculatorModal from '@/Components/RollCalculatorModal';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Edit({ auth, service, inventory_items, equipment }) {
    const [showRollCalc, setShowRollCalc] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: service.name || '', 
        description: service.description || '', 
        price: service.price || '0', 
        duration: service.duration ? service.duration.substring(0, 5) : '00:00', 
        profit_margin: service.profit_margin || '',
        inventory: service.inventory_items?.map(i => ({ id: i.id, quantity: i.pivot.quantity })) || [],
        equipment: service.equipment?.map(e => ({ id: e.id, hours_used: e.pivot.hours_used })) || [],
        labor: service.labor?.map(l => ({ 
            worker_type: l.worker_type || 'employee', 
            work_type: l.work_type || '', 
            rate_type: l.rate_type || 'fixed', 
            rate: l.rate || 0,
            hours: l.hours || 1 
        })) || [],
    });

    const inventoryOptions = useMemo(() => 
        inventory_items.map(i => ({
            id: i.id,
            name: `${i.name} (Stock: ${i.stock} ${i.form})`
        })), [inventory_items]);

    const addInventory = () => {
        setData('inventory', [...data.inventory, { id: '', quantity: 1 }]);
    };

    const removeInventory = (index) => {
        const list = [...data.inventory];
        list.splice(index, 1);
        setData('inventory', list);
    };

    const updateInventory = (index, field, value) => {
        const list = [...data.inventory];
        list[index][field] = value;
        setData('inventory', list);
    };

    const addEquipment = () => {
        setData('equipment', [...data.equipment, { id: '', hours_used: 1 }]);
    };

    const removeEquipment = (index) => {
        const list = [...data.equipment];
        list.splice(index, 1);
        setData('equipment', list);
    };

    const updateEquipment = (index, field, value) => {
        const list = [...data.equipment];
        list[index][field] = value;
        setData('equipment', list);
    };

    const addLabor = () => {
        setData('labor', [...data.labor, { worker_type: 'employee', work_type: '', rate_type: 'fixed', rate: 0, hours: 1 }]);
    };

    const removeLabor = (index) => {
        const list = [...data.labor];
        list.splice(index, 1);
        setData('labor', list);
    };

    const updateLabor = (index, field, value) => {
        const newList = data.labor.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setData('labor', newList);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('services.update', service.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Service</h2>}>
            <Head title="Edit Service" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 dark:border-gray-700">Basic Information</h3>
                            <div className="space-y-4 max-w-2xl">
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
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Price (₱) *</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowRollCalc(true)}
                                                className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition flex items-center gap-1 font-bold uppercase"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Calculate Price
                                            </button>
                                        </div>
                                        <input type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" required />
                                        {errors.price && <div className="text-red-500 mt-1 text-sm">{errors.price}</div>}

                                        <RollCalculatorModal 
                                            show={showRollCalc} 
                                            onClose={() => setShowRollCalc(false)} 
                                            materialName={data.name}
                                            onSelect={(res) => { setData('price', res.price); setShowRollCalc(false); }} 
                                        />
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
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Labor Section */}
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg p-6 border-l-4 border-yellow-500">
                            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Labor & Personnel</h3>
                                    <p className="text-xs text-gray-500">Assign work types and rates for employees/contractors.</p>
                                </div>
                                <button type="button" onClick={addLabor} className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">+ Add Labor Row</button>
                            </div>
                            <div className="space-y-4">
                                {data.labor.map((row, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Personnel Type</label>
                                            <select value={row.worker_type} 
                                                onChange={e => updateLabor(index, 'worker_type', e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm"
                                            >
                                                <option value="employee">Employee</option>
                                                <option value="contractor">Contractor</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Work Type</label>
                                            <input type="text" placeholder="e.g. Design" value={row.work_type} onChange={e => updateLabor(index, 'work_type', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate Type</label>
                                            <select value={row.rate_type} onChange={e => updateLabor(index, 'rate_type', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                <option value="fixed">Fixed Rate</option>
                                                <option value="hourly">Hourly Rate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate (₱)</label>
                                            <input type="number" step="0.01" value={row.rate} onChange={e => updateLabor(index, 'rate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm" />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hours</label>
                                                <input type="number" step="0.1" value={row.hours} onChange={e => updateLabor(index, 'hours', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm" disabled={row.rate_type === 'fixed'} />
                                            </div>
                                            <button type="button" onClick={() => removeLabor(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition mb-1">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {data.labor.length === 0 && <div className="text-sm text-gray-500 italic px-2">No labor assignments yet.</div>}
                            </div>
                        </div>

                        {/* Materials / Inventory */}
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Materials (Inventory)</h3>
                                <button type="button" onClick={addInventory} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">+ Add Material</button>
                            </div>
                            <div className="space-y-4">
                                {data.inventory.map((item, index) => (
                                    <div key={index} className="flex items-end gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Material</label>
                                            <SearchableSelect 
                                                options={inventoryOptions} 
                                                value={item.id} 
                                                onChange={val => updateInventory(index, 'id', val)} 
                                                placeholder="-- Select Material --"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Qty Needed</label>
                                            <input type="number" step="0.01" value={item.quantity} onChange={e => updateInventory(index, 'quantity', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm" />
                                        </div>
                                        <button type="button" onClick={() => removeInventory(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {data.inventory.length === 0 && <div className="text-sm text-gray-500 italic">No materials linked to this service.</div>}
                            </div>
                        </div>

                        {/* Energy / Equipment */}
                        <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Equipment Usage</h3>
                                <button type="button" onClick={addEquipment} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">+ Add Equipment</button>
                            </div>
                            <div className="space-y-4">
                                {data.equipment.map((item, index) => (
                                    <div key={index} className="flex items-end gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Machine / Equipment</label>
                                            <select value={item.id} onChange={e => updateEquipment(index, 'id', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm">
                                                <option value="">-- Select Equipment --</option>
                                                {equipment.map(e => <option key={e.id} value={e.id}>{e.name} (₱{e.hourly_cost}/hr)</option>)}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hours Used</label>
                                            <input type="number" step="0.1" value={item.hours_used} onChange={e => updateEquipment(index, 'hours_used', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-300 text-sm" />
                                        </div>
                                        <button type="button" onClick={() => removeEquipment(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {data.equipment.length === 0 && <div className="text-sm text-gray-500 italic">No equipment usage linked to this service.</div>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pb-20">
                            <a href={route('services.index')} className="px-6 py-2 border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</a>
                            <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
