import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const baca = (path) => readFile(new URL(path, import.meta.url), "utf8");
const HALAMAN = ["../index.html", "../produk.html", "../404.html"];

// SEO dasar: metadata, OG, canonical, JSON-LD, dan satu h1 per halaman.
for (const halaman of HALAMAN) {
  test(`SEO statis ${halaman}`, async () => {
    const html = await baca(halaman);
    for (const pola of [
      '<html lang="id">',
      'name="viewport"',
      'name="description"',
      'property="og:title"',
      'property="og:description"',
      'property="og:url"',
      'rel="canonical"',
      'type="application/ld+json" data-jsonld',
      "<title",
    ]) {
      assert.ok(html.includes(pola), `${halaman} tidak memuat ${pola}`);
    }
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${halaman} harus punya satu h1`);
    assert.ok(!html.includes("[?]"), `${halaman} menampilkan penanda [?]`);
  });
}

test("sitemap dan robots valid secara struktural", async () => {
  const peta = await baca("../sitemap.xml");
  assert.match(peta, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.ok(peta.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  assert.equal((peta.match(/<url>/g) ?? []).length, (peta.match(/<\/url>/g) ?? []).length);
  assert.equal((peta.match(/<loc>/g) ?? []).length, 2);
  assert.ok(peta.trimEnd().endsWith("</urlset>"));

  const robots = await baca("../robots.txt");
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/\S+\/sitemap\.xml$/m);
});

test("nomor WA hanya bersumber dari config.js", async () => {
  const config = await baca("../assets/js/config.js");
  const nomor = /waNumber:\s*"(\d+)"/.exec(config)?.[1];
  assert.equal(nomor, "6282353066305");
  for (const berkas of HALAMAN) {
    assert.ok(!(await baca(berkas)).includes(nomor), `${berkas} meng-hardcode nomor WA`);
  }
  const wa = await baca("../assets/js/whatsapp.js");
  assert.ok(wa.includes("CONFIG.business.waNumber"));
});

// Token: tidak ada warna literal atau font di luar tokens.css.
test("CSS non-token tidak memakai warna literal atau font hardcoded", async () => {
  for (const berkas of ["../assets/css/base.css", "../assets/css/components.css", "../assets/css/pages.css"]) {
    const css = await baca(berkas);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(css), `${berkas} memuat warna literal`);
    for (const baris of css.split("\n").filter((baris) => baris.includes("font-family:"))) {
      assert.match(baris, /font-family:\s*var\(--font-/);
    }
  }
});

// Kontras WCAG untuk pasangan warna yang dipakai teks.
const hexKeRgb = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16));
const linier = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminansi = (h) => {
  const [r, g, b] = hexKeRgb(h);
  return 0.2126 * linier(r) + 0.7152 * linier(g) + 0.0722 * linier(b);
};
const kontras = (a, b) => {
  const x = luminansi(a);
  const y = luminansi(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

test("kontras teks minimal 4.5:1", async () => {
  const css = await baca("../assets/css/tokens.css");
  const token = Object.fromEntries(
    [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
  );
  const pasangan = [
    ["on-accent", "accent"], ["accent", "card"], ["accent", "background"],
    ["muted-foreground", "card"], ["muted-foreground", "background"],
    ["foreground", "background"], ["secondary", "background"],
    ["card-foreground", "card"], ["on-primary", "primary"],
    ["primary", "card"], ["foreground", "muted"], ["on-secondary", "secondary"],
  ];
  for (const [depan, belakang] of pasangan) {
    assert.ok(token[depan] && token[belakang], `token ${depan}/${belakang} tidak ada`);
    const rasio = kontras(token[depan], token[belakang]);
    assert.ok(rasio >= 4.5, `kontras ${depan} di ${belakang} hanya ${rasio.toFixed(2)}:1`);
  }
});

test("beranda lokal di bawah 1 MB (font eksternal tidak dihitung)", async () => {
  const berkas = [
    "../index.html", "../assets/img/favicon.svg",
    "../assets/css/tokens.css", "../assets/css/base.css",
    "../assets/css/components.css", "../assets/css/pages.css",
    "../assets/js/main.js", "../assets/js/config.js", "../assets/js/whatsapp.js",
    "../assets/js/catalog.js", "../assets/js/products.js", "../assets/js/detail.js",
    "../assets/js/promo.js", "../assets/js/content.js", "../assets/js/video-text.js",
    "../assets/js/botol-audio.js",
    "../assets/video/arie-video-text.webm", "../data/products.json",
  ];
  let total = 0;
  for (const nama of berkas) total += (await baca(nama)).length;
  assert.ok(total < 1024 * 1024, `total beranda ${total} byte melebihi 1 MB`);
});

test("tilt flacon hanya aktif pada pointer halus dan menghormati reduced-motion", async () => {
  const js = await baca("../assets/js/main.js");
  const html = await baca("../index.html");
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /hover: hover/);
  assert.match(js, /saveData/);
  assert.match(js, /IntersectionObserver/);
  assert.match(html, /data-flacon/);
  assert.doesNotMatch(js, /classList\.add\("reveal"\)/);
});

test("panggung galeri dan kartu kontak menyatu dengan transisi aman", async () => {
  const html = await baca("../index.html");
  const css = await baca("../assets/css/pages.css");
  const js = await baca("../assets/js/main.js");
  const dasar = await baca("../assets/css/base.css");
  const konten = await baca("../assets/js/content.js");
  assert.match(html, /gallery-stage glass/);
  assert.match(html, /gallery-stage-glow/);
  assert.match(css, /\.gallery-stage:is\(:hover, :focus-within\)/);
  assert.match(css, /\.gallery-card\.is-tampak:is\(:hover, :focus-within\)/);
  assert.match(css, /\.contact-card::before/);
  assert.match(css, /\.map-card:is\(:hover, :focus-within\) svg/);
  assert.match(css, /\.bisa-animasi \.is-muncul/);
  assert.match(js, /initMuncul\(\)/);
  assert.match(js, /IntersectionObserver/);
  assert.match(konten, /is-tampak/);
  assert.match(dasar, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
});

test("kartu Cara Pesan muncul bergantian saat masuk viewport", async () => {
  const html = await baca("../index.html");
  const css = await baca("../assets/css/pages.css");
  const js = await baca("../assets/js/main.js");
  const daftar = /<ol class="step-grid">[\s\S]*?<\/ol>/.exec(html)?.[0] ?? "";
  assert.equal((daftar.match(/class="step-card"/g) ?? []).length, 4);
  assert.match(js, /querySelectorAll\("\.gallery-stage, \.contact-card, \.map-card, \.step-card"\)/);
  assert.match(css, /\.bisa-animasi \.step-card \{[\s\S]*?opacity: 0;[\s\S]*?transition: opacity/);
  assert.match(css, /\.bisa-animasi \.step-card:nth-child\(2\) \{ transition-delay: var\(--motion-fast\); \}/);
  assert.match(css, /\.bisa-animasi \.step-card:nth-child\(4\) \{ transition-delay: var\(--motion-slow\); \}/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
});

test("zoom galeri, judul video, footer dan nav memakai transisi CSS", async () => {
  const css = await baca("../assets/css/components.css");
  const halaman = await baca("../assets/css/pages.css");
  const zoom = await baca("../assets/js/gallery-zoom.js");
  const video = await baca("../assets/js/video-text.js");
  const utama = await baca("../assets/js/main.js");
  assert.match(zoom, /role", "dialog"/);
  assert.match(zoom, /aria-modal", "true"/);
  assert.match(zoom, /cloneNode\(true\)/);
  assert.match(zoom, /Escape/);
  assert.match(zoom, /requestAnimationFrame/);
  assert.match(utama, /initGalleryZoom\(\)/);
  assert.match(halaman, /\.zoom-overlay\.is-buka \.zoom-panel/);
  assert.match(halaman, /\.zoom-close:is\(:hover, :focus-visible\)/);
  assert.match(css, /\.judul-video \[data-video-text-label\]/);
  assert.match(css, /z-index: 2/);
  assert.match(video, /kembali|pause|classList\.remove\("is-aktif"\)/);
  assert.match(css, /site-footer \.chrome-bg::before/);
  assert.match(css, /outline-color: var\(--color-transparent\)/);
  assert.match(css, /site-header \{[\s\S]*?border-radius: var\(--radius-none\) var\(--radius-none\) var\(--radius-lg\)/);
  assert.match(css, /\.nav-list a:is\(:hover, :focus-visible\)[\s\S]*?color: var\(--color-accent-strong\)/);
  assert.match(css, /\.botol-tutup-grup \{[\s\S]*?transition: transform/);
  assert.doesNotMatch(halaman, /#[0-9a-fA-F]{3,8}\b/);
});

test("integrasi refresh: fitur baru coexisting dan token tetap terpusat", async () => {
  const html = await baca("../index.html");
  const utama = await baca("../assets/js/main.js");
  const komponen = await baca("../assets/css/components.css");
  const halaman = await baca("../assets/css/pages.css");
  const dasar = await baca("../assets/css/base.css");
  for (const penanda of [
    "chrome-glass", "data-video-text", "data-flacon", "gallery-ring",
    "data-wa", "data-route", "prefers-reduced-motion",
  ]) {
    assert.ok(html.includes(penanda) || komponen.includes(penanda) ||
      halaman.includes(penanda) || dasar.includes(penanda),
      `${penanda} tidak ditemukan`);
  }
  for (const inisialisasi of ["initChrome()", "initVideoText()", "initFlacon()", "initKontenTambahan()"]) {
    assert.ok(utama.includes(inisialisasi), `${inisialisasi} tidak dipanggil`);
  }
  assert.doesNotMatch(komponen.replace(/\/\*[\s\S]*?\*\//g, ""), /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(halaman.replace(/\/\*[\s\S]*?\*\//g, ""), /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(html, /<video[^>]+autoplay/i);
});

test("audio tutup botol disintesis saat klik tanpa autoplay", async () => {
  const html = await baca("../index.html");
  const js = await baca("../assets/js/main.js");
  const audio = await baca("../assets/js/botol-audio.js");
  const dasar = await baca("../assets/css/base.css");
  assert.match(html, /data-flacon/);
  assert.match(js, /mainkanAudioTutup\(terbuka\)/);
  assert.match(js, /flacon\.addEventListener\("click"/);
  assert.match(audio, /AudioContext/);
  assert.match(audio, /bisaGerak\(\)/);
  assert.match(audio, /saveData/);
  assert.doesNotMatch(audio, /autoplay/);
  assert.doesNotMatch(html, /<audio\b/);
  assert.match(dasar, /prefers-reduced-motion: reduce/);
});

test("Video Text judul memakai video lokal di belakang teks dan fallback aman", async () => {
  const html = await baca("../index.html");
  const js = await baca("../assets/js/video-text.js");
  const css = await baca("../assets/css/components.css");
  const lisensi = await baca("../assets/js/MAGICUI-LICENSE.md");
  const video = await readFile(new URL("../assets/video/arie-video-text.webm", import.meta.url));
  assert.match(html, /data-video-text-label data-config="name"/);
  assert.match(html, /assets\/video\/arie-video-text\.webm/);
  assert.match(html, /<h1 id="hero-judul" class="judul-video"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(js, /bisaGerak\(\)/);
  assert.match(js, /video\.pause\(\)/);
  assert.match(js, /IntersectionObserver/);
  assert.doesNotMatch(js, /innerHTML/);
  assert.match(css, /\.judul-video \[data-video-text-label\]/);
  assert.match(css, /z-index: 2/);
  assert.match(css, /\.video-text-media\.is-aktif[\s\S]*?opacity: 0\.24/);
  assert.match(lisensi, /magicui/);
  assert.ok(video.length > 1000, "video lokal kosong");
});

test("chrome glass navbar/footer memakai bingkai Dylan dan gerak aman", async () => {
  const html = await baca("../index.html");
  const css = await baca("../assets/css/components.css");
  const dasar = await baca("../assets/css/base.css");
  const js = await baca("../assets/js/main.js");
  const lisensi = await baca("../assets/css/UIVERSE-LICENSE.md");
  assert.match(html, /site-header glass chrome-glass/);
  assert.match(html, /site-footer chrome-glass/);
  assert.equal((html.match(/class="chrome-bg"/g) ?? []).length, 2);
  assert.match(css, /\.chrome-bg::before/);
  assert.match(css, /\.chrome-blob/);
  assert.match(css, /\.nav-list a::after/);
  assert.match(css, /\.btn-wa::after/);
  assert.match(dasar, /prefers-reduced-motion: reduce/);
  assert.match(js, /initChrome\(\)/);
  assert.match(lisensi, /dylanharriscameron/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}/);
});

test("galeri setengah cincin menampilkan lima foto berlabel Contoh", async () => {
  const config = await baca("../assets/js/config.js");
  const content = await baca("../assets/js/content.js");
  const html = await baca("../index.html");
  const css = await baca("../assets/css/pages.css");
  const ilustrasi = await baca("../assets/js/illustrations.js");
  assert.match(config, /gallery: true/);
  assert.match(config, /id: "contoh-5"/);
  assert.match(config, /label: "Contoh"/);
  assert.match(content, /180 \/ Math\.max\(jumlah - 1, 1\)/);
  assert.match(content, /Math\.sin\(rad\) \* lebar \* 0\.27/);
  assert.match(content, /rotateY\(\$\{miring\}deg\)/);
  assert.match(content, /ResizeObserver/);
  assert.match(content, /gallery-trigger/);
  assert.match(content, /geserFokus/);
  assert.match(content, /pointerup/);
  assert.match(content, /setAttribute\("aria-label"/);
  assert.match(content, /is-utama/);
  assert.doesNotMatch(content, /muatMotion|stagger/);
  assert.match(html, /gallery-ring[^>]*tabindex="0"/);
  assert.match(html, /data-galeri-putar="-1"/);
  assert.match(css, /aspect-ratio: 34 \/ 22/);
  assert.match(css, /clamp\(8rem, 34vw, 12rem\)/);
  assert.match(css, /perspective: 60rem/);
  assert.match(css, /\.gallery-ring\.is-animasi > li\.is-utama \{/);
  assert.match(css, /transition: transform 620ms var\(--ease-glide\)/);
  assert.match(css, /\.gallery-ring\.tanpa-gerak/);
  assert.match(ilustrasi, /var\(--color-accent\)/);
  assert.doesNotMatch(ilustrasi, /#[0-9a-fA-F]{3,8}\b/);
});

test("galeri fallback statis merender SVG ber-aria saat gerak dimatikan", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(`<!doctype html><html><body>
    <section data-galeri hidden>
      <ul data-galeri-grid></ul>
      <div data-galeri-kendali>
        <p data-galeri-status></p>
      </div>
    </section>
  </body></html>`);
  globalThis.document = dom.window.document;
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.matchMedia = () => ({ matches: true });
  const { initKontenTambahan } = await import("../assets/js/content.js?galeri-qa");
  initKontenTambahan();

  const ul = document.querySelector("[data-galeri-grid]");
  assert.equal(ul.children.length, 5);
  assert.ok(ul.classList.contains("tanpa-gerak"));
  assert.equal(ul.querySelectorAll("svg[role='img']").length, 5);
  assert.ok(ul.querySelector("svg").getAttribute("aria-label").startsWith("Contoh"));
  assert.equal(ul.querySelector("svg").getAttribute("width"), "120");
  assert.equal(ul.querySelectorAll(".gallery-label").length, 5);
  assert.equal(document.querySelector("[data-galeri-kendali]").hidden, true);
  assert.match(document.querySelector("[data-galeri-status]").textContent, /Foto 1 dari 5/);
  delete globalThis.document;
  delete globalThis.DOMParser;
  delete globalThis.matchMedia;
});

test("varian tombol Uiverse memakai token dan aksesibel", async () => {
  const css = await baca("../assets/css/components.css");
  const html = await baca("../index.html");
  const js = await baca("../assets/js/catalog.js");
  const lisensi = await baca("../assets/css/UIVERSE-LICENSE.md");
  assert.match(css, /\.btn-wa \{/);
  assert.match(css, /\.btn-route::after \{/);
  assert.match(css, /\.btn-card::before \{/);
  assert.match(html, /btn btn-accent btn-wa header-wa/);
  assert.match(html, /data-alt="Buka peta"/);
  assert.match(js, /btn btn-accent btn-card/);
  assert.match(lisensi, /MIT License/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}/);
});

test("kartu katalog memakai flip card dengan sisi depan judul saja", async () => {
  const js = await baca("../assets/js/catalog.js");
  const css = await baca("../assets/css/pages.css");
  assert.match(js, /"product-card flip-card"/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /aria-hidden/);
  assert.match(js, /belakang\.inert = true/);
  assert.match(js, /depan\.inert = keBelakang/);
  assert.match(js, /createElementNS/);
  assert.match(js, /rel = "noopener noreferrer"/);
  assert.match(css, /transform: rotateY\(180deg\)/);
  assert.match(css, /backface-visibility: hidden/);
});

test("tutup botol dan aroma dapat dikendalikan dengan keyboard", async () => {
  const html = await baca("../index.html");
  const js = await baca("../assets/js/main.js");
  assert.match(html, /class="flacon glass" type="button"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /data-tutup/);
  assert.match(html, /data-aroma/);
  assert.match(html, /data-aroma-status/);
  assert.doesNotMatch(html, /<div class="hero-visual" aria-hidden="true">/);
  assert.doesNotMatch(js, /muatMotion/);
  assert.match(js, /aria-pressed/);
});

test("gelembung aroma bervariasi dan label botol berbentuk ikon tetes", async () => {
  const html = await baca("../index.html");
  const css = await baca("../assets/css/components.css");
  const aroma = /<span class="aroma"[\s\S]*?<svg class="botol"/.exec(html)?.[0] ?? "";
  assert.equal((aroma.match(/<span><\/span>/g) ?? []).length, 8);
  assert.match(html, /<path class="botol-label"/);
  assert.match(html, /class="botol-label-tanda"/);
  assert.doesNotMatch(html, /<rect class="botol-label"/);
  assert.match(css, /@keyframes aroma-menguap/);
  assert.match(css, /\.flacon\[aria-pressed="true"\] \.aroma span \{[\s\S]*?animation:/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.flacon\[aria-pressed="true"\] \.aroma span[\s\S]*?animation: none/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(/);
});

test("tanpa pustaka Motion: hanya transisi CSS yang menghormati gerak", async () => {
  const pembungkus = await baca("../assets/js/motion-ui.js");
  const paket = JSON.parse(await baca("../package.json"));
  assert.match(pembungkus, /prefers-reduced-motion: reduce/);
  assert.match(pembungkus, /saveData/);
  assert.doesNotMatch(pembungkus, /muatMotion|vendor\/motion/);
  assert.equal(paket.dependencies?.motion, undefined);
  await assert.rejects(access(new URL("../assets/js/vendor/motion.min.js", import.meta.url)));
});

test("font hanya meminta bobot yang dipakai dan katalog mencadangkan ruang", async () => {
  for (const halaman of HALAMAN) {
    const html = await baca(halaman);
    assert.match(html, /Cormorant:wght@400;600/);
    assert.match(html, /Montserrat:wght@400;600/);
    assert.doesNotMatch(html, /wght@[0-9;]*[357]/);
  }
  const css = await baca("../assets/css/pages.css");
  assert.match(css, /\.product-grid \{[\s\S]*?min-height: 87rem/);
  assert.match(css, /grid-template-columns: repeat\(3, 1fr\);\s*min-height: 43rem/);
  assert.match(css, /grid-template-columns: repeat\(4, 1fr\);\s*min-height: 22rem/);
  assert.match(css, /\.flip-icon \{[\s\S]*?calc\(var\(--space-xl\) \* 3\.75\)/);
  assert.match(css, /:root\[data-detail-route\] \.product-grid/);
  assert.match(css, /:root\[data-detail-route\] #utama \{[\s\S]*?height: 43rem/);
  assert.match(await baca("../produk.html"), /dataset\.detailRoute/);
});

test("modul opsional dimuat sesuai penanda halaman", async () => {
  const utama = await baca("../assets/js/main.js");
  for (const modul of ["./botol-audio.js", "./catalog.js", "./detail.js"]) {
    assert.ok(utama.includes(`import("${modul}")`), `${modul} tidak dimuat malas`);
  }
  for (const modul of ["./promo.js", "./content.js", "./gallery-zoom.js", "./video-text.js"]) {
    assert.ok(utama.includes(`"${modul}"`), `${modul} tidak dimuat sesuai penanda`);
  }
  assert.match(utama, /document\.querySelector\(penanda\)/);
});

test("semua tautan eksternal memakai rel noopener noreferrer", async () => {
  for (const halaman of HALAMAN) {
    const html = await baca(halaman);
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
      assert.match(tag, /rel="noopener noreferrer"/, `${halaman}: ${tag}`);
    }
  }
});
