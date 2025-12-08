import { db } from "./supabase.js";

// ==========================
// VARIABEL GLOBAL
// ==========================
let editID = null;

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
// LOAD RIWAYAT REKAM MEDIS
// ==========================

async function loadRM() {
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
        .order("id_rekam", { ascending: true });

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
}
loadRM();

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

    // =====================
    // MODE UPDATE
    // =====================
    if (editID !== null) {
        const { error } = await db
            .from("rekam_medis")
            .update(payload)
            .eq("id_rekam", editID);

        if (error) {
            alert("Gagal update rekam medis!");
            return;
        }

        alert("Rekam medis berhasil diperbarui!");
        editID = null;
        loadRM();
        e.target.reset();
        return;
    }

    // =====================
    // MODE INSERT
    // =====================
    const { error } = await db.from("rekam_medis").insert([payload]);

    if (error) {
        alert("Gagal menyimpan RM");
        return;
    }

    alert("Rekam Medis Tersimpan!");
    loadRM();
    e.target.reset();
});

// ==========================
// FITUR EDIT
// ==========================

window.editRM = async (id) => {
    const { data, error } = await db
        .from("rekam_medis")
        .select("*")
        .eq("id_rekam", id)
        .single();

    if (error) {
        alert("Gagal mengambil data RM");
        return;
    }

    editID = id;

    document.getElementById("id_kunjungan").value = data.id_kunjungan;
    document.getElementById("diagnosa").value = data.diagnosa;
    document.getElementById("tindakan").value = data.tindakan;
    document.getElementById("resep").value = data.resep;

    alert("Mode Edit Aktif! Silakan ubah data lalu klik simpan.");
};

// ==========================
// FITUR HAPUS
// ==========================

window.hapusRM = async (id) => {
    if (!confirm("Yakin ingin menghapus rekam medis ini?")) return;

    const { error } = await db
        .from("rekam_medis")
        .delete()
        .eq("id_rekam", id);

    if (error) {
        alert("Gagal menghapus RM");
        return;
    }

    alert("Rekam medis berhasil dihapus!");
    loadRM();
};

// ==========================
// FITUR CETAK
// ==========================

window.cetakRM = async (id) => {
    const { data, error } = await db
        .from("rekam_medis")
        .select(`
            *,
            kunjungan(id_kunjungan, tanggal_kunjungan, pasien(nama_pasien))
        `)
        .eq("id_rekam", id)
        .single();

    if (error) {
        alert("Gagal mengambil data untuk cetak");
        return;
    }

    const win = window.open("", "_blank");

    win.document.writeln(`
        <html>
        <head>
            <title>Cetak Rekam Medis</title>
            <link rel="stylesheet" href="assets/css/rekam-medis.css">

            <style>
                /* 🔥 HILANGKAN semua tombol saat print */
                @media print {
                    button {
                        display: none !important;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background: white !important;
                    }
                }

                /* 🌟 Biar tampilan di print rapi & tengah */
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px 40px;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .print-container {
                    border: 1px solid #ccc;
                    padding: 20px;
                    border-radius: 10px;
                    background: white;
                }
            </style>
        </head>

        <body>
            <div class="print-container">

                <h2>Rekam Medis</h2>

                <p><b>ID Rekam:</b> ${data.id_rekam}</p>
                <p><b>Nama Pasien:</b> ${data.kunjungan.pasien.nama_pasien}</p>
                <p><b>ID Kunjungan:</b> ${data.kunjungan.id_kunjungan}</p>
                <p><b>Tanggal Kunjungan:</b> ${data.kunjungan.tanggal_kunjungan}</p>
                <p><b>Diagnosa:</b> ${data.diagnosa}</p>
                <p><b>Tindakan:</b> ${data.tindakan}</p>
                <p><b>Resep:</b> ${data.resep}</p>
                <p><b>Tanggal Rekam:</b> ${data.tanggal_rekam}</p>

                <br><br>
                <button onclick="window.print()">Print</button>

            </div>
        </body>
        </html>
    `);

    win.document.close();
};

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