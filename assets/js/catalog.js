import { CONFIG } from "./config.js";
import { filterProducts, loadProducts } from "./products.js";
import { productInquiryLink } from "./whatsapp.js";

const NAMA_BADGE = { terlaris: "Terlaris", baru: "Baru", promo: "Promo" };
export const NAMA_STOK = { ready: "Ready", habis: "Habis", preorder: "Preorder" };

function buat(tag, kelas, teks) {
  const elemen = document.createElement(tag);
  if (kelas) elemen.className = kelas;
  if (teks !== undefined) elemen.textContent = teks;
  return elemen;
}

export function formatHarga(produk) {
  if (!CONFIG.features.showPrices || produk.price == null) return "Tanya harga";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: produk.currency || "IDR",
    maximumFractionDigits: 0,
  }).format(produk.price);
}

export function buatKartu(produk, namaKategori) {
  const kartu = buat("article", "product-card");
  const kepala = buat("div", "product-head");
  kepala.append(buat("h3", undefined, produk.name));
  if (produk.isSample) kepala.append(buat("span", "product-badge", "Contoh"));
  kartu.append(kepala);

  if (produk.badges?.length) {
    const label = buat("div", "product-badges");
    produk.badges.forEach((badge) => label.append(buat("span", "product-badge", NAMA_BADGE[badge] ?? badge)));
    kartu.append(label);
  }

  kartu.append(buat("p", "product-meta", namaKategori));
  kartu.append(buat("p", "product-meta", `Ukuran: ${produk.sizesMl.join(", ")} ml`));
  kartu.append(buat("p", "product-price", formatHarga(produk)));
  kartu.append(buat("p", "product-meta", `Stok: ${NAMA_STOK[produk.stock] ?? produk.stock}`));

  const tautan = buat("a", "btn btn-accent", "Tanya / pesan via WA");
  tautan.href = productInquiryLink(produk);
  tautan.target = "_blank";
  tautan.rel = "noopener noreferrer";
  kartu.append(tautan);
  return kartu;
}

// Pasang filter, pencarian, dan keadaan kosong pada sebuah seksi katalog.
export async function initCatalog(bagian) {
  const grid = bagian.querySelector("[data-catalog-grid]");
  if (!grid) return;
  const kosong = bagian.querySelector("[data-catalog-empty]");
  const pesan = bagian.querySelector("[data-catalog-pesan]");
  const cari = bagian.querySelector("[data-catalog-search]");
  const kategori = bagian.querySelector("[data-catalog-category]");
  const label = bagian.querySelector("[data-catalog-badge]");
  const aturUlang = bagian.querySelector("[data-catalog-reset]");

  let katalog;
  try {
    katalog = await loadProducts();
  } catch {
    if (pesan) pesan.textContent = "Katalog belum bisa dimuat. Muat ulang halaman atau tanya via WhatsApp.";
    if (kosong) kosong.hidden = false;
    return;
  }

  const namaKategori = new Map(katalog.categories.map((item) => [item.id, item.name]));
  kategori?.querySelectorAll("option[value]:not([value=''])").forEach((opsi) => opsi.remove());
  katalog.categories.forEach((item) => {
    const opsi = document.createElement("option");
    opsi.value = item.id;
    opsi.textContent = item.name;
    kategori?.append(opsi);
  });

  const tampilkan = () => {
    grid.replaceChildren();
    const hasil = filterProducts(katalog.products, {
      q: cari?.value ?? "",
      categoryId: kategori?.value ?? "",
      badge: label?.value ?? "",
    });
    hasil.forEach((produk) => grid.append(buatKartu(produk, namaKategori.get(produk.categoryId) ?? "")));
    if (kosong) kosong.hidden = hasil.length > 0;
    if (pesan && hasil.length === 0) {
      pesan.textContent = "Produk tidak ditemukan. Coba kata kunci lain atau tanya via WhatsApp.";
    }
  };

  cari?.addEventListener("input", tampilkan);
  kategori?.addEventListener("change", tampilkan);
  label?.addEventListener("change", tampilkan);
  aturUlang?.addEventListener("click", () => {
    if (cari) cari.value = "";
    if (kategori) kategori.value = "";
    if (label) label.value = "";
    tampilkan();
    cari?.focus();
  });

  tampilkan();
}
