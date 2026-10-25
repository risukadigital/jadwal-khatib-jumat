/* Firebase - Khatib Jumat FZ 2027 */
const firebaseConfig = {
  apiKey: "AIzaSyBwgS0JiW9uwbiMkDl8d3xmcGQirxMUHco",
  authDomain: "khatib-fz-27.firebaseapp.com",
  projectId: "khatib-fz-27",
  storageBucket: "khatib-fz-27.firebasestorage.app",
  messagingSenderId: "655315678851",
  appId: "1:655315678851:web:fede04bc35c74307730db6",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

const $ = (id) => document.getElementById(id);

const loginBox = $("loginBox");
const adminPanel = $("adminPanel");
const emailInput = $("email");
const passwordInput = $("password");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");
const loginStatus = $("loginStatus");
const adminEmail = $("adminEmail");
const bulanContainer = $("bulanContainer");
const tanggalSection = $("tanggalSection");
const judulBulan = $("judulBulan");
const tanggalContainer = $("tanggalContainer");
const daftarJadwal = $("daftarJadwal");
const dataStatus = $("dataStatus");
const modal = $("modalJadwal");
const form = $("formJadwal");
const dialogTitle = $("dialogTitle");
const dialogTanggal = $("dialogTanggal");
const tempat = $("tempat");
const alamat = $("alamat");
const pengurus = $("pengurus");
const hpPengurus = $("hpPengurus");
const formStatus = $("formStatus");
const btnSave = $("btnSave");
const btnDelete = $("btnDelete");
const btnCancel = $("btnCancel");

const YEAR = 2027;

const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const namaHari = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

let dataJadwal = {};
let bulanAktif = null;
let tanggalAktif = null;
let sedangMenyimpan = false;
let sedangMenghapus = false;

function idTanggal(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `jadwal-${YEAR}-${mm}-${dd}`;
}

function formatTanggal(date) {
  return `${namaHari[date.getDay()]}, ${date.getDate()} ${namaBulan[date.getMonth()]} ${YEAR}`;
}

function tanggalDariId(id) {
  const match = /^jadwal-(2027)-(\d{2})-(\d{2})$/.exec(id);

  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function buatElemen(tag, text, className) {
  const el = document.createElement(tag);

  if (text !== undefined) {
    el.textContent = text;
  }

  if (className) {
    el.className = className;
  }

  return el;
}

/* LOGIN ADMIN */
btnLogin.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    loginStatus.textContent = "Email dan password wajib diisi.";
    return;
  }

  btnLogin.disabled = true;
  loginStatus.textContent = "Sedang login...";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginStatus.textContent = "Login berhasil.";
  } catch (error) {
    console.error(error);
    loginStatus.textContent = "Login gagal: " + error.message;
  } finally {
    btnLogin.disabled = false;
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    btnLogin.click();
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error(error);
  }
});

/* STATUS LOGIN */
auth.onAuthStateChanged(async (user) => {
  loginBox.classList.toggle("hidden", Boolean(user));
  adminPanel.classList.toggle("hidden", !user);

  if (!user) {
    adminEmail.textContent = "";
    return;
  }

  adminEmail.textContent = user.email || "";

  await muatData();
  buatBulan();
  renderDaftarJadwal();
});

/* MEMUAT DATA FIRESTORE */
async function muatData() {
  daftarJadwal.replaceChildren(
    buatElemen("p", "Memuat data jadwal...", "muted"),
  );

  try {
    const snapshot = await db.collection("jadwal").get();

    dataJadwal = {};

    snapshot.forEach((doc) => {
      dataJadwal[doc.id] = doc.data();
    });

    dataStatus.textContent = `Data berhasil dimuat: ${snapshot.size} jadwal.`;
  } catch (error) {
    console.error(error);

    dataStatus.textContent = "Gagal membaca Firestore: " + error.message;
  }
}

/* PILIH BULAN */
function buatBulan() {
  bulanContainer.replaceChildren();

  namaBulan.forEach((nama, index) => {
    const button = buatElemen(
      "button",
      nama,
      "bulan-card" + (bulanAktif === index ? " active" : ""),
    );

    button.type = "button";

    button.addEventListener("click", () => {
      bulanAktif = index;
      buatBulan();
      buatTanggalJumat(index);
    });

    bulanContainer.appendChild(button);
  });
}

/* TAMPILKAN HANYA TANGGAL JUMAT */
function buatTanggalJumat(indexBulan) {
  tanggalSection.classList.remove("hidden");

  judulBulan.textContent = `2. Pilih Tanggal Jumat — ${namaBulan[indexBulan]} ${YEAR}`;

  tanggalContainer.replaceChildren();

  const hariTerakhir = new Date(YEAR, indexBulan + 1, 0).getDate();

  for (let day = 1; day <= hariTerakhir; day++) {
    const date = new Date(YEAR, indexBulan, day);

    // 5 berarti Jumat
    if (date.getDay() !== 5) continue;

    const id = idTanggal(date);
    const record = dataJadwal[id];

    const sudahTerisi = Boolean(
      record &&
      (record.masjid ||
        record.tempat ||
        record.alamat ||
        record.pengurus ||
        record.hp ||
        record.hpPengurus),
    );

    const button = buatElemen(
      "button",
      undefined,
      "tanggal-card" + (sudahTerisi ? " terisi" : ""),
    );

    button.type = "button";

    button.appendChild(buatElemen("span", String(day), "day"));

    button.appendChild(
      buatElemen("span", sudahTerisi ? "Sudah terisi" : "Kosong", "label"),
    );

    button.setAttribute(
      "aria-label",
      `${formatTanggal(date)}, ${sudahTerisi ? "sudah terisi" : "kosong"}`,
    );

    button.addEventListener("click", () => {
      bukaForm(date);
    });

    tanggalContainer.appendChild(button);
  }
}

/* BUKA FORM TAMBAH / EDIT */
function bukaForm(date) {
  tanggalAktif = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const id = idTanggal(tanggalAktif);
  const record = dataJadwal[id] || {};

  const sudahTerisi = Boolean(
    record.masjid ||
    record.tempat ||
    record.alamat ||
    record.pengurus ||
    record.hp ||
    record.hpPengurus,
  );

  dialogTanggal.textContent = formatTanggal(tanggalAktif);

  dialogTitle.textContent = sudahTerisi ? "Edit Jadwal" : "Tambah Jadwal";

  tempat.value = record.masjid || record.tempat || "";
  alamat.value = record.alamat || "";
  pengurus.value = record.pengurus || "";
  hpPengurus.value = record.hp || record.hpPengurus || "";

  formStatus.textContent = "";

  btnSave.textContent = sudahTerisi ? "Simpan Perubahan" : "Simpan Jadwal";

  btnDelete.classList.toggle("hidden", !sudahTerisi);

  modal.classList.remove("hidden");
  tempat.focus();
}

/* TUTUP FORM */
function tutupForm() {
  modal.classList.add("hidden");
  tanggalAktif = null;
  form.reset();
  formStatus.textContent = "";
}

btnCancel.addEventListener("click", tutupForm);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    tutupForm();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    tutupForm();
  }
});

/* SIMPAN / UPDATE JADWAL */
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!tanggalAktif || sedangMenyimpan || sedangMenghapus) {
    return;
  }

  // Simpan salinan tanggal sebelum form ditutup
  const tanggalSimpan = new Date(tanggalAktif);
  const id = idTanggal(tanggalSimpan);

  const data = {
    tanggal:
      `${String(tanggalSimpan.getDate()).padStart(2, "0")}-` +
      `${String(tanggalSimpan.getMonth() + 1).padStart(2, "0")}-` +
      `${YEAR}`,
    bulan: namaBulan[tanggalSimpan.getMonth()],
    masjid: tempat.value.trim(),
    alamat: alamat.value.trim(),
    pengurus: pengurus.value.trim(),
    hp: hpPengurus.value.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (!data.masjid || !data.alamat || !data.pengurus || !data.hp) {
    formStatus.textContent = "Semua empat kolom wajib diisi.";
    return;
  }

  sedangMenyimpan = true;
  btnSave.disabled = true;
  btnDelete.disabled = true;
  formStatus.textContent = "Menyimpan ke Firebase...";

  try {
    await db.collection("jadwal").doc(id).set(data, { merge: true });

    dataJadwal[id] = {
      ...(dataJadwal[id] || {}),
      ...data,
    };

    tutupForm();

    if (bulanAktif !== null) {
      buatTanggalJumat(bulanAktif);
    }

    renderDaftarJadwal();

    dataStatus.textContent = `Jadwal ${formatTanggal(tanggalSimpan)} berhasil disimpan.`;
  } catch (error) {
    console.error(error);

    formStatus.textContent = "Gagal menyimpan: " + error.message;
  } finally {
    sedangMenyimpan = false;
    btnSave.disabled = false;
    btnDelete.disabled = false;
  }
});

/* HAPUS JADWAL */
btnDelete.addEventListener("click", async () => {
  if (!tanggalAktif || sedangMenyimpan || sedangMenghapus) {
    return;
  }

  const tanggalHapus = new Date(tanggalAktif);
  const id = idTanggal(tanggalHapus);

  if (
    !window.confirm(
      `Yakin ingin menghapus jadwal ${formatTanggal(tanggalHapus)}?`,
    )
  ) {
    return;
  }

  sedangMenghapus = true;
  btnDelete.disabled = true;
  btnSave.disabled = true;

  formStatus.textContent = "Menghapus jadwal...";

  try {
    await db.collection("jadwal").doc(id).delete();

    delete dataJadwal[id];

    tutupForm();

    if (bulanAktif !== null) {
      buatTanggalJumat(bulanAktif);
    }

    renderDaftarJadwal();

    dataStatus.textContent = `Jadwal ${formatTanggal(tanggalHapus)} berhasil dihapus.`;
  } catch (error) {
    console.error(error);

    formStatus.textContent = "Gagal menghapus: " + error.message;
  } finally {
    sedangMenghapus = false;
    btnDelete.disabled = false;
    btnSave.disabled = false;
  }
});

/* DAFTAR SEMUA JADWAL */
function renderDaftarJadwal() {
  daftarJadwal.replaceChildren();

  const entries = Object.entries(dataJadwal)
    .map(([id, data]) => ({
      id,
      data,
      date: tanggalDariId(id),
    }))
    .filter((item) => item.date)
    .sort((a, b) => a.date - b.date);

  if (entries.length === 0) {
    daftarJadwal.appendChild(
      buatElemen("p", "Belum ada jadwal yang disimpan.", "muted"),
    );
    return;
  }

  entries.forEach(({ data, date }) => {
    const card = buatElemen("article", undefined, "jadwal-item");

    card.appendChild(buatElemen("h3", formatTanggal(date)));

    card.appendChild(
      buatElemen("p", `Masjid: ${data.masjid || data.tempat || "-"}`),
    );

    card.appendChild(buatElemen("p", `Alamat: ${data.alamat || "-"}`));

    card.appendChild(buatElemen("p", `Pengurus: ${data.pengurus || "-"}`));

    card.appendChild(
      buatElemen("p", `Nomor HP: ${data.hp || data.hpPengurus || "-"}`),
    );

    const edit = buatElemen("button", "Edit jadwal");
    edit.type = "button";

    edit.addEventListener("click", () => {
      bulanAktif = date.getMonth();

      buatBulan();
      buatTanggalJumat(bulanAktif);
      bukaForm(date);

      tanggalSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    card.appendChild(edit);
    daftarJadwal.appendChild(card);
  });
}

console.log("admin.js berhasil dijalankan.");
