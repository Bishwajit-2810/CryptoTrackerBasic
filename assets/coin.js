// assets/coin.js
import { fetchCoinData, fetchChartData } from "./api/coinGecko.js";
import { formatPrice, formatMarketCap } from "../utils/formatter.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");

const loadingBox = document.getElementById("loadingBox");
const coinDetail = document.getElementById("coinDetail");

async function load() {
    if (!id) {
        coinDetail.innerHTML = `<p>No coin specified.</p>`;
        return;
    }

    try {
        const [coin, chart] = await Promise.all([
            fetchCoinData(id),
            fetchChartData(id)
        ]);

        if (!coin) {
            coinDetail.innerHTML = `<p>Failed to load coin.</p>`;
            return;
        }

        renderCoin(coin);
        renderChart(chart.prices || []);

    } catch (err) {
        console.error("coin load error:", err);
        coinDetail.innerHTML = `<p>Error loading coin data.</p>`;
    } finally {
        loadingBox.style.display = "none";
        coinDetail.style.display = "block";
    }
}

/* -----------------------------
   Render Coin Info
----------------------------- */
function renderCoin(coin) {
    const name = coin.name || "";
    const symbol = (coin.symbol || "").toUpperCase();
    const img = coin.image?.large || "";
    const rank = coin.market_data?.market_cap_rank ?? "—";
    const price = coin.market_data?.current_price?.usd ?? null;
    const change = coin.market_data?.price_change_percentage_24h ?? 0;

    const high = coin.market_data?.high_24h?.usd ?? null;
    const low = coin.market_data?.low_24h?.usd ?? null;

    coinDetail.innerHTML = `
    <div class="coin-header">
        <div class="coin-title">
            <img src="${img}" alt="${name}" />
            <div>
                <h1>${name}</h1>
                <div class="symbol">${symbol}</div>
            </div>
        </div>
        <div class="rank">Rank #${rank}</div>
    </div>

    <div class="coin-price-section">
        <div class="price-left">
            <h2>${formatPrice(price)}</h2>
            <div class="change-badge ${change >= 0 ? "positive" : "negative"}">
                ${change >= 0 ? "▲ " : "▼ "}${Math.abs(change).toFixed(2)}%
            </div>
        </div>

        <div class="price-ranges">
            <div class="price-range">
                <small>High (24h)</small>
                <div class="range-value">${formatPrice(high)}</div>
            </div>
            <div class="price-range">
                <small>Low (24h)</small>
                <div class="range-value">${formatPrice(low)}</div>
            </div>
        </div>
    </div>

    <div class="chart-section">
        <h3>Price Chart (7d)</h3>
        <canvas id="coinChart"></canvas>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <small>Market Cap</small>
            <div class="stat-value">${formatMarketCap(coin.market_data?.market_cap?.usd)}</div>
        </div>

        <div class="stat-card">
            <small>Volume (24h)</small>
            <div class="stat-value">${formatMarketCap(coin.market_data?.total_volume?.usd)}</div>
        </div>

        <div class="stat-card">
            <small>Circulating</small>
            <div class="stat-value">${(coin.market_data?.circulating_supply)?.toLocaleString() || "N/A"}</div>
        </div>

        <div class="stat-card">
            <small>Total Supply</small>
            <div class="stat-value">${(coin.market_data?.total_supply)?.toLocaleString() || "N/A"}</div>
        </div>
    </div>
    `;
}

/* -----------------------------
   FIXED CHART (auto renders without resize)
----------------------------- */
function renderChart(prices) {
    const canvas = document.getElementById("coinChart");
    if (!canvas) return;

    // Wait for layout to settle
    requestAnimationFrame(() => {
        setTimeout(() => drawChart(prices, canvas), 25);
    });
}

function drawChart(prices, canvas) {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();

    // If width is 0, wait and retry
    if (rect.width < 10) {
        setTimeout(() => drawChart(prices, canvas), 50);
        return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = 340 * devicePixelRatio;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const pts = (prices || []).slice(-70).map(p => ({ t: p[0], v: p[1] }));
    if (pts.length === 0) {
        ctx.fillStyle = "#9ca3af";
        ctx.fillText("No chart data", 16, 24);
        return;
    }

    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    const margin = 36;
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;

    const values = pts.map(p => p.v);
    const max = Math.max(...values);
    const min = Math.min(...values);

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
        const y = margin + (innerH / 3) * i;
        ctx.moveTo(margin, y);
        ctx.lineTo(margin + innerW, y);
    }
    ctx.stroke();

    // price line
    ctx.beginPath();
    ctx.strokeStyle = "#77c8ff";
    ctx.lineWidth = 2.2;
    pts.forEach((p, i) => {
        const x = margin + (i / (pts.length - 1)) * innerW;
        const y = margin + innerH - ((p.v - min) / (max - min)) * innerH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // fill gradient
    const grad = ctx.createLinearGradient(0, margin, 0, margin + innerH);
    grad.addColorStop(0, "rgba(119,200,255,0.14)");
    grad.addColorStop(1, "rgba(119,200,255,0.02)");
    ctx.lineTo(margin + innerW, margin + innerH);
    ctx.lineTo(margin, margin + innerH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // crisp overlay
    ctx.beginPath();
    ctx.strokeStyle = "#bfefff";
    ctx.lineWidth = 1.6;
    pts.forEach((p, i) => {
        const x = margin + (i / (pts.length - 1)) * innerW;
        const y = margin + innerH - ((p.v - min) / (max - min)) * innerH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
}

/* -----------------------------
   Resize Redraw Fix
----------------------------- */
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => load(), 150);
});

/* -----------------------------
   INIT
----------------------------- */
load();
