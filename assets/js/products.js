const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STOK = new Set(["ready", "habis", "preorder"]);
const BADGE = new Set(["terlaris", "baru", "promo"]);

// Validasi katalog dipakai loader browser dan skrip CLI.
export function validateCatalog(data) {
  const kesalahan = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["katalog harus berupa objek"];
  }
  if (data.version !== 1) kesalahan.push("version harus 1");
  if (!Array.isArray(data.categories)) kesalahan.push("categories harus berupa array");
  if (!Array.isArray(data.products)) kesalahan.push("products harus berupa array");
  if (kesalahan.length) return kesalahan;

  const ids = new Set();
  const slugKategori = new Set();
  data.categories.forEach((kategori, indeks) => {
    const label = `categories[${indeks}]`;
    if (!kategori || typeof kategori !== "object") {
      kesalahan.push(`${label} bukan objek`);
      return;
    }
    if (typeof kategori.id !== "string" || !kategori.id) kesalahan.push(`${label}.id wajib`);
    if (typeof kategori.name !== "string" || !kategori.name) kesalahan.push(`${label}.name wajib`);
    if (!SLUG.test(kategori.slug ?? "")) kesalahan.push(`${label}.slug tidak valid`);
    if (ids.has(kategori.id)) kesalahan.push(`${label}.id duplikat`);
    if (slugKategori.has(kategori.slug)) kesalahan.push(`${label}.slug duplikat`);
    ids.add(kategori.id);
    slugKategori.add(kategori.slug);
  });

  const idProduk = new Set();
  const slugProduk = new Set();
  data.products.forEach((produk, indeks) => {
    const label = `products[${indeks}]`;
    if (!produk || typeof produk !== "object") {
      kesalahan.push(`${label} bukan objek`);
      return;
    }
    if (typeof produk.id !== "string" || !produk.id) kesalahan.push(`${label}.id wajib`);
    if (idProduk.has(produk.id)) kesalahan.push(`${label}.id duplikat`);
    idProduk.add(produk.id);
    if (!SLUG.test(produk.slug ?? "")) kesalahan.push(`${label}.slug tidak valid`);
    if (slugProduk.has(produk.slug)) kesalahan.push(`${label}.slug duplikat`);
    slugProduk.add(produk.slug);
    if (typeof produk.name !== "string" || !produk.name) kesalahan.push(`${label}.name wajib`);
    if (!ids.has(produk.categoryId)) kesalahan.push(`${label}.categoryId tidak dikenal`);
    if (!Array.isArray(produk.sizesMl) || !produk.sizesMl.length ||
        produk.sizesMl.some((ukuran) => !Number.isFinite(ukuran) || ukuran <= 0)) {
      kesalahan.push(`${label}.sizesMl harus berisi angka positif`);
    }
    if (produk.price !== null && (!Number.isInteger(produk.price) || produk.price < 0)) {
      kesalahan.push(`${label}.price harus null atau bilangan bulat`);
    }
    if (!STOK.has(produk.stock)) kesalahan.push(`${label}.stock tidak valid`);
    if (!Array.isArray(produk.badges) || produk.badges.some((badge) => !BADGE.has(badge))) {
      kesalahan.push(`${label}.badges tidak valid`);
    }
    const catatan = produk.notes;
    if (!catatan || ["top", "middle", "base"].some((kunci) => !Array.isArray(catatan[kunci]))) {
      kesalahan.push(`${label}.notes tidak valid`);
    }
    if (!Array.isArray(produk.images) || produk.images.some((gambar) =>
      !gambar || typeof gambar.src !== "string" || !gambar.src.endsWith(".webp") ||
      typeof gambar.alt !== "string" || !Number.isFinite(gambar.width) || !Number.isFinite(gambar.height))) {
      kesalahan.push(`${label}.images tidak valid`);
    }
    if (typeof produk.isSample !== "boolean") kesalahan.push(`${label}.isSample wajib boolean`);
    if (produk.name?.startsWith("Contoh") && produk.isSample !== true) {
      kesalahan.push(`${label} berlabel "Contoh" wajib isSample: true`);
    }
  });

  return kesalahan;
}

// Muat katalog dari JSON, buang produk tidak aktif.
export async function loadProducts(url = "data/products.json") {
  const respons = await fetch(url);
  if (!respons.ok) throw new Error(`Gagal memuat katalog: ${respons.status}`);
  const data = await respons.json();
  const kesalahan = validateCatalog(data);
  if (kesalahan.length) throw new Error(`Data katalog tidak valid: ${kesalahan.join("; ")}`);
  const categories = [...data.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const products = data.products.filter((produk) => produk.active !== false);
  return { categories, products };
}

// Filter murni: pencarian nama/deskripsi/notes, kategori, dan badge.
export function filterProducts(products, { q = "", categoryId = "", badge = "" } = {}) {
  const kata = String(q).trim().toLocaleLowerCase("id-ID");
  return products.filter((produk) => {
    if (produk.active === false) return false;
    if (categoryId && produk.categoryId !== categoryId) return false;
    if (badge && !produk.badges?.includes(badge)) return false;
    if (!kata) return true;
    const teks = [produk.name, produk.description, ...Object.values(produk.notes ?? {}).flat()]
      .join(" ")
      .toLocaleLowerCase("id-ID");
    return teks.includes(kata);
  });
}

export function getBySlug(products, slug) {
  return products.find((produk) => produk.slug === slug && produk.active !== false) ?? null;
}
