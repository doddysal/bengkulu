import { daftarBeritaTerbit } from "/js/services/berita.service.js";
import { escapeHtml, formatDate } from "/js/core/utils.js";

const root = document.querySelector("[data-latest-news]");
const teksBersih = (nilai = "") => String(nilai).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

if (root) {
  daftarBeritaTerbit(3).then((baris) => {
    root.innerHTML = baris.length ? baris.map((berita) => `
      <a class="home-news-card" href="/konten/berita/detail.html?id=${encodeURIComponent(berita.id)}">
        <div class="home-news-image"><img src="${escapeHtml(berita.url_gambar || "/assets/images/news-placeholder.svg")}" alt="${escapeHtml(berita.judul)}" loading="lazy"></div>
        <div class="home-news-body">
          <div class="home-news-meta"><span>${escapeHtml(berita.kategori || "Berita")}</span><time>${formatDate(berita.tanggal_terbit || berita.dibuat_pada)}</time></div>
          <h3>${escapeHtml(berita.judul)}</h3>
          <p>${escapeHtml(berita.ringkasan || teksBersih(berita.isi).slice(0, 145))}</p>
          <b>Baca Selengkapnya</b>
        </div>
      </a>`).join("") : `<div class="empty">Belum ada berita diterbitkan.</div>`;
  }).catch((error) => {
    console.error("Berita homepage gagal dimuat:", error);
    root.innerHTML = `<div class="empty">Gagal memuat berita: ${escapeHtml(error.message)}</div>`;
  });
}