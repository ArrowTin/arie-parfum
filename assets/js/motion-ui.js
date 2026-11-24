// Pembungkus Motion v14.14.0 (MIT): dimuat hanya saat gerak diizinkan.
const SUMBER = new URL("./vendor/motion.min.js", import.meta.url).href;
let janjiMotion = null;

export function bisaGerak() {
  const media = globalThis.matchMedia;
  if (media?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (globalThis.navigator?.connection?.saveData) return false;
  return true;
}

// Memuat Motion sekali saja; mengembalikan null bila tidak tersedia.
export function muatMotion() {
  if (!bisaGerak()) return Promise.resolve(null);
  if (globalThis.Motion) return Promise.resolve(globalThis.Motion);
  if (typeof document === "undefined") return Promise.resolve(null);

  if (!janjiMotion) {
    janjiMotion = new Promise((selesai, gagal) => {
      const skrip = document.createElement("script");
      skrip.src = SUMBER;
      skrip.async = true;
      skrip.onload = selesai;
      skrip.onerror = gagal;
      document.head.append(skrip);
    })
      .then(() => globalThis.Motion ?? null)
      .catch(() => null);
  }

  return janjiMotion;
}
