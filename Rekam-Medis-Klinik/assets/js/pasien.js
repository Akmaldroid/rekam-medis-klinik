import { db } from "./supabase.js";

// =============== PAGINATION SETTINGS ===============
let currentPage = 1;
let perPage = 10;
let totalRows = 0;

// ===================================================
// LOAD DATA PASIEN DENGAN PAGINATION
// ===================================================
async function loadPasien(page = 1) {
    currentPage = page;

    // ===== HITUNG TOTAL DATA (AMAN) =====
    const { count, error: countError } = await db
        .from("pasien")
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
        .from("pasien")
        .select("*")
        .order("id_pasien", { ascending: true })
        .range(start, end);

    if (error) {
        console.error("Error load:", error);
        return;
    }

    const tabel = document.getElementById("tabelPasien");
    tabel.innerHTML = "";

    data.forEach(p => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id_pasien; // 🔥 penting untuk highlight

        tr.innerHTML = `
            <td>${p.id_pasien}</td>
            <td>${p.nama_pasien}</td>
            <td>${p.nik}</td>
            <td>${p.jenis_kelamin}</td>
            <td>${p.tanggal_lahir}</td>
            <td>${p.alamat}</td>
            <td>${p.no_telp}</td>
            <td>
                <button class="btnEdit" data-id="${p.id_pasien}">Edit</button>
                <button class="btnDelete" data-id="${p.id_pasien}">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    updatePaginationButtons();
    aktifkanTombolEdit();
    aktifkanTombolDelete();
    animateTable();
}

loadPasien();

// ===================================================
// FORM SUBMIT ADD / UPDATE
// ===================================================
let editId = null;

document.getElementById("formPasien").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_pasien: nama_pasien.value.trim(),
        nik: nik.value.trim(),
        jenis_kelamin: jenis_kelamin.value,
        tanggal_lahir: tanggal_lahir.value,
        alamat: alamat.value.trim(),
        no_telp: no_telp.value.trim(),
    };

    // ===== MODE EDIT =====
    if (editId !== null) {
        const { error } = await db
            .from("pasien")
            .update(payload)
            .eq("id_pasien", editId);

        if (error) return alert("Gagal update data");

        alert("Data berhasil diperbarui!");
        const lastId = editId;

        editId = null;
        e.target.reset();
        await loadPasien(currentPage);
        highlightRow(lastId);
        return;
    }

    // ===== MODE TAMBAH =====
    const { data, error } = await db
        .from("pasien")
        .insert([payload])
        .select()
        .single();

    if (error) return alert("Gagal menambahkan data");

    alert("Data berhasil ditambahkan!");
    e.target.reset();
    await loadPasien(1);
    highlightRow(data.id_pasien);
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
                .from("pasien")
                .delete()
                .eq("id_pasien", id);

            if (error) return alert("Gagal menghapus data");

            alert("Data terhapus!");
            loadPasien(currentPage);
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
                .from("pasien")
                .select("*")
                .eq("id_pasien", id)
                .single();

            if (error) return alert("Data tidak ditemukan");

            nama_pasien.value = data.nama_pasien;
            nik.value = data.nik;
            jenis_kelamin.value = data.jenis_kelamin;
            tanggal_lahir.value = data.tanggal_lahir;
            alamat.value = data.alamat;
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
    if (currentPage > 1) loadPasien(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
    loadPasien(currentPage + 1);
};

// ===================================================
// PERPAGE DROPDOWN
// ===================================================
document.getElementById("perPageSelect").addEventListener("change", (e) => {
    perPage = parseInt(e.target.value);
    loadPasien(1);
});

// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelPasien tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "2s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelPasien tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}
