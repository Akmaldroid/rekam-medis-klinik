import { logout } from "./auth.js";

function loadUserProfile() {
    const username = localStorage.getItem("username");

    if (!username) {
        window.location.href = "index.html";
        return;
    }

    // Tampilkan "halo, username"
    const userGreeting = document.getElementById("username-display");
    if (userGreeting) {
        userGreeting.textContent = username;
    }
}

loadUserProfile();

const menuItems = document.querySelectorAll("nav a");
const infoTitle = document.getElementById("info-title");
const infoText = document.getElementById("info-text");

let typingInterval = null;
let eraseInterval = null;
let currentText = "";
let index = 0;

/* ====== BERSIHKAN SEMUA ANIMASI ====== */
function stopAll() {
    clearInterval(typingInterval);
    clearInterval(eraseInterval);
    typingInterval = null;
    eraseInterval = null;
}

/* ====== TYPEWRITER TANPA GLITCH ====== */
function typeWriter(text) {
    if (currentText === text) return; // kalau sama, tidak usah reset

    stopAll(); // hentikan animasi lama COMPLETELY

    currentText = text;
    index = 0;
    infoText.textContent = "";

    typingInterval = setInterval(() => {
        infoText.textContent += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(typingInterval);
        }
    }, 35);
}

/* ====== EVENT MENU ====== */
menuItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
        stopAll(); // clear animasi lama
        infoTitle.textContent = item.textContent.trim();
        typeWriter(item.dataset.info);
    });

    item.addEventListener("mouseleave", () => {
        stopAll(); 
        infoTitle.textContent = "Selamat Datang!";
        typeWriter("Pilih menu di sebelah kiri untuk melihat informasi lebih detail.");
    });
});

/* Start default animation */
typeWriter("Pilih menu di sebelah kiri untuk melihat informasi lebih detail.");

// ===============================
// LOGOUT CLICK HANDLER
// ===============================
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        logout();
    });
}
