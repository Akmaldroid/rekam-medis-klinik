import { signUpUser } from "./auth.js";

// Show/hide id_dokter input
const roleSelect = document.getElementById("role");
const idDokterInput = document.getElementById("id_dokter");

roleSelect.addEventListener("change", () => {
    if (roleSelect.value === 'dokter') {
        idDokterInput.style.display = 'block';
        idDokterInput.style.opacity = 0;
        setTimeout(() => idDokterInput.style.opacity = 1, 50);
    } else {
        idDokterInput.style.opacity = 0;
        setTimeout(() => {
            idDokterInput.style.display = 'none';
        }, 150);
    }
});

// SIGN UP BUTTON
document.getElementById("btnSignup").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = roleSelect.value;
    const id_dokter = idDokterInput.value || null;

    // Simple validation
    if (!username || !password) {
        alert("Username dan password wajib diisi!");
        return;
    }

    const btn = document.getElementById("btnSignup");
    btn.disabled = true;
    btn.innerHTML = "Memproses...";

    const res = await signUpUser(username, password, role, id_dokter);

    if (!res.success) {
        alert(res.message);
        return;
    }

    alert("Akun berhasil dibuat! Silakan login.");
    window.location.href = "login.html";
});

function addFieldEffect(el) {
    el.addEventListener("input", () => {
        if (el.value.length > 0) {
            el.style.borderColor = "#1b873f";
        } else {
            el.style.borderColor = "#78c591";
        }
    });
}

addFieldEffect(document.getElementById("username"));
addFieldEffect(document.getElementById("password"));
addFieldEffect(idDokterInput);
