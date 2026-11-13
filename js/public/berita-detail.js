import {
  ambilBerita,
  daftarKomentar,
  tambahKomentar,
  hapusKomentar,
  daftarSuka,
  tambahSuka,
  hapusSuka
} from "/js/services/berita.service.js";
import { ambilSesi, ambilProfil } from "/js/core/auth.js";
import { escapeHtml, formatDate } from "/js/core/utils.js";

const root = document.querySelector("[data-detail]");
const id = new URLSearchParams(location.search).get("id");
if (!id) location.replace("/konten/berita/");

let berita = null;
let komentar = [];
let suka = [];
let sesi = null;
let profil = null;
let slideAktif = 0;
let timerSlide = null;

function renderGaleri() {
  const foto = [berita.url_gambar, ...(Array.isArray(berita.foto_album) ? berita.foto_album : [])].filter(Boolean);
  if (!foto.length) return "";
  return `<section class="detail-gallery">
    ${foto.map((url, index) => `<img class="${index === 0 ? "active" : ""}" src="${escapeHtml(url)}" alt="Dokumentasi ${escapeHtml(berita.judul)}">`).join("")}
    ${foto.length > 1 ? `<div class="detail-dots">${foto.map((_, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Buka foto ${index + 1}"></button>`).join("")}</div>` : ""}
  </section>`;
}

function renderIkonSuka(disukai) {
  return `<span class="like-icon ${disukai ? "liked" : ""}" aria-hidden="true"></span>`;
}

function renderKomentar() {
  if (!berita.izinkan_komentar) return "";
  const daftar = komentar.map((item) => {
    const bolehHapus = sesi && (
      sesi.user.id === item.pengguna_id ||
      ["admin", "superadmin"].includes(profil?.peran)
    );
    return `<article>
      <b>${escapeHtml(item.nama_pengguna)}</b>
      <small>${formatDate(item.dibuat_pada)}</small>
      <p>${escapeHtml(item.isi)}</p>
      ${bolehHapus ? `<button type="button" data-del-comment="${item.id}">Hapus</button>` : ""}
    </article>`;
  }).join("");

  const formulir = sesi
    ? `<form data-comment-form>
        <textarea name="isi" required maxlength="2000" placeholder="Tulis komentar..."></textarea>
        <button class="btn btn-primary" type="submit">Kirim komentar</button>
      </form>`
    : `<div class="login-comment">Silakan <a href="/akun/login.html">masuk</a> untuk menyukai dan berkomentar.</div>`;

  return `<section class="comments">
    <h2>Komentar (${komentar.length})</h2>
    <div>${daftar}</div>
    ${formulir}
  </section>`;
}

function render() {
  const disukai = Boolean(sesi && suka.some((item) => item.pengguna_id === sesi.user.id));
  const avatar = berita.avatar_penulis
    ? `<img src="${escapeHtml(berita.avatar_penulis)}" alt="Avatar penulis">`
    : `<b>${escapeHtml((berita.nama_penulis || "H").charAt(0))}</b>`;

  root.innerHTML = `${renderGaleri()}
    <article class="detail-article">
      <nav><a href="/index.html">Beranda</a><a href="/konten/berita/">Semua berita</a></nav>
      <span class="detail-label">${escapeHtml(berita.kategori)}</span>
      <h1>${escapeHtml(berita.judul)}</h1>
      <div class="detail-author">
        ${avatar}
        <div><strong>${escapeHtml(berita.nama_penulis || "Humas PMI")}</strong><small>${formatDate(berita.tanggal_terbit || berita.dibuat_pada)}</small></div>
        <button type="button" data-share>Bagikan</button>
      </div>
      <div class="detail-content">${berita.isi || ""}</div>
      <div class="detail-actions">
        <button type="button" data-like>${renderIkonSuka(disukai)}<span>${suka.length} Suka</span></button>
      </div>
      ${renderKomentar()}
    </article>`;

  pasangInteraksi();
  mulaiSlideshow();
}

function mulaiSlideshow() {
  clearInterval(timerSlide);
  const gambar = [...root.querySelectorAll(".detail-gallery > img")];
  const titik = [...root.querySelectorAll("[data-slide]")];
  if (gambar.length < 2) return;
  const pindah = (index) => {
    slideAktif = (index + gambar.length) % gambar.length;
    gambar.forEach((node, nomor) => node.classList.toggle("active", nomor === slideAktif));
    titik.forEach((node, nomor) => node.classList.toggle("active", nomor === slideAktif));
  };
  titik.forEach((tombol) => tombol.addEventListener("click", () => pindah(Number(tombol.dataset.slide))));
  timerSlide = setInterval(() => pindah(slideAktif + 1), 4500);
}

function pasangInteraksi() {
  root.querySelector("[data-share]")?.addEventListener("click", async () => {
    if (navigator.share) await navigator.share({ title: berita.judul, url: location.href });
    else { await navigator.clipboard.writeText(location.href); alert("Link disalin."); }
  });

  root.querySelector("[data-like]")?.addEventListener("click", async () => {
    if (!sesi) { location.href = "/akun/login.html"; return; }
    const milikSendiri = suka.find((item) => item.pengguna_id === sesi.user.id);
    if (milikSendiri) await hapusSuka(id, sesi.user.id);
    else await tambahSuka({ berita_id: id, pengguna_id: sesi.user.id });
    suka = await daftarSuka(id);
    render();
  });

  root.querySelector("[data-comment-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isi = event.currentTarget.elements.isi.value.trim();
    if (!isi) return;
    await tambahKomentar({
      berita_id: id,
      pengguna_id: sesi.user.id,
      nama_pengguna: profil?.nama || sesi.user.email.split("@")[0],
      isi
    });
    komentar = await daftarKomentar(id);
    render();
  });

  root.querySelectorAll("[data-del-comment]").forEach((tombol) => {
    tombol.addEventListener("click", async () => {
      await hapusKomentar(tombol.dataset.delComment);
      komentar = await daftarKomentar(id);
      render();
    });
  });
}

(async function muat() {
  try {
    [berita, komentar, suka] = await Promise.all([
      ambilBerita(id),
      daftarKomentar(id),
      daftarSuka(id)
    ]);
    sesi = await ambilSesi();
    if (sesi) profil = await ambilProfil();
    document.title = `${berita.judul} | PMI Kota Bengkulu`;
    render();
  } catch (error) {
    console.error(error);
    root.innerHTML = `<div class="detail-loading">${escapeHtml(error.message || "Berita gagal dimuat.")}</div>`;
  }
})();