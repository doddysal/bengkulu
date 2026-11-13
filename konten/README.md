# Konten Publik PMI Kota Bengkulu

Folder `konten/` adalah satu-satunya klaster halaman informasi publik.

## Subfolder
- `berita/`: daftar berita dan detail berita
- `donor-darah/`: informasi layanan donor darah
- `relawan/`: portal PMR, KSR, dan TSR
- `tentang/`: sejarah, prinsip dasar, visi-misi/struktur, serta kegiatan dan layanan

## Sumber data
- Hero setiap halaman: tabel `cms_halaman`, dikelola melalui **Admin > Pengaturan CMS**.
- Materi Profil PMI: tabel `profil_pmi`, dikelola melalui **Admin > Profil PMI**.
- Berita: tabel `berita`, dikelola melalui **Admin > Berita**.
- Pengguna dan role: tabel `pengguna`, dikelola melalui **Admin > Manajemen Pengguna**.

## Konvensi
- Gunakan `/assets/...` untuk CSS dan gambar statis.
- Gunakan `/js/...` untuk modul browser.
- Jangan membuat kembali folder `berita/`, `donor-darah/`, atau `relawan/` di root.
- Semua file teks disimpan sebagai UTF-8 tanpa BOM.