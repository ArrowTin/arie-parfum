import { CONFIG } from "./config.js";
import { buildWaLink } from "./whatsapp.js";
import { initCatalog } from "./catalog.js";
import { initDetail } from "./detail.js";
import { initPromo } from "./promo.js";
import { initKontenTambahan } from "./content.js";

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

  document.querySelectorAll("[data-tel]").forEach((elemen) => {
    elemen.href = `tel:+${CONFIG.business.waNumber}`;
    elemen.textContent = CONFIG.business.phoneDisplay;
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

// Gerak masuk viewport: hanya dipasang bila didukung dan pengguna tidak meminta reduced-motion.
export function initGerak() {
  if (!("IntersectionObserver" in globalThis)) return;
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const pengamat = new IntersectionObserver((entri) => {
    entri.forEach((butir) => {
      if (!butir.isIntersecting) return;
      butir.target.classList.add("is-visible");
      pengamat.unobserve(butir.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll("main > section:not([hidden]):not(.hero)").forEach((bagian) => {
    bagian.classList.add("reveal");
    pengamat.observe(bagian);
  });
}

// SEO: canonical, og:url, dan JSON-LD diisi dari config saat halaman dimuat.
export function initSeo() {
  const lokasi = globalThis.location;
  const url = lokasi && /^https?:$/.test(lokasi.protocol)
    ? `${lokasi.origin}${lokasi.pathname}`
    : "";

  if (url) {
    const canonical = document.querySelector("[data-canonical]");
    if (canonical) canonical.href = url;
    document.querySelectorAll("[data-og-url]").forEach((elemen) => {
      elemen.setAttribute("content", url);
    });
  }

  const data = document.querySelector("[data-jsonld]");
  if (!data) return;
  const a = CONFIG.business.address;
  data.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Store",
    name: CONFIG.business.name,
    description: "Toko parfum di Bengkayang, Kalimantan Barat.",
    url,
    telephone: `+${CONFIG.business.waNumber}`,
    hasMap: CONFIG.business.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.village,
      addressRegion: `${a.district}, ${a.regency}, ${a.province}`,
      postalCode: a.postalCode,
      addressCountry: "ID",
    },
  });
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
initSeo();
initNavigasi();

const slug = new URLSearchParams(globalThis.location?.search ?? "").get("p");
if (slug) {
  initDetail(slug);
} else {
  document.querySelectorAll("[data-catalog]").forEach((bagian) => initCatalog(bagian));
}

initPromo();
initKontenTambahan();
initGerak();
