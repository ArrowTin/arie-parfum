import { CONFIG } from "./config.js";

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
    foto.forEach((item) => {
      const baris = buat("li");
      baris.append(gambar(item));
      grid?.append(baris);
    });
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
