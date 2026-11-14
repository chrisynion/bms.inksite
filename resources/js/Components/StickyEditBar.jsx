import { Link } from '@inertiajs/react';

export default function StickyEditBar({ backHref, backLabel = 'Back', processing = false, children }) {
    return (
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 mb-4 transition-all">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {children}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{backLabel}</span>
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
