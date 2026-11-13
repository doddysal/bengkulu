import{wajibLogin}from"../core/guard.js";
function pastikanTabFooter(){
  const tabs=document.querySelector(".cms-page-tabs");
  const main=document.querySelector(".admin-main");
  if(!tabs||!main)return;
  if(!tabs.querySelector('[data-tab="footer"]')){
    const button=document.createElement("button");
    button.type="button";
    button.dataset.tab="footer";
    button.innerHTML="<b>Footer</b><small>Kontak, sponsor, statistik</small>";
    tabs.appendChild(button);
  }
  if(!main.querySelector('[data-panel="footer"]')){
    const section=document.createElement("section");
    section.className="cms-panel";
    section.dataset.panel="footer";
    section.innerHTML='<div data-cms-root="footer"></div>';
    main.appendChild(section);
  }
}
pastikanTabFooter();import{daftarCmsHalaman}from"../services/cms-halaman.service.js";import{buatEditorCms}from"./cms-editor-halaman.js";await wajibLogin(["admin","superadmin"]);const rows=await daftarCmsHalaman(),by=Object.fromEntries(rows.map(x=>[x.kode_bagian,x]));const maps={depan:["hero_utama"],berita:["hero_berita"],donor:["hero_donor"],relawan:["hero_relawan"],tentang:["hero_sejarah","hero_prinsip","hero_visi","hero_layanan"]};function render(panel){const root=document.querySelector(`[data-cms-root="${panel}"]`),codes=maps[panel]||[];root.innerHTML=codes.map(c=>`<div data-editor="${c}"></div>`).join("");codes.forEach(c=>buatEditorCms(root.querySelector(`[data-editor="${c}"]`),by[c]||{kode_bagian:c,judul:"",deskripsi:"",pengaturan:{}}))}document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("[data-panel]").forEach(x=>x.classList.toggle("active",x.dataset.panel===b.dataset.tab));render(b.dataset.tab)}));render("depan");