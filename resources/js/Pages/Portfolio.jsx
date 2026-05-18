import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Portfolio() {
    const [activeTab, setActiveTab] = useState('demo'); // 'demo' or 'case-studies' or 'ai-native'
    
    // Demo 1 State (Roll Pricing Calculator)
    const [rollCalc, setRollCalc] = useState({ price: '12000', width: '4', widthUnit: 'ft', height: '150', heightUnit: 'ft' });
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
    const rollPrices = getPrices(rollCalc.price, rollCalc.width, rollCalc.widthUnit, rollCalc.height, rollCalc.heightUnit);

    // Demo 2 State (Double-Entry Ledger Aggregator Console)
    const [paymentModes, setPaymentModes] = useState([
        { name: 'Cash', balance: 5000 },
        { name: 'GCash', balance: 15000 },
        { name: 'Bank Transfer', balance: 45000 }
    ]);
    const [ledgerTx, setLedgerTx] = useState([
        { id: 1, type: 'payment', mode: 'GCash', amount: 3500, label: 'Customer Payment (ORD-827)' },
        { id: 2, type: 'expense', mode: 'Cash', amount: -1200, label: 'Office Supplies Expense' },
        { id: 3, type: 'payment', mode: 'Bank Transfer', amount: 18000, label: 'Corporate Project Downpayment' }
    ]);
    const [newTx, setNewTx] = useState({ type: 'payment', mode: 'GCash', amount: '', label: '' });

    const handleAddTx = (e) => {
        e.preventDefault();
        const amt = parseFloat(newTx.amount) || 0;
        if (amt <= 0 || !newTx.label.trim()) return;
        const finalAmt = newTx.type === 'expense' ? -amt : amt;
        
        // Add transaction
        const updatedTx = [
            { id: Date.now(), type: newTx.type, mode: newTx.mode, amount: finalAmt, label: newTx.label },
            ...ledgerTx
        ];
        setLedgerTx(updatedTx);

        // Recalculate balance
        setPaymentModes(paymentModes.map(m => {
            if (m.name === newTx.mode) {
                return { ...m, balance: m.balance + finalAmt };
            }
            return m;
        }));

        setNewTx({ type: 'payment', mode: 'GCash', amount: '', label: '' });
    };

    // Demo 3 State (Area-Based Inventory Deductor Visualizer)
    const [materials, setMaterials] = useState([
        { id: 1, name: 'Premium Vinyl Matte Roll', form: 'Roll', width: 4, height: 150, stock: 600, unit: 'sqft' }, // 4x150 = 600 sqft
        { id: 2, name: 'Outdoor Tarpaulin Banner Roll', form: 'Roll', width: 6, height: 100, stock: 600, unit: 'sqft' },
        { id: 3, name: 'Eyelet Metal Rings', form: 'Unit', stock: 500, unit: 'pieces' }
    ]);
    const [orderItem, setOrderItem] = useState({ materialId: 1, width: 3, height: 5, quantity: 2 });
    const [deductionLogs, setDeductionLogs] = useState([]);

    const handleProcessOrder = () => {
        const mat = materials.find(m => m.id === Number(orderItem.materialId));
        if (!mat) return;
        const qty = parseFloat(orderItem.quantity) || 0;
        const w = parseFloat(orderItem.width) || 0;
        const h = parseFloat(orderItem.height) || 0;

        if (qty <= 0) return;

        let deductAmount = qty;
        let logDetails = '';

        if (mat.form.toLowerCase() === 'roll' && w > 0 && h > 0) {
            deductAmount = w * h * qty;
            logDetails = `Area-based deduction: ${w}ft x ${h}ft x ${qty} items = ${deductAmount} sqft`;
        } else {
            logDetails = `Unit-based deduction: ${qty} items = ${deductAmount} units`;
        }

        if (mat.stock < deductAmount) {
            alert(`Insufficient stock! Needed ${deductAmount} but only ${mat.stock} left.`);
            return;
        }

        // Deduct stock
        setMaterials(materials.map(m => {
            if (m.id === mat.id) {
                return { ...m, stock: Math.max(0, m.stock - deductAmount) };
            }
            return m;
        }));

        // Log transaction
        setDeductionLogs([
            {
                id: Date.now(),
                material: mat.name,
                deducted: deductAmount,
                unit: mat.unit,
                details: logDetails
            },
            ...deductionLogs
        ]);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20">
            <Head title="Developer Portfolio & Interactive Case Studies" />
            
            {/* Nav Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-500/20">CY</span>
                        <span className="font-extrabold text-lg text-white tracking-tight">Christian Ynion | Full Stack Developer</span>
                    </div>
                    <Link href="/" className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-sm font-semibold">
                        ← Back to Project
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-sky-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-widest mb-6 inline-block">Interactive Technical Portfolio</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
                        Building Resilient Internal Tools & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">Enterprise Dashboards</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-8">
                        This is a live tech portfolio showcasing dynamic software modules and real-world database case studies taken directly from the **BMS (Business Management System)** built for printing and signage production.
                    </p>

                    <div className="flex justify-center flex-wrap gap-4">
                        <Link href="/resume" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 duration-200">
                            Print / Save PDF Resume
                        </Link>
                        <a href="/developer_resume.md" target="_blank" className="px-6 py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/50 text-slate-300 font-bold rounded-lg transition hover:-translate-y-0.5 duration-200">
                            View Markdown Resume
                        </a>
                        <a href="#demos" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition hover:-translate-y-0.5 duration-200">
                            Try Live Tech Demos
                        </a>
                    </div>
                </div>
            </section>

            {/* Interactive Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16" id="demos">
                
                {/* Tabs */}
                <div className="flex justify-center flex-wrap border-b border-slate-800 mb-12">
                    <button 
                        onClick={() => setActiveTab('demo')}
                        className={`px-6 py-4 font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'demo' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        1. Interactive Live Demos
                    </button>
                    <button 
                        onClick={() => setActiveTab('case-studies')}
                        className={`px-6 py-4 font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'case-studies' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        2. Architectural Case Studies
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai-native')}
                        className={`px-6 py-4 font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'ai-native' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        3. AI-Native Development Flow
                    </button>
                </div>

                {/* Tab 1: Live Interactive Demos */}
                {activeTab === 'demo' && (
                    <div className="space-y-16">
                        
                        {/* Demo 1 Box */}
                        <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">FE Component Demonstration</span>
                                    <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Interactive Roll Pricing Calculator</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        Printing businesses purchase banner and vinyl raw material rolls by overall pricing, but sell finished goods in custom-sized square dimensions (e.g. sqft). This calculator automatically translates bulk roll costs into local multi-area pricing rates.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Total Purchase Price (₱)</label>
                                            <input 
                                                type="number" 
                                                value={rollCalc.price} 
                                                onChange={e => setRollCalc({...rollCalc, price: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-white font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. Roll Width</label>
                                                <div className="flex">
                                                    <input 
                                                        type="number" 
                                                        value={rollCalc.width} 
                                                        onChange={e => setRollCalc({...rollCalc, width: e.target.value})}
                                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-l-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-white font-bold"
                                                    />
                                                    <select 
                                                        value={rollCalc.widthUnit} 
                                                        onChange={e => setRollCalc({...rollCalc, widthUnit: e.target.value})}
                                                        className="bg-slate-800 border-y border-r border-slate-700 rounded-r-lg px-2 text-sm text-slate-200"
                                                    >
                                                        <option value="in">In</option>
                                                        <option value="ft">Ft</option>
                                                        <option value="cm">Cm</option>
                                                        <option value="m">M</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">3. Roll Length</label>
                                                <div className="flex">
                                                    <input 
                                                        type="number" 
                                                        value={rollCalc.height} 
                                                        onChange={e => setRollCalc({...rollCalc, height: e.target.value})}
                                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-l-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-white font-bold"
                                                    />
                                                    <select 
                                                        value={rollCalc.heightUnit} 
                                                        onChange={e => setRollCalc({...rollCalc, heightUnit: e.target.value})}
                                                        className="bg-slate-800 border-y border-r border-slate-700 rounded-r-lg px-2 text-sm text-slate-200"
                                                    >
                                                        <option value="in">In</option>
                                                        <option value="ft">Ft</option>
                                                        <option value="cm">Cm</option>
                                                        <option value="m">M</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:w-1/2 flex flex-col justify-center bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-4">Calculated Profit Rates</h4>
                                    {rollPrices ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Per Sq Foot</div>
                                                <div className="text-2xl font-black text-indigo-400 mt-1">₱{rollPrices.sqft}</div>
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Per Sq Meter</div>
                                                <div className="text-2xl font-black text-indigo-400 mt-1">₱{rollPrices.sqm}</div>
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Per Sq Inch</div>
                                                <div className="text-2xl font-black text-indigo-400 mt-1">₱{rollPrices.sqin}</div>
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Per Sq Cm</div>
                                                <div className="text-2xl font-black text-indigo-400 mt-1">₱{rollPrices.sqcm}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 italic text-center py-8 text-sm">Please input valid cost and size measurements.</div>
                                    )}
                                    <div className="mt-6 text-[10px] text-slate-500 italic bg-slate-900/30 p-3 rounded-lg border border-slate-900">
                                        💡 Live React logic is linked to [RollCalculatorModal.jsx](file:///d:/laragon/www/bms.inksite/resources/js/Components/RollCalculatorModal.jsx) inside our active code.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo 2 Box */}
                        <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">BE SQL Aggregation Mockup</span>
                                    <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Transactional Ledger Aggregator Console</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        This mirrors the double-entry dashboard logic inside [DashboardController.php](file:///d:/laragon/www/bms.inksite/app/Http/Controllers/DashboardController.php). It reads dynamised payment channels, adds incoming client order payments, processes general business ledger expense transactions, and aggregates live balances dynamically.
                                    </p>
                                    
                                    <form onSubmit={handleAddTx} className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tx Type</label>
                                                <select 
                                                    value={newTx.type} 
                                                    onChange={e => setNewTx({...newTx, type: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-200"
                                                >
                                                    <option value="payment">Order Payment (Inbound +)</option>
                                                    <option value="expense">Expense (Outbound -)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Payment Gateway</label>
                                                <select 
                                                    value={newTx.mode} 
                                                    onChange={e => setNewTx({...newTx, mode: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-200"
                                                >
                                                    {paymentModes.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount (₱)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="0.00"
                                                    value={newTx.amount}
                                                    onChange={e => setNewTx({...newTx, amount: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-white font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Transaction Label</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Acrylic Board Cost"
                                                    value={newTx.label}
                                                    onChange={e => setNewTx({...newTx, label: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-white"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm">
                                            Process Transaction & Recalculate Balance
                                        </button>
                                    </form>
                                </div>

                                <div className="lg:w-1/2 flex flex-col bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-4">Live Aggregated Balances</h4>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {paymentModes.map(mode => (
                                            <div key={mode.name} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                                                <div className="text-[10px] text-slate-500 uppercase font-black truncate">{mode.name} Account</div>
                                                <div className="text-lg font-black text-white mt-1">₱{mode.balance.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2">General Ledger Activity Logs</h4>
                                    <div className="flex-grow overflow-y-auto max-h-[160px] space-y-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                                        {ledgerTx.map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center text-xs p-2 hover:bg-slate-900 rounded border border-slate-900/50">
                                                <div>
                                                    <span className="font-bold text-white block">{tx.label}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">Gateway: {tx.mode}</span>
                                                </div>
                                                <span className={`font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {tx.amount > 0 ? '+' : ''}₱{tx.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo 3 Box */}
                        <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Inventory Engine Logic</span>
                                    <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Area-Based Inventory Deductor Engine</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        This simulates the intelligent `deductInventory()` engine in [Order.php](file:///d:/laragon/www/bms.inksite/app/Models/Order.php). Flat items are decremented per quantity, but **rolls** automatically deduct stock length/area based on dynamic client dimensions (`width * height * quantity`).
                                    </p>
                                    
                                    <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Production Item</label>
                                            <select 
                                                value={orderItem.materialId} 
                                                onChange={e => setOrderItem({...orderItem, materialId: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-200"
                                            >
                                                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.form})</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Width (ft)</label>
                                                <input 
                                                    type="number" 
                                                    disabled={materials.find(m => m.id === Number(orderItem.materialId))?.form === 'Unit'}
                                                    value={orderItem.width} 
                                                    onChange={e => setOrderItem({...orderItem, width: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 disabled:opacity-50 text-white font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Height (ft)</label>
                                                <input 
                                                    type="number" 
                                                    disabled={materials.find(m => m.id === Number(orderItem.materialId))?.form === 'Unit'}
                                                    value={orderItem.height} 
                                                    onChange={e => setOrderItem({...orderItem, height: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 disabled:opacity-50 text-white font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quantity</label>
                                                <input 
                                                    type="number" 
                                                    value={orderItem.quantity} 
                                                    onChange={e => setOrderItem({...orderItem, quantity: e.target.value})}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white font-bold"
                                                />
                                            </div>
                                        </div>

                                        <button onClick={handleProcessOrder} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm">
                                            Simulate Order Processing
                                        </button>
                                    </div>
                                </div>

                                <div className="lg:w-1/2 flex flex-col bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-4">Stock Ledger Status</h4>
                                    
                                    <div className="space-y-3 mb-6">
                                        {materials.map(m => (
                                            <div key={m.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-white block text-sm">{m.name}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">Form: {m.form}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black uppercase ${m.stock < 100 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300'}`}>
                                                        {m.stock} {m.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2">Stock Deduction Logs</h4>
                                    <div className="flex-grow overflow-y-auto max-h-[140px] space-y-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                                        {deductionLogs.length > 0 ? deductionLogs.map(log => (
                                            <div key={log.id} className="text-[11px] p-2 hover:bg-slate-900 rounded border border-slate-900/50">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-slate-300">{log.material}</span>
                                                    <span className="font-extrabold text-red-400">-{log.deducted} {log.unit}</span>
                                                </div>
                                                <p className="text-slate-500 italic">{log.details}</p>
                                            </div>
                                        )) : (
                                            <div className="text-slate-500 italic text-center py-6">No orders processed yet. Click the process button.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab 2: Architectural Case Studies */}
                {activeTab === 'case-studies' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Case Study A Card */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Database Design & Schema</span>
                            <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Area-Based Material Decoupling</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Standard commerce tracks inventory in integer integers, but printing and fabrication environments buy in sheets or rolls and sell by custom sizes. To solve this, I designed a multi-pivot inventory relationship mapping materials to services.
                            </p>
                            
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto mb-6 text-slate-300">
                                <span className="text-indigo-400 font-bold">// Pivot Schema Relationship</span><br />
                                $this-&gt;belongsToMany(InventoryItem::class, 'service_inventory')<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;-&gt;withPivot('quantity');
                            </div>
                            
                            <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2">Key Accomplishments</h4>
                            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                                <li>Eliminated vinyl material loss errors by automating dimension calculation.</li>
                                <li>Engineered safety safeguards to avoid negative-stock scenarios.</li>
                                <li>Developed multi-measurement conversion algorithms (In, Ft, Cm, M).</li>
                            </ul>
                        </div>

                        {/* Case Study B Card */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Operational Aggregations</span>
                            <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">Double-Entry Financial Cashbook</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Business operations require strict ledger reconciliation across distinct modes (Cash, GCash, Bank Transfer) with different starting values. This aggregates order payments and expense records to form a real-time account summary.
                            </p>
                            
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto mb-6 text-slate-300">
                                <span className="text-indigo-400 font-bold">// Multi-Source Ledger SQL Query</span><br />
                                \App\Models\Transaction::selectRaw(<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;'payment_mode, SUM(amount) as total'<br />
                                )-&gt;groupBy('payment_mode')-&gt;get();
                            </div>

                            <h4 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2">Key Accomplishments</h4>
                            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                                <li>Consolidated three isolated financial pipelines into a single SQL aggregator.</li>
                                <li>Implemented eager-loaded queries to completely eliminate N+1 latency.</li>
                                <li>Ensured order cancellation state filters out false revenue figures.</li>
                            </ul>
                        </div>

                    </div>
                )}

                {/* Tab 3: AI-Native Development */}
                {activeTab === 'ai-native' && (
                    <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto">
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">High-Velocity Engineering Methodology</span>
                        <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">My AI-Native Workflow Strategy</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            I leverage state-of-the-art AI pair-programming agents (like Codex, Cursor, Claude Code, and Gemini) to rapidly accelerate the software development lifecycle. I believe the true strength of an AI-native developer lies in combining high-velocity generation with absolute engineering discipline.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
                            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                <h4 className="font-extrabold text-white mb-2 flex items-center gap-2 text-indigo-400">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]">1</span>
                                    AI-Powered Velocity
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    I prompt AI agents to draft complex controllers, database configurations, and UI templates in seconds, decreasing standard development cycles by up to 70%.
                                </p>
                            </div>
                            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                <h4 className="font-extrabold text-white mb-2 flex items-center gap-2 text-indigo-400">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]">2</span>
                                    Rigorous Human Audits
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    I physically audit all AI output for relational validation, SQL injection opportunities, authorization middleware constraints, and mass-assignment loopholes.
                                </p>
                            </div>
                            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                <h4 className="font-extrabold text-white mb-2 flex items-center gap-2 text-indigo-400">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]">3</span>
                                    Test-Driven Boundaries
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    I construct comprehensive testing frameworks (such as Pest/PHPUnit in PHP or Vitest/Jest in JS) to protect backend state equations and prevent regression when modifying assets.
                                </p>
                            </div>
                            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                <h4 className="font-extrabold text-white mb-2 flex items-center gap-2 text-indigo-400">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]">4</span>
                                    Clean Abstractions
                                </h4>
                                <p className="text-slate-400 leading-relaxed">
                                    I maintain modularity and single-responsibility structures (SOLID), avoiding cluttered AI spaghetti code by structuring business rules inside specific domain helpers and model traits.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                            <h4 className="text-sm font-bold text-white mb-2">Pair-Programmed with Antigravity</h4>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
                                This exact platform and its case studies were engineered in pair-programming collaboration with Google Deepmind's **Antigravity AI Coding Assistant**, illustrating a state-of-the-art developer-agent co-authoring relationship.
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
