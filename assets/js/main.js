import { CONFIG } from "./config.js";
import { buildWaLink } from "./whatsapp.js";
import { bisaGerak } from "./motion-ui.js";

// Fitur opsional dimuat hanya bila penandanya ada di halaman.
async function jalankanJikaAda(penanda, modul, nama) {
  if (!document.querySelector(penanda)) return;
  const dimuat = await import(modul);
  dimuat[nama]();
}

async function initPromo() {
  await jalankanJikaAda("[data-promo]", "./promo.js", "initPromo");
}

async function initKontenTambahan() {
  await jalankanJikaAda("[data-tentang], [data-galeri], [data-testimoni]",
    "./content.js", "initKontenTambahan");
}

async function initGalleryZoom() {
  await jalankanJikaAda("[data-galeri-grid]", "./gallery-zoom.js", "initGalleryZoom");
}

async function initVideoText() {
  await jalankanJikaAda("[data-video-text]", "./video-text.js", "initVideoText");
}

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

// Momen botol: tutup diputar dan aroma dikeluarkan dengan transisi CSS saat ditekan.
export async function initFlacon() {
  const flacon = document.querySelector("[data-flacon]");
  if (!flacon) return;
  const { mainkanAudioTutup } = await import("./botol-audio.js");

  const status = flacon.querySelector("[data-aroma-status]");
  let terbuka = false;

  flacon.addEventListener("click", () => {
    terbuka = !terbuka;
    mainkanAudioTutup(terbuka);
    flacon.setAttribute("aria-pressed", String(terbuka));
    if (status) status.textContent = terbuka ? "Aroma dikeluarkan." : "Tutup botol dipasang kembali.";
  });

  // Tilt hanya pada pointer presisi, saat terlihat, dan tanpa reduced-motion/save-data.
  const media = globalThis.matchMedia;
  if (media?.("(prefers-reduced-motion: reduce)").matches) return;
  if (media?.("(hover: hover) and (pointer: fine)").matches === false) return;
  if (globalThis.navigator?.connection?.saveData) return;

  const aturKemiringan = (acara) => {
    const batas = flacon.getBoundingClientRect();
    if (!batas.width || !batas.height) return;
    const x = (acara.clientX - batas.left) / batas.width - 0.5;
    const y = (acara.clientY - batas.top) / batas.height - 0.5;
    flacon.style.setProperty("--tilt-x", `${(y * -12).toFixed(2)}deg`);
    flacon.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
  };

  const kembalikan = () => {
    flacon.style.setProperty("--tilt-x", "0deg");
    flacon.style.setProperty("--tilt-y", "0deg");
  };

  const pasang = () => {
    flacon.addEventListener("pointermove", aturKemiringan);
    flacon.addEventListener("pointerleave", kembalikan);
  };

  if (!("IntersectionObserver" in globalThis)) {
    pasang();
    return;
  }

  const pengamat = new IntersectionObserver((entri) => {
    if (!entri.some((butir) => butir.isIntersecting)) return;
    pasang();
    pengamat.disconnect();
  }, { threshold: 0.2 });
  pengamat.observe(flacon);
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

// Kaca header mengeras halus setelah pengguna menggulir.
export function initChrome() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const batas = 8;
  const perbarui = () => {
    header.classList.toggle("is-scrolled", (globalThis.scrollY ?? 0) > batas);
  };
  perbarui();
  globalThis.addEventListener?.("scroll", perbarui, { passive: true });
}

// Panggung galeri dan kartu kontak muncul halus sekali saat masuk viewport.
export function initMuncul() {
  if (!bisaGerak()) return;
  const sasaran = document.querySelectorAll(".gallery-stage, .contact-card, .map-card, .step-card");
  if (!sasaran.length) return;

  if (!("IntersectionObserver" in globalThis)) {
    document.body.classList.add("bisa-animasi");
    sasaran.forEach((elemen) => {
      elemen.classList.add("is-muncul");
    });
    return;
  }

  const pengamat = new IntersectionObserver((entri) => {
    entri.forEach((butir) => {
      if (!butir.isIntersecting) return;
      butir.target.classList.add("is-muncul");
      pengamat.unobserve(butir.target);
    });
  }, { threshold: 0.12 });

  document.body.classList.add("bisa-animasi");
  sasaran.forEach((elemen) => {
    pengamat.observe(elemen);
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
initChrome();
initMuncul();
initNavigasi();

const slug = new URLSearchParams(globalThis.location?.search ?? "").get("p");
if (slug) {
  const { initDetail } = await import("./detail.js");
  initDetail(slug);
} else if (document.querySelector("[data-catalog]")) {
  const { initCatalog } = await import("./catalog.js");
  document.querySelectorAll("[data-catalog]").forEach((bagian) => {
    initCatalog(bagian);
  });
}

initPromo();
initKontenTambahan();
initGalleryZoom();
initFlacon();
initVideoText();
