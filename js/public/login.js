import { masuk, ambilSesi } from "/js/core/auth.js";

function initLogin() {
  const form = document.querySelector("[data-login-form]") || document.querySelector("form");
  if (!form) {
    console.error("Form login tidak ditemukan.");
    return;
  }
  const status = document.querySelector("[data-login-status]");
  const email = form.querySelector('[name="email"]');
  const password = form.querySelector('[name="password"]');
  const submit = form.querySelector('button[type="submit"],input[type="submit"]');
  form.method = "post";
  form.action = "/akun/login.html";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!email || !password) {
      if (status) status.textContent = "Kolom email atau kata sandi tidak ditemukan.";
      return;
    }
    if (submit) submit.disabled = true;
    if (status) status.textContent = "Memeriksa akun...";
    try {
      await masuk(email.value.trim(), password.value);
      if (status) status.textContent = "Login berhasil. Mengalihkan ke beranda...";
      history.replaceState({}, "", "/akun/login.html");
      location.replace("/index.html");
    } catch (error) {
      if (status) status.textContent = error?.message || "Login gagal. Periksa email dan kata sandi.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  // Remove credentials accidentally exposed in the URL by a previous native GET submission.
  if (location.search) history.replaceState({}, "", "/akun/login.html");
}

try {
  const session = await ambilSesi();
  if (session) location.replace("/index.html");
  else initLogin();
} catch (error) {
  console.warn("Pemeriksaan sesi gagal, form login tetap diaktifkan.", error);
  initLogin();
}