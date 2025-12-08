import { db } from "./supabase.js";

// ===========================
// SIGN UP USER BARU
// ===========================
export async function signUpUser(username, password, role, id_dokter = null) {
    try {
        // 1. Cek username sudah dipakai atau belum
        const { data: existingUser, error: checkError } = await db
            .from("user_account")
            .select("username")
            .eq("username", username);

        if (checkError) {
            console.error("Error checking username:", checkError);
            return { success: false, message: "Gagal mengecek username!" };
        }

        if (existingUser && existingUser.length > 0) {
            return { success: false, message: "Username sudah digunakan!" };
        }

        // 2. Tentukan id_dokter (null untuk non-dokter)
        const dokterValue = role === "dokter" ? id_dokter : null;

        // 3. Insert user baru
        const { error: insertError } = await db
            .from("user_account")
            .insert({
                username,
                password,
                role,
                id_dokter: dokterValue
            });

        if (insertError) {
            console.error("Insert error:", insertError);
            return { success: false, message: "Gagal membuat akun!" };
        }

        return { success: true };

    } catch (err) {
        console.error("Unexpected signup error:", err);
        return { success: false, message: "Terjadi kesalahan sistem." };
    }
}



// ===========================
// LOGIN USER
// ===========================
export async function loginUser(username, password) {
    try {
        const { data, error } = await db
            .from("user_account")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .limit(1);

        if (error) {
            console.error("Login error:", error);
            return { success: false, message: "Kesalahan saat login." };
        }

        if (!data || data.length === 0) {
            return { success: false, message: "Username atau password salah!" };
        }

        const user = data[0];

        // Simpan session
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_id", user.id_user);
        localStorage.setItem("username", user.username);
        localStorage.setItem("currentUser", JSON.stringify(user)); // FIX WAJIB
        if (user.role === "dokter") {
            localStorage.setItem("id_dokter", user.id_dokter);
        }

        return { success: true, user };

    } catch (err) {
        console.error("Unexpected login error:", err);
        return { success: false, message: "Terjadi kesalahan sistem." };
    }
}

// ===============================
// GET CURRENT USER
// ===============================
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// ===============================
// LOGOUT FUNCTION
// ===============================
export function logout() {
    localStorage.clear();

    // hindari caching sesi lama
    sessionStorage.clear();

    // redirect aman
    window.location.href = "index.html";
}
