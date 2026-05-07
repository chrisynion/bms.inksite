import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function QuotationIndex({ auth }) {
    const printRef = useRef();

    const [logo, setLogo] = useState(() => localStorage.getItem('quotation_logo') || '');
    const [bgImage, setBgImage] = useState(() => localStorage.getItem('quotation_bgImage') || '');

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('quotation_form_data');
        const defaultData = {
            dateIssued: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            companyDetails: `Unit #3, D "new" Inn Bldg. Burgos St, Brgy.\nVillamonte, Bacolod City\n+63 945 386 9466\nwww.inksite.ph | fb.com/inksite.ph`,
            clientDetails: `QUOTATION FOR\n\nSIRB LAW FIRM\nSecond Floor, The Row Bldg.\nBrgy Mandalagan, Bacolod City`,
            tableTitle: 'OPTIONS FOR 2X7 SQFT SIGNAGE',
            tableOptions: [
                { id: 1, description: 'Option A: Double Layer Acrylic Lighted Box', price: '₱35,000' },
                { id: 2, description: 'Option B: Double Layer Acrylic Non-Lighted Panel', price: '₱25,000' },
                { id: 3, description: 'Option C: Sticker on Single Layer Acrylic Lighted Box', price: '₱21,000' },
                { id: 4, description: 'Option D: Sticker on Single Layer Acrylic Non-lighted Panel', price: '₱17,000' },
            ],
            tableFooterNote: 'Mockups are attached to this document.',
            inclusionsTitle: 'INCLUSIONS:',
            inclusions: [
                { id: 1, text: 'Free delivery.' },
                { id: 2, text: 'Free installation' },
                { id: 3, text: 'Free website (your 24/7 Salesman) for 1 year (free .com domain)' },
                { id: 4, text: '1 Year Warranty' },
            ],
            termsTitle: 'TERMS & CONDITIONS:',
            terms: [
                { id: 1, text: 'Prices quoted are valid for 15 working days from the issue date.' },
                { id: 2, text: 'Payment terms: 50% advance, 50% upon delivery.' },
                { id: 3, text: 'Lead time: 15 to 20 working days' },
            ],
            thankYouTitle: 'THANK YOU FOR YOUR BUSINESS.',
            thankYouMessage: 'We appreciate the opportunity to work with you and look forward to a long-term partnership.'
        };

        if (savedData) {
            const parsed = JSON.parse(savedData);
            // We want to merge saved sticky fields with fresh date and other non-sticky fields if needed
            // But user said "everything I enter stays", so we'll just merge
            return { ...defaultData, ...parsed, dateIssued: defaultData.dateIssued };
        }
        return defaultData;
    });

    React.useEffect(() => {
        localStorage.setItem('quotation_logo', logo);
    }, [logo]);

    React.useEffect(() => {
        localStorage.setItem('quotation_bgImage', bgImage);
    }, [bgImage]);

    React.useEffect(() => {
        localStorage.setItem('quotation_form_data', JSON.stringify({
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

    const handlePrint = () => {
        window.print();
    };

    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 print:hidden">Quotation Generator</h2>}
        >
            <Head>
                <title>Quotation Generator</title>
                <style>{`
                    @media print {
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
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: 0;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        @page {
                            size: auto;
                            margin: 0;
                        }
                    }
                `}</style>
            </Head>

            <div className="py-12 print:py-0 print:m-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 print:px-0 print:max-w-none flex flex-col md:flex-row gap-6">
                    {/* Form Controls - Hidden on Print */}
                    <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow print:hidden overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                        <div className="mb-6">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                            >
                                Print to PDF
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogo)} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBgImage)} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
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
                                        opacity: 0.15,
                                        zIndex: 0,
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                                    {/* The header has a blue line on top in the original image. We can add it as a decorative element. */}
                                </div>
                                
                                <div style={{ height: '3px', backgroundColor: '#5DADE2', width: '60%', position: 'absolute', top: '-15mm', left: '-20mm' }}></div>

                                {/* Date */}
                                <div className="mb-6 text-sm">
                                    Date Issued: {formData.dateIssued}
                                </div>

                                {/* Addresses */}
                                <div className="flex justify-between mb-8 text-sm leading-relaxed">
                                    <div className="whitespace-pre-line w-1/2 pr-4">
                                        {formData.companyDetails}
                                    </div>
                                    <div className="whitespace-pre-line w-1/2 text-right">
                                        {formData.clientDetails}
                                    </div>
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
                                    <div className="mt-2 text-sm">
                                        {formData.tableFooterNote}
                                    </div>
                                </div>

                                {/* Inclusions */}
                                <div className="mb-6">
                                    <div className="font-bold text-sm mb-1">{formData.inclusionsTitle}</div>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {formData.inclusions.map((item) => (
                                            <li key={item.id}>{item.text}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="mb-8">
                                    <div className="font-bold text-sm mb-1">{formData.termsTitle}</div>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {formData.terms.map((item) => (
                                            <li key={item.id}>{item.text}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Thank You Message */}
                                <div className="mt-auto pt-4">
                                    <div className="font-bold text-lg mb-2">{formData.thankYouTitle}</div>
                                    <div className="text-sm">
                                        {formData.thankYouMessage}
                                    </div>
                                </div>
                                
                                <div style={{ height: '2px', backgroundColor: '#5DADE2', width: '100%', marginTop: '20px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
