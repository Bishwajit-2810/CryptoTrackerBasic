import { fetchCryptos } from "./api/coinGecko.js";
import { createCryptoCard } from "./components/cryptoCards.js";

const container = document.getElementById("cryptoContainer");
const searchInput = document.getElementById("search");
const dropdown = document.getElementById("sortDropdown");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedSort = document.getElementById("selectedSort");
const gridBtn = document.getElementById("gridBtn");
const listBtn = document.getElementById("listBtn");

let cryptoList = [];
let filteredList = [];
let sortBy = "market_cap_rank";
let viewMode = "grid";

async function loadCryptos() {
    try {
        const data = await fetchCryptos();
        cryptoList = Array.isArray(data) ? data : [];
        applyFilters();
        render();
    } catch (err) {
        console.error("Error loading cryptos:", err);
    }
}

function applyFilters() {
    const q = searchInput.value.toLowerCase();

    filteredList = cryptoList.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );

    filteredList.sort((a, b) => {
        switch (sortBy) {
            case "name": return a.name.localeCompare(b.name);
            case "price": return a.current_price - b.current_price;
            case "price_desc": return b.current_price - a.current_price;
            case "change": return a.price_change_percentage_24h - b.price_change_percentage_24h;
            case "market_cap": return a.market_cap - b.market_cap;
            default: return a.market_cap_rank - b.market_cap_rank;
        }
    });
}

function render() {
    container.innerHTML = "";
    container.className = `crypto-container ${viewMode}`;

    if (filteredList.length === 0) {
        container.innerHTML = `<div class="loading"><p>No results.</p></div>`;
        return;
    }

    const frag = document.createDocumentFragment();
    filteredList.forEach(c => frag.appendChild(createCryptoCard(c)));
    container.appendChild(frag);
}

searchInput.addEventListener("input", () => {
    applyFilters();
    render();
});

dropdown.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});

[...dropdownMenu.children].forEach(item => {
    item.addEventListener("click", e => {
        sortBy = e.target.dataset.value;
        selectedSort.textContent = e.target.textContent;
        dropdown.classList.remove("open");
        applyFilters();
        render();
    });
});

document.addEventListener("click", e => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
});

gridBtn.addEventListener("click", () => {
    viewMode = "grid";
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
    render();
});

listBtn.addEventListener("click", () => {
    viewMode = "list";
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
    render();
});

loadCryptos();
setInterval(loadCryptos, 10000);
