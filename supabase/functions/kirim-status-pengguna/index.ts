import { createClient } from "npm:@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});
const escapeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const labels:Record<string,string>={aktif:"Disetujui",ditolak:"Belum Dapat Disetujui",diblokir:"Diblokir"};

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return response({ok:false,message:"Metode tidak diizinkan."},405);
  try{
    const url=Deno.env.get("SUPABASE_URL")!;
    const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey=Deno.env.get("RESEND_API_KEY");
    const from=Deno.env.get("EMAIL_FROM")||"PMI Kota Bengkulu <onboarding@resend.dev>";
    const siteUrl=(Deno.env.get("SITE_URL")||"").replace(/\/$/,"");
    if(!resendKey)return response({ok:false,message:"Secret RESEND_API_KEY belum dikonfigurasi."},500);
    const authorization=req.headers.get("Authorization")||"";
    const caller=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
    const{data:{user},error:userError}=await caller.auth.getUser();
    if(userError||!user)return response({ok:false,message:"Sesi admin tidak valid."},401);
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const{data:callerProfile,error:profileError}=await admin.from("pengguna").select("role_admin,hak_akses,aktif").eq("id",user.id).single();
    if(profileError||!callerProfile?.aktif)return response({ok:false,message:"Profil admin tidak aktif."},403);
    const allowed=callerProfile.role_admin==="superadmin"||(callerProfile.hak_akses||[]).includes("pengguna");
    if(!allowed)return response({ok:false,message:"Tidak memiliki akses Manajemen Pengguna."},403);

    const body=await req.json();
    const targetId=String(body.id||"");
    const nextStatus=String(body.status_pendaftaran||"");
    if(!targetId||!["menunggu","aktif","ditolak","diblokir"].includes(nextStatus))return response({ok:false,message:"Data pengguna tidak valid."},400);
    const{data:before,error:beforeError}=await admin.from("pengguna").select("id,nama,email,status_pendaftaran,jenis_pengguna").eq("id",targetId).single();
    if(beforeError||!before)return response({ok:false,message:"Pengguna tidak ditemukan."},404);

    const update={
      status_pendaftaran:nextStatus,
      jenis_pengguna:String(body.jenis_pengguna||before.jenis_pengguna||"umum"),
      role_admin:String(body.role_admin||"pengguna"),
      hak_akses:Array.isArray(body.hak_akses)?body.hak_akses:[],
      aktif:Boolean(body.aktif),
      catatan_admin:body.catatan_admin?String(body.catatan_admin):null,
      diperbarui_pada:new Date().toISOString()
    };
    const{data:updated,error:updateError}=await admin.from("pengguna").update(update).eq("id",targetId).select().single();
    if(updateError)throw updateError;

    const changed=before.status_pendaftaran!==nextStatus;
    const shouldEmail=changed&&["aktif","ditolak","diblokir"].includes(nextStatus)&&Boolean(before.email);
    if(!shouldEmail)return response({ok:true,email_dikirim:false,pengguna:updated,message:"Pengaturan pengguna berhasil disimpan."});

    const{data:already}=await admin.from("notifikasi_status_pengguna").select("id").eq("pengguna_id",targetId).eq("status",nextStatus).maybeSingle();
    if(already)return response({ok:true,email_dikirim:false,pengguna:updated,message:"Status disimpan. Email untuk status ini sudah pernah dikirim."});

    const label=labels[nextStatus];
    const intro=nextStatus==="aktif"
      ?"Pendaftaran akun pada Portal PMI Kota Bengkulu telah disetujui."
      :nextStatus==="ditolak"
        ?"Pendaftaran akun pada Portal PMI Kota Bengkulu belum dapat disetujui."
        :"Akses akun pada Portal PMI Kota Bengkulu telah diblokir.";
    const action=nextStatus==="aktif"&&siteUrl?`<a href="${escapeHtml(siteUrl)}/akun/login.html" style="display:inline-block;margin-top:18px;padding:12px 18px;border-radius:10px;background:#dc2626;color:#fff;text-decoration:none;font-weight:700">Masuk ke Portal PMI</a>`:"";
    const html=`<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:30px auto;padding:0 18px"><div style="background:#7f0b0b;padding:22px;border-radius:16px 16px 0 0;color:#fff"><h1 style="margin:0;font-size:22px">PMI Kota Bengkulu</h1><p style="margin:6px 0 0;color:#fecaca">Status Pendaftaran: ${label}</p></div><div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px"><p>Yth. <strong>${escapeHtml(before.nama||"Pengguna")}</strong>,</p><p style="line-height:1.7">${intro}</p><table style="width:100%;border-collapse:collapse;margin:20px 0"><tr><td style="padding:9px;border-bottom:1px solid #e2e8f0;color:#64748b">Email</td><td style="padding:9px;border-bottom:1px solid #e2e8f0;font-weight:700">${escapeHtml(before.email)}</td></tr><tr><td style="padding:9px;border-bottom:1px solid #e2e8f0;color:#64748b">Jenis pengguna</td><td style="padding:9px;border-bottom:1px solid #e2e8f0;font-weight:700">${escapeHtml(update.jenis_pengguna)}</td></tr><tr><td style="padding:9px;border-bottom:1px solid #e2e8f0;color:#64748b">Status</td><td style="padding:9px;border-bottom:1px solid #e2e8f0;font-weight:700">${label}</td></tr></table>${action}<p style="margin-top:24px;color:#64748b;font-size:13px;line-height:1.6">Email ini dikirim otomatis oleh Portal PMI Kota Bengkulu. Jangan membalas email ini.</p></div></div></body></html>`;
    const mailResponse=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${resendKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[before.email],subject:`Pendaftaran Akun PMI Kota Bengkulu ${label}`,html})});
    const mail=await mailResponse.json();
    if(!mailResponse.ok)return response({ok:false,status_tersimpan:true,message:`Status berhasil disimpan, tetapi email gagal: ${mail?.message||"Resend error"}`},502);
    await admin.from("notifikasi_status_pengguna").insert({pengguna_id:targetId,status:nextStatus,email:before.email,provider_id:mail.id||null});
    return response({ok:true,email_dikirim:true,pengguna:updated,message:`Status disimpan dan email ${label.toLowerCase()} berhasil dikirim.`});
  }catch(error){console.error(error);return response({ok:false,message:error instanceof Error?error.message:"Terjadi kesalahan server."},500)}
});