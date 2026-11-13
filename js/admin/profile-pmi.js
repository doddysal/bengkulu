import { wajibLogin, punyaAkses } from "/js/core/guard.js";
import { daftarProfilPmi, simpanProfilPmi } from "/js/services/profile-pmi.service.js";
import { unggahGambar } from "/js/services/upload-gambar.service.js";

const aksesLogin=await wajibLogin();const profilLogin=aksesLogin?.profil;

const editor = document.querySelector("[data-editor]");const AKSES_TAB={sejarah:"sejarah",prinsip:"prinsip",visi_misi:"visi_misi",layanan:"layanan"};document.querySelectorAll("[data-tab]").forEach(b=>{if(!punyaAkses(profilLogin,AKSES_TAB[b.dataset.tab]))b.remove()});const tabPertama=document.querySelector("[data-tab]");if(!tabPertama){location.replace("/admin/index.html?akses=ditolak");throw new Error("Tidak ada akses Profil PMI")};
const hasil = await daftarProfilPmi();
const rows = Object.fromEntries((hasil || []).map((item) => [item.kode_bagian, item]));
let tabAktif = tabPertama.dataset.tab;

const esc = (nilai = "") => String(nilai).replace(/[&<>"']/g, (karakter) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[karakter]));

const dataBagian = (kode) => rows[kode]?.data || {};

async function simpan(kode, data) {
  const tersimpan = await simpanProfilPmi({
    kode_bagian: kode,
    judul: rows[kode]?.judul || kode,
    data
  });
  rows[kode] = tersimpan;
  alert("Data Profil PMI berhasil disimpan.");
}

function renderSejarah() {
  const data = dataBagian("sejarah");
  let daftar = [
    ...(data.timeline_nasional || []).map((item) => ({ ...item, jenis: "nasional" })),
    ...(data.timeline_lokal || []).map((item) => ({ ...item, jenis: "lokal" }))
  ];
  if (!daftar.length) daftar = [{ tahun: "", judul: "", teks: "", media: "", jenis: "lokal", aktif: true }];

  editor.innerHTML = `
    <form class="profile-editor">
      <section class="card cms-form">
        <h2>Sejarah PMI</h2><div class="form-grid"><label class="field">Judul halaman<input name="judul_halaman" value="${esc(rows.sejarah?.judul || "")}"></label><label class="field">Label nasional<input name="label_nasional" value="${esc(data.label_nasional || "")}"></label><label class="field">Label lokal<input name="label_lokal" value="${esc(data.label_lokal || "")}"></label></div>
        <label class="field">Pengantar
          <textarea name="pengantar" rows="4">${esc(data.pengantar)}</textarea>
        </label>
      </section>
      <section class="card cms-form">
        <div class="profile-section-title">
          <h2>Timeline Nasional dan Kota Bengkulu</h2>
          <button class="btn btn-secondary" type="button" data-add>Tambah Tonggak</button>
        </div>
        <div data-items></div>
      </section>
      <button class="btn btn-primary profile-save" type="submit">Simpan Sejarah</button>
    </form>`;

  const form = editor.querySelector("form");
  const box = form.querySelector("[data-items]");

  function gambarDaftar() {
    box.innerHTML = daftar.map((item, index) => `
      <article class="profile-repeat">
        <div class="form-grid">
          <label class="field">Tahun
            <input data-index="${index}" data-field="tahun" value="${esc(item.tahun)}">
          </label>
          <label class="field">Jenis
            <select data-index="${index}" data-field="jenis">
              <option value="nasional" ${item.jenis === "nasional" ? "selected" : ""}>Nasional</option>
              <option value="lokal" ${item.jenis !== "nasional" ? "selected" : ""}>Kota Bengkulu</option>
            </select>
          </label>
          <label class="field field-wide">Judul
            <input data-index="${index}" data-field="judul" value="${esc(item.judul)}">
          </label>
          <label class="field field-wide">Uraian
            <textarea data-index="${index}" data-field="teks">${esc(item.teks)}</textarea>
          </label>
          <label class="field field-wide">URL foto/video
            <input data-index="${index}" data-field="media" value="${esc(item.media)}">
          </label>
        </div>
        <button type="button" class="btn-kecil btn-hapus" data-remove="${index}">Hapus</button>
      </article>`).join("");
  }

  gambarDaftar();
  box.addEventListener("input", (event) => {
    const index = Number(event.target.dataset.index);
    const field = event.target.dataset.field;
    if (field && daftar[index]) daftar[index][field] = event.target.value;
  });
  box.addEventListener("click", (event) => {
    const tombol = event.target.closest("[data-remove]");
    if (!tombol) return;
    daftar.splice(Number(tombol.dataset.remove), 1);
    gambarDaftar();
  });
  form.querySelector("[data-add]").addEventListener("click", () => {
    daftar.push({ tahun: "", judul: "", teks: "", media: "", jenis: "lokal", aktif: true });
    gambarDaftar();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await simpan("sejarah", {
      pengantar: form.elements.pengantar.value,
      timeline_nasional: daftar.filter((item) => item.jenis === "nasional"),
      timeline_lokal: daftar.filter((item) => item.jenis !== "nasional")
    });
  });
}

function renderPrinsip() {
  const data = dataBagian("prinsip");
  const nama = data.nama || [];
  const teks = [...(data.teks || [])];
  const gambar = [...(data.gambar || [])];

  editor.innerHTML = `
    <form class="profile-editor">
      <section class="card cms-form">
        <h2>Prinsip Gerakan</h2><div class="form-grid"><label class="field">Judul halaman<input name="judul_halaman" value="${esc(rows.prinsip?.judul || "")}"></label><label class="field field-wide">Pengantar<textarea name="pengantar" rows="3">${esc(data.pengantar || "")}</textarea></label></div>
        <div class="principle-admin-grid">
          ${nama.map((judul, index) => `
            <article>
              <h3>${esc(judul)}</h3>
              <img data-image="${index}" src="${esc(gambar[index] || "/assets/images/news-placeholder.svg")}" alt="Gambar ${esc(judul)}">
              <textarea data-text="${index}" rows="5">${esc(teks[index])}</textarea>
              <input type="file" accept="image/*" data-file="${index}">
              <button type="button" class="btn btn-secondary" data-upload="${index}">Upload Gambar</button>
            </article>`).join("")}
        </div>
        <label class="field">URL YouTube<input name="youtube_url" value="${esc(data.youtube_url)}"></label>
        <label class="field">Kutipan<input name="kutipan" value="${esc(data.kutipan)}"></label>
      </section>
      <button class="btn btn-primary profile-save" type="submit">Simpan Prinsip</button>
    </form>`;

  const form = editor.querySelector("form");
  form.querySelectorAll("[data-upload]").forEach((tombol) => {
    tombol.addEventListener("click", async () => {
      const index = Number(tombol.dataset.upload);
      const file = form.querySelector(`[data-file="${index}"]`).files?.[0];
      if (!file) return alert("Pilih gambar lebih dahulu.");
      const hasil = await unggahGambar(file, "profile/prinsip");
      gambar[index] = hasil.url;
      form.querySelector(`[data-image="${index}"]`).src = hasil.url;
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.querySelectorAll("[data-text]").forEach((input) => {
      teks[Number(input.dataset.text)] = input.value;
    });
    await simpan("prinsip", {
      ...data,
      nama,
      teks,
      gambar,
      youtube_url: form.elements.youtube_url.value,
      kutipan: form.elements.kutipan.value
    });
  });
}

function renderVisiMisi() {
  const data = dataBagian("visi_misi");
  editor.innerHTML = `
    <form class="profile-editor">
      <section class="card cms-form">
        <h2>Visi, Misi, dan Struktur</h2><div class="form-grid"><label class="field">Judul halaman<input name="judul_halaman" value="${esc(rows.visi_misi?.judul || "")}"></label><label class="field">Judul Visi<input name="judul_visi" value="${esc(data.judul_visi || "Visi")}"></label><label class="field">Judul Misi<input name="judul_misi" value="${esc(data.judul_misi || "Misi")}"></label><label class="field">Judul Struktur<input name="judul_struktur" value="${esc(data.judul_struktur || "Struktur Organisasi")}"></label></div>
        <label class="field">Visi<textarea name="visi" rows="4">${esc(data.visi)}</textarea></label>
        <label class="field">Misi, satu butir per baris<textarea name="misi" rows="7">${esc((data.misi || []).join("\n"))}</textarea></label>
        <label class="field">Masa bakti<input name="masa_bakti" value="${esc(data.masa_bakti)}"></label>
        <label class="field">URL gambar struktur<input name="struktur_gambar" value="${esc(data.struktur_gambar)}"></label>
        <label class="field">Data personel JSON<textarea name="personel" rows="8">${esc(JSON.stringify(data.personel || [], null, 2))}</textarea></label>
        <label class="field">Unit tambahan JSON<textarea name="unit_tambahan" rows="6">${esc(JSON.stringify(data.unit_tambahan || [], null, 2))}</textarea></label>
      </section>
      <button class="btn btn-primary profile-save" type="submit">Simpan Organisasi</button>
    </form>`;

  const form = editor.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await simpan("visi_misi", {
        visi: form.elements.visi.value,
        misi: form.elements.misi.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        masa_bakti: form.elements.masa_bakti.value,
        struktur_gambar: form.elements.struktur_gambar.value,
        personel: JSON.parse(form.elements.personel.value || "[]"),
        unit_tambahan: JSON.parse(form.elements.unit_tambahan.value || "[]")
      });
    } catch (error) {
      alert("JSON tidak valid: " + error.message);
    }
  });
}

function renderLayanan() {
  const data = dataBagian("layanan");
  editor.innerHTML = `
    <form class="profile-editor">
      <section class="card cms-form">
        <h2>Kegiatan dan Layanan</h2><label class="field">Nama halaman<input name="judul_halaman" value="${esc(rows.layanan?.judul || "")}"></label>
        <div class="form-grid">
          <label class="field">Subjudul<input name="header_subtitle" value="${esc(data.header_subtitle)}"></label>
          <label class="field">Judul<input name="header_title" value="${esc(data.header_title)}"></label>
          <label class="field field-wide">Deskripsi<input name="header_desc" value="${esc(data.header_desc)}"></label>
          <label class="field">WhatsApp Posko<input name="wa_posko" value="${esc(data.wa_posko)}"></label>
          <label class="field">Judul CTA<input name="cta_title" value="${esc(data.cta_title)}"></label>
          <label class="field field-wide">Deskripsi CTA<input name="cta_desc" value="${esc(data.cta_desc)}"></label>
          <label class="field">Teks tombol detail<input name="button_text" value="${esc(data.button_text || "")}"></label><label class="field">Teks tombol WhatsApp<input name="whatsapp_text" value="${esc(data.whatsapp_text || "")}"></label><label class="field field-wide">Teks saat kosong<input name="empty_text" value="${esc(data.empty_text || "")}"></label><label class="field field-wide">Daftar layanan JSON<textarea name="services" rows="18">${esc(JSON.stringify(data.services || [], null, 2))}</textarea></label>
        </div>
      </section>
      <button class="btn btn-primary profile-save" type="submit">Simpan Layanan</button>
    </form>`;

  const form = editor.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await simpan("layanan", {
        header_subtitle: form.elements.header_subtitle.value,
        header_title: form.elements.header_title.value,
        header_desc: form.elements.header_desc.value,
        wa_posko: form.elements.wa_posko.value.replace(/\D/g, ""),
        cta_title: form.elements.cta_title.value,
        cta_desc: form.elements.cta_desc.value,
        services: JSON.parse(form.elements.services.value || "[]")
      });
    } catch (error) {
      alert("JSON layanan tidak valid: " + error.message);
    }
  });
}

function render() {
  if (tabAktif === "prinsip") return renderPrinsip();
  if (tabAktif === "visi_misi") return renderVisiMisi();
  if (tabAktif === "layanan") return renderLayanan();
  return renderSejarah();
}

document.querySelectorAll("[data-tab]").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("active", item === tombol));
    tabAktif = tombol.dataset.tab;
    render();
  });
});

render();