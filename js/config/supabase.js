let klien=null;
export async function ambilKonfigurasiPublik(){const r=await fetch("/api/konfigurasi-publik",{cache:"no-store"});if(!r.ok)throw new Error("Konfigurasi aplikasi gagal dimuat.");return r.json();}
export async function ambilKlienSupabase(){
 if(klien)return klien;const c=await ambilKonfigurasiPublik();
 if(!c.supabaseUrl||!c.supabaseAnonKey)throw new Error("SUPABASE_URL dan SUPABASE_ANON_KEY belum diisi di .env.");
 if(!window.supabase?.createClient)throw new Error("Pustaka Supabase belum dimuat.");
 klien=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return klien;
}