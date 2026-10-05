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

const namaHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"
];

const bulanContainer = document.getElementById("bulanContainer");
const jadwalSection = document.getElementById("jadwalSection");
const judulBulan = document.getElementById("judulBulan");
const jadwalContainer = document.getElementById("jadwalContainer");

const formSection = document.getElementById("formSection");
const pilihJadwal = document.getElementById("pilihJadwal");

const inputMasjid = document.getElementById("inputMasjid");
const inputAlamat = document.getElementById("inputAlamat");
const inputPengurus = document.getElementById("inputPengurus");
const inputHP = document.getElementById("inputHP");
const inputKeterangan = document.getElementById("inputKeterangan");

const btnSimpan = document.getElementById("btnSimpan");
const btnKembali = document.getElementById("btnKembali");
const btnAdmin = document.getElementById("btnAdmin");

let modeAdmin = false;


/* ==============================
   DATA SEMENTARA
   ============================== */

const dataJadwal = {};

/* ==============================
   MUAT DATA DARI FIREBASE
============================== */

async function muatDataFirebase() {

    try {

        const snapshot =
            await db
                .collection("jadwal")
                .get();

        snapshot.forEach(function (doc) {

            dataJadwal[doc.id] =
                doc.data();

        });

        console.log(
            "Data Firebase berhasil dimuat."
        );

    } catch (error) {

        console.error(
            "Gagal membaca Firebase:",
            error
        );

    }

}
/* ==============================
   BUAT ID TANGGAL
   ============================== */

function buatIdTanggal(tanggal) {

    const tahun = tanggal.getFullYear();

    const bulan = String(
        tanggal.getMonth() + 1
    ).padStart(2, "0");

    const hari = String(
        tanggal.getDate()
    ).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}


/* ==============================
   FORMAT TANGGAL
   ============================== */

function formatTanggal(tanggal) {

    return (
        namaHari[tanggal.getDay()] +
        ", " +
        tanggal.getDate() +
        " " +
        namaBulan[tanggal.getMonth()] +
        " " +
        tanggal.getFullYear()
    );
}


/* ==============================
   12 BULAN
   ============================== */

namaBulan.forEach(function (bulan, index) {

    const card = document.createElement("div");

    card.className = "bulan-card";

    card.innerText = bulan;

    card.addEventListener("click", function () {

        bukaBulan(index);

    });

    bulanContainer.appendChild(card);

});


/* ==============================
   BUKA BULAN
   ============================== */

function bukaBulan(indexBulan) {

    jadwalContainer.innerHTML = "";

    pilihJadwal.innerHTML = "";

    judulBulan.innerText =
        "Jadwal Khatib Jumat - " +
        namaBulan[indexBulan] +
        " 2027";

    jadwalSection.style.display = "block";

    formSection.style.display = "block";


    const tanggalAwal = new Date(
        2027,
        indexBulan,
        1
    );

    const tanggalAkhir = new Date(
        2027,
        indexBulan + 1,
        0
    );


    for (
        let tanggal = new Date(tanggalAwal);

        tanggal <= tanggalAkhir;

        tanggal.setDate(
            tanggal.getDate() + 1
        )
    ) {

        if (tanggal.getDay() !== 5) {
            continue;
        }


        const tanggalJumat =
            new Date(tanggal);

        const idTanggal =
            "jadwal-" +
            buatIdTanggal(tanggalJumat);

        const teksTanggal =
            formatTanggal(tanggalJumat);


        /* ==========================
           OPTION TANGGAL
           ========================== */

        const option =
            document.createElement("option");

        option.value = idTanggal;

        option.innerText = teksTanggal;

        pilihJadwal.appendChild(option);


        /* ==========================
           KARTU JADWAL
           ========================== */

        const article =
            document.createElement("article");

        article.className = "jadwal";

        article.id = idTanggal;


        article.innerHTML = `

            <h3>
                ${teksTanggal}
            </h3>

            <p class="data-masjid">
                Nama Masjid: -
            </p>

            <p class="data-alamat">
                Alamat/Lokasi: -
            </p>

            <p class="data-pengurus">
                Nama Pengurus: -
            </p>

            <p class="data-hp">
                Nomor HP Pengurus: -
            </p>

            <p class="data-keterangan">
                Keterangan: -
            </p>

        `;


        jadwalContainer.appendChild(article);

        tampilkanData(
            article,
            idTanggal
        );

    }


    if (pilihJadwal.options.length > 0) {

        muatForm(
            pilihJadwal.value
        );

    }


    jadwalSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* ==============================
   TAMPILKAN DATA
   ============================== */

function tampilkanData(
    article,
    idJadwal
) {

    const data =
        dataJadwal[idJadwal];


    if (!data) {
        return;
    }


    article.querySelector(
        ".data-masjid"
    ).innerText =
        "Nama Masjid: " +
        (data.masjid || "-");


    article.querySelector(
        ".data-alamat"
    ).innerText =
        "Alamat/Lokasi: " +
        (data.alamat || "-");


    article.querySelector(
        ".data-pengurus"
    ).innerText =
        "Nama Pengurus: " +
        (data.pengurus || "-");


    article.querySelector(
        ".data-hp"
    ).innerText =
        "Nomor HP Pengurus: " +
        (data.hp || "-");


    article.querySelector(
        ".data-keterangan"
    ).innerText =
        "Keterangan: " +
        (data.keterangan || "-");

}


/* ==============================
   MUAT FORM
   ============================== */

function muatForm(idJadwal) {

    const data =
        dataJadwal[idJadwal];


    inputMasjid.value =
        data?.masjid || "";

    inputAlamat.value =
        data?.alamat || "";

    inputPengurus.value =
        data?.pengurus || "";

    inputHP.value =
        data?.hp || "";

    inputKeterangan.value =
        data?.keterangan || "";

}


/* ==============================
   PILIH TANGGAL
   ============================== */

pilihJadwal.addEventListener(
    "change",
    function () {

        muatForm(
            pilihJadwal.value
        );

    }
);


/* ==============================
   SIMPAN
   ============================== */

btnSimpan.addEventListener(
    "click",
    async function () {

        const idJadwal =
            pilihJadwal.value;

        if (!idJadwal) {

            alert(
                "Pilih jadwal terlebih dahulu."
            );

            return;
        }

        const data = {

            masjid:
                inputMasjid.value.trim(),

            alamat:
                inputAlamat.value.trim(),

            pengurus:
                inputPengurus.value.trim(),

            hp:
                inputHP.value.trim(),

            keterangan:
                inputKeterangan.value.trim()

        };

        if (
            !data.masjid &&
            !data.alamat &&
            !data.pengurus &&
            !data.hp &&
            !data.keterangan
        ) {

            alert(
                "Isi data terlebih dahulu."
            );

            return;
        }

        try {

            await db
                .collection("jadwal")
                .doc(idJadwal)
                .set(data, {
                    merge: true
                });


            /* Update tampilan */

            dataJadwal[idJadwal] =
                data;

            const article =
                document.getElementById(
                    idJadwal
                );

            if (article) {

                tampilkanData(
                    article,
                    idJadwal
                );

            }

            alert(
                "Data berhasil disimpan ke Firebase."
            );

        } catch (error) {

            console.error(error);

            alert(
                "Gagal menyimpan data: " +
                error.message
            );

        }

    }
);

/* ==============================
   ADMIN
============================== */

btnAdmin.addEventListener(
    "click",
    function () {

        window.location.href = "./admin.html";

    }
);

/* ==============================
   KEMBALI
   ============================== */

btnKembali.addEventListener(
    "click",
    function () {

        jadwalSection.style.display =
            "none";

        formSection.style.display =
            "none";

        jadwalContainer.innerHTML =
            "";

        pilihJadwal.innerHTML =
            "";

    }
);

muatDataFirebase();
console.log(
    "Jadwal Khatib Jumat 2027 - UI siap."
);