/* ==============================
   FIREBASE
============================== */

const firebaseConfig = {
    apiKey: "AIzaSyBwgS0JiW9uwbiMkDl8d3xmcGQirxMUHco",
    authDomain: "khatib-fz-27.firebaseapp.com",
    projectId: "khatib-fz-27",
    storageBucket: "khatib-fz-27.firebasestorage.app",
    messagingSenderId: "655315678851",
    appId: "1:655315678851:web:fede04bc35c74307730db6"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


/* ==============================
   ELEMENT
============================== */

const loginBox =
    document.getElementById("loginBox");

const adminPanel =
    document.getElementById("adminPanel");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const btnLogin =
    document.getElementById("btnLogin");

const btnLogout =
    document.getElementById("btnLogout");

const loginStatus =
    document.getElementById("loginStatus");

const adminEmail =
    document.getElementById("adminEmail");

const bulanContainer =
    document.getElementById("bulanContainer");

const jadwalId =
    document.getElementById("jadwalId");

const tanggal =
    document.getElementById("tanggal");

const bulan =
    document.getElementById("bulan");

const namaKhatib =
    document.getElementById("namaKhatib");

const tempat =
    document.getElementById("tempat");

const alamat =
    document.getElementById("alamat");

const pengurus =
    document.getElementById("pengurus");

const hpPengurus =
    document.getElementById("hpPengurus");

const keterangan =
    document.getElementById("keterangan");

const btnSave =
    document.getElementById("btnSave");

const btnDelete =
    document.getElementById("btnDelete");

const dataStatus =
    document.getElementById("dataStatus");

const daftarJadwal =
    document.getElementById("daftarJadwal");


/* ==============================
   LOGIN
============================== */

if (btnLogin) {

    btnLogin.addEventListener(
        "click",
        async function () {

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (!email || !password) {

                loginStatus.innerText =
                    "Email dan password wajib diisi.";

                return;
            }

            loginStatus.innerText =
                "Sedang login...";

            try {

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );

                loginStatus.innerText =
                    "Login berhasil.";

            } catch (error) {

                console.error(error);

                loginStatus.innerText =
                    "Login gagal: " +
                    error.message;
            }

        }
    );

}


/* ==============================
   STATUS LOGIN
============================== */

auth.onAuthStateChanged(
    async function (user) {

        if (user) {

            if (loginBox) {
                loginBox.classList.add("hidden");
            }

            if (adminPanel) {
                adminPanel.classList.remove("hidden");
            }

            if (adminEmail) {
                adminEmail.innerText =
                    user.email;
            }

            await tampilkanData();

        } else {

            if (loginBox) {
                loginBox.classList.remove("hidden");
            }

            if (adminPanel) {
                adminPanel.classList.add("hidden");
            }

        }

    }
);


/* ==============================
   LOGOUT
============================== */

if (btnLogout) {

    btnLogout.addEventListener(
        "click",
        async function () {

            await auth.signOut();

        }
    );

}


/* ==============================
   12 BULAN
============================== */

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
    "Desember"
];


function buatBulan() {

    if (!bulanContainer) {
        return;
    }

    bulanContainer.innerHTML = "";

    namaBulan.forEach(
        function (nama) {

            const tombol =
                document.createElement("button");

            tombol.type = "button";

            tombol.className =
                "bulan-card";

            tombol.innerText =
                nama;

            tombol.addEventListener(
                "click",
                function () {

                    bulan.value = nama;

                }
            );

            bulanContainer.appendChild(
                tombol
            );

        }
    );

}


/* ==============================
   SIMPAN / EDIT
============================== */

if (btnSave) {

    btnSave.addEventListener(
        "click",
        async function () {

            const id =
                jadwalId.value.trim();


            /* ==========================
               ADMIN TIDAK BOLEH TAMBAH
               DATA BARU
            ========================== */

            if (!id) {

                dataStatus.innerText =
                    "Pilih data jadwal yang ingin diedit terlebih dahulu.";

                return;
            }


            const data = {

                tanggal:
                    tanggal.value.trim(),

                bulan:
                    bulan.value.trim(),

                /* ==========================
                   DATA PUBLIK
                ========================== */

                masjid:
                    tempat.value.trim(),

                alamat:
                    alamat.value.trim(),

                pengurus:
                    pengurus.value.trim(),

                hp:
                    hpPengurus.value.trim(),

                keterangan:
                    keterangan.value.trim(),

                updatedAt:
                    new Date().toISOString()

            };


            try {

                await db
                    .collection("jadwal")
                    .doc(id)
                    .set(
                        data,
                        {
                            merge: true
                        }
                    );


                dataStatus.innerText =
                    "Data berhasil diedit.";


                await tampilkanData();


            } catch (error) {

                console.error(error);

                dataStatus.innerText =
                    "Gagal mengedit data: " +
                    error.message;

            }

        }
    );

}

/* ==============================
   HAPUS
============================== */

if (btnDelete) {

    btnDelete.addEventListener(
        "click",
        async function () {

            const id =
                jadwalId.value.trim();

            if (!id) {

                dataStatus.innerText =
                    "Pilih data yang akan dihapus.";

                return;
            }

            const yakin =
                confirm(
                    "Yakin ingin menghapus data ini?"
                );

            if (!yakin) {
                return;
            }

            try {

                await db
                    .collection("jadwal")
                    .doc(id)
                    .delete();

                kosongkanForm();

                dataStatus.innerText =
                    "Data berhasil dihapus.";

                await tampilkanData();

            } catch (error) {

                console.error(error);

                dataStatus.innerText =
                    "Gagal menghapus: " +
                    error.message;

            }

        }
    );

}


/* ==============================
   TAMPILKAN DATA
============================== */

async function tampilkanData() {

    if (!daftarJadwal) {
        return;
    }

    daftarJadwal.innerHTML =
        "Memuat data...";

    try {

        const snapshot =
            await db
                .collection("jadwal")
                .get();

        if (snapshot.empty) {

            daftarJadwal.innerHTML =
                "Belum ada data jadwal.";

            return;
        }

        daftarJadwal.innerHTML = "";

        snapshot.forEach(
            function (item) {

                const data =
                    item.data();

                const div =
                    document.createElement("div");

                div.className =
                    "jadwal-item";

                div.innerHTML = `

                    <strong>
                        ${item.id}
                    </strong>

                    <div>
                        Tanggal:
                        ${data.tanggal || "-"}
                    </div>

                    <div>
                        Bulan:
                        ${data.bulan || "-"}
                    </div>

                    <div>
                        Masjid:
                        ${data.masjid || data.tempat || "-"}
                    </div>

                    <div>
                        Alamat:
                        ${data.alamat || "-"}
                    </div>

                    <div>
                        Pengurus:
                        ${data.pengurus || "-"}
                    </div>

                    <div>
                        HP:
                        ${data.hp || data.hpPengurus || "-"}
                    </div>

                    <div>
                        Keterangan:
                        ${data.keterangan || "-"}
                    </div>

                    <br>

                    <button
                        type="button"
                        class="btn-save"
                    >
                        Edit
                    </button>

                `;

                const tombolEdit =
                    div.querySelector("button");

                tombolEdit.addEventListener(
                    "click",
                    function () {

                        isiForm(
                            item.id,
                            data
                        );

                    }
                );

                daftarJadwal.appendChild(
                    div
                );

            }
        );

    } catch (error) {

        console.error(error);

        daftarJadwal.innerHTML =
            "Gagal mengambil data: " +
            error.message;

    }

}


/* ==============================
   ISI FORM EDIT
============================== */

function isiForm(
    id,
    data
) {

    jadwalId.value =
        id;

    tanggal.value =
        data.tanggal || "";

    bulan.value =
        data.bulan || "";

    /*
       Data publik menggunakan:
       masjid
       alamat
       pengurus
       hp
       keterangan
    */

    namaKhatib.value =
        data.namaKhatib || "";

    tempat.value =
        data.masjid ||
        data.tempat ||
        "";

    alamat.value =
        data.alamat || "";

    pengurus.value =
        data.pengurus || "";

    hpPengurus.value =
        data.hp ||
        data.hpPengurus ||
        "";

    keterangan.value =
        data.keterangan || "";

    dataStatus.innerText =
        "Mode edit: " + id;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ==============================
   KOSONGKAN FORM
============================== */

function kosongkanForm() {

    jadwalId.value = "";

    tanggal.value = "";

    bulan.value = "";

    namaKhatib.value = "";

    tempat.value = "";

    alamat.value = "";

    pengurus.value = "";

    hpPengurus.value = "";

    keterangan.value = "";

}


/* ==============================
   MULAI
============================== */

buatBulan();

console.log(
    "admin.js berhasil dijalankan."
);