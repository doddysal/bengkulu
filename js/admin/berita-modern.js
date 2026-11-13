// import{wajibAkses}from"/js/core/guard.js";import{daftarSemuaBerita,simpanBerita,hapusBerita}from"../services/berita.service.js";import{unggahGambar,pasangPemilihGambar}from"../services/upload-gambar.service.js";import{slugify,escapeHtml,formatDate}from"../core/utils.js";
// const akses=await wajibAkses("berita"),form=document.querySelector("[data-form]"),list=document.querySelector("[data-news-list]"),cari=document.querySelector("[data-cari]"),status=document.querySelector("[data-form-status]");let rows=[],album=[];const profil=akses?.profil||{};form.nama_penulis.value=profil.nama||"Humas PMI";
// const quill=new Quill("#editor-berita",{theme:"snow",placeholder:"Tulis isi berita...",modules:{toolbar:[[{'header':[1,2,3,false]}],["bold","italic","underline","strike"],[{'list':'ordered'},{'list':'bullet'}],[{'align':[]}],["blockquote","link","image","video"],["clean"]]}});
// pasangPemilihGambar({root:form,inputFile:"[data-cover-file]",inputUrl:"[data-cover-url]",preview:"[data-cover-preview]",tombol:"[data-cover-upload]",pesan:"[data-cover-status]",folder:"berita/sampul"});
// function renderAlbum(){const g=document.querySelector("[data-album-grid]");g.innerHTML=album.map((u,i)=>`<figure><img src="${escapeHtml(u)}" alt=""><button type="button" data-rm="${i}">x</button></figure>`).join("");g.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{album.splice(Number(b.dataset.rm),1);renderAlbum()})}document.querySelector("[data-album-upload]").onclick=async()=>{const file=document.querySelector("[data-album-file]").files?.[0],msg=document.querySelector("[data-album-status]");if(!file)return msg.textContent="Pilih gambar.";try{const r=await unggahGambar(file,"berita/album",p=>msg.textContent=`Mengunggah ${p}%...`);album.push(r.url);renderAlbum();msg.textContent="Foto ditambahkan."}catch(e){msg.textContent=e.message}};
// function reset(){form.reset();form.id.value="";form.nama_penulis.value=profil.nama||"Humas PMI";quill.setText("");album=[];renderAlbum();document.querySelector("[data-cover-preview]").hidden=true;document.querySelector("[data-batal]").classList.add("hidden");status.textContent=""}
// function edit(x){form.id.value=x.id;form.judul.value=x.judul;form.kategori.value=x.kategori;form.status.value=x.status;form.ringkasan.value=x.ringkasan||"";form.url_gambar.value=x.url_gambar||"";form.nama_penulis.value=x.nama_penulis||profil.nama||"Humas PMI";form.izinkan_komentar.checked=x.izinkan_komentar!==false;quill.root.innerHTML=x.isi||"";album=Array.isArray(x.foto_album)?[...x.foto_album]:[];renderAlbum();const p=document.querySelector("[data-cover-preview]");p.src=x.url_gambar||"";p.hidden=!x.url_gambar;document.querySelector("[data-batal]").classList.remove("hidden");scrollTo({top:0,behavior:"smooth"})}
// function render(){const q=cari.value.toLowerCase();const data=rows.filter(x=>`${x.judul} ${x.kategori}`.toLowerCase().includes(q));list.innerHTML=data.length?data.map(x=>`<article class="news-row"><div class="news-thumb">${x.url_gambar?`<img src="${escapeHtml(x.url_gambar)}">`:"<span>IMG</span>"}</div><div><h3>${escapeHtml(x.judul)}</h3><p>${formatDate(x.tanggal_terbit||x.dibuat_pada)} · ${escapeHtml(x.nama_penulis||"Humas PMI")}</p></div><span class="status-pill status-${x.status}">${x.status}</span><div class="aksi"><button class="btn-kecil" data-edit="${x.id}">Edit</button><button class="btn-kecil btn-hapus" data-del="${x.id}">Hapus</button></div></article>`).join(""):`<div class="empty-admin">Belum ada berita.</div>`;list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(rows.find(x=>x.id===b.dataset.edit)));list.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Hapus berita permanen?")){await hapusBerita(b.dataset.del);await muat()}})}async function muat(){rows=await daftarSemuaBerita();render()}cari.oninput=render;document.querySelector("[data-batal]").onclick=reset;
// form.onsubmit=async e=>{e.preventDefault();const btn=document.querySelector("[data-submit]");btn.disabled=true;status.textContent="Menyimpan...";const st=form.status.value,payload={judul:form.judul.value.trim(),slug:slugify(form.judul.value),kategori:form.kategori.value,ringkasan:form.ringkasan.value.trim(),isi:quill.root.innerHTML,url_gambar:form.url_gambar.value.trim()||null,status:st,pembuat_id:akses.sesi.user.id,nama_penulis:form.nama_penulis.value,avatar_penulis:profil.avatar_url||null,foto_album:album,izinkan_komentar:form.izinkan_komentar.checked,tanggal_terbit:st==="terbit"?new Date().toISOString():null};try{await simpanBerita(payload,form.id.value||null);status.textContent="Berita tersimpan.";reset();await muat()}catch(err){status.textContent=err.message}finally{btn.disabled=false}};muat();
/**
 * =======================================================================
 * MANAJEMEN BERITA CONTROLLER
 * =======================================================================
 */

// --- 1. Imports ---
import { wajibAkses } from "/js/core/guard.js";
import { daftarSemuaBerita, simpanBerita, hapusBerita } from "../services/berita.service.js";
import { unggahGambar, pasangPemilihGambar } from "../services/upload-gambar.service.js";
import { slugify, escapeHtml, formatDate } from "../core/utils.js";


// --- 2. Security & State Init ---
const akses  = await wajibAkses("berita");
const profil = akses?.profil || {};

let rows  = [];
let album = [];


// --- 3. DOM Elements ---
const form   = document.querySelector("[data-form]");
const list   = document.querySelector("[data-news-list]");
const cari   = document.querySelector("[data-cari]");
const status = document.querySelector("[data-form-status]");

form.nama_penulis.value = profil.nama || "Humas PMI";


// --- 4. Rich Text Editor & Image Pickers ---
const quill = new Quill("#editor-berita", {
  theme: "snow",
  placeholder: "Tulis isi berita...",
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ["blockquote", "link", "image", "video"],
      ["clean"]
    ]
  }
});

pasangPemilihGambar({
  root:      form,
  inputFile: "[data-cover-file]",
  inputUrl:  "[data-cover-url]",
  preview:   "[data-cover-preview]",
  tombol:    "[data-cover-upload]",
  pesan:     "[data-cover-status]",
  folder:    "berita/sampul"
});


// --- 5. Album Management ---
function renderAlbum() {
  const grid = document.querySelector("[data-album-grid]");
  
  grid.innerHTML = album.map((url, i) => `
    <figure>
      <img src="${escapeHtml(url)}" alt="">
      <button type="button" data-rm="${i}">x</button>
    </figure>
  `).join("");
  
  grid.querySelectorAll("[data-rm]").forEach(btn => {
    btn.onclick = () => {
      album.splice(Number(btn.dataset.rm), 1);
      renderAlbum();
    };
  });
}

document.querySelector("[data-album-upload]").onclick = async () => {
  const file = document.querySelector("[data-album-file]").files?.[0];
  const msg  = document.querySelector("[data-album-status]");
  
  if (!file) return msg.textContent = "Pilih gambar.";
  
  try {
    const res = await unggahGambar(file, "berita/album", (progress) => {
      msg.textContent = `Mengunggah ${progress}%...`;
    });
    
    album.push(res.url);
    renderAlbum();
    msg.textContent = "Foto ditambahkan.";
    
  } catch (err) {
    msg.textContent = err.message;
  }
};


// --- 6. Form Handlers ---
function reset() {
  form.reset();
  form.id.value           = "";
  form.nama_penulis.value = profil.nama || "Humas PMI";
  
  quill.setText("");
  album = [];
  renderAlbum();
  
  document.querySelector("[data-cover-preview]").hidden = true;
  document.querySelector("[data-batal]").classList.add("hidden");
  status.textContent = "";
}

function edit(data) {
  form.id.value                 = data.id;
  form.judul.value              = data.judul;
  form.kategori.value           = data.kategori;
  form.status.value             = data.status;
  form.ringkasan.value          = data.ringkasan || "";
  form.url_gambar.value         = data.url_gambar || "";
  form.nama_penulis.value       = data.nama_penulis || profil.nama || "Humas PMI";
  form.izinkan_komentar.checked = data.izinkan_komentar !== false;
  
  quill.root.innerHTML          = data.isi || "";
  album                         = Array.isArray(data.foto_album) ? [...data.foto_album] : [];
  
  renderAlbum();
  
  const preview = document.querySelector("[data-cover-preview]");
  preview.src    = data.url_gambar || "";
  preview.hidden = !data.url_gambar;
  
  document.querySelector("[data-batal]").classList.remove("hidden");
  scrollTo({ top: 0, behavior: "smooth" });
}


// --- 7. List Rendering & Data Loader ---
function render() {
  const keyword = cari.value.toLowerCase();
  const dataFiltered = rows.filter(x => `${x.judul} ${x.kategori}`.toLowerCase().includes(keyword));
  
  list.innerHTML = dataFiltered.length ? dataFiltered.map(x => `
    <article class="news-row">
      <div class="news-thumb">
        ${x.url_gambar ? `<img src="${escapeHtml(x.url_gambar)}">` : "<span>IMG</span>"}
      </div>
      <div>
        <h3>${escapeHtml(x.judul)}</h3>
        <p>${formatDate(x.tanggal_terbit || x.dibuat_pada)} · ${escapeHtml(x.nama_penulis || "Humas PMI")}</p>
      </div>
      <span class="status-pill status-${x.status}">${x.status}</span>
      
      <div class="aksi">
        <button class="btn-kecil" data-edit="${x.id}">Edit</button>
        <button class="btn-kecil btn-hapus" data-del="${x.id}">Hapus</button>
      </div>
    </article>
  `).join("") : `<div class="empty-admin">Belum ada berita.</div>`;
  
  // Attach edit & delete actions
  list.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => edit(rows.find(x => x.id === btn.dataset.edit));
  });
  
  list.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Hapus berita permanen?")) {
        await hapusBerita(btn.dataset.del);
        await muat();
      }
    };
  });
}

async function muat() {
  rows = await daftarSemuaBerita();
  render();
}


// --- 8. Event Listeners & Form Submission ---
cari.oninput = render;
document.querySelector("[data-batal]").onclick = reset;

form.onsubmit = async (e) => {
  e.preventDefault();
  
  const btn = document.querySelector("[data-submit]");
  btn.disabled = true;
  status.textContent = "Menyimpan...";
  
  const st = form.status.value;
  
  // Data Payload Preparation
  const payload = {
    judul:            form.judul.value.trim(),
    slug:             slugify(form.judul.value),
    kategori:         form.kategori.value,
    ringkasan:        form.ringkasan.value.trim(),
    isi:              quill.root.innerHTML,
    url_gambar:       form.url_gambar.value.trim() || null,
    status:           st,
    pembuat_id:       akses.sesi.user.id,
    nama_penulis:     form.nama_penulis.value,
    avatar_penulis:   profil.avatar_url || null,
    foto_album:       album,
    izinkan_komentar: form.izinkan_komentar.checked,
    tanggal_terbit:   st === "terbit" ? new Date().toISOString() : null
  };
  
  try {
    await simpanBerita(payload, form.id.value || null);
    status.textContent = "Berita tersimpan.";
    reset();
    await muat();
  } catch (err) {
    status.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
};


// --- 9. Initial Load ---
muat();