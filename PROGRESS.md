# PROGRESS.md — Arie Parfum

Entri terbaru di atas, format 3 baris: `### [tanggal] Txx — judul (STATUS)` / hasil + verifikasi / commit & catatan.

### [2026-11-24] T24 — Chrome navbar & footer ala Dylan (DONE)
Riset: stack vanilla + Motion lokal dipertahankan; ui-ux-pro-max memilih Liquid Glass, Cormorant/Montserrat, palet existing. Rencana: bidang cahaya → kaca bingkai Dylan → konten; budget gerak hover/fokus + scroll, signature moment VideoText menyusul T25.
Header/footer memakai panel inset + blob cahaya ala Dylan (Uiverse MIT, lisensi diperbarui), nav/CTA berkilau dan responsif scroll; verifikasi npm test 27/27, biome lint bersih, 360/1280px tanpa scroll horizontal, konsol bersih, axe WCAG A/AA bersih.
Commit 7ea58be — push menyusul.

### [2026-11-24] T23 — Integrasi & QA akhir (DONE)
QA browser nyata via Playwright/Chromium: 360px & 1280px pada index/produk/404 tanpa scroll horizontal, tanpa error/warning konsol, WCAG A/AA (axe) bersih, tautan WA/rute/telepon berfungsi, `rel` eksternal lengkap, tab/fokus terlihat, flip keyboard dan cincin ArrowRight berfungsi; reduced-motion memakai fallback grid.
Perbaikan: sisi flip tersembunyi diberi `inert` agar tidak lagi masuk urutan fokus; npm test 26/26, CSS valid, lint bersih; beranda ≈379 KB (<1 MB). Lighthouse tidak dijalankan (task tidak meminta tool berat); angka Lighthouse belum diukur.
Commit 8e6d599 — push origin/master berhasil. Semua task T00–T23 DONE.

### [2026-11-24] T22 — Galeri ring dengan Motion (DONE)
`features.gallery` mengaktifkan galeri berisi 4 ilustrasi unDraw lokal berlabel "Contoh"; SVG diwarnai ulang memakai token dan disisipkan lewat DOMParser (bukan innerHTML) dengan `role="img"`, `aria-label`, `width`, `height`.
Cincin radial diputar lewat drag horizontal, tombol panah, dan ArrowLeft/ArrowRight; Motion memakai `animate` + `stagger` untuk masuk dan rotasi; fallback grid statis aktif saat reduced-motion/save-data/Motion gagal.
Verifikasi: npm test 26/26, CSS valid, biome lint bersih; commit ab73919 — push origin/master berhasil.

### [2026-11-24] T21 — Variasi tombol Uiverse (DONE)
Tiga varian dari Uiverse (MIT, atribusi di `assets/css/UIVERSE-LICENSE.md`) disesuaikan ke token: `btn-wa` gradien aksen + edge light, `btn-route` kubus label "Lihat rute"→"Buka peta", `btn-card` kilau radial untuk CTA kartu.
Verifikasi: npm test 24/24, CSS valid, tidak ada warna literal pada CSS, biome lint bersih.
Commit 24c2382 — push origin/master berhasil.

### [2026-11-24] T20 — Flip card katalog (DONE)
Kartu produk kini flip card CSS 3D: depan hanya ikon botol SVG berwarna token (atau foto dari `images`) + judul, belakang kategori, ukuran, stok, badge/"Contoh", dan CTA WA; flip via tombol dengan `aria-expanded`/`aria-hidden` serta fokus berpindah ke sisi aktif.
Verifikasi: npm test 23/23, CSS valid, jsdom flip depan→belakang→depan dengan atribut ARIA benar, biome lint bersih; ilustrasi unDraw disiapkan lokal untuk galeri T22.
Commit 9f81a07 — push origin/master berhasil.

### [2026-11-24] T19 — Tutup botol berputar & aroma (DONE)
Flacon jadi tombol aksesibel (`aria-pressed`, label, status `aria-live`); klik/Enter memutar tutup 180°, empat tetes aroma naik dari mulut botol via Motion `animate` + `stagger`, klik lagi memasang tutup; fallback CSS statis bila Motion tidak tersedia.
Verifikasi: npm test 22/22, CSS valid, jsdom buka→tutup 4 panggilan animasi & reduced-motion 0 animasi dengan status tetap terbaca; biome lint bersih.
Commit be0ae52 — push origin/master berhasil.

### [2026-11-24] T18 — Fondasi Motion & gerak aman (DONE)
Motion v14.14.0 di-vendor lokal (`assets/js/vendor/motion.min.js`, MIT) dan dimuat malas lewat `muatMotion()`; `bisaGerak()` memblokir reduced-motion/save-data tanpa CDN atau build.
Verifikasi: npm test 21/21 (tambahan tes pembungkus), uji Node `bisaGerak()` false pada reduced-motion & saveData, biome lint pada dua berkas bersih.
Commit ad1c306 — push origin/master berhasil.

### [2026-11-24] T17 — Refresh frontend glass-motion (DONE)
Palet hangat (#FAF7F1/#7A4A06/#E7BE73), kaca blur 12px pada header, panel hero, menu, dan flacon dengan medan cahaya amber; momen ikonik flacon memakai tilt pointer + sapuan kilau 700ms, reveal per seksi T16 dilepas.
Verifikasi: npm test 20/20, CSS divalidasi lightningcss, jsdom tilt 3deg→reset serta reduced-motion tanpa tilt; Playwright gagal (libatk-1.0 tidak ada), Biome punya 21 error bawaan (href="#" yang diisi runtime & formatter tab) sehingga tidak dijadikan gate; scroll 360/1280 belum teramati visual.
Commit 3e45ed5 — push origin/master berhasil.

### [2026-11-22] T16 — Gerak halus Fase 2 (DONE)
Transisi ringan: tombol saat ditekan, hover kartu produk (shadow/border), FAQ saat dibuka, dan fade-in seksi via IntersectionObserver. Hero sengaja dikecualikan agar LCP tidak tertunda; skeleton tidak ditambahkan agar tidak menimbulkan CLS.
Verifikasi: simulasi reduced-motion true → tidak ada kelas reveal; normal → reveal + is-visible; CSS token bersih; total aset 92 KB; npm test 20/20; konsol statis bersih. Lighthouse tetap tidak tersedia.
Commit f8ac281 — push origin/master berhasil.

### [2026-11-22] T15 — Panduan deploy & serah terima (DONE)
`README.md` berisi data usaha, cara edit config/produk/galeri/testimoni, uji sebelum unggah, daftar berkas publik vs internal, header hosting, dan daftar hal yang belum dikonfirmasi. Deploy tetap Batas Mutlak. Halaman `404.html` ditambahkan agar bukan 404 bawaan hosting.
Verifikasi: npm test 19/19 (404 ikut dicek SEO/h1), ownership gate OK, token & tautan bersih; placeholder `example.com` di sitemap/robots diberi petunjuk penggantian saat deploy.
Commit 51e08ab — push origin/master berhasil.

### [2026-11-22] T14 — QA + audit keamanan (DONE)
Tinjauan independen: qa-tester diganti agen umum karena model default tidak tersedia; security-auditor read-only. Keduanya melapor DONE; gate `check-ownership.mjs be-dev qa-tester security-auditor` → OK setelah perbaikan `whatsapp.js` oleh pm (globs ownership memerlukan be-dev disertakan).
Verifikasi pm: npm test 18/18, validator lulus, sitemap/robots/SEO/token/rel bersih, kontras ≥4.5:1, beranda <1 MB. Temuan rendah `$&` pada template WA diperbaiki dengan replacer fungsi + tes. Tidak ada temuan tinggi/secret/XSS.
Belum terukur jujur: Lighthouse/Chromium, scroll visual 360/1280px, konsol browser, keyboard langsung, WA Android/iOS, ponsel nyata; produk contoh belum punya foto (tidak ada `<img>` tanpa alt).
Commit c6b9d10 — push origin/master berhasil.

### [2026-11-22] T13 — Performa & aksesibilitas (DONE)
Total aset teks beranda 108 KB (< 1 MB); tanpa pustaka/animasi berat; font `display=swap`; tidak ada `innerHTML`/`eval`; tidak ada emoji sebagai ikon; semua tautan eksternal ber-`rel`.
Verifikasi kontras: teks/background 18.9:1, muted 7.3:1, putih/aksen 4.9:1, aksen/background 4.7:1 (semua ≥4.5:1); 13 pemakaian target sentuh 48px; reduced-motion & focus-visible ada; 360px aman secara statis. Lighthouse tidak tersedia (paket tidak terpasang & tidak ada browser headless), sehingga skor tidak diklaim — perlu dijalankan pemilik di hosting.
Commit 4c735a7 — commit kosong untuk catatan audit; push origin/master berhasil.

### [2026-11-22] T12 — SEO teknis (DONE)
Meta description 69/77 karakter, 6 tag OG + Twitter Card, favicon SVG; canonical/og:url & JSON-LD `Store` diisi dari config saat runtime (placeholder `https://example.com/` di HTML/XML diberi label "Contoh", diganti otomatis di situs live); sitemap.xml + robots.txt dibuat.
Verifikasi: XML sitemap ter-parse (2 URL); simulasi `https://arie.example/` menghasilkan canonical/og-url benar dan JSON-LD valid (telepon, alamat, hasMap); `openingHours` sengaja tidak dicantumkan karena `[?]`.
Commit 01136fd — push origin/master berhasil.

### [2026-11-22] T11 — Kontak & Peta (DONE)
Seksi `#kontak` menampilkan alamat & telepon dari config, jam dengan catatan konfirmasi, kartu peta tanpa embed (izin `[?]`), serta dua tombol rute ke Google Maps.
Verifikasi: tidak ada id duplikat (footer renamed `#footer`), 1 h1, tanpa hardcode nomor/alamat; simulasi menghasilkan `tel:+6282353066305` dan label `0823-5306-6305`; token valid.
Commit b27643d — push origin/master berhasil.

### [2026-11-22] T10 — Cara Pesan & FAQ (DONE)
Empat langkah pesan dan 3 FAQ memakai `<details>/<summary>` (bisa diketik dengan keyboard, fokus terlihat dari `base.css`); jawaban hanya fakta terkonfirmasi atau mengajak konfirmasi, alamat diisi dari config.
Verifikasi: 1 h1, 3 pasangan details/summary; tidak ada kata original/COD/ongkir/garansi; token valid.
Commit ab7da0e — push origin/master berhasil.

### [2026-11-22] T09 — Tentang, Galeri, Testimoni (flag) (DONE)
`content.js` hanya membuka seksi bila `business.about` terisi dan/atau `features.gallery`/`testimonials` benar serta datanya ada; field `[?]` di config dibiarkan kosong sehingga semua seksi tersembunyi.
Verifikasi: simulasi data kosong → 3 seksi tetap hidden; setelah data contoh diisi → 3 seksi tampil dengan 1 item galeri & 1 testimoni; npm test 9/9.
Commit 64c6fc1 — push origin/master berhasil.

### [2026-11-22] T08 — Promo/Koleksi (flag) (DONE)
Seksi `#promo` memakai `hidden` di HTML dan hanya dibuka `promo.js` bila `CONFIG.features.promo` benar serta ada produk berbadge `promo`; kartu memakai renderer katalog yang sama.
Verifikasi: simulasi flag false → tetap tersembunyi; flag true + satu produk promo → tampil dengan 1 kartu; npm test 9/9.
Commit 22e839e — push origin/master berhasil.

### [2026-11-22] T07 — Detail produk (DONE)
`detail.js` menampilkan detail saat `?p=<slug>`, mengganti judul h1, menyembunyikan kontrol katalog, memilih ukuran, dan menautkan WA berisi nama produk; slug tak dikenal memunculkan pesan ramah + jalan keluar.
Verifikasi: simulasi DOM dengan `?p=contoh-parfum-1` menghasilkan judul produk, kontrol tersembunyi, tautan WA "…Contoh Parfum 1 (30)…", produk terkait tampil; slug salah menampilkan pesan ramah; npm test 9/9.
Commit dbc16a7 — push origin/master berhasil.

### [2026-11-22] T06 — Katalog + filter + pencarian (DONE)
`catalog.js` merender kartu via DOM API (`textContent`), memuat kategori dari JSON, filter kategori/label, pencarian, dan keadaan kosong; dipakai di `#katalog` beranda dan `produk.html`.
Verifikasi: simulasi DOM menampilkan 4 kartu → cari "pencarian" = 1 kartu → "zzz" = pesan kosong → reset = 4 kartu; npm test 9/9; var/warna token bersih, 1 h1 per halaman, tautan eksternal ber-`rel`.
Commit 7864c25 — push origin/master berhasil.

### [2026-11-22] T05 — Header, Hero, Keunggulan, Footer, WA mengambang (DONE)
`index.html` satu halaman semantik; `components.css` memakai token saja; `main.js` mengisi data usaha, tautan WA (dari `whatsapp.js`), rute, dan menu mobile. Badge "Buka 24 Jam" mengikuti flag dan tetap mengajak konfirmasi.
Verifikasi: 1 `<h1>`, tautan eksternal memakai `rel="noopener noreferrer"`, tidak ada nomor/alamat hard-code, semua `var()` terdefinisi; simulasi DOM menghasilkan WA & rute benar. 360/1280px aman secara statis (grid `min()`, tanpa lebar tetap); browser headless belum tersedia.
Commit 2652400 — push origin/master berhasil.

### [2026-11-22] T04 — products.json, validator, data contoh (DONE)
`data/products.json` berisi 2 kategori + 4 produk contoh (tanpa merek/harga/foto karangan); `products.js` berisi `validateCatalog`, `loadProducts`, `filterProducts`, `getBySlug`; validator CLI di `scripts/validate-data.mjs`.
Verifikasi: `node scripts/validate-data.mjs` lulus (4/4 isSample); `npm test` 9/9 lulus termasuk duplikat slug & kategori tak dikenal.
Commit 9fc62f1 — push origin/master berhasil.

### [2026-11-22] T03 — config.js & whatsapp.js + tes (DONE)
`config.js` jadi sumber tunggal data usaha/flag; `whatsapp.js` mengekspor `buildWaLink` dan `productInquiryLink`; `package.json` menandai ESM agar `node --test` bisa mengimpor `.js`.
Verifikasi: npm test 5/5 lulus; grep nomor WA hanya muncul di config.js; tautan `wa.me/6282353066305?text=` sesuai kontrak.
Commit 28381ee — push origin/master berhasil.

### [2026-11-22] T02 — Token CSS & base styles (DONE)
`tokens.css` memuat palet/tipografi/spasi/radius/shadow/gerak dari MASTER; `base.css` hanya memakai `var()`, reset ringan, fokus terlihat, reduced-motion, `.container` berbasis `min()`.
Verifikasi: semua `var()` terdefinisi, tidak ada warna/px mentah di base.css; lebar 360px aman secara statis (tanpa lebar tetap, gambar `max-width:100%`). Browser headless tidak tersedia, uji visual menyusul di T05/T13.
Commit cc209c9 — push origin/master berhasil.

### [2026-11-22] T01 — Design system via skill ui-ux-pro-max (DONE)
Skrip skill: `.opencode/skills/ui-ux-pro-max/scripts/search.py` (Python 3.14.2, sudah terpasang; npm install tidak perlu). Pilihan: pola Feature-Rich Showcase + palet premium dark/emas (#1C1917/#A16207/#FAFAF9) + Cormorant/Montserrat + gaya Exaggerated Minimalism; efek Liquid Glass ditolak (platform-specific, blur/aksesibilitas). Tersimpan di `design-system/arie-parfum/MASTER.md` (diabaikan git sesuai aturan).
Commit 6d78618 — commit kosong sengaja karena seluruh keluaran T01 berada di folder yang diabaikan git.

### [2026-11-22] T00 — Setup repo & izin awal (DONE)
APPROVALS.md: DISETUJUI 2026-11-22, remote ArrowTin/arie-parfum, branch master (bukan main). Verifikasi: git ls-remote & push --dry-run OK; tidak ada berkas internal terlacak; folder assets/{css,js,img} + data dibuat.
Commit 0e50e99 — push origin/master berhasil. Remote & branch dicatat sesuai kondisi aktual.

### [2026-11-22] Inisiasi (DONE)
Bundle disiapkan; tampilan belum ditentukan (T01 via skill). Izin awal belum dijawab (APPROVALS.md).
