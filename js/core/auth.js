import{ambilKlienSupabase}from"../config/supabase.js";
export async function masuk(email,password){const k=await ambilKlienSupabase();const{data,error}=await k.auth.signInWithPassword({email,password});if(error)throw error;return data}
export async function keluar(){const k=await ambilKlienSupabase();const{error}=await k.auth.signOut();if(error)throw error}
export async function ambilSesi(){const k=await ambilKlienSupabase();const{data,error}=await k.auth.getSession();if(error)throw error;return data.session}
export async function ambilProfil(){const sesi=await ambilSesi();if(!sesi)return null;const k=await ambilKlienSupabase();const{data,error}=await k.from("pengguna").select("*").eq("id",sesi.user.id).maybeSingle();if(error)throw error;return data}
// Alias kompatibilitas agar halaman lama tidak gagal saat cache masih memanggil nama Inggris.
export const signIn=masuk;
export const signOut=keluar;
export const getSession=ambilSesi;
export const getProfile=ambilProfil;