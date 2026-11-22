import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { filterProducts, getBySlug, validateCatalog } from "../assets/js/products.js";

const data = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const produk = data.products;

test("katalog contoh lolos validasi", () => {
  assert.deepEqual(validateCatalog(data), []);
  assert.ok(produk.every((item) => item.isSample === true));
});

test("validator menolak slug duplikat dan kategori tidak dikenal", () => {
  const buruk = structuredClone(data);
  buruk.products[1].slug = buruk.products[0].slug;
  buruk.products[1].categoryId = "tidak-ada";
  const kesalahan = validateCatalog(buruk);
  assert.ok(kesalahan.some((pesan) => pesan.includes("slug duplikat")));
  assert.ok(kesalahan.some((pesan) => pesan.includes("categoryId tidak dikenal")));
});

test("filterProducts menyaring kategori, badge, dan teks", () => {
  assert.equal(filterProducts(produk, { categoryId: "wanita" }).length, 2);
  assert.equal(filterProducts(produk, { badge: "baru" }).length, 1);
  assert.equal(filterProducts(produk, { q: "PENCARIAN" })[0].id, "p003");
  assert.equal(filterProducts(produk, { q: "tidak-ada" }).length, 0);
});

test("getBySlug mengembalikan produk atau null", () => {
  assert.equal(getBySlug(produk, "contoh-parfum-1").id, "p001");
  assert.equal(getBySlug(produk, "slug-salah"), null);
});
