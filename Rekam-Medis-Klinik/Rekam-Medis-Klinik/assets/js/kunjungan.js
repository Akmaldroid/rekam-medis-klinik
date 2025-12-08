import { db } from "./supabase.js";

// ==============================
// GLOBAL DATA
// ==============================
let pasienList = [];
let editModeID = null; // <- penanda mode edit

// ==============================
// LOAD DROPDOWN PASIEN, DOKTER, POLI
// ==============================
async function loadDropdown() {

    // Pasien
    const { data: pasien } = await db.from("pasien").select("id_pasien, nama_pasien");
    pasienList = pasien;

    // Dokter
    const { data: dokter } = await db.from("dokter").select("id_dokter, nama_dokter");
    document.getElementById("id_dokter").innerHTML =
        dokter.map(d => `<option value="${d.id_dokter}">${d.nama_dokter}</option>`).join("");

    // Poli
    const { data: poli } = await db.from("poli").select("id_poli, nama_poli");
    document.getElementById("id_poli").innerHTML =
        poli.map(p => `<option value="${p.id_poli}">${p.nama_poli}</option>`).join("");
}

loadDropdown();

// ==============================
// AUTOCOMPLETE PASIEN
// ==============================
const searchInput = document.getElementById("searchPasien");
const hasilList = document.getElementById("autocompleteList");

searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    if (keyword.trim() === "") {
        hasilList.style.display = "none";
        return;
    }

    const hasil = pasienList.filter(p =>
        p.nama_pasien.toLowerCase().includes(keyword)
    );

    hasilList.innerHTML = hasil
        .map(p => `
            <div class="autocomplete-item" data-id="${p.id_pasien}" data-name="${p.nama_pasien}">
                ${p.nama_pasien}
            </div>
        `)
        .join("");

    hasilList.style.display = hasil.length > 0 ? "block" : "none";

    document.querySelectorAll(".autocomplete-item").forEach(item => {
        item.addEventListener("click", () => {
            const id = item.dataset.id;
            const name = item.dataset.name;

            searchInput.value = name;
            document.getElementById("id_pasien").value = id;

            hasilList.style.display = "none";
        });
    });
});

// ==============================
// LOAD LIST KUNJUNGAN
// ==============================
async function loadKunjungan() {
    const { data, error } = await db
        .from("kunjungan")
        .select(`
            id_kunjungan,
            id_pasien,
            id_dokter,
            id_poli,
            tanggal_kunjungan,
            keluhan,
            pasien (nama_pasien),
            poli (nama_poli)
        `)
        .order("id_kunjungan", { ascending: true });

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
                <button data-id="${k.id_kunjungan}" class="editKunjungan">Edit</button>
                <button data-id="${k.id_kunjungan}" class="hapusKunjungan">Hapus</button>
            </td>
        `;
        tabel.appendChild(tr);
    });

    activeDelete();
    activeEdit();
}

loadKunjungan();

// ==============================
// TAMBAH / UPDATE KUNJUNGAN
// ==============================
document.getElementById("formKunjungan").addEventListener("submit", async (e) => {
    e.preventDefault();

    const idPasien = document.getElementById("id_pasien").value;

    if (!idPasien) {
        alert("Pilih pasien dulu melalui pencarian.");
        return;
    }

    const payload = {
        id_pasien: idPasien,
        id_dokter: document.getElementById("id_dokter").value,
        id_poli: document.getElementById("id_poli").value,
        tanggal_kunjungan: document.getElementById("tanggal_kunjungan").value,
        keluhan: document.getElementById("keluhan").value,
    };

    // ========= MODE UPDATE =========
    if (editModeID !== null) {
        const { error } = await db
            .from("kunjungan")
            .update(payload)
            .eq("id_kunjungan", editModeID);

        if (error) {
            console.error("Update error:", error);
            alert("Gagal memperbarui kunjungan");
            return;
        }

        alert("Kunjungan berhasil diperbarui!");

        editModeID = null;
        document.getElementById("submitBtn").textContent = "Simpan";
        e.target.reset();
        searchInput.value = "";

        loadKunjungan();
        return;
    }

    // ========= MODE INSERT =========
    const { error } = await db.from("kunjungan").insert([payload]);

    if (error) {
        console.error("Insert error:", error);
        alert("Gagal menambahkan kunjungan");
        return;
    }

    alert("Kunjungan berhasil ditambahkan!");
    loadKunjungan();
    e.target.reset();
    searchInput.value = "";
});

// ==============================
// HAPUS KUNJUNGAN
// ==============================
function activeDelete() {
    document.querySelectorAll(".hapusKunjungan").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (!confirm("Yakin ingin menghapus kunjungan ini?")) return;

            await db.from("kunjungan").delete().eq("id_kunjungan", id);
            loadKunjungan();
        });
    });
}

// ==============================
// EDIT KUNJUNGAN
// ==============================
function activeEdit() {
    document.querySelectorAll(".editKunjungan").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            editModeID = id;

            const { data } = await db
                .from("kunjungan")
                .select("*")
                .eq("id_kunjungan", id)
                .single();

            if (!data) return;

            // Isi ke form
            document.getElementById("id_pasien").value = data.id_pasien;

            const pasien = pasienList.find(p => p.id_pasien == data.id_pasien);
            if (pasien) searchInput.value = pasien.nama_pasien;

            document.getElementById("id_dokter").value = data.id_dokter;
            document.getElementById("id_poli").value = data.id_poli;
            document.getElementById("tanggal_kunjungan").value = data.tanggal_kunjungan;
            document.getElementById("keluhan").value = data.keluhan;

            // Ubah tombol submit
            document.getElementById("submitBtn").textContent = "Update Kunjungan";

            // Auto scroll ke form
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

// Efek halus saat user memilih item autocomplete
export function animateSelect(el) {
    el.style.transition = "0.25s";
    el.style.background = "#d8f2ff";

    setTimeout(() => {
        el.style.background = "white";
    }, 250);
}

// Efek input fokus glow
document.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("focus", () => {
        field.style.boxShadow = "0 0 0 5px rgba(10,150,220,0.25)";
    });

    field.addEventListener("blur", () => {
        field.style.boxShadow = "none";
    });
});
animateSelect();