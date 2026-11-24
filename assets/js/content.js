import { CONFIG } from "./config.js";
import { ILUSTRASI } from "./illustrations.js";
import { bisaGerak } from "./motion-ui.js";

function buat(tag, kelas, teks) {
  const elemen = document.createElement(tag);
  if (kelas) elemen.className = kelas;
  if (teks !== undefined) elemen.textContent = teks;
  return elemen;
}

function gambar(item) {
  const elemen = document.createElement("img");
  elemen.src = item.src;
  elemen.alt = item.alt ?? "";
  elemen.width = item.width;
  elemen.height = item.height;
  elemen.loading = "lazy";
  elemen.decoding = "async";
  return elemen;
}

// Ilustrasi unDraw disimpan lokal dan sudah berisi token warna Arie Parfum.
function ilustrasi(item) {
  const mentah = ILUSTRASI[item.illustration ?? ""];
  const pengganti = () => buat("span", "gallery-placeholder", item.label ?? "Contoh");
  if (!mentah) return pengganti();

  const dokumen = new DOMParser().parseFromString(mentah, "image/svg+xml");
  if (dokumen.querySelector("parsererror")) return pengganti();
  const elemen = document.importNode(dokumen.documentElement, true);
  elemen.setAttribute("role", "img");
  elemen.setAttribute("aria-label", item.alt ?? "Ilustrasi contoh");
  elemen.setAttribute("width", "120");
  elemen.setAttribute("height", "120");
  elemen.setAttribute("focusable", "false");
  return elemen;
}

function media(item) {
  return item.src ? gambar(item) : ilustrasi(item);
}

// Dial setengah lingkaran: arc 180°, kartu tegak, busur membalik ke bawah.
function initGaleriRing(galeri, data, cincin) {
  const kendali = galeri.querySelector("[data-galeri-kendali]");
  const status = galeri.querySelector("[data-galeri-status]");
  const jumlah = data.length;
  const langkah = 180 / Math.max(jumlah - 1, 1);

  const kartu = data.map((item) => {
    const baris = buat("li", "gallery-card is-tampak");
    const tombol = buat("button", "gallery-trigger");
    tombol.type = "button";
    tombol.setAttribute("aria-label", `Perbesar ${item.alt ?? "ilustrasi contoh"}`);
    tombol.append(media(item));
    baris.append(tombol, buat("span", "gallery-label", item.label ?? "Contoh"));
    return baris;
  });
  cincin.append(...kartu);

  let fokus = 0;
  let lebar = cincin.clientWidth;
  let tinggi = cincin.clientHeight;

  // Semua posisi memakai transform, sehingga pergantian fokus tetap di GPU.
  const tata = () => {
    lebar = cincin.clientWidth || lebar;
    tinggi = cincin.clientHeight || tinggi;
    kartu.forEach((baris, indeks) => {
      let jarak = indeks - fokus;
      if (jarak > jumlah / 2) jarak -= jumlah;
      if (jarak < -jumlah / 2) jarak += jumlah;
      const rad = (jarak * langkah * Math.PI) / 180;
      const x = Math.sin(rad) * lebar * 0.27;
      const y = (1 - Math.cos(rad)) * tinggi * 0.18;
      const skala = 1.06 - Math.abs(jarak) * 0.17;
      const miring = -jarak * 11;
      const miringZ = jarak * -3;
      baris.style.transform = `translate3d(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%), 0) rotateZ(${miringZ}deg) rotateY(${miring}deg) scale(${skala.toFixed(2)})`;
      baris.style.opacity = (1 - Math.abs(jarak) * 0.14).toFixed(2);
      baris.style.zIndex = String(10 - Math.abs(jarak));
      baris.classList.toggle("is-utama", jarak === 0);
    });
    if (status) status.textContent = `Foto ${fokus + 1} dari ${jumlah}`;
  };

  if (!bisaGerak()) {
    cincin.classList.add("tanpa-gerak");
    cincin.removeAttribute("tabindex");
    if (kendali) kendali.hidden = true;
    if (status) status.textContent = `Foto 1 dari ${jumlah}`;
    return;
  }

  tata();
  cincin.classList.add("is-animasi");
  if ("ResizeObserver" in globalThis) {
    new ResizeObserver(tata).observe(cincin);
  } else {
    globalThis.addEventListener("resize", tata);
  }
  const geserFokus = (arah) => {
    fokus = ((fokus + arah) % jumlah + jumlah) % jumlah;
    tata();
  };

  kendali?.querySelectorAll("[data-galeri-putar]").forEach((tombol) => {
    tombol.addEventListener("click", () => geserFokus(Number(tombol.dataset.galeriPutar) || 1));
  });
  cincin.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      geserFokus(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      geserFokus(1);
    }
  });

  let awalX = 0;
  let menyeret = false;
  const hentikanSeret = () => {
    menyeret = false;
    cincin.classList.remove("is-menyeret");
    globalThis.removeEventListener("pointerup", selesaiSeret);
    globalThis.removeEventListener("pointercancel", hentikanSeret);
  };
  cincin.addEventListener("pointerdown", (event) => {
    menyeret = true;
    awalX = event.clientX;
    cincin.classList.add("is-menyeret");
    globalThis.addEventListener("pointerup", selesaiSeret, { once: true });
    globalThis.addEventListener("pointercancel", hentikanSeret, { once: true });
  });
  function selesaiSeret(event) {
    if (!menyeret) return;
    hentikanSeret();
    const jarak = event.clientX - awalX;
    if (Math.abs(jarak) > Math.min(cincin.getBoundingClientRect().width / 6, 48)) {
      geserFokus(jarak < 0 ? 1 : -1);
    }
  }
}

// Tentang, galeri, dan testimoni hanya tampil bila datanya memang ada.
export function initKontenTambahan() {
  const tentang = document.querySelector("[data-tentang]");
  const cerita = CONFIG.business.about?.trim?.();
  if (tentang && cerita) {
    const isi = tentang.querySelector("[data-tentang-isi]");
    if (isi) isi.textContent = cerita;
    tentang.hidden = false;
  }

  const galeri = document.querySelector("[data-galeri]");
  const foto = CONFIG.business.gallery;
  if (galeri && CONFIG.features.gallery && Array.isArray(foto) && foto.length) {
    const grid = galeri.querySelector("[data-galeri-grid]");
    if (grid) initGaleriRing(galeri, foto, grid);
    galeri.hidden = false;
  }

  const testimoni = document.querySelector("[data-testimoni]");
  const kutipan = CONFIG.business.testimonials;
  if (testimoni && CONFIG.features.testimonials && Array.isArray(kutipan) && kutipan.length) {
    const grid = testimoni.querySelector("[data-testimoni-grid]");
    kutipan.forEach((item) => {
      const baris = buat("li");
      baris.append(buat("blockquote", undefined, item.quote ?? ""));
      if (item.author) baris.append(buat("cite", undefined, item.author));
      grid?.append(baris);
    });
    testimoni.hidden = false;
  }
}
