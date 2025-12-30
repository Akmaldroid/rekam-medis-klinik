import { db } from "./supabase.js";

// =============== PAGINATION SETTINGS ===============
let currentPage = 1;
let perPage = 10;
let totalRows = 0;

// ===================================================
// LOAD DATA OBAT DENGAN PAGINATION
// ===================================================
async function loadObat(page = 1) {
    currentPage = page;

    // ===== HITUNG TOTAL DATA (AMAN) =====
    const { count, error: countError } = await db
        .from("obat")
        .select("*", { count: "exact", head: true });

    if (countError) {
        console.error("Error count:", countError);
        return;
    }

    totalRows = count ?? 0;

    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * perPage;
    const end = start + perPage - 1;

    // ===== AMBIL DATA =====
    const { data, error } = await db
        .from("obat")
        .select("*")
        .order("id_obat", { ascending: true })
        .range(start, end);

    if (error) {
        console.error("Error load:", error);
        return;
    }

    const tabel = document.getElementById("tabelObat");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id_obat; // 🔥 penting untuk highlight

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

    updatePaginationButtons();
    aktifkanTombolEdit();
    aktifkanTombolDelete();
    animateTable();
}

loadObat();

// ===================================================
// FORM SUBMIT ADD / UPDATE
// ===================================================
let editId = null;

document.getElementById("formObat").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_obat: nama_obat.value.trim(),
        jenis_obat: jenis_obat.value.trim(),
        stok: stok.value.trim(),
        satuan: satuan.value.trim(),
        harga: harga.value.trim(),
    };

    // ===== MODE EDIT =====
    if (editId !== null) {
        const { error } = await db
            .from("obat")
            .update(payload)
            .eq("id_obat", editId);

        if (error) return alert("Gagal update data");

        alert("Data berhasil diperbarui!");
        const lastId = editId;

        editId = null;
        e.target.reset();
        await loadObat(currentPage);
        highlightRow(lastId);
        return;
    }

    // ===== MODE TAMBAH =====
    const { data, error } = await db
        .from("obat")
        .insert([payload])
        .select()
        .single();

    if (error) return alert("Gagal menambahkan data");

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    await loadObat(1);
    highlightRow(data.id_obat);
});

// ===================================================
// DELETE OBAT
// ===================================================
function aktifkanTombolDelete() {
    document.querySelectorAll(".btnDelete").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            if (!confirm("Hapus data ini?")) return;

            const { error } = await db
                .from("obat")
                .delete()
                .eq("id_obat", id);

            if (error) return alert("Gagal menghapus data");

            alert("Data terhapus!");
            loadObat(currentPage);
        };
    });
}

// ===================================================
// EDIT OBAT
// ===================================================
function aktifkanTombolEdit() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            editId = id;

            const { data, error } = await db
                .from("obat")
                .select("*")
                .eq("id_obat", id)
                .single();

            if (error) return alert("Data tidak ditemukan");

            nama_obat.value = data.nama_obat;
            jenis_obat.value = data.jenis_obat;
            stok.value = data.stok;
            satuan.value = data.satuan;
            harga.value = data.harga;
        };
    });
}

// ===================================================
// PAGE BUTTON CONTROL
// ===================================================
function updatePaginationButtons() {
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

    document.getElementById("pageInfo").innerText =
        `Halaman ${currentPage} dari ${totalPages}`;

    document.getElementById("prevBtn").disabled = currentPage <= 1;
    document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) loadObat(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
    loadObat(currentPage + 1);
};

// ===================================================
// PERPAGE DROPDOWN
// ===================================================
document.getElementById("itemsPerPage").addEventListener("change", (e) => {
    perPage = parseInt(e.target.value);
    currentPage = 1;
    loadObat(1);
});

// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelObat tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "2s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelObat tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}
