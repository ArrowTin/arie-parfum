# Arie Parfum — Panduan Pemilik

Situs statis portofolio + katalog parfum. Pesan masuk lewat WhatsApp; tidak ada backend, formulir, atau database.

## 1. Fakta yang sudah dipakai

- Nama: Arie Parfum — Toko Parfum
- Alamat: RFGM+675, Jl. Perwira, Malo Jelayan, Kec. Bengkayang, Kab. Bengkayang, Kalimantan Barat 79211
- Telepon/WA: 0823-5306-6305 (nomor hanya disimpan di `assets/js/config.js`)
- Peta: tautan Google Maps di `assets/js/config.js`

## 2. Cara mengubah data usaha

Edit `assets/js/config.js`:

- `business.name`, `business.category`, `business.address`, `business.phoneDisplay`, `business.waNumber`, `business.mapsUrl`.
- `business.hours.is24h`: mengontrol badge "Buka 24 Jam". Data ini masih perlu dikonfirmasi; teks di situs sudah mengajak pembeli memastikan lewat WhatsApp.
- `features.showPrices`: `false` membuat semua harga tampil sebagai "Tanya harga".
- `features.promo`, `features.gallery`, `features.testimonials`: seksi terkait hanya muncul bila bernilai `true` **dan** datanya diisi.
- `wa.general` dan `wa.product`: template pesan WhatsApp. Jangan memakai HTML di sini.

Setelah mengubah config, jalankan `npm test` lalu commit perubahan.

## 3. Cara menambah atau mengubah produk

1. Siapkan foto WebP (sisi terpanjang ≤ 1200 px, ≤ 150 KB bila mungkin) dan simpan di `assets/img/`.
2. Edit `data/products.json`. Salin struktur produk yang ada, lalu isi:
   - `id` unik, `slug` huruf kecil + tanda hubung, `categoryId` harus ada di `categories`.
   - `sizesMl` berisi angka, misal `[30, 60]`.
   - `price`: `null` untuk "Tanya harga", atau angka rupiah bulat hanya bila harga sudah disepakati.
   - `stock`: `ready`, `habis`, atau `preorder`.
   - `badges`: `terlaris`, `baru`, atau `promo` (kosongkan bila tidak ada).
   - `images`: tiap entri butuh `src`, `alt`, `width`, `height`.
   - `isSample: true` untuk data contoh; situs akan menampilkan label "Contoh".
   - `active: false` menyembunyikan produk tanpa menghapus datanya.
3. Jalankan `node scripts/validate-data.mjs`. Validator harus lolos sebelum commit.
4. Link detail produk memakai `produk.html?p=<slug>`.

Data contoh saat ini semuanya berlabel "Contoh", belum memiliki foto, dan belum memakai harga — jangan ditampilkan sebagai data asli sebelum diedit.

## 4. Cara menyalakan promo, galeri, dan testimoni

- Promo: set `features.promo: true`, lalu beri badge `promo` pada produk yang ingin ditampilkan.
- Galeri: isi `business.gallery` dengan `{ "src", "alt", "width", "height" }`, lalu set `features.gallery: true`.
- Testimoni: isi `business.testimonials` dengan `{ "quote", "author" }` **hanya dengan izin**, lalu set `features.testimonials: true`.

Jangan menambahkan klaim "original", antar/COD, ongkir, sertifikasi, atau testimoni tanpa konfirmasi pemilik.

## 5. Uji sebelum unggah

```bash
npm test
node scripts/validate-data.mjs
```

Periksa juga di ponsel: tautan WhatsApp, rute Google Maps, tombol telepon, filter/cari katalog, dan halaman detail. Lighthouse sebaiknya dijalankan di hosting karena alat browser tidak tersedia di lingkungan pengembangan.

## 6. Deploy (membutuhkan keputusan pemilik)

Deploy dan pemilihan domain **tidak dilakukan oleh agent** tanpa persetujuan. Langkah saat pemilik siap:

1. Pilih hosting statis (GitHub Pages, Netlify, atau Cloudflare Pages) dan domain/HTTPS.
2. Unggah hanya berkas publik: `index.html`, `produk.html`, `404.html`, `assets/`, `data/`, `sitemap.xml`, `robots.txt`, `README.md`.
3. **Jangan** unggah `AGENTS.md`, `APPROVALS.md`, `PROJECT_SPEC.md`, `TASKS.md`, `PROGRESS.md`, `docs/`, `_PANDUAN-PENGGUNA/`, `design-system/`, `opencode.json`, `.opencode/`, `.claude/`, `package.json`, `tests/`, `scripts/`.
4. Ganti `https://example.com/` di `sitemap.xml` dan `robots.txt` dengan domain final. `canonical` dan `og:url` di halaman akan terisi otomatis dari alamat situs saat halaman dibuka.
5. Aktifkan HTTPS, lalu uji ulang WhatsApp, peta, telepon, dan SEO.
6. Daftarkan sitemap ke Google Search Console dan lengkapi Google Business Profile.

Header hosting yang disarankan: `Content-Security-Policy` (izinkan font Google), `Referrer-Policy`, `X-Content-Type-Options: nosniff`, dan `Permissions-Policy`.

## 7. Yang belum dikonfirmasi

Jam 24 jam, merek/harga asli, status original/racikan/refill, antar/COD/ongkir, foto toko & produk, akun media sosial, domain final, testimoni, dan cerita toko. Semua sengaja tidak ditampilkan sebagai fakta.

Kontak pengembang diserahkan lewat kanal yang disepakati, bukan disimpan di repositori.
