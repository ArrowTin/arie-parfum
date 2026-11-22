import test from "node:test";
import assert from "node:assert/strict";
import { CONFIG } from "../assets/js/config.js";
import { buildWaLink, productInquiryLink } from "../assets/js/whatsapp.js";

test("buildWaLink memakai nomor dari config dan pesan umum", () => {
  const link = buildWaLink();
  const url = new URL(link);
  assert.equal(`${url.origin}${url.pathname}`, `https://wa.me/${CONFIG.business.waNumber}`);
  assert.equal(url.searchParams.get("text"), CONFIG.wa.general);
});

test("buildWaLink menyandikan teks khusus", () => {
  const pesan = "Halo, ada stok? 100%";
  const url = new URL(buildWaLink(pesan));
  assert.equal(url.searchParams.get("text"), pesan);
  assert.match(buildWaLink(pesan), /text=Halo%2C%20ada%20stok%3F/);
});

test("buildWaLink tanpa teks tidak menyertakan query", () => {
  assert.equal(buildWaLink(""), `https://wa.me/${CONFIG.business.waNumber}`);
});

test("productInquiryLink mengisi nama dan ukuran dari produk", () => {
  const produk = { name: "Contoh Parfum 1", sizesMl: [30, 60] };
  const url = new URL(productInquiryLink(produk));
  assert.equal(url.searchParams.get("text"), CONFIG.wa.product
    .replace("{nama}", "Contoh Parfum 1")
    .replace("{ukuran}", "30"));
});

test("productInquiryLink menerima ukuran pilihan", () => {
  const url = new URL(productInquiryLink({ name: "Contoh A", sizesMl: [30] }, 60));
  assert.match(url.searchParams.get("text"), /Contoh A \(60\)/);
});

test("karakter $ pada nama tidak mengubah template pesan", () => {
  const nama = "Contoh $& $` $' Parfum";
  const url = new URL(productInquiryLink({ name: nama, sizesMl: [30] }));
  assert.equal(url.searchParams.get("text"), CONFIG.wa.product
    .replace("{nama}", () => nama)
    .replace("{ukuran}", () => "30"));
});
