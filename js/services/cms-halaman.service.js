import{kueri}from"../core/api.js";
export const ambilCmsHalaman=kode=>kueri(k=>k.from("cms_halaman").select("*").eq("kode_bagian",kode).maybeSingle());
export const daftarCmsHalaman=()=>kueri(k=>k.from("cms_halaman").select("*").order("kode_bagian"));
export const simpanCmsHalaman=data=>kueri(k=>k.from("cms_halaman").upsert(data,{onConflict:"kode_bagian"}).select().single());