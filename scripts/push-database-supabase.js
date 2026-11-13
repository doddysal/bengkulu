require("dotenv").config();
const fs=require("fs"),path=require("path"),{Client}=require("pg");
const url=process.env.SUPABASE_DB_URL;
if(!url)throw new Error("SUPABASE_DB_URL belum diisi di .env. Service role key tidak dapat menjalankan CREATE TABLE atau RLS.");
const files=["skema.sql","kebijakan.sql","data-awal.sql","navbar-cms.sql","footer-cms.sql","footer-cms-v2.sql","penyempurnaan-berita.sql"];
(async()=>{const client=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await client.connect();try{for(const file of files){const full=path.join(__dirname,"..","supabase",file);if(!fs.existsSync(full)){console.log("LEWATI",file,"(tidak ditemukan)");continue}console.log("JALANKAN",file);await client.query(fs.readFileSync(full,"utf8"));console.log("OK",file)}console.log("Semua SQL berhasil diterapkan ke Supabase.")}finally{await client.end()}})().catch(e=>{console.error("Push database gagal:",e.message);process.exit(1)});