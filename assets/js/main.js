import { CONFIG } from "./config.js";
import { buildWaLink } from "./whatsapp.js";
import { initCatalog } from "./catalog.js";
import { initDetail } from "./detail.js";

// Isi teks dari config ke semua elemen penanda.
function isiPenanda(penanda, nilai) {
  document.querySelectorAll(`[data-config="${penanda}"]`).forEach((elemen) => {
    elemen.textContent = nilai;
  });
}

// Alamat dirakit dari config agar tidak duplikat di HTML.
function alamatLengkap() {
  const a = CONFIG.business.address;
  return [a.plusCode, a.street, a.village, `Kec. ${a.district}`,
    `Kab. ${a.regency}`, a.province, a.postalCode].join(", ");
}

export function initDataUsaha() {
  const judulHalaman = document.querySelector("[data-page-title]")?.textContent?.trim() ||
    "Toko Parfum di Bengkayang";
  document.title = `${CONFIG.business.name} — ${judulHalaman}`;
  isiPenanda("name", CONFIG.business.name);
  isiPenanda("category", CONFIG.business.category);
  isiPenanda("street", CONFIG.business.address.street);
  isiPenanda("address", alamatLengkap());
  isiPenanda("phone", CONFIG.business.phoneDisplay);

  document.querySelectorAll("[data-year]").forEach((elemen) => {
    elemen.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-wa]").forEach((elemen) => {
    elemen.href = buildWaLink();
  });

  document.querySelectorAll("[data-route]").forEach((elemen) => {
    elemen.href = CONFIG.business.mapsUrl;
  });

  // Jam 24 jam berlabel [?]: tampil sesuai flag, tetap mengajak konfirmasi.
  if (CONFIG.business.hours.is24h) {
    document.querySelectorAll("[data-hours]").forEach((elemen) => {
      elemen.hidden = false;
    });
    document.querySelectorAll("[data-hours-label]").forEach((elemen) => {
      elemen.textContent = "Buka 24 Jam";
    });
    document.querySelectorAll("[data-hours-desc]").forEach((elemen) => {
      elemen.textContent = "Data peta menunjukkan 24 jam. Konfirmasi ulang lewat WhatsApp.";
    });
  }
}

// Menu mobile: tombol membuka/ menutup daftar nav.
export function initNavigasi() {
  const tombol = document.querySelector(".nav-toggle");
  const daftar = document.querySelector(".nav-list");
  if (!tombol || !daftar) return;

  const tutup = () => {
    tombol.setAttribute("aria-expanded", "false");
    daftar.classList.remove("is-open");
  };

  tombol.addEventListener("click", () => {
    const terbuka = tombol.getAttribute("aria-expanded") === "true";
    tombol.setAttribute("aria-expanded", String(!terbuka));
    daftar.classList.toggle("is-open", !terbuka);
  });

  daftar.addEventListener("click", (acara) => {
    if (acara.target.closest("a")) tutup();
  });

  document.addEventListener("keydown", (acara) => {
    if (acara.key === "Escape") tutup();
  });
}

initDataUsaha();
initNavigasi();

const slug = new URLSearchParams(globalThis.location?.search ?? "").get("p");
if (slug) {
  initDetail(slug);
} else {
  document.querySelectorAll("[data-catalog]").forEach((bagian) => initCatalog(bagian));
}
