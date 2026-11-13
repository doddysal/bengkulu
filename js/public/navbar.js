import { ambilPengaturanSitus } from "/js/services/pengaturan-situs.service.js";
import { ambilSesi, ambilProfil, keluar } from "/js/core/auth.js";

const bawaan = {
  header_atas: "KOTA",
  header_bawah: "BENGKULU",
  judul_situs: "PMI Kota Bengkulu",
  logo_url: "assets/images/logo-pmi-kota-bengkulu.png"
};

const aman = (nilai = "") => String(nilai).replace(/[&<>"']/g, (karakter) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[karakter]));

function urlAset(nilai) {
  const url = String(nilai || "").trim();
  if (/^https?:\/\//i.test(url)) return url;
  return "/" + url.replace(/^\/+/, "");
}

function menuDesktop() {
  return `<nav class="nav-links" aria-label="Menu utama">
    <a href="/index.html">Beranda</a>
    <a href="/konten/berita/">Berita</a>
    <div class="nav-drop">
      <button type="button">Tentang PMI <i class="chevron"></i></button>
      <div class="nav-drop-menu">
        <a href="/konten/tentang/sejarah.html">Sejarah PMI</a>
        <a href="/konten/tentang/prinsip.html">Prinsip Gerakan</a>
        <a href="/konten/tentang/visi-misi.html">Visi Misi dan Struktur</a>
        <a href="/konten/tentang/layanan.html">Kegiatan dan Layanan</a>
      </div>
    </div>
    <a href="/konten/donor-darah/">Donor Darah</a>
    <a href="/konten/relawan/">Portal Relawan</a>
  </nav>`;
}

function menuPengguna(profil) {
  if (!profil) return `<a class="nav-login" href="/akun/login.html">Login</a>`;
  const nama = profil.nama || "Pengguna";
  const avatar = profil.avatar_url
    ? `<img src="${aman(profil.avatar_url)}" alt="Avatar pengguna">`
    : `<span>${aman(nama.charAt(0).toUpperCase())}</span>`;
  const dashboard = ["editor", "admin", "superadmin"].includes(profil.peran)
    ? `<a href="/admin/index.html">Dashboard Admin</a>` : "";
  return `<div class="profile-menu">
    <button class="profile-trigger" type="button" aria-expanded="false">
      ${avatar}<b>${aman(nama.split(" ")[0])}</b><i class="chevron"></i>
    </button>
    <div class="profile-dropdown">
      <small>Masuk sebagai</small><strong>${aman(nama)}</strong>
      <a href="/akun/profil.html">Profil dan Avatar</a>${dashboard}
      <button type="button" data-keluar>Keluar</button>
    </div>
  </div>`;
}

async function mulaiNavbar() {
  const root = document.querySelector("[data-navbar]");
  if (!root) return;
  let konfigurasi = { ...bawaan };
  let profil = null;
  try { konfigurasi = { ...konfigurasi, ...(await ambilPengaturanSitus()) }; }
  catch (error) { console.warn("Navbar memakai konfigurasi bawaan.", error); }
  try { if (await ambilSesi()) profil = await ambilProfil(); }
  catch (error) { console.warn("Profil navbar tidak tersedia.", error); }

  root.innerHTML = `<div class="nav">
    <a class="brand" href="/index.html">
      <img class="brand-logo" src="${aman(urlAset(konfigurasi.logo_url))}" alt="Logo ${aman(konfigurasi.judul_situs)}">
      <span class="brand-copy"><strong>${aman(konfigurasi.header_atas)}</strong><span>${aman(konfigurasi.header_bawah)}</span></span>
    </a>
    ${menuDesktop()}
    <div class="nav-actions">${menuPengguna(profil)}</div>
    <button class="nav-toggle" type="button" aria-label="Buka menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
  <nav class="mobile-nav" aria-label="Menu seluler">
    <a href="/index.html">Beranda</a><a href="/konten/berita/">Berita</a>
    <a href="/konten/donor-darah/">Donor Darah</a><a href="/konten/relawan/">Portal Relawan</a>
    <a href="/konten/tentang/sejarah.html">Tentang PMI</a>
    ${profil ? `<a href="/akun/profil.html">Profil dan Avatar</a>` : `<a href="/akun/login.html">Login</a>`}
  </nav>`;

  const pemicu = root.querySelector(".profile-trigger");
  const dropdown = root.querySelector(".profile-dropdown");
  pemicu?.addEventListener("click", () => {
    const terbuka = dropdown.classList.toggle("open");
    pemicu.setAttribute("aria-expanded", String(terbuka));
  });
  root.querySelector("[data-keluar]")?.addEventListener("click", async () => {
    await keluar(); location.replace("/index.html");
  });
  const tombol = root.querySelector(".nav-toggle");
  const seluler = root.querySelector(".mobile-nav");
  tombol?.addEventListener("click", () => {
    const terbuka = seluler.classList.toggle("open");
    tombol.setAttribute("aria-expanded", String(terbuka));
  });
  document.title = konfigurasi.judul_situs;
}

mulaiNavbar().catch((error) => console.error("Navbar gagal dimuat:", error));