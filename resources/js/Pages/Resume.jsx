import { Head, Link } from '@inertiajs/react';

export default function Resume() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-800 font-sans antialiased pb-20 print:bg-white print:text-black print:pb-0">
            <Head title="Christian Ynion - Professional Resume" />

            {/* Print stylesheet injected directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body {
                        background-color: white !important;
                        color: #1e293b !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                        background: white !important;
                        color: black !important;
                    }
                    a {
                        text-decoration: none !important;
                        color: #1e293b !important;
                    }
                    hr {
                        border-color: #cbd5e1 !important;
                    }
                }
            `}} />

            {/* Top Toolbar (Hidden during print) */}
            <div className="no-print bg-slate-950/80 border-b border-slate-800 backdrop-blur sticky top-0 z-50 py-3 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/portfolio" className="text-slate-400 hover:text-white text-sm font-semibold transition">
                            ← Back to Portfolio
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/developer_resume.md"
                            target="_blank"
                            className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg text-sm font-semibold transition"
                        >
                            View Raw Markdown
                        </a>
                        <button
                            onClick={handlePrint}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print to PDF / Save Resume
                        </button>
                    </div>
                </div>
            </div>

            {/* Resume Page Sheet */}
            <div className="max-w-4xl mx-auto mt-8 p-8 sm:p-12 bg-white rounded-3xl border border-slate-800/20 shadow-2xl print-container print:mt-0 print:rounded-none print:border-none print:shadow-none">

                {/* Header Section */}
                <div className="text-center sm:text-left flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            Christian Ynion
                        </h1>
                        <p className="text-indigo-600 font-extrabold text-lg uppercase tracking-wider">
                            Full-Stack Software Developer | AI-Native Systems Builder
                        </p>
                    </div>
                    <div className="text-sm text-slate-500 sm:text-right space-y-2.5 font-medium">
                        <p className="flex justify-center sm:justify-end items-center gap-2">
                            <span className="text-base leading-none">📍</span>
                            <span>Bacolod City, Philippines</span>
                        </p>
                        <p className="flex justify-center sm:justify-end items-center gap-2">
                            <span className="text-base leading-none">✉️</span>
                            <a href="mailto:christianynion@gmail.com" className="hover:text-indigo-600 transition">christianynion@gmail.com</a>
                        </p>
                        <p className="flex justify-center sm:justify-end items-center gap-2">
                            <span className="text-base leading-none">📞</span>
                            <a href="tel:+639178796270" className="hover:text-indigo-600 transition">+63 917 879 6270</a>
                        </p>
                        <p className="flex justify-center sm:justify-end items-center gap-2">
                            <span className="text-base leading-none">🔗</span>
                            <a href="https://github.com/chrisynion" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">github.com/chrisynion</a>
                        </p>
                    </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Professional Summary */}
                <div className="mb-6">
                    <h2 className="text-sm font-black tracking-widest text-indigo-600 uppercase mb-3">
                        Professional Summary
                    </h2>
                    <p className="text-slate-650 text-sm leading-relaxed">
                        Highly practical and velocity-driven <strong>Full-Stack Software Developer</strong> with extensive experience building internal business tools, dashboards, APIs, and complex software integrations. Specialized in the <strong>React (Vite) + Laravel + PostgreSQL</strong> stack, with a deep understanding of database modeling, transactional accounting ledgers, and responsive front-end design. An industry pioneer in <strong>AI-Native software engineering</strong>, utilizing advanced AI coding tools as force multipliers to ship clean, secure, and rigorously tested production code at 10x velocity.
                    </p>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Technical Skills */}
                <div className="mb-6">
                    <h2 className="text-sm font-black tracking-widest text-indigo-600 uppercase mb-3">
                        Technical Skills
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700">
                        <div>
                            <span className="font-bold text-slate-900">Front-End:</span> React, Vite, JavaScript, TypeScript, HTML5, CSS3, Tailwind CSS, Responsive Design, SPA Architecture
                        </div>
                        <div>
                            <span className="font-bold text-slate-900">Back-End:</span> Python, FastAPI, PHP, Laravel, Node.js, Express, REST APIs, JSON APIs, OAuth, Webhooks, Integrations
                        </div>
                        <div>
                            <span className="font-bold text-slate-900">Databases:</span> PostgreSQL, MySQL, SQL, Eloquent ORM, SQLAlchemy, Database Design, Schema Migrations, Complex Aggregations
                        </div>
                        <div>
                            <span className="font-bold text-slate-900">Tools & Testing:</span> Git, GitHub, Pest, PHPUnit, Jest, Postman, Vite Bundling, Docker, Local Servers (Laragon, Apache)
                        </div>
                        <div className="md:col-span-2 mt-1">
                            <span className="font-bold text-slate-900">AI-Native Dev:</span> Advanced Prompting, Code Auditing, AI-driven Refactoring, Test-Driven AI Pair-Programming
                        </div>
                    </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Selected Project Experience */}
                <div className="mb-6">
                    <h2 className="text-sm font-black tracking-widest text-indigo-600 uppercase mb-4">
                        Selected Project Experience
                    </h2>

                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-black text-slate-900 text-base">
                                    Lead Full-Stack Developer | Business Management ERP (BMS.Inksite)
                                </h3>
                                <p className="text-slate-500 text-xs font-bold italic mt-0.5">
                                    React (Vite), Laravel, Tailwind CSS, SQL, Inertia.js, Pest Testing
                                </p>
                            </div>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest print:text-slate-600">
                                Present
                            </span>
                        </div>

                        <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 leading-relaxed">
                            <li>
                                <strong>Full-Stack Architecture:</strong> Architected and shipped a comprehensive, high-performance Business Management ERP for print production, managing customers, services, custom dimensions orders, payments, automated stock tracking, and financial ledgers.
                            </li>
                            <li>
                                <strong>Relational Database Design:</strong> Engineered a highly relational SQL schema with robust Eloquent ORM models and migrations, ensuring high performance, referential integrity, and elimination of N+1 query bottlenecks through eager-loaded relations.
                            </li>
                            <li>
                                <strong>Automated Inventory & Area Logic:</strong> Coded an automated inventory engine that intelligently tracks fractional stock. If a service utilizes "roll-form" materials (e.g. vinyl), the system automatically decrements stock based on calculated square area (<code>width × height × quantity</code>), eliminating physical inventory discrepancies.
                            </li>
                            <li>
                                <strong>Double-Entry Ledger Aggregation:</strong> Developed an operational ledger cashbook that dynamically aggregates customer payments and expense transactions grouped by payment method (Cash, GCash, Bank Transfer) to display real-time reconciliations on an executive dashboard.
                            </li>
                            <li>
                                <strong>Mathematical Quotation Tools:</strong> Created an interactive <strong>Roll Cost Calculator</strong> in React, translating roll size invoice costs into unit-area pricing rates (sqft, sqin, sqm, sqcm), increasing customer quoting speed by 300%.
                            </li>
                            <li>
                                <strong>Modern Interactive Dashboard:</strong> Formulated a responsive, dark-mode compatible KPI dashboard utilizing smooth Tailwind gradients and CSS micro-animations to display live metrics (Gross Revenue, Active Production, Low Stock Alerts, Account Balances).
                            </li>
                            <li>
                                <strong>AI-Native Velocity & Rigor:</strong> Utilized state-of-the-art AI coding assistants (Claude Code, Cursor, Gemini) to accelerate boilerplate creation, refactoring, and documentation, while maintaining strict code quality, manual security reviews, and Pest feature test coverage.
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Work Experience */}
                <div className="mb-6">
                    <h2 className="text-sm font-black tracking-widest text-indigo-600 uppercase mb-4">
                        Work Experience
                    </h2>

                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-black text-slate-900 text-sm">
                                    Full-Stack Software Developer | Freelance / Self-Employed
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                2024 – 2026
                            </span>
                        </div>
                        <ul className="text-xs text-slate-650 space-y-1.5 list-disc pl-4 leading-relaxed">
                            <li>
                                Designed and built bespoke internal business tools and client-facing web applications using React and backend frameworks.
                            </li>
                            <li>
                                Integrated third-party REST APIs, OAuth, and webhooks to synchronize data between CRM, accounting platforms, and databases.
                            </li>
                            <li>
                                Wrote clean, modular, and reusable frontend components in React (JavaScript/TypeScript) and integrated styling systems.
                            </li>
                            <li>
                                Optimized slow database queries, implemented indexes, and designed normalized database schemas.
                            </li>
                            <li>
                                Wrote automated unit and integration tests to ensure application reliability and prevent regression bugs.
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Education & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                        <h2 className="text-xs font-black tracking-widest text-indigo-600 uppercase mb-3">
                            Education
                        </h2>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            Bachelor of Science in Information Technology
                        </h4>
                        <p className="text-slate-500 text-xs mt-1">
                            University of Negros Occidental - Recoletos | 2004 - 2008
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xs font-black tracking-widest text-indigo-600 uppercase mb-3">
                            Key Accomplishments
                        </h2>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
                            <li>
                                Pioneer in leveraging AI pair-programming agents for high-velocity software engineering, increasing shipment velocity by 300%.
                            </li>
                            <li>
                                Framework-agnostic backend expertise (perfect conceptual translation from PHP/Laravel to Python/FastAPI).
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
