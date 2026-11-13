import { ambilPengaturanSitus, simpanPengaturanSitus } from "/js/services/pengaturan-situs.service.js";
import { unggahGambar } from "/js/services/upload-gambar.service.js";

const tab=document.querySelector('[data-tab="footer"]');
const panel=document.querySelector('[data-panel="footer"]');
const root=panel?.querySelector('[data-cms-root="footer"]');
const text=(value)=>Array.isArray(value)?value.join("\n"):String(value||"");
const urls=(value)=>String(value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
let ready=false;

async function buildFooterForm(){
  if(!root||ready)return;
  ready=true;
  root.innerHTML='<div class="card cms-form"><div class="empty-admin">Memuat pengaturan footer...</div></div>';
  try{
    const cfg=await ambilPengaturanSitus();
    root.innerHTML=`<form class="card cms-form footer-cms-form">
      <div class="cms-editor-head"><div><h2>Footer Website</h2><p>Kelola alamat, media sosial, statistik, dan seluruh logo sponsor.</p></div><span class="cms-code">footer</span></div>
      <div class="form-grid">
        <label class="field">Header atas<input name="header_atas"></label>
        <label class="field">Header bawah<input name="header_bawah"></label>
        <label class="field field-wide">Slogan footer<input name="footer_text"></label>
        <label class="field field-wide">Alamat markas<textarea name="footer_address" rows="3"></textarea></label>
        <label class="field">Telepon<input name="footer_phone"></label>
        <label class="field">Email<input name="footer_email" type="email"></label>
        <label class="field">Warna latar<input name="footer_bg_color" type="color"></label>
        <label class="field">Label sponsor<input name="footer_sponsor_label"></label>
        <label class="field">Label alamat<input name="footer_address_label"></label>
        <label class="field">Label sosial<input name="footer_social_label"></label>
        <label class="field">Label statistik<input name="footer_stats_label"></label>
        <label class="field">Teks sponsor kosong<input name="footer_sponsor_empty"></label>
        <label class="field">Facebook<input name="social_fb" type="url"></label>
        <label class="field">Instagram<input name="social_ig" type="url"></label>
        <label class="field">X / Twitter<input name="social_tw" type="url"></label>
        <label class="field">YouTube<input name="social_yt" type="url"></label>
        <label class="field">TikTok<input name="social_tt" type="url"></label>
        <label class="field">Teks Privasi<input name="footer_legal_privacy"></label>
        <label class="field">Teks Ketentuan<input name="footer_legal_terms"></label>
        <label class="field">Teks Kontak<input name="footer_contact_label"></label>
        <label class="field field-wide">Logo sponsor, satu URL setiap baris<textarea name="sponsor_logos" rows="8"></textarea><small class="muted">Jumlah logo tidak dibatasi. Logo akan tersusun otomatis di footer.</small></label>
        <label class="field field-wide">Tambah logo sponsor<input name="sponsor_file" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"></label>
        <div class="field-wide media-upload-row"><button type="button" class="btn btn-secondary" data-upload>Upload dan Tambah Logo</button><span data-upload-status></span></div>
        <div class="field-wide sponsor-admin-preview" data-preview></div>
      </div>
      <div class="cms-save"><button class="btn btn-primary">Simpan Footer</button><span data-save-status></span></div>
    </form>`;
    const form=root.querySelector("form");
    const defaults={footer_bg_color:"#380a0a",footer_sponsor_label:"DIDUKUNG OLEH:",footer_address_label:"ALAMAT MARKAS:",footer_social_label:"IKUTI KAMI DI:",footer_stats_label:"STATISTIK SISTEM:",footer_sponsor_empty:"Mitra Kemanusiaan",footer_legal_privacy:"Kebijakan Privasi",footer_legal_terms:"Ketentuan Layanan",footer_contact_label:"Kontak Kami"};
    for(const element of form.elements){if(!element.name||element.name==="sponsor_file")continue;element.value=element.name==="sponsor_logos"?text(cfg[element.name]):(cfg[element.name]??defaults[element.name]??"")}
    const preview=()=>{const list=urls(form.elements.sponsor_logos.value);form.querySelector("[data-preview]").innerHTML=list.map((url,index)=>`<figure><img src="${url}" alt="Logo sponsor ${index+1}"><button type="button" data-remove="${index}">Hapus</button></figure>`).join("")||'<p class="muted">Belum ada logo sponsor.</p>'};
    form.elements.sponsor_logos.addEventListener("input",preview);
    form.querySelector("[data-preview]").addEventListener("click",event=>{const button=event.target.closest("[data-remove]");if(!button)return;const list=urls(form.elements.sponsor_logos.value);list.splice(Number(button.dataset.remove),1);form.elements.sponsor_logos.value=list.join("\n");preview()});
    form.querySelector("[data-upload]").addEventListener("click",async()=>{const file=form.elements.sponsor_file.files?.[0],status=form.querySelector("[data-upload-status]");if(!file){status.textContent="Pilih file logo terlebih dahulu.";return}try{const result=await unggahGambar(file,"footer/sponsor",progress=>status.textContent=`Mengunggah ${progress}%...`);form.elements.sponsor_logos.value=[...new Set([...urls(form.elements.sponsor_logos.value),result.url])].join("\n");form.elements.sponsor_file.value="";status.textContent="Logo berhasil ditambahkan.";preview()}catch(error){status.textContent=error.message}});
    form.addEventListener("submit",async event=>{event.preventDefault();const status=form.querySelector("[data-save-status]");status.textContent="Menyimpan...";const data={};for(const element of form.elements){if(element.name&&element.name!=="sponsor_file")data[element.name]=element.value}data.sponsor_logos=urls(form.elements.sponsor_logos.value).join("\n");try{await simpanPengaturanSitus(data);status.textContent="Footer berhasil disimpan."}catch(error){status.textContent=error.message}});
    preview();
  }catch(error){ready=false;root.innerHTML=`<div class="card cms-form"><h2>Footer gagal dimuat</h2><p class="pesan-form">${error.message}</p><button class="btn btn-secondary" type="button" data-retry>Coba Lagi</button></div>`;root.querySelector("[data-retry]")?.addEventListener("click",buildFooterForm)}
}

if(tab&&panel){
  tab.addEventListener("click",()=>setTimeout(buildFooterForm,0));
  if(tab.classList.contains("active"))buildFooterForm();
}