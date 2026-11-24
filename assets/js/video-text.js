// Tekstur video di belakang judul: tidak menimpa huruf, tetap punya fallback teks polos.
import { bisaGerak } from "./motion-ui.js";

export function initVideoText() {
  const wadah = document.querySelector("[data-video-text]");
  const media = wadah?.querySelector("[data-video-text-media]");
  const video = wadah?.querySelector("[data-video-text-video]");
  if (!wadah || !media || !video) return;

  // Reduced-motion/save-data: judul tetap tampil tanpa lapisan video.
  if (!bisaGerak()) return;

  video.addEventListener("error", () => media.classList.remove("is-aktif"), { once: true });

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
