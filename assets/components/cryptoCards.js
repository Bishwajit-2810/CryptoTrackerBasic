import { formatPrice, formatMarketCap } from "../../utils/formatter.js";

export function createCryptoCard(coin) {
    const a = document.createElement("a");
    a.className = "crypto-card";
    a.href = `coin.html?id=${encodeURIComponent(coin.id)}`;

    // header wrapper
    const headerWrap = document.createElement("div");
    headerWrap.className = "crypto-header";

    const header = document.createElement("div");
    header.className = "crypto-info";

    const img = document.createElement("img");
    img.src = coin.image;
    img.alt = coin.name;

    const text = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = coin.name;
    const sym = document.createElement("div");
    sym.className = "symbol";
    sym.textContent = coin.symbol.toUpperCase();

    text.appendChild(h3);
    text.appendChild(sym);
    header.appendChild(img);
    header.appendChild(text);

    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = `#${coin.market_cap_rank}`;

    headerWrap.appendChild(header);
    headerWrap.appendChild(rank);
    a.appendChild(headerWrap);

    const priceBlock = document.createElement("div");
    priceBlock.className = "crypto-price";
    priceBlock.innerHTML = `
    <p class="price">${formatPrice(coin.current_price)}</p>
    <p class="change ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}">
      ${coin.price_change_percentage_24h >= 0 ? "▲" : "▼"} 
      ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
    </p>
  `;

    const stats = document.createElement("div");
    stats.className = "crypto-stats";
    stats.innerHTML = `
    <div class="stat">
      <div class="stat-label">Market Cap</div>
      <div class="stat-value">$${formatMarketCap(coin.market_cap)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Volume</div>
      <div class="stat-value">$${formatMarketCap(coin.total_volume)}</div>
    </div>
  `;

    a.appendChild(priceBlock);
    a.appendChild(stats);

    return a;
}
