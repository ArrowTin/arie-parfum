import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateCatalog } from "../assets/js/products.js";

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const berkas = path.join(akar, "data", "products.json");

try {
  const data = JSON.parse(await readFile(berkas, "utf8"));
  const kesalahan = validateCatalog(data);
  if (kesalahan.length) {
    console.error("Validasi gagal:\n- " + kesalahan.join("\n- "));
    process.exit(1);
  }
  const contoh = data.products.filter((produk) => produk.isSample === true);
  console.log(`Validator lulus: ${data.categories.length} kategori, ${data.products.length} produk (${contoh.length} data contoh).`);
} catch (error) {
  console.error("Validator gagal:", error.message);
  process.exit(1);
}
