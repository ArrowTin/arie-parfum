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

// Ikon botol berbasis token, dipakai saat produk belum punya foto.
function ikonBotol() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("class", "flip-icon");
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, atribut] of [
    ["rect", { x: 25, y: 5, width: 14, height: 9, rx: 2, class: "flip-icon-cap" }],
    ["path", { d: "M23 16h18a7 7 0 0 1 7 7v27a7 7 0 0 1-7 7H23a7 7 0 0 1-7-7V23a7 7 0 0 1 7-7Z", class: "flip-icon-body" }],
    ["path", { d: "M24 33h16", class: "flip-icon-line" }],
  ]) {
    const elemen = document.createElementNS(ns, tag);
    Object.entries(atribut).forEach(([kunci, nilai]) => {
      elemen.setAttribute(kunci, String(nilai));
    });
    svg.append(elemen);
  }
  return svg;
}

function gambarDepan(produk) {
  const sumber = produk.images?.[0];
  if (!sumber) return ikonBotol();
  const gambar = buat("img", "flip-image");
  gambar.src = typeof sumber === "string" ? sumber : (sumber.src ?? "");
  gambar.alt = atau(sumber.alt, `Ilustrasi ${produk.name}`);
  gambar.width = atau(sumber.width, 320);
  gambar.height = atau(sumber.height, 240);
  gambar.loading = "lazy";
  gambar.decoding = "async";
  return gambar;
}

function atau(nilai, cadangan) {
  return nilai === undefined || nilai === null || nilai === "" ? cadangan : nilai;
}

export function buatKartu(produk, namaKategori) {
  const kartu = buat("article", "product-card flip-card");
  kartu.dataset.flipped = "false";
  const dalam = buat("div", "flip-card-inner");
  const depan = buat("div", "flip-face flip-front");
  const belakang = buat("div", "flip-face flip-back");
  belakang.setAttribute("aria-hidden", "true");
  belakang.inert = true;

  depan.append(gambarDepan(produk));
  depan.append(buat("h3", undefined, produk.name));

  const buka = buat("button", "flip-open");
  buka.type = "button";
  buka.setAttribute("aria-expanded", "false");
  buka.setAttribute("aria-label", `Lihat detail ${produk.name}`);
  const panah = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  panah.setAttribute("viewBox", "0 0 24 24");
  panah.setAttribute("aria-hidden", "true");
  panah.setAttribute("class", "flip-chevron");
  const garis = document.createElementNS("http://www.w3.org/2000/svg", "path");
  garis.setAttribute("d", "m9 6 6 6-6 6");
  panah.append(garis);
  buka.append(panah);
  depan.append(buka);

  const tutup = buat("button", "flip-close");
  tutup.type = "button";
  tutup.setAttribute("aria-label", `Tutup detail ${produk.name}`);
  tutup.textContent = "×";
  belakang.append(tutup);

  if (produk.isSample) belakang.append(buat("span", "product-badge", "Contoh"));

  if (produk.badges?.length) {
    const label = buat("div", "product-badges");
    produk.badges.forEach((badge) => {
      label.append(buat("span", "product-badge", NAMA_BADGE[badge] ?? badge));
    });
    belakang.append(label);
  }
  belakang.append(buat("p", "product-meta", namaKategori));
  belakang.append(buat("p", "product-meta", `Ukuran: ${produk.sizesMl.join(", ")} ml`));
  belakang.append(buat("p", "product-price", formatHarga(produk)));
  belakang.append(buat("p", "product-meta", `Stok: ${NAMA_STOK[produk.stock] ?? produk.stock}`));

  const tautan = buat("a", "btn btn-accent btn-card", "Tanya / pesan via WA");
  tautan.href = productInquiryLink(produk);
  tautan.target = "_blank";
  tautan.rel = "noopener noreferrer";
  belakang.append(tautan);

  const balik = (keBelakang) => {
    kartu.dataset.flipped = String(keBelakang);
    buka.setAttribute("aria-expanded", String(keBelakang));
    depan.setAttribute("aria-hidden", String(keBelakang));
    belakang.setAttribute("aria-hidden", String(!keBelakang));
    depan.inert = keBelakang;
    belakang.inert = !keBelakang;
    (keBelakang ? tutup : buka).focus();
  };
  buka.addEventListener("click", () => balik(true));
  tutup.addEventListener("click", () => balik(false));

  dalam.append(depan, belakang);
  kartu.append(dalam);
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
  kategori?.querySelectorAll("option[value]:not([value=''])").forEach((opsi) => {
    opsi.remove();
  });
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
    hasil.forEach((produk) => {
    grid.append(buatKartu(produk, namaKategori.get(produk.categoryId) ?? ""));
  });
    if (kosong) {
      kosong.hidden = hasil.length > 0;
    }
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
