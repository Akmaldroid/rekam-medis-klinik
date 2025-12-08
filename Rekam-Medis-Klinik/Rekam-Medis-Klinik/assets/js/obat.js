import { db } from "./supabase.js";

// =====================================
// LOAD DATA OBAT
// =====================================

async function loadObat() {
    const { data, error } = await db
        .from("obat")
        .select("*")
        .order("id_obat", { ascending: true });

    if (error) {
        console.error("Select error:", error);
        return;
    }

    const tabel = document.getElementById("tabelObat");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id_obat}</td>
            <td>${p.nama_obat}</td>
            <td>${p.jenis_obat}</td>
            <td>${p.stok}</td>
            <td>${p.satuan}</td>
            <td>${p.harga}</td>
            <td>
                <button class="btnEdit" data-id="${p.id_obat}">Edit</button>
                <button class="btnDelete" data-id="${p.id_obat}">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    aktifkanTombolEdit();
    aktifkanTombolDelete();
}

loadObat();

// =====================================
// FORM SUBMIT → ADD ATAU EDIT
// =====================================

let editId = null; // global, untuk menentukan mode edit

document.getElementById("formObat").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_obat: document.getElementById("nama_obat").value,
        jenis_obat: document.getElementById("jenis_obat").value,
        stok: document.getElementById("stok").value,
        satuan: document.getElementById("satuan").value,
        harga: document.getElementById("harga").value,
    };

    // ==============================
    // MODE EDIT
    // ==============================
    if (editId !== null) {
        const { error } = await db
            .from("obat")
            .update(payload)
            .eq("id_obat", editId);

        if (error) {
            console.error("Update error:", error);
            alert("Gagal memperbarui data");
            return;
        }

        alert("Data berhasil diperbarui!");
        editId = null;
        e.target.reset();
        loadObat();
        return;
    }

    // ==============================
    // MODE TAMBAH
    // ==============================
    const { error } = await db.from("obat").insert([payload]);

    if (error) {
        console.error("Insert error:", error);
        alert("Gagal menambahkan data");
        return;
    }

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    loadObat();
});

// =====================================
// DELETE OBAT
// =====================================

function aktifkanTombolDelete() {
    document.querySelectorAll(".btnDelete").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (!confirm("Yakin ingin menghapus data ini?")) return;

            const { error } = await db
                .from("obat")
                .delete()
                .eq("id_obat", id);

            if (error) {
                console.error("Delete error:", error);
                alert("Gagal menghapus data");
                return;
            }

            alert("Data berhasil dihapus!");
            loadObat();
        });
    });
}

// =====================================
// EDIT OBAT
// =====================================

function aktifkanTombolEdit() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            editId = id; // set mode jadi EDIT

            const { data, error } = await db
                .from("obat")
                .select("*")
                .eq("id_obat", id)
                .single();

            if (error) {
                console.error("Fetch error:", error);
                return;
            }

            // Isi form dengan data lama
            document.getElementById("nama_obat").value = data.nama_obat;
            document.getElementById("jenis_obat").value = data.jenis_obat;
            document.getElementById("stok").value = data.stok;
            document.getElementById("satuan").value = data.satuan;
            document.getElementById("harga").value = data.harga;
        });
    });
}
