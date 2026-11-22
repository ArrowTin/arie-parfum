import { CONFIG } from "./config.js";
import { buatKartu } from "./catalog.js";
import { filterProducts, loadProducts } from "./products.js";

// Bagian promo hanya muncul bila flag aktif dan ada produk berlabel promo.
export async function initPromo() {
  const bagian = document.querySelector("[data-promo]");
  if (!bagian || !CONFIG.features.promo) return;

  try {
    const { products } = await loadProducts();
    const promo = filterProducts(products, { badge: "promo" });
    if (!promo.length) return;
    const grid = bagian.querySelector("[data-promo-grid]");
    if (!grid) return;
    promo.slice(0, 4).forEach((produk) => grid.append(buatKartu(produk, "")));
    bagian.hidden = false;
  } catch {
    // Biarkan bagian tetap tersembunyi bila data gagal dimuat.
  }
}
