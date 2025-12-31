import { db } from "./supabase.js";

// ==========================
// VARIABEL GLOBAL
// ==========================
let editID = null;

// ==========================
// PAGINATION STATE
// ==========================
let currentPage = 1;
let itemsPerPage = 10;
let totalRows = 0;
let totalPages = 1;

const itemsSelect = document.getElementById("perPageSelect");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ==========================
// LOAD KUNJUNGAN UNTUK INPUT RM
// ==========================
async function loadKunjungan() {
    const { data } = await db
        .from("kunjungan")
        .select(`
            id_kunjungan,
            tanggal_kunjungan,
            pasien (nama_pasien)
        `);

    const select = document.getElementById("id_kunjungan");
    select.innerHTML = data.map(k =>
        `<option value="${k.id_kunjungan}">
            ${k.pasien?.nama_pasien} - ${k.tanggal_kunjungan}
        </option>`
    ).join("");
}
loadKunjungan();

// ==========================
// LOAD REKAM MEDIS + PAGINATION
// ==========================
async function loadRM() {

    // ======================
    // HITUNG TOTAL DATA
    // ======================
    const { count } = await db
        .from("rekam_medis")
        .select("*", { count: "exact", head: true });

    totalRows = count || 0;
    totalPages = Math.ceil(totalRows / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // ======================
    // AMBIL DATA BERDASARKAN HALAMAN
    // ======================
    const { data } = await db
        .from("rekam_medis")
        .select(`
            id_rekam,
            diagnosa,
            tindakan,
            resep,
            tanggal_rekam,
            kunjungan (id_kunjungan, pasien (nama_pasien))
        `)
        .order("id_rekam", { ascending: true })
        .range(from, to);

    const tabel = document.getElementById("tabelRM");
    tabel.innerHTML = "";

    data.forEach(rm => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${rm.id_rekam}</td>
            <td>${rm.kunjungan?.id_kunjungan}</td>
            <td>${rm.kunjungan?.pasien?.nama_pasien}</td>
            <td>${rm.diagnosa}</td>
            <td>${rm.tindakan}</td>
            <td>${rm.resep}</td>
            <td>${rm.tanggal_rekam}</td>
            <td>
                <button onclick="editRM(${rm.id_rekam})">Edit</button>
                <button onclick="hapusRM(${rm.id_rekam})">Hapus</button>
                <button onclick="cetakRM(${rm.id_rekam})">Cetak</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    animateTable();
    // ======================
    // UPDATE INFO PAGINATION
    // ======================
    pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
loadRM();

// ==========================
// EVENT PAGINATION
// ==========================
itemsSelect.addEventListener("change", () => {
    itemsPerPage = parseInt(itemsSelect.value);
    currentPage = 1;
    loadRM();
});

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadRM();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadRM();
    }
});

// ==========================
// SIMPAN / UPDATE REKAM MEDIS
// ==========================
document.getElementById("formRM").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        id_kunjungan: document.getElementById("id_kunjungan").value,
        diagnosa: document.getElementById("diagnosa").value,
        tindakan: document.getElementById("tindakan").value,
        resep: document.getElementById("resep").value,
        tanggal_rekam: new Date().toISOString().split("T")[0]
    };

    if (editID !== null) {
        await db.from("rekam_medis").update(payload).eq("id_rekam", editID);
        editID = null;
        alert("Rekam medis berhasil diperbarui!");
        loadRM();
        e.target.reset();
        return;
    }

    await db.from("rekam_medis").insert([payload]);
    alert("Rekam medis tersimpan!");
    loadRM();
    e.target.reset();
});

// ==========================
// FITUR EDIT
// ==========================
window.editRM = async (id) => {
    const { data } = await db
        .from("rekam_medis")
        .select("*")
        .eq("id_rekam", id)
        .single();

    editID = id;
    document.getElementById("id_kunjungan").value = data.id_kunjungan;
    document.getElementById("diagnosa").value = data.diagnosa;
    document.getElementById("tindakan").value = data.tindakan;
    document.getElementById("resep").value = data.resep;

    alert("Mode Edit Aktif!");
};

// ==========================
// FITUR HAPUS
// ==========================
window.hapusRM = async (id) => {
    if (!confirm("Yakin ingin menghapus rekam medis ini?")) return;
    await db.from("rekam_medis").delete().eq("id_rekam", id);
    alert("Rekam medis berhasil dihapus!");
    loadRM();
};

// ==========================
// FITUR CETAK (TIDAK DIUBAH)
// ==========================
window.cetakRM = async (id) => {
    const { data } = await db
        .from("rekam_medis")
        .select(`
            *,
            kunjungan(id_kunjungan, tanggal_kunjungan, pasien(nama_pasien))
        `)
        .eq("id_rekam", id)
        .single();

    const win = window.open("", "_blank");
    win.document.writeln(`
        <html>
        <head>
            <title>Cetak Rekam Medis</title>
            <style>
                @media print { button { display:none } }
                body { font-family: Arial; color: #fff; padding:20px; background: linear-gradient(90deg, #0b7ec8, #0ca48a); }
            </style>
        </head>
        <body>
            <h2>Rekam Medis</h2>
            <p><b>Nama Pasien:</b> ${data.kunjungan.pasien.nama_pasien}</p>
            <p><b>Diagnosa:</b> ${data.diagnosa}</p>
            <p><b>Tindakan:</b> ${data.tindakan}</p>
            <p><b>Resep:</b> ${data.resep}</p>
            <button onclick="window.print()">Print</button>
        </body>
        </html>
    `);
    win.document.close();
};

// ==========================
// EFEK UI (TIDAK DIUBAH)
// ==========================
document.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("focus", () => {
        field.style.boxShadow = "0 0 0 5px rgba(10,150,220,0.25)";
    });
    field.addEventListener("blur", () => {
        field.style.boxShadow = "none";
    });
});

// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelRM tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "1s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelRM tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}