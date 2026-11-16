import { ambilKlienSupabase } from "/js/config/supabase.js";
import { ambilSesi } from "/js/core/auth.js";

const form = document.querySelector("[data-register]");
const status = form?.querySelector("[data-status]");

if (!form || !status) {
  throw new Error("Form pendaftaran tidak ditemukan.");
}

// Pertahanan tambahan jika HTML lama masih tersimpan dalam cache.
form.method = "post";
form.action = "/akun/daftar.html";

const bersihTelepon = (value) => String(value || "").replace(/[^0-9+]/g, "");

async function mulai() {
  try {
    const existingSession = await ambilSesi();
    if (existingSession) {
      location.replace("/akun/profil.html?info=sudah-login");
      return;
    }
  } catch (error) {
    console.warn("Pemeriksaan sesi awal gagal, form tetap diaktifkan.", error);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const button = form.querySelector('button[type="submit"]');
    const nama = form.elements.nama.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const passwordConfirm = form.elements.password_confirm.value;

    if (password !== passwordConfirm) {
      status.textContent = "Konfirmasi password tidak sama.";
      return;
    }
    if (password.length < 8) {
      status.textContent = "Password minimal 8 karakter.";
      return;
    }

    button.disabled = true;
    status.textContent = "Mendaftarkan akun...";

    try {
      const supabase = await ambilKlienSupabase();
      const metadata = {
        nama,
        telepon: bersihTelepon(form.elements.telepon.value),
        alamat: form.elements.alamat.value.trim(),
        golongan_darah: form.elements.golongan_darah.value,
        jenis_pengguna: form.elements.jenis_pengguna.value
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${location.origin}/akun/login.html`
        }
      });

      if (error) throw error;
      if (!data?.user?.id) throw new Error("Supabase tidak mengembalikan ID pengguna.");

      // Trigger database adalah jalur utama. RPC menjadi verifikasi/fallback sinkronisasi.
      const { data: profilSiap, error: profilError } = await supabase.rpc(
        "pastikan_profil_pendaftar",
        { target_id: data.user.id }
      );

      if (profilError) {
        throw new Error(`Akun Auth dibuat, tetapi profil pengguna gagal disinkronkan: ${profilError.message}`);
      }
      if (!profilSiap) {
        throw new Error("Akun Auth dibuat, tetapi profil pengguna belum tersedia.");
      }

      history.replaceState({}, "", "/akun/daftar.html");
      form.reset();
      status.textContent = data.session
        ? "Pendaftaran diterima. Akun menunggu persetujuan admin."
        : "Pendaftaran diterima. Periksa email bila verifikasi diwajibkan, lalu tunggu persetujuan admin.";
    } catch (error) {
      console.error("Pendaftaran gagal:", error);
      status.textContent = `Pendaftaran gagal: ${error?.message || "Terjadi kesalahan."}`;
    } finally {
      button.disabled = false;
    }
  });
}

mulai();