import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function RollCalculatorModal({ show, onClose, onSelect, materialName = "" }) {
    const [calc, setCalc] = useState({ price: '', width: '', widthUnit: 'ft', height: '', heightUnit: 'ft' });

    const handleApply = (price, unit, meta = null) => {
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

    const getToMeter = (unit) => {
        const rates = { 'in': 0.0254, 'ft': 0.3048, 'cm': 0.01, 'm': 1 };
        return rates[unit] || 1;
    };

    const getPrices = (p, w, wu, h, hu) => {
        const pVal = parseFloat(p) || 0;
        const width = parseFloat(w) || 0;
        const height = parseFloat(h) || 0;
        
        if (pVal <= 0 || width <= 0 || height <= 0) return null;

        const wM = width * getToMeter(wu);
        const hM = height * getToMeter(hu);
        const areaSqM = wM * hM;
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
                <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Roll Pricing Calculator
                        </h3>
                        {materialName && <p className="text-sm text-gray-500 mt-1 italic font-medium">Material: {materialName}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">1. Total Purchase Price (₱)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                                <input 
                                    type="number" 
                                    value={calc.price} 
                                    onChange={e => setCalc({...calc, price: e.target.value})} 
                                    className="block w-full pl-8 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="0.00" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">2. Roll Width</label>
                            <div className="flex">
                                <input 
                                    type="number" 
                                    value={calc.width} 
                                    onChange={e => setCalc({...calc, width: e.target.value})} 
                                    className="flex-1 rounded-l-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="0.00"
                                />
                                <select 
                                    value={calc.widthUnit} 
                                    onChange={e => setCalc({...calc, widthUnit: e.target.value})} 
                                    className="rounded-r-lg border-l-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold uppercase py-2"
                                >
                                    <option value="in">In</option>
                                    <option value="ft">Ft</option>
                                    <option value="cm">Cm</option>
                                    <option value="m">M</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">3. Roll Length</label>
                            <div className="flex">
                                <input 
                                    type="number" 
                                    value={calc.height} 
                                    onChange={e => setCalc({...calc, height: e.target.value})} 
                                    className="flex-1 rounded-l-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="0.00"
                                />
                                <select 
                                    value={calc.heightUnit} 
                                    onChange={e => setCalc({...calc, heightUnit: e.target.value})} 
                                    className="rounded-r-lg border-l-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold uppercase py-2"
                                >
                                    <option value="in">In</option>
                                    <option value="ft">Ft</option>
                                    <option value="cm">Cm</option>
                                    <option value="m">M</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {currentResults && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                            <h4 className="text-indigo-900 dark:text-indigo-200 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Calculated Square-Area Rates
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {['sqft', 'sqin', 'sqm', 'sqcm'].map(unit => {
                                    const labels = { sqft: 'Per Sq Ft', sqin: 'Per Sq In', sqm: 'Per Sq Meter', sqcm: 'Per Sq Cm' };
                                    return (
                                        <button 
                                            key={unit}
                                            type="button"
                                            onClick={() => handleApply(currentResults[unit], unit, {
                                                price: calc.price, width: calc.width, widthUnit: calc.widthUnit, height: calc.height, heightUnit: calc.heightUnit,
                                                prices: currentResults
                                            })} 
                                            className="group bg-white dark:bg-gray-800 p-5 rounded-xl border border-indigo-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all text-left"
                                        >
                                            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{labels[unit]}</div>
                                            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-600">₱{currentResults[unit]}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition">Close Calculator</button>
                </div>
            </div>
        </Modal>
    );
}
