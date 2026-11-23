# Undangan Digital — Drapery Emerald

Single page, mobile-first, HTML + CSS + JavaScript vanilla + GSAP/ScrollTrigger (CDN).

## Struktur
```
index.html        halaman (cover amplop + 9 section)
css/style.css     semua gaya & design tokens (:root)
js/config.js      ← SEMUA DATA yang perlu diganti ada di sini
js/main.js        logika: cover, musik, countdown, RSVP, galeri, animasi
img/              aset WebP (sudah dikompres & di-rename)
audio/            taruh file lagu di sini (mis. song.mp3)
apps-script.gs    backend RSVP/ucapan untuk Google Sheets
```

## Cara pakai
1. Buka `index.html` langsung di browser (tidak perlu server).
   Nama tamu: `index.html?to=Budi+Santoso`.
2. Ganti data di `js/config.js`: nama, tanggal, acara, rekening, love story, galeri, YouTube.
3. Taruh lagu di `audio/song.mp3` (atau ubah `music` di config, bisa playlist).
4. RSVP online: ikuti langkah di `apps-script.gs`, lalu isi `rsvpEndpoint` di config.
   Tanpa endpoint, ucapan hanya tersimpan di browser masing-masing (mode uji coba).
5. Deploy: upload seluruh folder ke Netlify / Vercel / GitHub Pages / hosting biasa.

## Catatan
- Gambar di `img/` berasal dari template referensi (Canva). Ganti dengan foto & aset milik sendiri
  atau berlisensi sebelum dipakai untuk klien/komersial.
- Section video otomatis tersembunyi jika `youtube` belum diisi URL yang valid.
- Countdown otomatis berganti menjadi "Hari bahagia telah tiba" setelah tanggal acara lewat.
