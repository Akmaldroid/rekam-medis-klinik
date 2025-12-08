import { getRole } from "./auth.js";

// allowedRoles = array, contoh: ['admin', 'petugas']
export function protectPage(allowedRoles) {
    const role = getRole();

    if (!role) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "login.html";
        return;
    }

    if (!allowedRoles.includes(role)) {
        alert("Kamu tidak punya akses ke halaman ini!");
        window.location.href = "dashboard.html";
        return;
    }
}

export function getRole() {
    return localStorage.getItem("user_role") || null;
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}
