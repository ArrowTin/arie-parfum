import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
    "../assets/js/promo.js", "../assets/js/content.js", "../data/products.json",
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

test("semua tautan eksternal memakai rel noopener noreferrer", async () => {
  for (const halaman of HALAMAN) {
    const html = await baca(halaman);
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
      assert.match(tag, /rel="noopener noreferrer"/, `${halaman}: ${tag}`);
    }
  }
});
