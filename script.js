/* ==========================================
   KHATIB JUMAT FZ - HALAMAN UTAMA 2027
   Firebase Firestore
   ========================================== */

(function () {
  "use strict";

  const TAHUN = 2027;

  const BULAN = [
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

  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  let bulanAktif = null;
  let tanggalAktif = null;
  let semuaJadwal = {};
  let sedangMemuat = false;

  const el = {
    monthGrid: document.getElementById("monthGrid"),
    fridaySection: document.getElementById("fridaySection"),
    fridayTitle: document.getElementById("fridayTitle"),
    fridayGrid: document.getElementById("fridayGrid"),
    fridayStatus: document.getElementById("fridayStatus"),
    scheduleTitle: document.getElementById("scheduleTitle"),
    scheduleStatus: document.getElementById("scheduleStatus"),
    scheduleGrid: document.getElementById("scheduleGrid"),
  };

  function tampilkanError(pesan) {
    if (el.scheduleStatus) {
      el.scheduleStatus.textContent = pesan;
    }

    console.error("[Khatib Jumat]", pesan);
  }

  function buatElemen(tag, teks, className) {
    const node = document.createElement(tag);

    if (teks !== undefined && teks !== null) {
      node.textContent = String(teks);
    }

    if (className) {
      node.className = className;
    }

    return node;
  }

  function formatTanggal(date) {
    return (
      HARI[date.getDay()] +
      ", " +
      date.getDate() +
      " " +
      BULAN[date.getMonth()] +
      " " +
      TAHUN
    );
  }

  function buatIdTanggal(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `jadwal-${TAHUN}-${mm}-${dd}`;
  }

  function tanggalDariId(id) {
    const cocok = /^jadwal-2027-(\d{2})-(\d{2})$/.exec(id);

    if (!cocok) return null;

    const bulan = Number(cocok[1]) - 1;
    const hari = Number(cocok[2]);
    const date = new Date(TAHUN, bulan, hari);

    if (
      date.getFullYear() !== TAHUN ||
      date.getMonth() !== bulan ||
      date.getDate() !== hari ||
      date.getDay() !== 5
    ) {
      return null;
    }

    return date;
  }

  function dataBerisiJadwal(data) {
    if (!data) return false;

    return Boolean(
      String(data.masjid || data.tempat || "").trim() ||
      String(data.alamat || "").trim() ||
      String(data.pengurus || "").trim() ||
      String(data.hp || data.hpPengurus || "").trim(),
    );
  }

  function namaMasjid(data) {
    return String(data.masjid || data.tempat || "").trim();
  }

  function nomorHp(data) {
    return String(data.hp || data.hpPengurus || "").trim();
  }

  /* ==========================================
     TAMPILKAN PILIHAN BULAN
     ========================================== */

  function buatPilihanBulan() {
    if (!el.monthGrid) {
      tampilkanError('Elemen "monthGrid" tidak ditemukan. Periksa index.html.');
      return;
    }

    el.monthGrid.replaceChildren();

    BULAN.forEach(function (nama, index) {
      const tombol = buatElemen(
        "button",
        nama,
        "month-button" + (bulanAktif === index ? " active" : ""),
      );

      tombol.type = "button";
      tombol.setAttribute("aria-pressed", String(bulanAktif === index));

      tombol.addEventListener("click", function () {
        bukaBulan(index);
      });

      el.monthGrid.appendChild(tombol);
    });
  }

  /* ==========================================
     BUKA BULAN DAN TAMPILKAN TANGGAL JUMAT
     ========================================== */

  function bukaBulan(indexBulan) {
    bulanAktif = indexBulan;
    tanggalAktif = null;

    buatPilihanBulan();

    el.fridaySection.classList.remove("hidden");
    el.fridayTitle.textContent =
      "2. Pilih Tanggal Jumat — " + BULAN[indexBulan] + " " + TAHUN;

    el.fridayGrid.replaceChildren();

    const jumlahHari = new Date(TAHUN, indexBulan + 1, 0).getDate();

    for (let hari = 1; hari <= jumlahHari; hari++) {
      const date = new Date(TAHUN, indexBulan, hari);

      if (date.getDay() !== 5) continue;

      const id = buatIdTanggal(date);
      const data = semuaJadwal[id];
      const terisi = dataBerisiJadwal(data);

      const tombol = buatElemen("button", undefined, "friday-button");

      tombol.type = "button";
      tombol.setAttribute("aria-pressed", "false");

      tombol.appendChild(buatElemen("span", hari, "date-number"));

      tombol.appendChild(buatElemen("span", "Jumat", "date-label"));

      tombol.appendChild(
        buatElemen(
          "span",
          terisi ? "Jadwal tersedia" : "Belum tersedia",
          "filled-label" + (terisi ? " filled" : ""),
        ),
      );

      tombol.addEventListener("click", function () {
        tanggalAktif = id;

        el.fridayGrid
          .querySelectorAll(".friday-button")
          .forEach(function (item) {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });

        tombol.classList.add("active");
        tombol.setAttribute("aria-pressed", "true");

        tampilkanJadwalTanggal(id, date);
      });

      el.fridayGrid.appendChild(tombol);
    }

    el.fridayStatus.textContent =
      "Pilih tanggal Jumat untuk melihat informasi jadwal.";

    el.scheduleTitle.textContent =
      "Jadwal Khatib — " + BULAN[indexBulan] + " " + TAHUN;

    tampilkanJadwalBulan(indexBulan);
  }

  /* ==========================================
     TAMPILKAN INFORMASI JADWAL
     ========================================== */

  function buatKartuJadwal(id, data) {
    const date = tanggalDariId(id);

    if (!date || !dataBerisiJadwal(data)) return null;

    const kartu = buatElemen("article", undefined, "schedule-card");

    const kepala = buatElemen("div", undefined, "schedule-card-header");

    kepala.appendChild(buatElemen("h3", formatTanggal(date)));

    kepala.appendChild(buatElemen("p", "Jadwal Khatib Jumat Tahun " + TAHUN));

    const isi = buatElemen("div", undefined, "schedule-card-body");

    function tambahField(label, value) {
      const pembungkus = buatElemen("p");
      pembungkus.appendChild(buatElemen("span", label, "field-label"));
      pembungkus.appendChild(buatElemen("span", value || "-", "field-value"));
      isi.appendChild(pembungkus);
    }

    tambahField("Nama Masjid / Tempat", namaMasjid(data));
    tambahField("Alamat", data.alamat);
    tambahField("Nama Pengurus", data.pengurus);

    const hp = nomorHp(data);
    const barisHp = buatElemen("p");

    barisHp.appendChild(buatElemen("span", "Nomor HP Pengurus", "field-label"));

    if (hp) {
      const tautan = buatElemen("a", hp, "field-value phone-link");

      tautan.href = "tel:" + hp.replace(/[^\d+]/g, "");
      barisHp.appendChild(tautan);
    } else {
      barisHp.appendChild(buatElemen("span", "-", "field-value"));
    }

    isi.appendChild(barisHp);

    kartu.appendChild(kepala);
    kartu.appendChild(isi);

    return kartu;
  }

  function tampilkanJadwalTanggal(id, date) {
    el.scheduleGrid.replaceChildren();

    el.scheduleTitle.textContent = "Jadwal Khatib — " + formatTanggal(date);

    const data = semuaJadwal[id];

    if (!dataBerisiJadwal(data)) {
      el.scheduleGrid.appendChild(
        buatElemen(
          "div",
          "Belum ada jadwal yang tersedia untuk " + formatTanggal(date) + ".",
          "empty",
        ),
      );

      el.scheduleStatus.textContent =
        "Jadwal untuk tanggal ini belum diisi oleh admin.";

      return;
    }

    const kartu = buatKartuJadwal(id, data);

    if (kartu) el.scheduleGrid.appendChild(kartu);

    el.scheduleStatus.textContent = "Jadwal berhasil ditampilkan.";
  }

  function tampilkanJadwalBulan(indexBulan) {
    el.scheduleGrid.replaceChildren();

    const daftar = Object.keys(semuaJadwal)
      .map(function (id) {
        return {
          id: id,
          date: tanggalDariId(id),
          data: semuaJadwal[id],
        };
      })
      .filter(function (item) {
        return (
          item.date &&
          item.date.getMonth() === indexBulan &&
          dataBerisiJadwal(item.data)
        );
      })
      .sort(function (a, b) {
        return a.date - b.date;
      });

    if (daftar.length === 0) {
      el.scheduleGrid.appendChild(
        buatElemen(
          "div",
          "Belum ada jadwal yang tersedia untuk " +
            BULAN[indexBulan] +
            " " +
            TAHUN +
            ".",
          "empty",
        ),
      );

      el.scheduleStatus.textContent =
        "Belum ada jadwal tersimpan untuk bulan ini.";

      return;
    }

    daftar.forEach(function (item) {
      const kartu = buatKartuJadwal(item.id, item.data);

      if (kartu) {
        el.scheduleGrid.appendChild(kartu);
      }
    });

    el.scheduleStatus.textContent =
      "Ditemukan " +
      daftar.length +
      " jadwal pada bulan " +
      BULAN[indexBulan] +
      ".";
  }

  /* ==========================================
     BACA FIRESTORE
     ========================================== */

  async function muatJadwal() {
    if (sedangMemuat) return;
    sedangMemuat = true;

    el.scheduleStatus.textContent = "Sedang mengambil jadwal dari Firebase...";

    try {
      if (typeof firebase === "undefined") {
        throw new Error("Firebase SDK belum dimuat.");
      }

      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyBwgS0JiW9uwbiMkDl8d3xmcGQirxMUHco",
          authDomain: "khatib-fz-27.firebaseapp.com",
          projectId: "khatib-fz-27",
          storageBucket: "khatib-fz-27.firebasestorage.app",
          messagingSenderId: "655315678851",
          appId: "1:655315678851:web:fede04bc35c74307730db6",
        });
      }

      const db = firebase.firestore();
      const snapshot = await db.collection("jadwal").get();

      semuaJadwal = {};

      snapshot.forEach(function (doc) {
        semuaJadwal[doc.id] = doc.data();
      });

      if (bulanAktif !== null) {
        bukaBulan(bulanAktif);

        if (tanggalAktif) {
          const date = tanggalDariId(tanggalAktif);

          if (date) {
            tampilkanJadwalTanggal(tanggalAktif, date);
          }
        }
      } else {
        el.scheduleGrid.replaceChildren(
          buatElemen(
            "div",
            "Data berhasil dimuat. Silakan pilih bulan untuk melihat jadwal.",
            "empty",
          ),
        );

        el.scheduleStatus.textContent =
          "Koneksi Firebase berhasil. Total dokumen: " + snapshot.size + ".";
      }

      console.log(
        "[Khatib Jumat] Firestore berhasil dibaca. Total dokumen:",
        snapshot.size,
      );
    } catch (error) {
      console.error("[Khatib Jumat] Gagal memuat data:", error);

      el.scheduleGrid.replaceChildren(
        buatElemen(
          "div",
          "Jadwal belum dapat dimuat. Periksa koneksi internet dan aturan akses Firestore.",
          "empty",
        ),
      );

      el.scheduleStatus.textContent = "Gagal memuat jadwal: " + error.message;
    } finally {
      sedangMemuat = false;
    }
  }

  /* ==========================================
     MULAI APLIKASI
     ========================================== */

  function mulai() {
    const elemenWajib = [
      "monthGrid",
      "fridaySection",
      "fridayTitle",
      "fridayGrid",
      "fridayStatus",
      "scheduleTitle",
      "scheduleStatus",
      "scheduleGrid",
    ];

    const hilang = elemenWajib.filter(function (id) {
      return !document.getElementById(id);
    });

    if (hilang.length > 0) {
      console.error(
        "[Khatib Jumat] Elemen HTML tidak ditemukan:",
        hilang.join(", "),
      );

      return;
    }

    buatPilihanBulan();
    muatJadwal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
