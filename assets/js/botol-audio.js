// Suara tutup botol disintesis dengan Web Audio saat pengguna menekan botol.
import { bisaGerak } from "./motion-ui.js";

let konteks = null;

function siapAudio() {
  if (!bisaGerak()) return null;
  if (globalThis.navigator?.connection?.saveData) return null;
  const Konstruktor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Konstruktor) return null;
  konteks ??= new Konstruktor();
  if (konteks.state === "suspended") konteks.resume().catch(() => {});
  return konteks;
}

function pop(konteksAudio, waktu) {
  const osilator = konteksAudio.createOscillator();
  const keras = konteksAudio.createGain();
  osilator.type = "sine";
  osilator.frequency.setValueAtTime(480, waktu);
  osilator.frequency.exponentialRampToValueAtTime(110, waktu + 0.09);
  keras.gain.setValueAtTime(0.0001, waktu);
  keras.gain.exponentialRampToValueAtTime(0.22, waktu + 0.008);
  keras.gain.exponentialRampToValueAtTime(0.0001, waktu + 0.17);
  osilator.connect(keras).connect(konteksAudio.destination);
  osilator.start(waktu);
  osilator.stop(waktu + 0.18);
}

function desis(konteksAudio, waktu) {
  const panjang = Math.floor(konteksAudio.sampleRate * 0.45);
  const penyangga = konteksAudio.createBuffer(1, panjang, konteksAudio.sampleRate);
  const data = penyangga.getChannelData(0);
  for (let i = 0; i < panjang; i += 1) data[i] = (Math.random() * 2 - 1) * 0.5;

  const sumber = konteksAudio.createBufferSource();
  sumber.buffer = penyangga;
  const saringan = konteksAudio.createBiquadFilter();
  saringan.type = "bandpass";
  saringan.frequency.value = 1500;
  saringan.Q.value = 0.8;
  const keras = konteksAudio.createGain();
  keras.gain.setValueAtTime(0.0001, waktu);
  keras.gain.exponentialRampToValueAtTime(0.05, waktu + 0.05);
  keras.gain.exponentialRampToValueAtTime(0.0001, waktu + 0.44);
  sumber.connect(saringan).connect(keras).connect(konteksAudio.destination);
  sumber.start(waktu);
  sumber.stop(waktu + 0.45);
}

// Dipanggil dari handler klik, bukan saat halaman dimuat.
export function mainkanAudioTutup(terbuka) {
  const konteksAudio = siapAudio();
  if (!konteksAudio) return;
  const waktu = konteksAudio.currentTime + 0.01;
  pop(konteksAudio, waktu);
  if (terbuka) desis(konteksAudio, waktu + 0.05);
}
