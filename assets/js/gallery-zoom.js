// Pembesaran galeri: panel dialog dengan transisi CSS, tanpa pustaka tambahan.
import { bisaGerak } from "./motion-ui.js";

function buat(tag, kelas, teks) {
  const elemen = document.createElement(tag);
  if (kelas) elemen.className = kelas;
  if (teks !== undefined) elemen.textContent = teks;
  return elemen;
}

function bangunDialog() {
  const lapisan = buat("div", "zoom-overlay");
  lapisan.hidden = true;
  lapisan.setAttribute("role", "dialog");
  lapisan.setAttribute("aria-modal", "true");
  lapisan.setAttribute("aria-labelledby", "zoom-judul");

  const panel = buat("div", "zoom-panel glass");
  const tutup = buat("button", "zoom-close", "×");
  tutup.type = "button";
  tutup.setAttribute("aria-label", "Tutup pembesaran");
  const panggung = buat("div", "zoom-stage");
  const judul = buat("p", "zoom-label");
  judul.id = "zoom-judul";
  panel.append(tutup, panggung, judul);
  lapisan.append(panel);
  document.body.append(lapisan);
  return { lapisan, panel, panggung, judul, tutup };
}

export function initGalleryZoom() {
  const grid = document.querySelector("[data-galeri-grid]");
  if (!grid) return;
  const { lapisan, panggung, judul, tutup } = bangunDialog();
  let pemicu = null;
  let penutup = null;

  const tutupDialog = () => {
    if (lapisan.hidden) return;
    lapisan.classList.remove("is-buka");
    globalThis.clearTimeout?.(penutup);
    penutup = globalThis.setTimeout?.(() => {
      lapisan.hidden = true;
      panggung.replaceChildren();
    }, bisaGerak() ? 320 : 0);
    pemicu?.focus?.();
    pemicu = null;
  };

  grid.addEventListener("click", (acara) => {
    const tombol = acara.target.closest?.(".gallery-trigger");
    if (!tombol?.closest(".is-tampak")) return;
    const kartu = tombol.closest(".gallery-card");
    const media = tombol.firstElementChild;
    if (!kartu || !media) return;

    pemicu = tombol;
    panggung.replaceChildren(media.cloneNode(true));
    judul.textContent = kartu.querySelector(".gallery-label")?.textContent ?? "Contoh";
    globalThis.clearTimeout?.(penutup);
    lapisan.hidden = false;
    requestAnimationFrame(() => lapisan.classList.add("is-buka"));
    tutup.focus();
  });

  tutup.addEventListener("click", tutupDialog);
  lapisan.addEventListener("click", (acara) => {
    if (acara.target === lapisan) tutupDialog();
  });
  document.addEventListener("keydown", (acara) => {
    if (lapisan.hidden) return;
    if (acara.key === "Escape") {
      acara.preventDefault();
      tutupDialog();
    } else if (acara.key === "Tab") {
      acara.preventDefault();
      tutup.focus();
    }
  });
}
