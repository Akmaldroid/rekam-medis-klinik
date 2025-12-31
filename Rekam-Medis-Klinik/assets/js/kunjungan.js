import { db } from "./supabase.js";

// ==============================
// GLOBAL DATA
// ==============================
let pasienList = [];
let editModeID = null;

// ===== PAGINATION =====
let currentPage = 1;
let perPage = 10;
let totalRows = 0;

// ==============================
// LOAD DROPDOWN PASIEN, DOKTER, POLI
// ==============================
async function loadDropdown() {

    const { data: pasien } = await db
        .from("pasien")
        .select("id_pasien, nama_pasien");
    pasienList = pasien || [];

    const { data: dokter } = await db
        .from("dokter")
        .select("id_dokter, nama_dokter");
    document.getElementById("id_dokter").innerHTML =
        dokter.map(d => `<option value="${d.id_dokter}">${d.nama_dokter}</option>`).join("");

    const { data: poli } = await db
        .from("poli")
        .select("id_poli, nama_poli");
    document.getElementById("id_poli").innerHTML =
        poli.map(p => `<option value="${p.id_poli}">${p.nama_poli}</option>`).join("");
}

loadDropdown();

// ==============================
// AUTOCOMPLETE PASIEN (TETAP)
// ==============================
const searchInput = document.getElementById("searchPasien");
const hasilList = document.getElementById("autocompleteList");

searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase().trim();
    if (!keyword) {
        hasilList.style.display = "none";
        return;
    }

    const hasil = pasienList.filter(p =>
        p.nama_pasien.toLowerCase().includes(keyword)
    );

    hasilList.innerHTML = hasil.map(p => `
        <div class="autocomplete-item" data-id="${p.id_pasien}" data-name="${p.nama_pasien}">
            ${p.nama_pasien}
        </div>
    `).join("");

    hasilList.style.display = hasil.length ? "block" : "none";

    document.querySelectorAll(".autocomplete-item").forEach(item => {
        item.onclick = () => {
            document.getElementById("id_pasien").value = item.dataset.id;
            searchInput.value = item.dataset.name;
            hasilList.style.display = "none";
        };
    });
});

// ==============================
// LOAD LIST KUNJUNGAN + PAGINATION
// ==============================
async function loadKunjungan(page = 1) {
    currentPage = page;

    // ===== COUNT =====
    const { count } = await db
        .from("kunjungan")
        .select("*", { count: "exact", head: true });

    totalRows = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * perPage;
    const end = start + perPage - 1;

    // ===== DATA =====
    const { data, error } = await db
        .from("kunjungan")
        .select(`
            id_kunjungan,
            tanggal_kunjungan,
            keluhan,
            pasien (nama_pasien),
            poli (nama_poli)
        `)
        .order("id_kunjungan", { ascending: true })
        .range(start, end);

    if (error) {
        console.error(error);
        return;
    }

    const tabel = document.getElementById("tabelKunjungan");
    tabel.innerHTML = "";

    data.forEach(k => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${k.id_kunjungan}</td>
            <td>${k.pasien?.nama_pasien || "-"}</td>
            <td>${k.tanggal_kunjungan}</td>
            <td>${k.poli?.nama_poli || "-"}</td>
            <td>${k.keluhan}</td>
            <td>
                <button class="editKunjungan" data-id="${k.id_kunjungan}">Edit</button>
                <button class="hapusKunjungan" data-id="${k.id_kunjungan}">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    updatePagination();
    activeEdit();
    activeDelete();
    animateTable();
}

loadKunjungan();

// ==============================
// PAGINATION CONTROL
// ==============================
function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    document.getElementById("pageInfo").innerText =
        `Halaman ${currentPage} dari ${totalPages}`;

    document.getElementById("prevBtn").disabled = currentPage <= 1;
    document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) loadKunjungan(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
    loadKunjungan(currentPage + 1);
};

document.getElementById("perPageSelect").addEventListener("change", e => {
    perPage = Number(e.target.value);
    currentPage = 1;
    loadKunjungan(1);
});

// ==============================
// DELETE & EDIT (TIDAK DIUBAH)
// ==============================
function activeDelete() {
    document.querySelectorAll(".hapusKunjungan").forEach(btn => {
        btn.onclick = async () => {
            if (!confirm("Yakin hapus kunjungan?")) return;
            await db.from("kunjungan").delete().eq("id_kunjungan", btn.dataset.id);
            loadKunjungan(currentPage);
        };
    });
}

function activeEdit() {
    document.querySelectorAll(".editKunjungan").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            editModeID = id;

            const { data } = await db
                .from("kunjungan")
                .select("*")
                .eq("id_kunjungan", id)
                .single();

            if (!data) return;

            document.getElementById("id_pasien").value = data.id_pasien;
            document.getElementById("id_dokter").value = data.id_dokter;
            document.getElementById("id_poli").value = data.id_poli;
            document.getElementById("tanggal_kunjungan").value = data.tanggal_kunjungan;
            document.getElementById("keluhan").value = data.keluhan;

            const pasien = pasienList.find(p => p.id_pasien == data.id_pasien);
            if (pasien) searchInput.value = pasien.nama_pasien;

            document.getElementById("submitBtn").textContent = "Update Kunjungan";
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
    });
}

// ===================================================
// UI ENHANCEMENT
// ===================================================
function animateTable() {
    document.querySelectorAll("#tabelKunjungan tr").forEach((row, i) => {
        row.style.opacity = 0;
        setTimeout(() => {
            row.style.transition = "1s";
            row.style.opacity = 1;
        }, 50 * i);
    });
}

function highlightRow(id) {
    const row = document.querySelector(`#tabelKunjungan tr[data-id='${id}']`);
    if (!row) return;

    row.style.background = "#e0f7ff";
    setTimeout(() => {
        row.style.transition = "1s";
        row.style.background = "";
    }, 1000);
}