export const qs=(s,r=document)=>r.querySelector(s); export const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
export const escapeHtml=(v="")=>String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
export const formatDate=(v)=>v?new Intl.DateTimeFormat("id-ID",{dateStyle:"long"}).format(new Date(v)):"-";
export const slugify=(v="")=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export function setStatus(message,type="info"){const el=qs("[data-status]");if(el){el.textContent=message;el.dataset.type=type;}}