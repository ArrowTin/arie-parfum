// Video Text adaptasi MIT dari Magic UI: video hanya tampak di dalam bentuk teks.
import { bisaGerak } from "./motion-ui.js";

const NS = "http://www.w3.org/2000/svg";

// Mask SVG dibangun lewat DOM API, tanpa menyuntik HTML mentah.
function maskTeks(label, lebar, tinggi) {
  const gaya = globalThis.getComputedStyle?.(label);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("xmlns", NS);
  svg.setAttribute("width", String(lebar));
  svg.setAttribute("height", String(tinggi));
  svg.setAttribute("viewBox", `0 0 ${lebar} ${tinggi}`);

  const teks = document.createElementNS(NS, "text");
  teks.setAttribute("x", "0");
  teks.setAttribute("y", "50%");
  teks.setAttribute("text-anchor", "start");
  teks.setAttribute("dominant-baseline", "middle");
  teks.setAttribute("font-size", gaya?.fontSize ?? "3rem");
  teks.setAttribute("font-weight", gaya?.fontWeight ?? "600");
  teks.setAttribute("font-family", gaya?.fontFamily ?? "serif");
  teks.textContent = label.textContent?.trim() ?? "";
  svg.append(teks);
  return new XMLSerializer().serializeToString(svg);
}

export function initVideoText() {
  const wadah = document.querySelector("[data-video-text]");
  const label = wadah?.querySelector("[data-video-text-label]");
  const media = wadah?.querySelector("[data-video-text-media]");
  const video = wadah?.querySelector("[data-video-text-video]");
  if (!wadah || !label || !media || !video) return;

  // Tanpa gerak (reduced-motion/save-data) teks polos tetap tampil dan terbaca.
  if (!bisaGerak()) return;

  const perbaruiMask = () => {
    const { width, height } = wadah.getBoundingClientRect();
    if (!width || !height) return;
    const svg = maskTeks(label, Math.round(width), Math.round(height));
    media.style.setProperty("--video-text-mask",
      `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  };

  perbaruiMask();
  if ("ResizeObserver" in globalThis) {
    new ResizeObserver(perbaruiMask).observe(wadah);
  } else {
    globalThis.addEventListener?.("resize", perbaruiMask, { passive: true });
  }

  video.addEventListener("error", () => media.classList.remove("is-aktif"), { once: true });

  // Video diputar hanya saat judul terlihat.
  const aturPutar = (terlihat) => {
    if (terlihat) {
      video.play()
        .then(() => media.classList.add("is-aktif"))
        .catch(() => media.classList.remove("is-aktif"));
    } else {
      video.pause();
      media.classList.remove("is-aktif");
    }
  };

  if ("IntersectionObserver" in globalThis) {
    new IntersectionObserver((entri) => {
      aturPutar(entri.some((butir) => butir.isIntersecting));
    }, { threshold: 0.2 }).observe(wadah);
  } else {
    aturPutar(true);
  }
}
