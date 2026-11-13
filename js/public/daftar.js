import { ambilKlien } from "/js/core/api.js";
import { ambilSesi } from "/js/core/auth.js";

const existingSession = await ambilSesi();
if (existingSession) {
  location.replace("/akun/profil.html?info=sudah-login");
  throw new Error("Pengguna sudah login. Pendaftaran dialihkan ke profil.");
}

const form = document.querySelector("[data-register]");
const status = form.querySelector("[data-status]");
const bersihTelepon = (value) => String(value || "").replace(/[^0-9+]/g, "");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const nama = form.elements.nama.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  if (password !== form.elements.password_confirm.value) { status.textContent = "Konfirmasi password tidak sama."; return; }
  if (password.length < 8) { status.textContent = "Password minimal 8 karakter."; return; }
  button.disabled = true;
  status.textContent = "Mendaftarkan akun...";
  try {
    const supabase = await ambilKlien();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          nama,
          telepon: bersihTelepon(form.elements.telepon.value),
          alamat: form.elements.alamat.value.trim(),
          golongan_darah: form.elements.golongan_darah.value,
          jenis_pengguna: form.elements.jenis_pengguna.value
        },
        emailRedirectTo: `${location.origin}/akun/login.html`
      }
    });
    if (error) throw error;
    if (data.session) {
      status.textContent = "Pendaftaran berhasil. Akun menunggu pemeriksaan admin.";
      setTimeout(() => location.replace("/akun/profil.html"), 1000);
    } else {
      status.textContent = "Pendaftaran berhasil. Periksa email untuk verifikasi, lalu masuk.";
      form.reset();
    }
  } catch (error) {
    status.textContent = `Pendaftaran gagal: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});