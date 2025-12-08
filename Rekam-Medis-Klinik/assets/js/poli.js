import { db } from "./supabase.js";

// =====================================
// LOAD DATA POLI
// =====================================

async function loadPoli() {
    const { data, error } = await db
        .from("poli")
        .select("*")
        .order("id_poli", { ascending: true });
    if (error) {
        console.error("Select error:", error);
        return;
    }

    const tabel = document.getElementById("tabelPoli");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id_poli}</td>
            <td>${p.nama_poli}</td>
            <td>${p.lokasi}</td>
            <td>
                <button class="btnEdit" data-id="${p.id_poli}">Edit</button>
                <button class="btnDelete" data-id="${p.id_poli}">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    aktifkanTombolEdit();
    aktifkanTombolDelete();
}

loadPoli();

// =====================================
// FORM SUBMIT → ADD ATAU EDIT
// =====================================

let editId = null; // global, untuk menentukan mode edit

document.getElementById("formPoli").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_poli: document.getElementById("nama_poli").value,
        lokasi: document.getElementById("lokasi").value,
    };

    // ==============================
    // MODE EDIT
    // ==============================
    if (editId !== null) {
        const { error } = await db
            .from("poli")
            .update(payload)
            .eq("id_poli", editId);

        if (error) {
            console.error("Update error:", error);
            alert("Gagal memperbarui data");
            return;
        }

        alert("Data berhasil diperbarui!");
        editId = null;
        e.target.reset();
        loadPoli();
        return;
    }

    // ==============================
    // MODE TAMBAH
    // ==============================
    const { error } = await db.from("poli").insert([payload]);

    if (error) {
        console.error("Insert error:", error);
        alert("Gagal menambahkan data");
        return;
    }

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    loadPoli();
});

// =====================================
// DELETE POLI
// =====================================

function aktifkanTombolDelete() {
    document.querySelectorAll(".btnDelete").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (!confirm("Yakin ingin menghapus data ini?")) return;

            const { error } = await db
                .from("poli")
                .delete()
                .eq("id_poli", id);

            if (error) {
                console.error("Delete error:", error);
                alert("Gagal menghapus data");
                return;
            }

            alert("Data berhasil dihapus!");
            loadPoli();
        });
    });
}

// =====================================
// EDIT POLI
// =====================================

function aktifkanTombolEdit() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            editId = id; // set mode jadi EDIT

            const { data, error } = await db
                .from("poli")
                .select("*")
                .eq("id_poli", id)
                .single();

            if (error) {
                console.error("Fetch error:", error);
                return;
            }

            // Isi form dengan data lama
            document.getElementById("nama_poli").value = data.nama_poli;
            document.getElementById("lokasi").value = data.lokasi;
        });
    });
}

// Animasi fade table saat data di-load
document.addEventListener("DOMContentLoaded", () => {
    const tbl = document.querySelector("table");

    if (tbl) {
        tbl.style.opacity = 0;
        setTimeout(() => {
            tbl.style.transition = "0.6s";
            tbl.style.opacity = 1;
        }, 150);
    }
});


// Tambahan animasi masuk tabel
export function applyRowAnimation() {
    document.querySelectorAll("tbody tr").forEach((row, i) => {
        row.style.opacity = 0;
        row.style.animation = `fadeIn 0.4s ease forwards`;
        row.style.animationDelay = `${i * 0.05}s`;
    });
}
applyRowAnimation();