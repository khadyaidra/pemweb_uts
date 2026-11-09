/* =========================================================
   PTI Web Design Contest 2026 - script.js
   Fitur:
   1. Navigasi interaktif (menu mobile)
   2. Ganti tema terang/gelap (fitur tambahan)
   3. Penghitung mundur batas pendaftaran (fitur tambahan)
   4. Validasi formulir + pesan keberhasilan
   ========================================================= */

"use strict";

/* ---------- 1. Menu mobile ---------- */
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

// Menu menutup setelah salah satu tautan diklik atau tombol Esc ditekan
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------- 2. Tema terang / gelap ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap");
  themeLabel.textContent = isDark ? "Terang" : "Gelap";
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("pti-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch (err) {
    /* localStorage tidak tersedia, abaikan */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

applyTheme(getInitialTheme());

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("pti-theme", next);
  } catch (err) {
    /* abaikan */
  }
});

/* ---------- 3. Penghitung mundur ---------- */
// Batas pendaftaran: 5 Desember 2026, 23.59 WIB (UTC+7)
const DEADLINE = new Date("2026-12-05T23:59:00+07:00").getTime();

const cdEls = {
  days: document.getElementById("cd-days"),
  hours: document.getElementById("cd-hours"),
  minutes: document.getElementById("cd-minutes"),
  seconds: document.getElementById("cd-seconds"),
};
const countdownNote = document.getElementById("countdown-note");

const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const diff = DEADLINE - Date.now();

  if (diff <= 0) {
    Object.values(cdEls).forEach((el) => (el.textContent = "00"));
    countdownNote.textContent = "Pendaftaran sudah ditutup.";
    countdownNote.classList.add("closed");
    return false; // hentikan timer
  }

  const totalSeconds = Math.floor(diff / 1000);
  cdEls.days.textContent = pad(Math.floor(totalSeconds / 86400));
  cdEls.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  cdEls.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  cdEls.seconds.textContent = pad(totalSeconds % 60);
  return true;
}

if (updateCountdown()) {
  const timerId = setInterval(() => {
    if (!updateCountdown()) clearInterval(timerId);
  }, 1000);
}

/* ---------- 4. Validasi formulir ---------- */
const form = document.getElementById("registerForm");
const successPanel = document.getElementById("successPanel");
const successText = document.getElementById("successText");
const resetBtn = document.getElementById("resetBtn");

// Setiap aturan mengembalikan pesan error, atau "" jika data valid
const rules = {
  nama(value) {
    const v = value.trim();
    if (v === "") return "Nama lengkap wajib diisi.";
    if (v.length < 3) return "Nama minimal 3 karakter.";
    if (!/^[A-Za-zÀ-ÿ' .-]+$/.test(v)) return "Nama hanya boleh berisi huruf, spasi, titik, atau tanda hubung.";
    return "";
  },
  email(value) {
    const v = value.trim();
    if (v === "") return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Format email belum benar, contoh: nama@email.com.";
    return "";
  },
  whatsapp(value) {
    const v = value.replace(/[\s-]/g, "");
    if (v === "") return "Nomor WhatsApp wajib diisi.";
    if (!/^[0-9+]+$/.test(v)) return "Nomor hanya boleh berisi angka.";
    if (!/^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(v)) return "Gunakan nomor Indonesia yang diawali 08, 62, atau +62 (10–13 digit).";
    return "";
  },
  institusi(value) {
    const v = value.trim();
    if (v === "") return "Asal kampus atau sekolah wajib diisi.";
    if (v.length < 3) return "Nama kampus atau sekolah minimal 3 karakter.";
    return "";
  },
  kategori(value) {
    return value === "" ? "Pilih salah satu kategori lomba." : "";
  },
  setuju(_value, input) {
    return input.checked ? "" : "Centang pernyataan ini untuk melanjutkan.";
  },
};

function validateField(input) {
  const rule = rules[input.name];
  const message = rule(input.value, input);
  const wrapper = input.closest(".field");
  const errorEl = document.getElementById(input.name + "-error");

  errorEl.textContent = message;
  wrapper.classList.toggle("invalid", message !== "");
  wrapper.classList.toggle("valid", message === "");
  input.setAttribute("aria-invalid", String(message !== ""));
  return message === "";
}

const fields = Array.from(form.elements).filter((el) => el.name && rules[el.name]);

// Validasi langsung saat pengguna selesai mengisi, dan memperbarui saat mengetik ulang
fields.forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  const eventName = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(eventName, () => {
    if (input.closest(".field").classList.contains("invalid")) validateField(input);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Periksa semua kolom, lalu fokuskan kolom pertama yang salah
  const results = fields.map((input) => ({ input, ok: validateField(input) }));
  const firstInvalid = results.find((r) => !r.ok);

  if (firstInvalid) {
    firstInvalid.input.focus();
    return;
  }

  const nama = form.elements.nama.value.trim();
  const kategori = form.elements.kategori.value;
  successText.textContent =
    "Terima kasih, " + nama + ". Anda terdaftar di kategori " + kategori +
    ". Konfirmasi akan dikirim ke " + form.elements.email.value.trim() + ".";

  form.hidden = true;
  successPanel.hidden = false;
  successPanel.focus();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  fields.forEach((input) => {
    input.closest(".field").classList.remove("valid", "invalid");
    input.removeAttribute("aria-invalid");
    document.getElementById(input.name + "-error").textContent = "";
  });
  successPanel.hidden = true;
  form.hidden = false;
  form.elements.nama.focus();
});

/* ---------- 5. Tahun di footer ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
