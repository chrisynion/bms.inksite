import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function RollCalculatorModal({ show, onClose, rolls, onSelect, materialName = "" }) {
    const [calc, setCalc] = useState({ price: '', width: '', widthUnit: 'ft', height: '', heightUnit: 'ft' });
    const [activeTab, setActiveTab] = useState('saved');

    const handleApply = (price, unit, meta = null) => {
        // If meta is null (from saved rolls), we might have those fields in roll object
        const fullData = {
            price: price, // Final chosen unit price
            purchase_price: meta ? meta.price : 0,
            roll_width: meta ? meta.width : 0,
            roll_width_unit: meta ? meta.widthUnit : 'ft',
            roll_length: meta ? meta.height : 0,
            roll_length_unit: meta ? meta.heightUnit : 'ft',
            price_sqft: meta ? meta.prices.sqft : 0,
            price_sqin: meta ? meta.prices.sqin : 0,
            price_sqm: meta ? meta.prices.sqm : 0,
            price_sqcm: meta ? meta.prices.sqcm : 0,
        };
        onSelect(fullData);
    };

    // Calculation logic mirroring the PHP version
    const getToMeter = (unit) => {
        const rates = { 'in': 0.0254, 'ft': 0.3048, 'cm': 0.01, 'm': 1 };
        return rates[unit] || 1;
    };

    const getPrices = (p, w, wu, h, hu) => {
        const pVal = parseFloat(p) || 0;
        const wM = (parseFloat(w) || 0) * getToMeter(wu);
        const hM = (parseFloat(h) || 0) * getToMeter(hu);
        const areaSqM = wM * hM;
        if (pVal <= 0 || areaSqM <= 0) return null;

        const pSqm = pVal / areaSqM;
        return {
            sqft: (pSqm / 10.7639104).toFixed(4),
            sqin: (pSqm / 1550.0031).toFixed(4),
            sqcm: (pSqm / 10000).toFixed(4),
            sqm: pSqm.toFixed(4)
        };
    };

    const currentResults = getPrices(calc.price, calc.width, calc.widthUnit, calc.height, calc.heightUnit);

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Roll Pricing Calculator
                        </h3>
                        {materialName && <p className="text-sm text-gray-500 mt-1 italic font-medium">Pricing for: {materialName}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex border-b dark:border-gray-700 mb-6">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 text-sm font-semibold transition ${activeTab === 'saved' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        Saved Rolls
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 text-sm font-semibold transition ${activeTab === 'manual' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    >
                        New Calculation
                    </button>
                </div>

                {activeTab === 'saved' ? (
                    <div className="space-y-4 max-h-96 overflow-auto pr-2">
                        {(!rolls || rolls.length === 0) ? (
                            <div className="text-center py-8 text-gray-500">No saved rolls found in the calculator JSON.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rolls.map((roll, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="font-bold text-gray-900 dark:text-white truncate mb-2">{roll.name}</div>
                                        <div className="text-xs text-gray-500 mb-3">{roll.width}{roll.widthUnit} × {roll.height}{roll.heightUnit} • Total ₱{roll.price}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => handleApply(roll.price_per_sqft, 'sqft', {
                                                    price: roll.price, width: roll.width, widthUnit: roll.widthUnit, height: roll.height, heightUnit: roll.heightUnit,
                                                    prices: { sqft: roll.price_per_sqft, sqin: roll.price_per_sqin, sqm: roll.price_per_sqm, sqcm: roll.price_per_sqcm }
                                                })} 
                                                className="text-[10px] bg-white dark:bg-gray-800 border dark:border-gray-600 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left"
                                            >
                                                <div className="text-gray-400 font-bold uppercase">Sq Ft</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">₱{roll.price_per_sqft}</div>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleApply(roll.price_per_sqin, 'sqin', {
                                                    price: roll.price, width: roll.width, widthUnit: roll.widthUnit, height: roll.height, heightUnit: roll.heightUnit,
                                                    prices: { sqft: roll.price_per_sqft, sqin: roll.price_per_sqin, sqm: roll.price_per_sqm, sqcm: roll.price_per_sqcm }
                                                })}
                                                className="text-[10px] bg-white dark:bg-gray-800 border dark:border-gray-600 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left"
                                            >
                                                <div className="text-gray-400 font-bold uppercase">Sq In</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">₱{roll.price_per_sqin}</div>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">Roll Purchase Price (₱)</label>
                                <input type="number" value={calc.price} onChange={e => setCalc({...calc, price: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-900 dark:text-white" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">Roll Width</label>
                                <div className="flex mt-1">
                                    <input type="number" value={calc.width} onChange={e => setCalc({...calc, width: e.target.value})} className="flex-1 rounded-l-md border-gray-300 dark:bg-gray-900 dark:text-white" />
                                    <select value={calc.widthUnit} onChange={e => setCalc({...calc, widthUnit: e.target.value})} className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-700 text-sm">
                                        <option value="in">In</option>
                                        <option value="ft">Ft</option>
                                        <option value="cm">Cm</option>
                                        <option value="m">M</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">Roll Length / Height</label>
                                <div className="flex mt-1">
                                    <input type="number" value={calc.height} onChange={e => setCalc({...calc, height: e.target.value})} className="flex-1 rounded-l-md border-gray-300 dark:bg-gray-900 dark:text-white" />
                                    <select value={calc.heightUnit} onChange={e => setCalc({...calc, heightUnit: e.target.value})} className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-700 text-sm">
                                        <option value="in">In</option>
                                        <option value="ft">Ft</option>
                                        <option value="cm">Cm</option>
                                        <option value="m">M</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {currentResults && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                                <h4 className="text-indigo-800 dark:text-indigo-300 font-bold mb-3 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                    Select Calculated Rate
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => handleApply(currentResults.sqft, 'sqft', {
                                            price: calc.price, width: calc.width, widthUnit: calc.widthUnit, height: calc.height, heightUnit: calc.heightUnit,
                                            prices: currentResults
                                        })} 
                                        className="text-left group"
                                    >
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq Ft</div>
                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">₱{currentResults.sqft}</div>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleApply(currentResults.sqin, 'sqin', {
                                            price: calc.price, width: calc.width, widthUnit: calc.widthUnit, height: calc.height, heightUnit: calc.heightUnit,
                                            prices: currentResults
                                        })} 
                                        className="text-left group"
                                    >
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq In</div>
                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">₱{currentResults.sqin}</div>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleApply(currentResults.sqm, 'sqm', {
                                            price: calc.price, width: calc.width, widthUnit: calc.widthUnit, height: calc.height, heightUnit: calc.heightUnit,
                                            prices: currentResults
                                        })} 
                                        className="text-left group"
                                    >
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq Meter</div>
                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">₱{currentResults.sqm}</div>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleApply(currentResults.sqcm, 'sqcm', {
                                            price: calc.price, width: calc.width, widthUnit: calc.widthUnit, height: calc.height, heightUnit: calc.heightUnit,
                                            prices: currentResults
                                        })} 
                                        className="text-left group"
                                    >
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Sq Cm</div>
                                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">₱{currentResults.sqcm}</div>
                                    </button>
                                </div>
                                <div className="mt-4 text-[11px] text-indigo-500 italic flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                                    Selecting a rate will populate ALL details in the Inventory record.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-bold hover:bg-gray-300 transition">Close</button>
                </div>
            </div>
        </Modal>
    );
}
