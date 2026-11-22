import { CONFIG } from "./config.js";

// Bangun tautan WA; nomor selalu diambil dari config.js.
export function buildWaLink(text = CONFIG.wa.general) {
  const base = `https://wa.me/${CONFIG.business.waNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Pesan produk memakai template config.js dan ukuran pertama bila tidak ditentukan.
export function productInquiryLink(product, sizeMl) {
  const nama = product?.name ?? "";
  const ukuran = sizeMl ?? product?.sizesMl?.[0] ?? "";
  // Replacer fungsi mencegah pola seperti "$&" pada nama mengubah template.
  const pesan = CONFIG.wa.product
    .replace("{nama}", () => nama)
    .replace("{ukuran}", () => String(ukuran));
  return buildWaLink(pesan);
}
