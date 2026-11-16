import { ambilPengaturanSitus } from "/js/services/pengaturan-situs.service.js";
import { ambilKlienSupabase } from "/js/config/supabase.js";
const root=document.querySelector("[data-footer]");
const D={header_atas:"KOTA",header_bawah:"BENGKULU",footer_text:"Kemanusiaan untuk Semua.",footer_address:"Kota Bengkulu",footer_phone:"",footer_email:"",footer_bg_color:"#380a0a",footer_sponsor_label:"DIDUKUNG OLEH:",footer_address_label:"ALAMAT MARKAS:",footer_social_label:"IKUTI KAMI DI:",footer_stats_label:"STATISTIK SISTEM (PAGE VIEW & PENGUNJUNG):",footer_sponsor_empty:"Mitra Kemanusiaan",footer_legal_privacy:"KEBIJAKAN PRIVASI",footer_legal_terms:"KETENTUAN LAYANAN",footer_contact_label:"KONTAK KAMI",social_fb:"",social_ig:"",social_tw:"",social_yt:"",social_tt:"",sponsor_logos:""};
const esc=(v="")=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const extractUrl=(value="")=>{const raw=String(value).trim();if(!raw)return"";const href=raw.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];if(href)return href.trim();const text=raw.replace(/<[^>]+>/g," ").match(/https?:\/\/[^\s<"']+/i)?.[0];return(text||raw).replace(/&amp;/g,"&").trim()};
const normalize=raw=>{const cfg={...raw};const aliases={footer_address:["footer_alamat"],footer_phone:["footer_telepon"],footer_text:["footer_judul"],social_fb:["footer_facebook","footer_social_fb"],social_ig:["footer_instagram","footer_social_ig"],social_tw:["footer_x","footer_social_tw"],social_yt:["footer_youtube","footer_social_yt"],social_tt:["footer_tiktok","footer_social_tt"],sponsor_logos:["footer_sponsor","footer_sponsor_logos"]};for(const[target,list]of Object.entries(aliases)){if(String(cfg[target]||"").trim())continue;const key=list.find(k=>String(cfg[k]||"").trim());if(key)cfg[target]=cfg[key]}for(const key of ["social_fb","social_ig","social_tw","social_yt","social_tt"])cfg[key]=extractUrl(cfg[key]);return cfg};
const parseLogos=value=>{let list=[];if(Array.isArray(value))list=value;else{const raw=String(value||"").trim();try{const parsed=JSON.parse(raw);list=Array.isArray(parsed)?parsed:[raw]}catch{list=raw.split(/\r?\n|,/)} }return [...new Set(list.map(extractUrl).filter(url=>/^https?:\/\//i.test(url)))]};
const paths={facebook:'<path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/>',instagram:'<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>',x:'<path d="M18.2 2H22l-8.3 9.5L23 22h-7.3L10 14.6 3.5 22H0l8.4-9.6L-.5 2h7.5l5.1 6.7L18.2 2zm-1.3 18H19L5.9 3.9H3.7L16.9 20z"/>',youtube:'<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"/>',tiktok:'<path d="M15 2c.2 2.1 1.3 3.7 3.4 4.6v3.1a8.3 8.3 0 0 1-3.4-1v6.2A7.1 7.1 0 1 1 8.9 8v3.4a3.8 3.8 0 1 0 2.8 3.6V2H15z"/>'};
const social=(url,key,label)=>url?`<a class="footer-v2-social footer-v2-${key}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><svg viewBox="0 0 24 24">${paths[key]}</svg></a>`:"";
const number=v=>Number(v||0).toLocaleString("id-ID");
function stats(cfg,pv={},uv={},ss={}){return `<span class="footer-v2-stats-title">${esc(cfg.footer_stats_label)}</span><div class="footer-v2-stats-values"><span><small>PAGE VIEW HARI INI:</small><b>${number(pv.hari_ini)}</b></span><span><small>KEMARIN:</small><b>${number(pv.kemarin)}</b></span><span><small>BULAN INI:</small><b>${number(pv.bulan_ini)}</b></span><span><small>TAHUN INI:</small><b>${number(pv.tahun_ini)}</b></span><span><small>PENGUNJUNG UNIK:</small><b>${number(uv.total)}</b></span><span><small>SESI TOTAL:</small><b>${number(ss.total)}</b></span><strong><small>TOTAL:</small><b>${number(pv.total)}</b></strong></div>`}
function render(input){const cfg={...D,...normalize(input)},logos=parseLogos(normalize(input).sponsor_logos);root.className="footer-v2";root.style.backgroundColor=cfg.footer_bg_color;root.innerHTML=`<div class="footer-v2-inner"><div class="footer-v2-top"><section class="footer-v2-sponsors"><span class="footer-v2-label">${esc(cfg.footer_sponsor_label)}</span><div class="footer-v2-logo-box">${logos.length?logos.map((url,i)=>`<figure><img src="${esc(url)}" alt="Logo sponsor ${i+1}" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('image-error')"></figure>`).join(""):`<small>${esc(cfg.footer_sponsor_empty)}</small>`}</div></section><section class="footer-v2-address"><span class="footer-v2-label">${esc(cfg.footer_address_label)}</span><p>${esc(cfg.footer_address)}</p><div>${cfg.footer_phone?`<a href="tel:${esc(cfg.footer_phone)}">${esc(cfg.footer_phone)}</a>`:""}${cfg.footer_email?`<a href="mailto:${esc(cfg.footer_email)}">${esc(cfg.footer_email)}</a>`:""}</div></section><section class="footer-v2-follow"><span class="footer-v2-label">${esc(cfg.footer_social_label)}</span><div>${social(cfg.social_fb,"facebook","Facebook")}${social(cfg.social_ig,"instagram","Instagram")}${social(cfg.social_tw,"x","X")}${social(cfg.social_yt,"youtube","YouTube")}${social(cfg.social_tt,"tiktok","TikTok")}${![cfg.social_fb,cfg.social_ig,cfg.social_tw,cfg.social_yt,cfg.social_tt].some(Boolean)?'<small>BELUM DIATUR</small>':""}</div></section></div><div class="footer-v2-stats" data-footer-stats>${stats(cfg)}</div><nav class="footer-v2-legal"><a href="/kebijakan/privasi.html">${esc(cfg.footer_legal_privacy)}</a><a href="/kebijakan/ketentuan.html">${esc(cfg.footer_legal_terms)}</a></nav><div class="footer-v2-copy"><p>PALANG MERAH INDONESIA ${esc(cfg.header_atas)} ${esc(cfg.header_bawah)} - ALL RIGHTS RESERVED.</p><span class="footer-v2-dot"></span><p><span class="footer-v2-copyright"></span>${new Date().getFullYear()} ${esc(cfg.footer_text)}</p></div></div>`;return cfg}
async function start(){
  let cfg=render(D);
  try{
    const saved=await ambilPengaturanSitus();
    cfg=render(saved);
    const db=await ambilKlienSupabase();
    let visitor=localStorage.getItem("pmi_visitor_id");
    if(!visitor){visitor=crypto.randomUUID?.()||`visitor-${Date.now()}-${Math.random()}`;localStorage.setItem("pmi_visitor_id",visitor)}
    let session=sessionStorage.getItem("pmi_session_id");
    if(!session){session=crypto.randomUUID?.()||`session-${Date.now()}-${Math.random()}`;sessionStorage.setItem("pmi_session_id",session)}
    const pagePath=`${location.pathname}${location.search}`;
    const pageKey=`pmi_counted:${pagePath}`;
    let summary=null;
    if(!sessionStorage.getItem(pageKey)){
      const{data,error}=await db.rpc("catat_dan_ringkas_kunjungan",{p_session_id:session,p_visitor_id:visitor,p_path:pagePath});
      if(error)throw error;
      summary=data;
      sessionStorage.setItem(pageKey,"1");
    }else{
      const{data,error}=await db.rpc("ringkasan_statistik_pengunjung");
      if(error)throw error;
      summary=data;
    }
    root.querySelector("[data-footer-stats]").innerHTML=stats(cfg,summary?.page_views,summary?.unique_visitors,summary?.sessions);
  }catch(error){console.error("Footer/statistik gagal",error)}
}
if(root)start();