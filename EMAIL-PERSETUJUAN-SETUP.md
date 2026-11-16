# Email Persetujuan Pengguna

## Komponen
- Edge Function: `kirim-status-pengguna`
- Provider: Resend
- Secret wajib: `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`
- Audit: tabel `notifikasi_status_pengguna`

## Perilaku
- `menunggu -> aktif`: kirim email persetujuan
- `menunggu -> ditolak`: kirim email penolakan
- `aktif -> diblokir`: kirim email pemblokiran
- Menyimpan status yang sama tidak mengirim email ulang
- Kombinasi pengguna/status dicatat sekali dalam tabel audit

## Perintah deploy
```powershell
supabase login
supabase link --project-ref PROJECT_REF
supabase secrets set RESEND_API_KEY="re_xxx" EMAIL_FROM="PMI Kota Bengkulu <noreply@domain.id>" SITE_URL="https://domain.id"
supabase functions deploy kirim-status-pengguna
```