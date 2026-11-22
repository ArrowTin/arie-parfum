import { formatHarga, NAMA_STOK } from "./catalog.js";
import { filterProducts, getBySlug, loadProducts } from "./products.js";
import { buildWaLink, productInquiryLink } from "./whatsapp.js";

const NAMA_BADGE = { terlaris: "Terlaris", baru: "Baru", promo: "Promo" };
const NAMA_CATATAN = { top: "Top", middle: "Middle", base: "Base" };

function buat(tag, kelas, teks) {
  const elemen = document.createElement(tag);
  if (kelas) elemen.className = kelas;
  if (teks !== undefined) elemen.textContent = teks;
  return elemen;
}

function tautanEksternal(teks, href, kelas) {
  const elemen = buat("a", kelas, teks);
  elemen.href = href;
  elemen.target = "_blank";
  elemen.rel = "noopener noreferrer";
  return elemen;
}

function tambahGambar(wadah, produk) {
  if (!produk.images?.length) return;
  const galeri = buat("div", "detail-gallery");
  produk.images.forEach((gambar) => {
    const elemen = document.createElement("img");
    elemen.src = gambar.src;
    elemen.alt = gambar.alt;
    elemen.width = gambar.width;
    elemen.height = gambar.height;
    elemen.loading = "lazy";
    elemen.decoding = "async";
    galeri.append(elemen);
  });
  wadah.append(galeri);
}

function tambahCatatan(wadah, produk) {
  const catatan = produk.notes ?? {};
  const isi = Object.entries(catatan).filter(([, nilai]) => nilai.length);
  if (!isi.length) return;
  const daftar = buat("dl", "detail-notes");
  isi.forEach(([kunci, nilai]) => {
    daftar.append(buat("dt", undefined, NAMA_CATATAN[kunci] ?? kunci));
    daftar.append(buat("dd", undefined, nilai.join(", ")));
  });
  wadah.append(daftar);
}

function tidakDitemukan(wadah) {
  wadah.replaceChildren();
  wadah.append(buat("h2", undefined, "Produk tidak ditemukan"));
  wadah.append(buat("p", undefined,
    "Produk tidak ditemukan. Lihat semua produk atau tanya via WhatsApp."));
  const aksi = buat("div", "detail-actions");
  const semua = buat("a", "btn btn-outline", "Lihat semua produk");
  semua.href = "produk.html";
  aksi.append(semua, tautanEksternal("Tanya via WhatsApp", buildWaLink(), "btn btn-accent"));
  wadah.append(aksi);
}

function tampilkanProduk(wadah, produk, semuaProduk) {
  wadah.replaceChildren();

  const jejak = buat("nav", "detail-crumb");
  const kembali = buat("a", undefined, "Katalog");
  kembali.href = "produk.html";
  jejak.append(kembali, buat("span", undefined, "/"), buat("span", undefined, produk.name));
  wadah.append(jejak);

  tambahGambar(wadah, produk);

  const isi = buat("div", "detail-body");
  if (produk.isSample) isi.append(buat("span", "product-badge", "Contoh"));
  if (produk.badges?.length) {
    const label = buat("div", "product-badges");
    produk.badges.forEach((badge) => label.append(buat("span", "product-badge", NAMA_BADGE[badge] ?? badge)));
    isi.append(label);
  }
  isi.append(buat("p", "detail-desc", produk.description ?? ""));
  tambahCatatan(isi, produk);
  isi.append(buat("p", "product-price", formatHarga(produk)));
  isi.append(buat("p", "product-meta", `Stok: ${NAMA_STOK[produk.stock] ?? produk.stock}`));

  const pilihan = buat("div", "field");
  const labelUkuran = buat("label", undefined, "Pilih ukuran");
  labelUkuran.htmlFor = `ukuran-${produk.id}`;
  const ukuran = document.createElement("select");
  ukuran.id = `ukuran-${produk.id}`;
  produk.sizesMl.forEach((nilai) => {
    const opsi = document.createElement("option");
    opsi.value = String(nilai);
    opsi.textContent = `${nilai} ml`;
    ukuran.append(opsi);
  });
  pilihan.append(labelUkuran, ukuran);
  isi.append(pilihan);

  const wa = tautanEksternal("Tanya / pesan via WA", "", "btn btn-accent");
  const perbaruiTautan = () => {
    wa.href = productInquiryLink(produk, Number(ukuran.value) || produk.sizesMl[0]);
  };
  ukuran.addEventListener("change", perbaruiTautan);
  perbaruiTautan();
  isi.append(wa);
  wadah.append(isi);

  const terkait = filterProducts(semuaProduk, { categoryId: produk.categoryId })
    .filter((item) => item.id !== produk.id)
    .slice(0, 3);
  if (terkait.length) {
    wadah.append(buat("h2", "section-title", "Produk terkait"));
    const daftar = buat("ul", "detail-related");
    terkait.forEach((item) => {
      const baris = buat("li");
      const tautan = buat("a", undefined, `${item.name} — ${formatHarga(item)}`);
      tautan.href = `produk.html?p=${encodeURIComponent(item.slug)}`;
      baris.append(tautan);
      daftar.append(baris);
    });
    wadah.append(daftar);
  }
}

// Detail diaktifkan bila URL memakai ?p=<slug>.
export async function initDetail(slug) {
  const wadah = document.querySelector("[data-detail]");
  if (!wadah || !slug) return;

  document.querySelectorAll(
    "[data-catalog-filter], [data-catalog-grid], [data-catalog-empty], [data-catalog-intro]"
  ).forEach((elemen) => { elemen.hidden = true; });
  wadah.hidden = false;

  try {
    const { products } = await loadProducts();
    const produk = getBySlug(products, slug);
    if (!produk) {
      tidakDitemukan(wadah);
      return;
    }
    const judul = document.querySelector("[data-page-judul]");
    if (judul) judul.textContent = produk.name;
    tampilkanProduk(wadah, produk, products);
  } catch {
    tidakDitemukan(wadah);
  }
}
