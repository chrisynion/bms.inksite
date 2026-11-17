const PILL_STYLES = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function SummaryBanner({ items = [] }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm mb-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-gray-700">
                {items.map((item) => (
                    <div key={item.label} className="px-6 py-6 text-center flex flex-col items-center justify-center">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">
                            {item.label}
                        </p>
                        <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {item.value}
                        </p>
                        {item.pill && (
                            <span
                                className={`mt-2.5 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                                    PILL_STYLES[item.tone || 'slate']
                                }`}
                            >
                                {item.pill}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
