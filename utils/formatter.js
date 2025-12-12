// utils/formatter.js
export function formatPrice(num) {
    if (num === null || num === undefined || Number.isNaN(num)) return "-";
    return "$" + Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMarketCap(num) {
    if (num === null || num === undefined || Number.isNaN(num)) return "-";
    const n = Number(num);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return n.toLocaleString();
}
