import { db } from "./supabase.js";

// =============== PAGINATION SETTINGS ===============
let currentPage = 1;
let perPage = 5;
let totalRows = 0;

// ===================================================
// LOAD DATA POLI DENGAN PAGINATION
// ===================================================
async function loadPoli(page = 1) {
    currentPage = page;

    // ===== HITUNG TOTAL DATA (AMAN) =====
    const { count, error: countError } = await db
        .from("poli")
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
        .from("poli")
        .select("*")
        .order("id_poli", { ascending: true })
        .range(start, end);

    if (error) {
        console.error("Error load:", error);
        return;
    }

    const tabel = document.getElementById("tabelPoli");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id_poli; // 🔥 penting untuk highlight

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

    updatePaginationButtons();
    aktifkanTombolEdit();
    aktifkanTombolDelete();
    animateTable();
}

loadPoli();

// ===================================================
// FORM SUBMIT ADD / UPDATE
// ===================================================
let editId = null;

document.getElementById("formPoli").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_poli: nama_poli.value.trim(),
        lokasi: lokasi.value.trim(),
    };

    // ===== MODE EDIT =====
    if (editId !== null) {
        const { error } = await db
            .from("poli")
            .update(payload)
            .eq("id_poli", editId);

        if (error) return alert("Gagal update data");

        alert("Data berhasil diperbarui!");
        const lastId = editId;

        editId = null;
        e.target.reset();
        await loadPoli(currentPage);
        highlightRow(lastId);
        return;
    }

    // ===== MODE TAMBAH =====
    const { data, error } = await db
        .from("poli")
        .insert([payload])
        .select()
        .single();

    if (error) return alert("Gagal menambahkan data");

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    await loadPoli(1);
    highlightRow(data.id_poli);
});

// ===================================================
// DELETE PASIEN
// ===================================================
function aktifkanTombolDelete() {
    document.querySelectorAll(".btnDelete").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            if (!confirm("Hapus data ini?")) return;

            const { error } = await db
                .from("poli")
                .delete()
                .eq("id_poli", id);

            if (error) return alert("Gagal menghapus data");

            alert("Data terhapus!");
            loadPoli(currentPage);
        };
    });
}

// ===================================================
// EDIT PASIEN
// ===================================================
function aktifkanTombolEdit() {
    document.querySelectorAll(".btnEdit").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            editId = id;

            const { data, error } = await db
                .from("poli")
                .select("*")
                .eq("id_poli", id)
                .single();

            if (error) return alert("Data tidak ditemukan");

            nama_poli.value = data.nama_poli;
            lokasi.value = data.lokasi;
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
    if (currentPage > 1) loadPoli(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
    loadPoli(currentPage + 1);
};

// ===================================================
// PERPAGE DROPDOWN
// ===================================================
document.getElementById("itemsPerPage").addEventListener("change", (e) => {
    perPage = Number(e.target.value);
    currentPage = 1;   // 🔥 WAJIB reset page
    loadPoli(1);
});


// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelPoli tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "2s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelPoli tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}
