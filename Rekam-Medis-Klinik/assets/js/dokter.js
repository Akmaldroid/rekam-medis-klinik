import { db } from "./supabase.js";

// =====================================
// LOAD DATA DOKTER
// =====================================

async function loadDokter() {
    const { data, error } = await db
        .from("dokter")
        .select("*")
        .order("id_dokter", { ascending: true });

    if (error) {
        console.error("Select error:", error);
        return;
    }

    const tabel = document.getElementById("tabelDokter");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id_dokter}</td>
            <td>${p.nama_dokter}</td>
            <td>${p.spesialisasi}</td>
            <td>${p.no_str}</td>
            <td>${p.no_telp}</td>

            <td>
                <button class="btnEdit" data-id="${p.id_dokter}">Edit</button>
                <button class="btnDelete" data-id="${p.id_dokter}">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    aktifkanTombolEdit();
    aktifkanTombolDelete();
}

loadDokter();

// =====================================
// FORM SUBMIT → ADD ATAU EDIT
// =====================================

let editId = null; // global, untuk menentukan mode edit

document.getElementById("formDokter").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_dokter: document.getElementById("nama_dokter").value,
        spesialisasi: document.getElementById("spesialisasi").value,
        no_str: document.getElementById("no_str").value,
        no_telp: document.getElementById("no_telp").value,
    };

    // ==============================
    // MODE EDIT
    // ==============================
    if (editId !== null) {
        const { error } = await db
            .from("dokter")
            .update(payload)
            .eq("id_dokter", editId);

        if (error) {
            console.error("Update error:", error);
            alert("Gagal memperbarui data");
            return;
        }

        alert("Data berhasil diperbarui!");
        editId = null;
        e.target.reset();
        loadDokter();
        return;
    }

    // ==============================
    // MODE TAMBAH
    // ==============================
    const { error } = await db.from("dokter").insert([payload]);

    if (error) {
        console.error("Insert error:", error);
        alert("Gagal menambahkan data");
        return;
    }

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    loadDokter();
});

// =====================================
// DELETE DOKTER
// =====================================

function aktifkanTombolDelete() {
    document.querySelectorAll(".btnDelete").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (!confirm("Yakin ingin menghapus data ini?")) return;

            const { error } = await db
                .from("dokter")
                .delete()
                .eq("id_dokter", id);

            if (error) {
                console.error("Delete error:", error);
                alert("Gagal menghapus data");
                return;
            }

            alert("Data berhasil dihapus!");
            loadDokter();
        });
    });
}

// =====================================
// EDIT DOKTER
// =====================================

function aktifkanTombolEdit() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            editId = id; // set mode jadi EDIT

            const { data, error } = await db
                .from("dokter")
                .select("*")
                .eq("id_dokter", id)
                .single();

            if (error) {
                console.error("Fetch error:", error);
                return;
            }

            // Isi form dengan data lama
            document.getElementById("nama_dokter").value = data.nama_dokter;
            document.getElementById("spesialisasi").value = data.spesialisasi;
            document.getElementById("no_str").value = data.no_str;
            document.getElementById("no_telp").value = data.no_telp;
        });
    });
}

// Animasi halus saat baris tabel muncul
export function animateTable() {
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row, i) => {
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
        setTimeout(() => {
            row.style.transition = "0.35s ease";
            row.style.opacity = "1";
            row.style.transform = "translateY(0)";
        }, i * 70);
    });
}

// Panggil otomatis setelah DOM siap
document.addEventListener("DOMContentLoaded", animateTable);

animateTable();