// assets/api/coinGecko.js
const PROXIES = [
    "https://corsproxy.io/?",
    "https://api.allorigins.win/raw?url="
];
const BASE = "https://api.coingecko.com/api/v3";

async function tryFetch(url) {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        // Some proxies wrap results; try parse
        try {
            return JSON.parse(text);
        } catch {
            // maybe already raw JSON string
            try {
                return await (await fetch(url)).json();
            } catch (e) {
                console.error("Failed to parse proxy response", e);
                return null;
            }
        }
    } catch (err) {
        console.warn("proxy fetch failed:", err.message);
        return null;
    }
}

async function fetchWithFallback(endpoint) {
    for (const proxy of PROXIES) {
        const url = proxy + encodeURIComponent(`${BASE}${endpoint}`);
        const data = await tryFetch(url);
        if (data !== null) return data;
    }
    // Last attempt: direct (may fail with CORS)
    try {
        const res = await fetch(`${BASE}${endpoint}`);
        if (!res.ok) throw new Error(`Direct fetch failed ${res.status}`);
        return res.json();
    } catch (err) {
        console.error("All fetch attempts failed:", err.message);
        return null;
    }
}

export async function fetchCryptos() {
    const data = await fetchWithFallback("/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false");
    if (!Array.isArray(data)) {
        console.warn("fetchCryptos returned non-array:", data);
        return [];
    }
    return data;
}

export async function fetchCoinData(id) {
    const data = await fetchWithFallback(`/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    if (!data || typeof data !== "object") return null;
    return data;
}

export async function fetchChartData(id) {
    const data = await fetchWithFallback(`/coins/${id}/market_chart?vs_currency=usd&days=7`);
    if (!data || !data.prices) return { prices: [] };
    return data;
}
