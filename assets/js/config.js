// Sumber tunggal data usaha dan pengaturan fitur.
export const CONFIG = {
  business: {
    name: "Arie Parfum",
    category: "Toko Parfum",
    address: {
      plusCode: "RFGM+675",
      street: "Jl. Perwira",
      village: "Malo Jelayan",
      district: "Bengkayang",
      regency: "Bengkayang",
      province: "Kalimantan Barat",
      postalCode: "79211",
    },
    phoneDisplay: "0823-5306-6305",
    waNumber: "6282353066305",
    mapsUrl: "https://maps.app.goo.gl/d6wrRSZdUt7naff59",
    hours: { is24h: true }, // [?] perlu konfirmasi pemilik
    social: { instagram: null, facebook: null, tiktok: null },
  },
  features: {
    showPrices: false, // [?] harga belum ditentukan
    promo: false,
    gallery: false,
    testimonials: false,
    claimOriginal: false, // [?] klaim original tidak ditampilkan
    delivery: false, // [?] antar/COD belum dikonfirmasi
  },
  wa: {
    general: "Halo Arie Parfum, saya ingin bertanya tentang produk parfum.",
    product: "Halo Arie Parfum, saya ingin tanya/pesan: {nama} ({ukuran}). Apakah tersedia?",
  },
};
