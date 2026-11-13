# PMI Kota Bengkulu - Supabase

1. Isi `.env` dengan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
2. Jalankan di Supabase SQL Editor secara berurutan: `supabase/skema.sql`, `supabase/kebijakan.sql`, `supabase/data-awal.sql`.
3. Buat user melalui Supabase Authentication.
4. Tambahkan profil dengan UUID yang sama ke tabel `pengguna`, misalnya role `superadmin`.
5. Jalankan `npm install` lalu `npm run dev`.
6. Buka `http://localhost:3000`.

`.env.example` hanya template. Semua konfigurasi runtime dibaca dari `.env` oleh `server.js`. Browser hanya menerima URL Supabase dan anon/publishable key melalui `/api/konfigurasi-publik`; service role dan Cloudinary API secret tidak pernah dikirim ke browser.

## Repository

Remote: https://github.com/pmilmsapp-pmi/bengkulu.git

Konfigurasi rahasia disimpan hanya di .env. Gunakan .env.example sebagai template.
