import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function QuotationIndex({ auth, dbSettings }) {
    const printRef = useRef();

    const [logo, setLogo] = useState(() => dbSettings?.logo || localStorage.getItem('quotation_logo') || '');
    const [bgImage, setBgImage] = useState(() => {
        try {
            return dbSettings?.bgImage || localStorage.getItem('quotation_bgImage') || '';
        } catch (e) {
            localStorage.removeItem('quotation_bgImage');
            return dbSettings?.bgImage || '';
        }
    });
    
    // We'll use this for file uploads specifically
    const [logoFile, setLogoFile] = useState(null);
    const [bgFile, setBgFile] = useState(null);

    const { post, processing } = useForm();

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('quotation_form_data');
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const defaultData = {
            dateIssued: today,
            companyDetails: dbSettings?.companyDetails || `Unit #3, D "new" Inn Bldg. Burgos St, Brgy.\nVillamonte, Bacolod City\n+63 945 386 9466\nwww.inksite.ph | fb.com/inksite.ph`,
            clientDetails: `QUOTATION FOR\n\nSIRB LAW FIRM\nSecond Floor, The Row Bldg.\nBrgy Mandalagan, Bacolod City`,
            tableTitle: dbSettings?.tableTitle || 'OPTIONS FOR 2X7 SQFT SIGNAGE',
            tableOptions: [
                { id: 1, description: 'Option A: Double Layer Acrylic Lighted Box', price: '₱35,000' },
                { id: 2, description: 'Option B: Double Layer Acrylic Non-Lighted Panel', price: '₱25,000' },
                { id: 3, description: 'Option C: Sticker on Single Layer Acrylic Lighted Box', price: '₱21,000' },
                { id: 4, description: 'Option D: Sticker on Single Layer Acrylic Non-lighted Panel', price: '₱17,000' },
            ],
            tableFooterNote: dbSettings?.tableFooterNote || 'Mockups are attached to this document.',
            inclusionsTitle: dbSettings?.inclusionsTitle || 'INCLUSIONS:',
            inclusions: dbSettings?.inclusions || [
                { id: 1, text: 'Free delivery.' },
                { id: 2, text: 'Free installation' },
                { id: 3, text: 'Free website (your 24/7 Salesman) for 1 year (free .com domain)' },
                { id: 4, text: '1 Year Warranty' },
            ],
            termsTitle: dbSettings?.termsTitle || 'TERMS & CONDITIONS:',
            terms: dbSettings?.terms || [
                { id: 1, text: 'Prices quoted are valid for 15 working days from the issue date.' },
                { id: 2, text: 'Payment terms: 50% advance, 50% upon delivery.' },
                { id: 3, text: 'Lead time: 15 to 20 working days' },
            ],
            thankYouTitle: dbSettings?.thankYouTitle || 'THANK YOU FOR YOUR BUSINESS.',
            thankYouMessage: dbSettings?.thankYouMessage || 'We appreciate the opportunity to work with you and look forward to a long-term partnership.'
        };

        if (savedData && !dbSettings?.companyDetails) { 
            const parsed = JSON.parse(savedData);
            return { ...defaultData, ...parsed, dateIssued: today };
        }
        return { ...defaultData, dateIssued: today };
    });

    // Helper for safe localStorage access
    const safeSetItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Storage quota exceeded, could not save to localStorage:', e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                // If it's the big background image causing the issue, clear it to allow recovery
                if (key === 'quotation_bgImage') {
                    localStorage.removeItem('quotation_bgImage');
                    alert('The image you uploaded is too large to save in your browser memory. It will still show in the preview, but you should "Save as System Defaults" to persist it to the database instead.');
                }
            }
        }
    };

    React.useEffect(() => {
        if (logo && !logo.startsWith('http') && logo !== '') {
            safeSetItem('quotation_logo', logo);
        }
    }, [logo]);

    React.useEffect(() => {
        if (bgImage && !bgImage.startsWith('http') && bgImage !== '') {
            safeSetItem('quotation_bgImage', bgImage);
        }
    }, [bgImage]);

    React.useEffect(() => {
        safeSetItem('quotation_form_data', JSON.stringify({
            companyDetails: formData.companyDetails,
            thankYouTitle: formData.thankYouTitle,
            thankYouMessage: formData.thankYouMessage,
            inclusionsTitle: formData.inclusionsTitle,
            inclusions: formData.inclusions,
            termsTitle: formData.termsTitle,
            terms: formData.terms,
            tableFooterNote: formData.tableFooterNote,
            tableTitle: formData.tableTitle
        }));
    }, [formData]);

    const handleSaveToDatabase = () => {
        const payload = {
            ...formData,
            logo: logoFile,
            bgImage: bgFile,
        };
        
        post(route('quotation.settings.update'), payload, {
            forceFormData: true,
            onSuccess: () => alert('Settings saved to database successfully!'),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFileChange = (e, setter, fileSetter) => {
        const file = e.target.files[0];
        if (file) {
            fileSetter(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index, field, value, arrayName) => {
        const newArray = [...formData[arrayName]];
        newArray[index][field] = value;
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const addArrayItem = (arrayName, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], { id: Date.now(), ...defaultItem }]
        }));
    };

    const removeArrayItem = (index, arrayName) => {
        const newArray = [...formData[arrayName]];
        newArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 print:hidden">Quotation Generator</h2>
                    <button 
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 print:hidden transform hover:scale-105 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print to PDF
                    </button>
                </div>
            }
        >
            <Head>
                <title>Quotation Generator</title>
                <style>{`
                    @media print {
                        @page {
                            size: A4;
                            margin: 0; /* Background can now fill the whole page */
                        }
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            background-color: transparent !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .quotation-bg {
                            position: fixed !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: 100% !important;
                            z-index: -1 !important;
                            visibility: visible !important;
                        }
                    }
                `}</style>
            </Head>

            <div className="py-12 print:py-0 print:m-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 print:px-0 print:max-w-none flex flex-col md:flex-row gap-6">
                    {/* Form Controls - Hidden on Print */}
                    <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow print:hidden overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogo, setLogoFile)} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBgImage, setBgFile)} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                                <button onClick={() => setBgImage('')} className="text-sm text-red-500 mt-1">Clear Background</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Issued</label>
                                <input type="text" name="dateIssued" value={formData.dateIssued} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Details (Left)</label>
                                <textarea name="companyDetails" value={formData.companyDetails} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Details (Right)</label>
                                <textarea name="clientDetails" value={formData.clientDetails} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>

                            <hr className="my-4 border-gray-300 dark:border-gray-600"/>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Options</label>
                                <input type="text" name="tableTitle" value={formData.tableTitle} onChange={handleChange} className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Table Title" />
                                
                                {formData.tableOptions.map((opt, index) => (
                                    <div key={opt.id} className="flex gap-2 mb-2 items-center">
                                        <input type="text" value={opt.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'tableOptions')} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Description" />
                                        <input type="text" value={opt.price} onChange={(e) => handleArrayChange(index, 'price', e.target.value, 'tableOptions')} className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Price" />
                                        <button onClick={() => removeArrayItem(index, 'tableOptions')} className="text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem('tableOptions', { description: '', price: '' })} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">+ Add Option</button>
                                
                                <input type="text" name="tableFooterNote" value={formData.tableFooterNote} onChange={handleChange} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" placeholder="Footer Note" />
                            </div>

                            <hr className="my-4 border-gray-300 dark:border-gray-600"/>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inclusions</label>
                                <input type="text" name="inclusionsTitle" value={formData.inclusionsTitle} onChange={handleChange} className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Title" />
                                {formData.inclusions.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 mb-2 items-center">
                                        <input type="text" value={item.text} onChange={(e) => handleArrayChange(index, 'text', e.target.value, 'inclusions')} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
                                        <button onClick={() => removeArrayItem(index, 'inclusions')} className="text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem('inclusions', { text: '' })} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">+ Add Inclusion</button>
                            </div>

                            <hr className="my-4 border-gray-300 dark:border-gray-600"/>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Terms & Conditions</label>
                                <input type="text" name="termsTitle" value={formData.termsTitle} onChange={handleChange} className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Title" />
                                {formData.terms.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 mb-2 items-center">
                                        <input type="text" value={item.text} onChange={(e) => handleArrayChange(index, 'text', e.target.value, 'terms')} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
                                        <button onClick={() => removeArrayItem(index, 'terms')} className="text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                ))}
                                <button onClick={() => addArrayItem('terms', { text: '' })} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">+ Add Term</button>
                            </div>

                            <hr className="my-4 border-gray-300 dark:border-gray-600"/>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thank You Title</label>
                                <input type="text" name="thankYouTitle" value={formData.thankYouTitle} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thank You Message</label>
                                <textarea name="thankYouMessage" value={formData.thankYouMessage} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveToDatabase}
                                    disabled={processing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    {processing ? 'Saving...' : 'Save as System Defaults'}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Saving to database makes these settings the default for everyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preview / Print Area */}
                    <div className="w-full md:w-2/3 flex justify-center print:w-full print:block">
                        <div 
                            id="print-area" 
                            className="bg-white shadow-xl relative overflow-hidden" 
                            style={{ 
                                width: '210mm', 
                                minHeight: '297mm', 
                                padding: '15mm 20mm',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                fontFamily: 'Arial, sans-serif'
                            }}
                        >
                            {/* Background Image */}
                            {bgImage && (
                                <div 
                                    className="quotation-bg"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${bgImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        opacity: 0.05,
                                        zIndex: 0,
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
                                <thead className="print:table-header-group">
                                    <tr><td style={{ height: '15mm' }}></td></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '0 20mm', verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '267mm' }}>
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        {logo ? (
                                                            <img src={logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '250px' }} />
                                                        ) : (
                                                            <div className="h-20 w-48 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
                                                                [Upload Logo]
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div style={{ height: '3px', backgroundColor: '#5DADE2', width: '60%', position: 'absolute', top: '0mm', left: '0mm' }}></div>

                                                {/* Date */}
                                                <div className="mb-6 text-sm">
                                                    Date Issued: {formData.dateIssued}
                                                </div>

                                                {/* Addresses */}
                                                <div className="flex justify-between mb-8 text-sm leading-relaxed">
                                                    <div 
                                                        className="whitespace-pre-line w-1/2 pr-4"
                                                        dangerouslySetInnerHTML={{ __html: formData.companyDetails }}
                                                    />
                                                    <div 
                                                        className="whitespace-pre-line w-1/2 text-right"
                                                        dangerouslySetInnerHTML={{ __html: formData.clientDetails }}
                                                    />
                                                </div>

                                                {/* Options Table */}
                                                <div className="mb-6">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr>
                                                                <th className="border border-black text-left py-2 px-3 font-bold" style={{ backgroundColor: '#B3E5FC' }}>{formData.tableTitle}</th>
                                                                <th className="border border-black text-right py-2 px-3 font-bold w-32" style={{ backgroundColor: '#B3E5FC' }}>PRICE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formData.tableOptions.map((opt) => (
                                                                <tr key={opt.id}>
                                                                    <td className="border-b border-black py-2 px-3 text-sm">{opt.description}</td>
                                                                    <td className="border-b border-black py-2 px-3 text-sm text-right font-medium">{opt.price}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div 
                                                        className="mt-2 text-sm whitespace-pre-line"
                                                        dangerouslySetInnerHTML={{ __html: formData.tableFooterNote }}
                                                    />
                                                </div>

                                                {/* Inclusions */}
                                                <div className="mb-6">
                                                    <div className="font-bold text-sm mb-1">{formData.inclusionsTitle}</div>
                                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                                        {formData.inclusions.map((item) => (
                                                            <li key={item.id} dangerouslySetInnerHTML={{ __html: item.text }} />
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Terms & Conditions */}
                                                <div className="mb-8">
                                                    <div className="font-bold text-sm mb-1">{formData.termsTitle}</div>
                                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                                        {formData.terms.map((item) => (
                                                            <li key={item.id} dangerouslySetInnerHTML={{ __html: item.text }} />
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Thank You Message */}
                                                <div className="mt-auto pt-4">
                                                    <div className="font-bold text-lg mb-2">{formData.thankYouTitle}</div>
                                                    <div 
                                                        className="text-sm whitespace-pre-line"
                                                        dangerouslySetInnerHTML={{ __html: formData.thankYouMessage }}
                                                    />
                                                    <div style={{ height: '2px', backgroundColor: '#5DADE2', width: '100%', marginTop: '20px' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="print:table-footer-group">
                                    <tr><td style={{ height: '15mm' }}></td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
