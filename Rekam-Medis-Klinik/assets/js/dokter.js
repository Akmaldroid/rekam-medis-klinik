import { db } from "./supabase.js";

// =============== PAGINATION SETTINGS ===============
let currentPage = 1;
let perPage = 10;
let totalRows = 0;

// ===================================================
// LOAD DATA DOKTER DENGAN PAGINATION
// ===================================================
async function loadDokter(page = 1) {
    currentPage = page;

    // ===== HITUNG TOTAL DATA (AMAN) =====
    const { count, error: countError } = await db
        .from("dokter")
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
        .from("dokter")
        .select("*")
        .order("id_dokter", { ascending: true })
        .range(start, end);

    if (error) {
        console.error("Error load:", error);
        return;
    }

    const tabel = document.getElementById("tabelDokter");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id_dokter; // 🔥 penting untuk highlight

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

    updatePaginationButtons();
    aktifkanTombolEdit();
    aktifkanTombolDelete();
    animateTable();
}

loadDokter();

// ===================================================
// FORM SUBMIT ADD / UPDATE
// ===================================================
let editId = null;

document.getElementById("formDokter").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_dokter: nama_dokter.value.trim(),
        spesialisasi: spesialisasi.value.trim(),
        no_str: no_str.value.trim(),
        no_telp: no_telp.value.trim(),
    };

    // ===== MODE EDIT =====
    if (editId !== null) {
        const { error } = await db
            .from("dokter")
            .update(payload)
            .eq("id_dokter", editId);

        if (error) return alert("Gagal update data");

        alert("Data berhasil diperbarui!");
        const lastId = editId;

        editId = null;
        e.target.reset();
        await loadDokter(currentPage);
        highlightRow(lastId);
        return;
    }

    // ===== MODE TAMBAH =====
    const { data, error } = await db
        .from("dokter")
        .insert([payload])
        .select()
        .single();

    if (error) return alert("Gagal menambahkan data");

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    await loadDokter(1);
    highlightRow(data.id_dokter);
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
                .from("dokter")
                .delete()
                .eq("id_dokter", id);

            if (error) return alert("Gagal menghapus data");

            alert("Data terhapus!");
            loadDokter(currentPage);
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
                .from("dokter")
                .select("*")
                .eq("id_dokter", id)
                .single();

            if (error) return alert("Data tidak ditemukan");

            nama_dokter.value = data.nama_dokter;
            spesialisasi.value = data.spesialisasi;
            no_str.value = data.no_str;
            no_telp.value = data.no_telp;
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
    if (currentPage > 1) loadDokter(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
    loadDokter(currentPage + 1);
};

// ===================================================
// PERPAGE DROPDOWN
// ===================================================
document.getElementById("perPageSelect").addEventListener("change", (e) => {
    perPage = parseInt(e.target.value);
    currentPage = 1;   // 🔥 WAJIB reset page
    loadDokter(1);
});

// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelDokter tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "2s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelDokter tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}
