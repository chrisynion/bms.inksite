import { DONUT_COLORS } from './formatters';

export default function DonutChartCard({
    title,
    badge,
    centerValue,
    centerLabel,
    segments = [],
    colors = DONUT_COLORS,
    emptyText = 'No data available for this period.',
    formatRight,
}) {
    const activeSegments = segments.filter((s) => Number(s.value) > 0);
    const total = activeSegments.reduce((sum, s) => sum + Number(s.value), 0);

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
                {badge && (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">
                        {badge}
                    </span>
                )}
            </div>

            {total > 0 ? (
                <>
                    <div className="flex items-center justify-center my-4">
                        <div className="relative w-44 h-44">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140" role="img" aria-label={title}>
                                <circle
                                    cx="70"
                                    cy="70"
                                    r={radius}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="22"
                                    className="text-slate-100 dark:text-gray-700"
                                />
                                {activeSegments.map((seg, idx) => {
                                    const fraction = Number(seg.value) / total;
                                    const dashLength = fraction * circumference;
                                    const dashOffset = -cumulative * circumference;
                                    cumulative += fraction;
                                    const strokeColor = seg.color || colors[idx % colors.length];

                                    return (
                                        <circle
                                            key={seg.label}
                                            cx="70"
                                            cy="70"
                                            r={radius}
                                            fill="none"
                                            stroke={strokeColor}
                                            strokeWidth="22"
                                            strokeDasharray={`${dashLength} ${circumference}`}
                                            strokeDashoffset={dashOffset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {centerValue}
                                </span>
                                {centerLabel && (
                                    <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-400">
                                        {centerLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {segments.map((seg, idx) => {
                            const dotColor = seg.color || colors[idx % colors.length];
                            return (
                                <div key={seg.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span
                                            className="w-3 h-3 rounded-[4px] shrink-0"
                                            style={{ backgroundColor: dotColor }}
                                        />
                                        <span className="text-slate-700 dark:text-gray-300 font-medium truncate">
                                            {seg.label}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white ml-3 shrink-0">
                                        {formatRight ? formatRight(seg) : `${seg.pct ?? 0}%`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-28 h-28 rounded-full border-[14px] border-slate-100 dark:border-gray-700 flex items-center justify-center mb-3">
                        <span className="text-xs font-bold text-slate-400">0%</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{emptyText}</p>
                </div>
            )}
        </div>
    );
}
