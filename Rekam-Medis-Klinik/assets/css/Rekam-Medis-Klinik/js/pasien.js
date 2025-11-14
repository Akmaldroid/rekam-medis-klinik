import { supabase } from "./supabase.js";

const tableBody = document.querySelector("#tablePasien tbody");
const form = document.querySelector("#formPasien");

async function loadPasien() {
  const { data, error } = await supabase.from("pasien").select("*").order("id_pasien");
  if (error) return console.error(error);

  tableBody.innerHTML = "";
  data.forEach(p => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.id_pasien}</td>
        <td>${p.nama_pasien}</td>
        <td>${p.nik}</td>
        <td>${p.jenis_kelamin}</td>
        <td>${p.tanggal_lahir}</td>
        <td>${p.alamat}</td>
        <td>${p.no_telp}</td>
        <td>
          <button onclick="editPasien(${p.id_pasien})">Edit</button>
          <button onclick="deletePasien(${p.id_pasien})">Hapus</button>
        </td>
      </tr>
    `;
  });
}

window.editPasien = async (id) => {
  const { data } = await supabase.from("pasien").select("*").eq("id_pasien", id).single();

  document.getElementById("id_pasien").value = data.id_pasien;
  document.getElementById("nama_pasien").value = data.nama_pasien;
  document.getElementById("nik").value = data.nik;
  document.getElementById("jenis_kelamin").value = data.jenis_kelamin;
  document.getElementById("tanggal_lahir").value = data.tanggal_lahir;
  document.getElementById("alamat").value = data.alamat;
  document.getElementById("no_telp").value = data.no_telp;
};

window.deletePasien = async (id) => {
  await supabase.from("pasien").delete().eq("id_pasien", id);
  loadPasien();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nama_pasien: nama_pasien.value,
    nik: nik.value,
    jenis_kelamin: jenis_kelamin.value,
    tanggal_lahir: tanggal_lahir.value,
    alamat: alamat.value,
    no_telp: no_telp.value,
  };

  const id = document.getElementById("id_pasien").value;

  if (id) {
    await supabase.from("pasien").update(payload).eq("id_pasien", id);
  } else {
    await supabase.from("pasien").insert(payload);
  }

  form.reset();
  loadPasien();
});

loadPasien();
