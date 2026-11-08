/* ==========================================================================
   KONFIGURASI UNDANGAN — ubah data di file ini saja.
   (Dipakai sebagai script biasa, bukan ES module, supaya index.html bisa
   langsung dibuka dengan double-click tanpa server.)
   ========================================================================== */
window.WEDDING = {
  bride: {
    nick: "Arin",
    full: "Arinda Kusuma Wardani",
    order: "Putri ke-1",
    father: "Andhika Jaya Kusuma",
    mother: "Nur Siti Khomariyah",
    photo: "img/arinda.webp",
    instagram: "arindkusuma"
  },
  groom: {
    nick: "Pam",
    full: "Arum Tri Pamungkas",
    order: "Putra ke-3",
    father: "(Alm) Yusup Efendi",
    mother: "Insriana",
    photo: "img/pamungkas.webp",
    instagram: "punggg_"
  },

  // Tanggal & jam acara utama (dipakai untuk countdown & blok "Simpan Tanggalnya")
  date: "2026-12-05T16:00:00+07:00",

  events: [
    {
      name: "Akad",
      day: "Sabtu, 5 Desember 2026",
      time: "16.00 WIB - selesai",
      venue: "",
      address: "",
      maps: "https://maps.app.goo.gl/1xEG2i7htsKP5d7q6",
      image: "img/venue.webp"
    },
    {
      name: "Resepsi",
      day: "Sabtu, 5 Desember 2026",
      time: "18.00 - 21.00 WIB",
      venue: "Hotel Stayvie Dinoyo Prime Lt. 7",
      address: "",
      maps: "https://maps.app.goo.gl/1xEG2i7htsKP5d7q6"
    }
  ],

  dressCode: { text: "Hitam, Cream, Maroon", colors: ["#141414", "#F2E6D0", "#600A0A"] },

  gifts: [
    { bank: "BCA", number: "3660378200", name: "Arinda Kusuma Wardani" },
    { bank: "DANA", number: "089531861678", name: "Arum Tri Pamungkas" }
  ],
  giftAddress: {
    text: "Jl. Kahuripan No. 3 RT.3 RW.2 Desa Garum, Kec. Garum, Kab. Blitar",
    confirm: "089531861678" // nomor WhatsApp konfirmasi
  },

  // Musik: satu file (string) atau playlist (array of {title, artist, src}).
  // Letakkan file lagu di folder audio/ — belum ada file lagu di proyek ini.
  music: [
    { title: "Lagu Kami", artist: "Arin & Pam", src: "audio/music.mp3" }
  ],

  // URL embed YouTube (format https://www.youtube.com/embed/ID). Kosongkan "" untuk menyembunyikan section video.
  youtube: "https://www.youtube.com/embed/XXXX",

  loveStory: [
    { title: "Awal Pertemuan", date: "2 Mei 2023", text: "Pada 2 Mei 2023 kami pertama kali bertemu. Dari pertemuan sederhana itu, tumbuh rasa nyaman yang tak pernah kami duga." },
    { title: "Perjalanan Bersama", date: "2023 – 2026", text: "Sejak 2023 hingga 2026 kami belajar saling memahami, melewati suka dan duka, jarak dan waktu, hingga yakin bahwa kami ingin berjalan bersama selamanya." },
    { title: "Menuju Halal", date: "2026", text: "Dengan restu kedua keluarga, kami memantapkan hati untuk melangkah ke jenjang pernikahan. Bismillah." }
  ],

  gallery: [
    "img/p1.webp", "img/p2.webp", "img/p3.webp", "img/p4.webp", "img/p5.webp",
    "img/p6.webp", "img/p7.webp", "img/p8.webp", "img/p9.webp", "img/p10.webp"
  ],

  quote: {
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
    source: "QS Ar-Rum : 21"
  },

  // RSVP & ucapan. Isi dengan URL Web App Google Apps Script (lihat apps-script.gs).
  // Jika kosong, RSVP disimpan sementara di browser tamu (localStorage) — hanya untuk uji coba.
  rsvpEndpoint: "",
  maxGuests: 4
};
