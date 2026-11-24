// Gerak hanya dipakai lewat transisi CSS; pustaka animasi tidak dikirim ke browser.
export function bisaGerak() {
  const media = globalThis.matchMedia;
  if (media?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (globalThis.navigator?.connection?.saveData) return false;
  return true;
}
