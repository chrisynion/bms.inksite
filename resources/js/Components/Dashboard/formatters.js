export function formatPeso(value, compact = false) {
    const num = Number(value) || 0;
    if (compact) {
        const abs = Math.abs(num);
        const sign = num < 0 ? '-' : '';
        if (abs >= 1_000_000) {
            return `${sign}₱${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
        }
        if (abs >= 1_000) {
            return `${sign}₱${Math.round(abs / 1_000)}k`;
        }
        return `${sign}₱${Math.round(abs).toLocaleString('en-PH')}`;
    }

    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num)}`;
}

export function formatPesoExact(value) {
    const num = Number(value) || 0;
    return `₱${new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num)}`;
}

export const DONUT_COLORS = [
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#38bdf8', // sky-400
    '#cbd5e1', // slate-300
];

export const SEMANTIC_DONUT_COLORS = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#ef4444',
    blue: '#3b82f6',
    sky: '#38bdf8',
    slate: '#94a3b8',
};
