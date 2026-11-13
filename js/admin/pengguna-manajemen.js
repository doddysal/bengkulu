import { wajibAkses } from "/js/core/guard.js";
import { daftarPengguna, perbaruiPengguna } from "/js/services/pengguna.service.js";

await wajibAkses("pengguna");

const root = document.querySelector("[data-users]");
const stats = document.querySelector("[data-stats]");
const search = document.querySelector("[data-search]");
const roleFilter = document.querySelector("[data-role-filter]");
const pagination = document.querySelector("[data-pagination]");
const dialog = document.querySelector("[data-dialog]");
const form = document.querySelector("[data-edit-form]");
const PAGE_SIZE = 25;

const ROLES = [
  "pengguna", "superadmin", "admin_utama", "admin_berita",
  "admin_donor_darah", "admin_relawan", "admin_sejarah", "admin_prinsip",
  "admin_visi_misi", "admin_layanan", "admin_agenda", "admin_galeri"
];
const HAK = {
  dashboard: "Dashboard", berita: "Berita", donor_darah: "Donor Darah",
  relawan: "Relawan", sejarah: "Sejarah PMI", prinsip: "Prinsip",
  visi_misi: "Visi Misi", layanan: "Layanan", agenda: "Agenda",
  galeri: "Galeri", pengguna: "Pengguna", cms: "CMS"
};
const PRESET = {
  pengguna: [], superadmin: Object.keys(HAK),
  admin_utama: Object.keys(HAK).filter((item) => item !== "pengguna"),
  admin_berita: ["dashboard", "berita"],
  admin_donor_darah: ["dashboard", "donor_darah"],
  admin_relawan: ["dashboard", "relawan"], admin_sejarah: ["dashboard", "sejarah"],
  admin_prinsip: ["dashboard", "prinsip"], admin_visi_misi: ["dashboard", "visi_misi"],
  admin_layanan: ["dashboard", "layanan"], admin_agenda: ["dashboard", "agenda"],
  admin_galeri: ["dashboard", "galeri"]
};

let rows = await daftarPengguna();
let tab = "semua";
let page = 1;

const esc = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

form.elements.role_admin.innerHTML = ROLES.map((role) =>
  `<option value="${role}">${role.replaceAll("_", " ")}</option>`
).join("");
form.querySelector("[data-access-checks]").innerHTML = Object.entries(HAK).map(([key, label]) =>
  `<label><input type="checkbox" name="hak" value="${key}"> ${label}</label>`
).join("");
roleFilter.innerHTML += ROLES.map((role) =>
  `<option value="${role}">${role.replaceAll("_", " ")}</option>`
).join("");

function updateStats() {
  const count = (predicate) => rows.filter(predicate).length;
  const values = [
    ["Total", rows.length],
    ["Pendaftar Baru", count((item) => item.status_pendaftaran === "menunggu")],
    ["Admin", count((item) => item.role_admin && item.role_admin !== "pengguna")],
    ["Aktif", count((item) => item.status_pendaftaran === "aktif" && item.aktif)],
    ["Diblokir", count((item) => item.status_pendaftaran === "diblokir" || !item.aktif)]
  ];
  stats.innerHTML = values.map(([label, total]) => `<article><b>${total}</b><span>${label}</span></article>`).join("");
}

function filteredRows() {
  const query = search.value.trim().toLowerCase();
  return rows.filter((item) => {
    const searchable = `${item.nama || ""} ${item.email || ""} ${item.telepon || ""} ${item.role_admin || ""} ${(item.hak_akses || []).join(" ")}`.toLowerCase();
    const tabMatches = tab === "semua" ||
      (tab === "admin" && item.role_admin !== "pengguna") ||
      (tab === "aktif" && item.status_pendaftaran === "aktif" && item.aktif) ||
      (tab === "diblokir" && (item.status_pendaftaran === "diblokir" || !item.aktif)) ||
      item.status_pendaftaran === tab;
    return tabMatches && searchable.includes(query) && (!roleFilter.value || item.role_admin === roleFilter.value);
  });
}

function openEdit(item) {
  form.elements.id.value = item.id;
  form.elements.status_pendaftaran.value = item.status_pendaftaran || "menunggu";
  form.elements.jenis_pengguna.value = item.jenis_pengguna || "umum";
  form.elements.role_admin.value = item.role_admin || "pengguna";
  form.elements.aktif.checked = Boolean(item.aktif);
  form.elements.catatan_admin.value = item.catatan_admin || "";
  form.querySelector("[data-user-name]").textContent = item.email || "";
  form.querySelector("[data-dialog-display-name]").textContent = item.nama || "Tanpa Nama";
  form.querySelector("[data-dialog-display-email]").textContent = item.email || "Email belum tersedia";
  form.querySelector("[data-dialog-status]").textContent = item.status_pendaftaran || "menunggu";
  const image = form.querySelector("[data-dialog-avatar-image]");
  const initial = form.querySelector("[data-dialog-avatar-initial]");
  if (item.avatar_url) {
    image.src = item.avatar_url;
    image.hidden = false;
    initial.hidden = true;
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    initial.hidden = false;
    initial.textContent = (item.nama || "A").trim().charAt(0).toUpperCase();
  }
  form.querySelectorAll('[name="hak"]').forEach((checkbox) => {
    checkbox.checked = (item.hak_akses || []).includes(checkbox.value);
  });
  form.querySelector("[data-edit-status]").textContent = "";
  dialog.showModal();
}

function render() {
  updateStats();
  const data = filteredRows();
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  page = Math.min(page, totalPages);
  const visible = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  root.innerHTML = visible.length ? visible.map((item) => `
    <article class="managed-user-card">
      <div class="managed-avatar">${item.avatar_url ? `<img src="${esc(item.avatar_url)}" alt="">` : `<span>${esc((item.nama || "?").charAt(0))}</span>`}</div>
      <div class="managed-identity"><h3>${esc(item.nama || "Tanpa Nama")}</h3><p>${esc(item.email || "-")} | ${esc(item.telepon || "-")}</p><div><span class="status-${esc(item.status_pendaftaran)}">${esc(item.status_pendaftaran)}</span><span>${esc(item.jenis_pengguna)}</span><span>${esc((item.role_admin || "pengguna").replaceAll("_", " "))}</span></div></div>
      <div class="managed-access">${(item.hak_akses || []).slice(0, 5).map((access) => `<small>${esc(HAK[access] || access)}</small>`).join("")}${(item.hak_akses || []).length > 5 ? `<small>+${item.hak_akses.length - 5}</small>` : ""}</div>
      <button class="btn-kecil" type="button" data-edit="${item.id}">Atur</button>
    </article>`).join("") : '<div class="empty-admin">Tidak ada pengguna sesuai filter.</div>';
  pagination.innerHTML = `<button ${page <= 1 ? "disabled" : ""} data-page="${page - 1}">Sebelumnya</button><span>Halaman ${page} dari ${totalPages} | ${data.length} pengguna</span><button ${page >= totalPages ? "disabled" : ""} data-page="${page + 1}">Berikutnya</button>`;
  root.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openEdit(rows.find((item) => item.id === button.dataset.edit))));
  pagination.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => { page = Number(button.dataset.page); render(); }));
}

function closeDialog(event) {
  event?.preventDefault();
  if (dialog.open) dialog.close();
}

dialog.querySelectorAll("[data-dialog-close]").forEach((button) => button.addEventListener("click", closeDialog));
dialog.addEventListener("cancel", closeDialog);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(event); });

form.elements.role_admin.addEventListener("change", () => {
  const preset = PRESET[form.elements.role_admin.value] || [];
  form.querySelectorAll('[name="hak"]').forEach((checkbox) => { checkbox.checked = preset.includes(checkbox.value); });
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = form.querySelector("[data-edit-status]");
  status.textContent = "Menyimpan...";
  const data = {
    status_pendaftaran: form.elements.status_pendaftaran.value,
    jenis_pengguna: form.elements.jenis_pengguna.value,
    role_admin: form.elements.role_admin.value,
    hak_akses: [...form.querySelectorAll('[name="hak"]:checked')].map((item) => item.value),
    aktif: form.elements.aktif.checked,
    catatan_admin: form.elements.catatan_admin.value.trim()
  };
  try {
    await perbaruiPengguna(form.elements.id.value, data);
    rows = rows.map((item) => item.id === form.elements.id.value ? { ...item, ...data } : item);
    status.textContent = "Tersimpan.";
    setTimeout(() => { closeDialog(); render(); }, 450);
  } catch (error) {
    status.textContent = error.message;
  }
});

document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("active", item === button));
  tab = button.dataset.tab; page = 1; render();
}));
search.addEventListener("input", () => { page = 1; render(); });
roleFilter.addEventListener("change", () => { page = 1; render(); });
render();