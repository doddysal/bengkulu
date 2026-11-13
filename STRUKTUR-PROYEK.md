# Struktur Proyek PMI Kota Bengkulu

## Root aplikasi
- `index.html`: halaman depan publik
- `server.js`: server Express dan endpoint konfigurasi publik
- `service-worker.js`: cache PWA
- `manifest.webmanifest`: metadata PWA
- `.env`: konfigurasi rahasia lokal, tidak boleh masuk Git
- `.env.example`: contoh konfigurasi
- `package.json`: dependensi dan perintah npm

## Folder utama
- `admin/`: dashboard, berita, pengguna, profil PMI, agenda, galeri, relawan, dan Pengaturan CMS
- `akun/`: login, pendaftaran, dan profil pengguna
- `konten/`: seluruh halaman konten publik
- `kebijakan/`: kebijakan privasi dan ketentuan layanan
- `assets/`: CSS, ikon, dan gambar statis
- `js/admin/`: modul JavaScript admin
- `js/public/`: modul JavaScript halaman publik
- `js/core/`: autentikasi, guard, router, API, dan utilitas
- `js/services/`: akses data Supabase dan upload Cloudinary
- `scripts/`: utilitas Node.js
- `supabase/`: SQL skema, policy, trigger, role, dan seed

## Modul aktif
- Berita publik: `/konten/berita/`
- Detail berita: `/konten/berita/detail.html?id=UUID`
- Donor darah: `/konten/donor-darah/`
- Portal relawan: `/konten/relawan/`
- Profil PMI: `/konten/tentang/`
- Login: `/akun/login.html`
- Pendaftaran pengguna: `/akun/daftar.html`
- Profil pengguna: `/akun/profil.html`
- Admin: `/admin/index.html`

## Aturan struktur
1. Halaman konten publik hanya berada di bawah `konten/`.
2. Halaman autentikasi hanya berada di bawah `akun/`.
3. Halaman admin hanya berada di bawah `admin/`.
4. Semua import browser memakai path absolut `/js/...` dan `/assets/...`.
5. File `.env`, `supabase/.temp/`, hasil Repomix, dan backup patch tidak masuk Git.
6. Teks source disimpan sebagai UTF-8 tanpa BOM.

