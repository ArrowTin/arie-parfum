import { CONFIG } from "./config.js";
import { ILUSTRASI } from "./illustrations.js";
import { bisaGerak, muatMotion } from "./motion-ui.js";

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

function indeksAktif(sudut, jumlah) {
  const langkah = 360 / jumlah;
  return ((Math.round(-sudut / langkah) % jumlah) + jumlah) % jumlah;
}

function sudutWajar(sudut) {
  return ((sudut + 180) % 360 + 360) % 360 - 180;
}

// Cincin radial: drag horizontal, panah, atau tombol; Motion dipakai bila diizinkan.
function initGaleriRing(galeri, data, cincin) {
  const kendali = galeri.querySelector("[data-galeri-kendali]");
  const status = galeri.querySelector("[data-galeri-status]");
  const jumlah = data.length;
  const langkah = 360 / jumlah;

  const kartu = data.map((item, indeks) => {
    const baris = buat("li", "gallery-card");
    const rad = ((-90 + indeks * langkah) * Math.PI) / 180;
    baris.style.setProperty("--x", `${(Math.cos(rad) * 30).toFixed(2)}%`);
    baris.style.setProperty("--y", `${(Math.sin(rad) * 15).toFixed(2)}%`);
    baris.append(media(item), buat("span", "gallery-label", item.label ?? "Contoh"));
    return baris;
  });
  cincin.append(...kartu);

  let sudutSekarang = 0;
  const perbaruiTampilan = () => {
    kartu.forEach((baris, indeks) => {
      const sudut = sudutWajar(-90 + indeks * langkah + sudutSekarang);
      const tampak = sudut >= -180 && sudut <= 0;
      baris.classList.toggle("is-tampak", tampak);
      baris.inert = !tampak;
    });
    if (status) status.textContent = `Ilustrasi ${indeksAktif(sudutSekarang, jumlah) + 1} dari ${jumlah}`;
  };
  perbaruiTampilan();

  const pakaiStatic = () => {
    cincin.classList.add("tanpa-gerak");
    cincin.removeAttribute("tabindex");
    if (kendali) kendali.hidden = true;
  };
  if (!bisaGerak()) {
    pakaiStatic();
    return;
  }

  muatMotion().then((pustaka) => {
    if (!pustaka?.animate) {
      pakaiStatic();
      return;
    }
    const { animate, stagger } = pustaka;
    animate(kartu, { scale: [0.86, 1] }, {
      duration: 0.5,
      delay: stagger(0.08),
      ease: "easeOut",
    });

    const putarKe = (tujuan, durasi = 0.5) => {
      sudutSekarang = tujuan;
      animate(cincin, { rotate: tujuan }, { duration: durasi, ease: "easeInOut" });
      animate(kartu, { rotate: -tujuan }, { duration: durasi, ease: "easeInOut" });
      perbaruiTampilan();
    };
    const putar = (arah) =>
      putarKe(Math.round(sudutSekarang / langkah) * langkah + arah * langkah);

    kendali?.querySelectorAll("[data-galeri-putar]").forEach((tombol) => {
      tombol.addEventListener("click", () => putar(Number(tombol.dataset.galeriPutar) || 1));
    });
    cincin.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        putar(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        putar(1);
      }
    });

    let awalX = 0;
    let awalSudut = 0;
    let menyeret = false;
    cincin.addEventListener("pointerdown", (event) => {
      menyeret = true;
      awalX = event.clientX;
      awalSudut = sudutSekarang;
      cincin.setPointerCapture?.(event.pointerId);
    });
    cincin.addEventListener("pointermove", (event) => {
      if (!menyeret) return;
      const lebar = cincin.getBoundingClientRect().width || 1;
      sudutSekarang = awalSudut + ((event.clientX - awalX) / lebar) * 180;
      cincin.style.transform = `rotate(${sudutSekarang}deg)`;
      kartu.forEach((baris) => {
        baris.style.transform = `rotate(${-sudutSekarang}deg)`;
      });
      perbaruiTampilan();
    });
    const selesai = () => {
      if (!menyeret) return;
      menyeret = false;
      putarKe(Math.round(sudutSekarang / langkah) * langkah);
    };
    cincin.addEventListener("pointerup", selesai);
    cincin.addEventListener("pointercancel", selesai);
  });
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
