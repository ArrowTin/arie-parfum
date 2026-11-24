# TASKS.md — Arie Parfum

Status: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED`. Satu task = satu commit = satu push. Baca **hanya** file di kolom *Baca*.

| ID | Judul | Agent | Dep | Baca | Kriteria lulus | Status |
|---|---|---|---|---|---|---|
| T00 | Setup repo, .gitignore, izin awal (APPROVALS.md) | pm-architect | — | APPROVALS.md, AGENTS.md §6 | `APPROVALS.md` terisi; `git status` tidak melacak berkas internal; struktur folder dasar ada | DONE 0e50e99 |
| T01 | Design system via skill ui-ux-pro-max | fe-dev | T00 | docs/02 | `design-system/arie-parfum/MASTER.md` ada; pilihan gaya dicatat di PROGRESS | DONE 6d78618 |
| T02 | Token CSS & base styles | fe-dev | T01 | docs/02, docs/04 | `tokens.css` turunan MASTER; tanpa warna/font di luar token; 360px tanpa scroll horizontal | DONE cc209c9 |
| T03 | config.js & whatsapp.js + tes | be-dev | T00 | PROJECT_SPEC §3 | Tautan `wa.me/6282353066305?text=…` benar; tes node:test lulus | DONE 28381ee |
| T04 | products.json, validator, data contoh | be-dev | T03 | PROJECT_SPEC §3, docs/05 | Validator lulus; semua data contoh `isSample:true` | DONE 9fc62f1 |
| T05 | Header, Hero, Keunggulan, Footer, WA mengambang | fe-dev | T02,T03 | docs/03, docs/00 | Satu `<h1>`; CTA WA & Rute berfungsi; 360/1280px OK | DONE 2652400 |
| T06 | Katalog + filter + pencarian | be-dev→fe-dev | T04,T05 | PROJECT_SPEC §3, docs/03 | Filter & cari bekerja; keadaan kosong; konsol bersih | DONE 7864c25 |
| T07 | Detail produk | fe-dev | T06 | docs/03 | `?p=slug` OK; slug tak dikenal → pesan ramah; WA memuat nama produk | DONE dbc16a7 |
| T08 | Promo/Koleksi (flag) | fe-dev | T06 | docs/03 | Tersembunyi bila `features.promo=false` | DONE 22e839e |
| T09 | Tentang, Galeri, Testimoni (flag) | fe-dev | T05 | docs/03 | Tampil hanya bila data ada | DONE 64c6fc1 |
| T10 | Cara Pesan & FAQ | fe-dev | T05 | docs/03 | FAQ tanpa klaim `[?]`; aksesibel keyboard | DONE ab7da0e |
| T11 | Kontak & Peta | fe-dev | T05 | docs/03 | Alamat, telepon, jam, peta, tombol rute | DONE b27643d |
| T12 | SEO teknis | devops-docs→fe-dev | T05–T11 | docs/06 | meta, OG, JSON-LD, sitemap.xml, robots.txt valid | DONE 01136fd |
| T13 | Performa & aksesibilitas | fe-dev | T12 | docs/06, docs/02 (checklist) | Target Lighthouse tercapai atau dicatat jujur bila alat tak tersedia | DONE 4c735a7 |
| T14 | QA + audit keamanan | qa-tester, security-auditor | T13 | docs/07 | Checklist lulus; temuan tinggi diperbaiki | DONE c6b9d10 |
| T15 | Panduan deploy & serah terima | devops-docs | T14 | docs/07, docs/05 | README pemilik + panduan edit produk + panduan deploy (deploy = Batas Mutlak) | DONE 51e08ab |
| T16 | Gerak halus Fase 2 | fe-dev | T15 | docs/08 | Perf tidak turun; reduced-motion teruji | DONE f8ac281 |
| T17 | Refresh frontend glass-motion | pm-architect | T16 | skill glass-motion-frontend, MASTER.md | Kaca terukur di header/hero/menu, flacon tilt dengan reduced-motion, token bersih, npm test lulus | DONE 3e45ed5 |
| T18 | Fondasi Motion & gerak aman | pm-architect | T17 | package.json, https://motion.dev/docs/quick-start, AGENTS.md §7 | `motion` dipakai dari paket (bukan CDN); helper `bisaGerak()` mengecek reduced-motion/save-data; package.json + lock di-commit; npm test lulus | DONE ad1c306 |
| T19 | Tutup botol berputar & aroma | fe-dev | T17,T18 | index.html, assets/css/components.css, assets/js/main.js, https://motion.dev/docs/animate | Klik/Enter memutar tutup, 3–4 lapis aroma keluar dari mulut botol via Motion, bisa ditutup lagi; fallback statis, tanpa autoplay, keyboard & reduced-motion aman | DONE be0ae52 |
| T20 | Flip card katalog | fe-dev | T17 | assets/js/catalog.js, assets/css/pages.css, data/products.json, https://undraw.co/illustrations | Depan ikon SVG berbasis token + judul saja (foto asli dipakai bila `images` ada); belakang kategori, ukuran, status, badge, CTA WA; flip CSS 3D + `aria-expanded`/`aria-hidden`, `textContent`, tanpa klaim | DONE 9f81a07 |
| T21 | Variasi tombol Uiverse | fe-dev | T17 | https://uiverse.io/ui/animated-buttons, assets/css/components.css, tests/qa.test.js | 2–3 varian tombol Uiverse (MIT) disalin dan disesuaikan token: WA utama, rute sekunder, CTA kartu; kontras ≥4.5:1, target ≥48px, tanpa warna literal | DONE 24c2382 |
| T22 | Galeri ring dengan Motion | fe-dev | T18 | config.js, content.js, index.html, https://motion.dev/docs/stagger, https://undraw.co/illustrations | Galeri cincin radial diputar via drag/panah dengan Motion + stagger; fallback grid statis; `features.gallery` jadi sumber aktif; ilustrasi unDraw SVG berlabel "Contoh" diwarnai token, memakai `alt`/`aria-label` + `width`/`height`/`lazy` bila via `<img>`, tanpa stok foto | DONE ab73919 |
| T23 | Integrasi & QA akhir | qa-tester, pm-architect | T19–T22 | TASKS.md, PROGRESS.md, tests/qa.test.js, docs/07 | Semua task terverifikasi: npm test, CSS valid, token/kontras/rel bersih, 360px & 1280px tanpa scroll horizontal, konsol bersih, TASKS/PROGRESS diperbarui, commit & push per task | DONE 8e6d599 |
| T24 | Chrome navbar & footer ala Dylan Uiverse | pm-architect | T23 | skill glass-motion-frontend (vanilla, recipes), index.html, assets/css/components.css, assets/js/main.js, assets/css/UIVERSE-LICENSE.md | Bingkai kaca Dylan (panel inset + blob) di header/footer, transisi hover/fokus/scroll, tombol WA berkilau, kontras ≥4.5:1, 360px tanpa scroll horizontal, npm test lulus | DONE 7ea58be |
| T25 | Video Text judul hero (Magic UI) | pm-architect | T24 | https://magicui.design/docs/components/video-text, source video-text.tsx, index.html, assets/js/main.js, assets/css/pages.css | Judul "Arie Parfum" berisi video dengan mask SVG, video lokal ringan & lazy, jeda/reduced-motion/save-data aman, h1 tetap satu & terbaca, npm test lulus | TODO |
| T26 | Audio tutup botol | pm-architect | T25 | index.html, assets/js/main.js, tests/qa.test.js | Suara cork-pop/fizz disintesis Web Audio saat klik pengguna, tanpa autoplay/aset eksternal, reduced-motion & save-data aman, status ARIA tetap benar, npm test lulus | TODO |
| T27 | Galeri setengah cincin besar | pm-architect | T24 | assets/js/content.js, assets/css/pages.css, assets/js/config.js, tests/qa.test.js | Cincin hanya separuh lingkaran terlihat, kartu lebih besar, pergantian tampak/hilang jelas, drag/panah/keyboard tetap kerja, fallback grid statis, npm test lulus | TODO |
| T28 | Integrasi & QA refresh | pm-architect | T25–T27 | TASKS.md, PROGRESS.md, tests/qa.test.js, docs/07 | npm test & lint lulus, tidak ada warna literal/innerHTML, 360/1280px tanpa scroll horizontal, konsol bersih, TASKS/PROGRESS terbarui, commit & push per task | TODO |

Catatan: `motion@14.14.0` sudah terpasang di `node_modules` dan tercantum di `package.json` (di-commit pada T18). Komponen Uiverse disalin sebagai HTML/CSS berlisensi MIT. Ilustrasi unDraw (SVG, open-source tanpa atribusi) dipakai sebagai pengganti foto placeholder dan diwarnai ulang ke token aksen; foto asli tetap diutamakan bila tersedia di data. Tidak ada klaim merek/harga/testimoni baru.

## Backlog
(kosong)
