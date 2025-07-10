// --- Initial Data and State Management ---
// Daftar user dengan role
const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "petugas", password: "petugas123", role: "petugas" }
];

// Data utama aplikasi, akan dimuat dari localStorage
let tilokData = [];

// Fungsi untuk memeriksa peran pengguna yang sedang login
// Variabel ini akan diinisialisasi hanya jika ada elemen login di halaman (yaitu di admin.html)
let currentUserRole = null;
if (sessionStorage.getItem('loggedInUser')) {
    try {
        currentUserRole = JSON.parse(sessionStorage.getItem('loggedInUser')).role;
    } catch (e) {
        console.error("Error parsing loggedInUser from sessionStorage:", e);
        sessionStorage.removeItem('loggedInUser'); // Clear invalid data
    }
}

// --- Referensi DOM Elements (Kondisional berdasarkan Halaman) ---

// Dashboard Elements
const tanggalPelaksanaanInput = document.getElementById("tanggalPelaksanaan");
const pppkDateSpan = document.getElementById("pppkDate");
const skbDateSpan = document.getElementById("skbDate");
const noDataPppkPar = document.getElementById("noDataPppk");
const noDataSkbPar = document.getElementById("noDataSkb");
const showEntriesPppkSelect = document.getElementById("showEntriesPppk");
const searchPppkInput = document.getElementById("searchPppk");
const tableBodyPppk = document.getElementById("tableBodyPppk");
const paginationPppkUl = document.getElementById("paginationPppk");
const showingEntriesPppkPar = document.getElementById("showingEntriesPppk");
const showEntriesSkbSelect = document.getElementById("showEntriesSkb");
const searchSkbInput = document.getElementById("searchSkb");
const tableBodySkb = document.getElementById("tableBodySkb");
const paginationSkbUl = document.getElementById("paginationSkb");
const showingEntriesSkbPar = document.getElementById("showingEntriesSkb");
const currentYearSpan = document.getElementById("currentYear");

// Dashboard Modal Elements
const dataKeseluruhanModalLabel = document.getElementById("dataKeseluruhanModalLabel");
const modalTilokNameSpan = document.getElementById("modalTilokName");
const modalTilokDetailTitle = document.getElementById("modalTilokDetailTitle");
const modalTilokNamaSpan = document.getElementById("modalTilokNama");
const modalTilokTanggalSpan = document.getElementById("modalTilokTanggal");
const showEntriesModalSelect = document.getElementById("showEntriesModal");
const searchModalInput = document.getElementById("searchModal");
const tableBodyModal = document.getElementById("tableBodyModal");
const paginationModalUl = document.getElementById("paginationModal");
const showingEntriesModalPar = document.getElementById("showingEntriesModal");

// Admin Panel Elements
const loginSection = document.getElementById("loginSection"); // Hanya ada di admin.html
const adminPanelContent = document.getElementById("adminPanelContent"); // Hanya ada di admin.html
const loggedInUserSpan = document.getElementById("loggedInUser");
const loginForm = document.getElementById("loginForm");
const loginMessageDiv = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const dataInputForm = document.getElementById("dataInputForm");
const detailInputForm = document.getElementById("detailInputForm");
const messageDiv = document.getElementById("message");
const detailMessageDiv = document.getElementById("detailMessage");
const adminDataTableBody = document.getElementById("adminDataTableBody");
const tilokOptionsDatalist = document.getElementById("tilokOptions");
const adminModalTilokName = document.getElementById("adminModalTilokName");
const adminDetailTableBody = document.getElementById("adminDetailTableBody");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const editIndexHiddenInput = document.getElementById("editIndex");
const submitDetailButton = document.getElementById("submitDetailButton");
const cancelEditDetailButton = document.getElementById("cancelEditDetailButton");
const editDetailIndexHiddenInput = document.getElementById("editDetailIndex");
const tilokInputCard = document.getElementById("tilokInputCard");
const detailInputCard = document.getElementById("detailInputCard");


// --- Pagination State Variables (Global for each page type) ---
let currentPppkPage = 1;
let currentSkbPage = 1;
let currentModalPage = 1;

let rowsPerPagePppk = showEntriesPppkSelect ? parseInt(showEntriesPppkSelect.value) : 5;
let rowsPerPageSkb = showEntriesSkbSelect ? parseInt(showEntriesSkbSelect.value) : 5;
let rowsPerPageModal = showEntriesModalSelect ? parseInt(showEntriesModalSelect.value) : 5;

let activeModalTilokDetails = []; // Untuk menyimpan detail tilok yang sedang aktif di modal dashboard

// --- Dashboard Initial Date & Year ---
let dashboardSelectedDate = tanggalPelaksanaanInput ? tanggalPelaksanaanInput.value : new Date().toISOString().split('T')[0];
let currentDashboardYear = new Date().getFullYear();

// Set initial year for dashboard
if (currentYearSpan) {
    currentYearSpan.textContent = currentDashboardYear;
}


// --- Utility Functions ---

// Save data to localStorage
function saveData() {
    localStorage.setItem('tilokData', JSON.stringify(tilokData));
}

// Load data from localStorage
function loadData() {
    const storedData = localStorage.getItem('tilokData');
    if (storedData) {
        tilokData = JSON.parse(storedData);
    }
    // Tambahkan data dummy jika localStorage kosong untuk demonstrasi
    if (tilokData.length === 0) {
        tilokData.push({
            tilok: "Kantor Pusat Jakarta",
            mulai: "2025-07-01",
            selesai: "2025-07-15",
            sesi: 10,
            peserta: 500,
            jenisUjian: "PPPK Tahap II",
            details: [
                { instansi: "Kemenkeu", tanggal: "2025-07-01", sesiKe: 1, hadir: 45, tidakHadir: 5, tertinggi: 450, terendah: 200 },
                { instansi: "Kemenkeu", tanggal: "2025-07-01", sesiKe: 2, hadir: 48, tidakHadir: 2, tertinggi: 480, terendah: 250 },
                { instansi: "Kemendikbud", tanggal: "2025-07-02", sesiKe: 1, hadir: 40, tidakHadir: 10, tertinggi: 420, terendah: 180 }
            ]
        });
        tilokData.push({
            tilok: "Kantor Cabang Surabaya",
            mulai: "2025-07-10",
            selesai: "2025-07-20",
            sesi: 6,
            peserta: 300,
            jenisUjian: "SKB CPNS",
            details: [
                { instansi: "Pemerintah Provinsi Jatim", tanggal: "2025-07-10", sesiKe: 1, hadir: 50, tidakHadir: 0, tertinggi: 400, terendah: 220 },
                { instansi: "Pemerintah Kota Surabaya", tanggal: "2025-07-11", sesiKe: 1, hadir: 48, tidakHadir: 2, tertinggi: 390, terendah: 210 }
            ]
        });
        tilokData.push({
            tilok: "Kantor Wilayah Bandung",
            mulai: "2025-08-01",
            selesai: "2025-08-10",
            sesi: 8,
            peserta: 400,
            jenisUjian: "PPPK Tahap II",
            details: [
                { instansi: "Dinas Pendidikan Jabar", tanggal: "2025-08-01", sesiKe: 1, hadir: 42, tidakHadir: 8, tertinggi: 430, terendah: 190 }
            ]
        });
        saveData(); // Simpan data dummy ke localStorage
    }
}

// Function to format date to DD-MM-YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// --- Admin Panel Functions ---

// Initialize Admin Panel logic only if admin-specific elements exist
if (loginSection && adminPanelContent) {
    // Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const uname = document.getElementById("username").value;
            const pass = document.getElementById("password").value;
            const user = users.find(u => u.username === uname && u.password === pass);

            if (user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify({ username: user.username, role: user.role }));
                currentUserRole = user.role; // Update global variable

                loginSection.style.display = "none";
                adminPanelContent.style.display = "block";
                if (loggedInUserSpan) loggedInUserSpan.textContent = user.username;
                loginMessageDiv.textContent = ""; // Clear any previous login message

                populateTilokOptions();
                updateTilokTable();

                // Sembunyikan/Tampilkan form input berdasarkan role
                if (currentUserRole !== "admin") {
                    if (tilokInputCard) tilokInputCard.style.display = "none";
                    if (detailInputCard) detailInputCard.style.display = "none";
                } else {
                    if (tilokInputCard) tilokInputCard.style.display = "block";
                    if (detailInputCard) detailInputCard.style.display = "block";
                }

            } else {
                loginMessageDiv.textContent = "Username atau password salah.";
            }
        });
    }

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem('loggedInUser'); // Clear login state
            currentUserRole = null; // Clear global variable
            loginSection.style.display = "block"; // Show login form
            adminPanelContent.style.display = "none"; // Hide admin content
            // window.location.reload(); // Refresh halaman untuk memastikan state bersih
        });
    }

    // Handler for adding new Tilok data
    function handleAddTilok(e) {
        e.preventDefault();
        if (currentUserRole !== "admin") {
            if(messageDiv) messageDiv.textContent = "Anda tidak memiliki izin untuk menambah data.";
            return;
        }

        const tilok = document.getElementById("tilok").value;
        const mulai = document.getElementById("jadwalMulai").value;
        const selesai = document.getElementById("jadwalSelesai").value;
        const sesi = parseInt(document.getElementById("sesi").value);
        const peserta = parseInt(document.getElementById("peserta").value);
        const jenisUjian = document.getElementById("jenisUjian").value;

        const data = { tilok, mulai, selesai, sesi, peserta, jenisUjian, details: [] };
        tilokData.push(data);
        saveData();
        updateTilokTable();
        populateTilokOptions();
        this.reset();
        if(messageDiv) messageDiv.textContent = "Data berhasil ditambahkan.";
    }

    // Handler for updating existing Tilok data
    function handleUpdateTilok(e) {
        e.preventDefault();
        if (currentUserRole !== "admin") {
            if(messageDiv) messageDiv.textContent = "Anda tidak memiliki izin untuk mengedit data.";
            return;
        }

        const index = parseInt(editIndexHiddenInput.value);
        if (isNaN(index) || index < 0 || index >= tilokData.length) return;

        const tilok = document.getElementById("tilok").value;
        const mulai = document.getElementById("jadwalMulai").value;
        const selesai = document.getElementById("jadwalSelesai").value;
        const sesi = parseInt(document.getElementById("sesi").value);
        const peserta = parseInt(document.getElementById("peserta").value);
        const jenisUjian = document.getElementById("jenisUjian").value;

        tilokData[index] = { ...tilokData[index], tilok, mulai, selesai, sesi, peserta, jenisUjian };
        saveData();
        updateTilokTable();
        populateTilokOptions();
        this.reset();
        if(messageDiv) messageDiv.textContent = "Data berhasil diperbarui.";

        if(submitButton) submitButton.textContent = "Simpan Data Tilok";
        if(cancelEditButton) cancelEditButton.classList.add("d-none");
        if(dataInputForm) {
            dataInputForm.removeEventListener("submit", handleUpdateTilok);
            dataInputForm.addEventListener("submit", handleAddTilok);
        }
        if(editIndexHiddenInput) editIndexHiddenInput.value = "";
    }

    // Attach initial add handler for Tilok form (if form exists)
    if (dataInputForm) {
        dataInputForm.addEventListener("submit", handleAddTilok);

        if (cancelEditButton) {
            cancelEditButton.addEventListener("click", function() {
                dataInputForm.reset();
                if(submitButton) submitButton.textContent = "Simpan Data Tilok";
                cancelEditButton.classList.add("d-none");
                dataInputForm.removeEventListener("submit", handleUpdateTilok);
                dataInputForm.addEventListener("submit", handleAddTilok);
                if(editIndexHiddenInput) editIndexHiddenInput.value = "";
                if(messageDiv) messageDiv.textContent = "";
            });
        }
    }


    // Edit Tilok function (called from table button)
    window.editTilok = function(index) {
        if (currentUserRole !== "admin") {
            alert("Anda tidak memiliki izin untuk mengedit data ini.");
            return;
        }

        const tilokItem = tilokData[index];
        if (!tilokItem) return;

        if(document.getElementById("tilok")) document.getElementById("tilok").value = tilokItem.tilok;
        if(document.getElementById("jadwalMulai")) document.getElementById("jadwalMulai").value = tilokItem.mulai;
        if(document.getElementById("jadwalSelesai")) document.getElementById("jadwalSelesai").value = tilokItem.selesai;
        if(document.getElementById("sesi")) document.getElementById("sesi").value = tilokItem.sesi;
        if(document.getElementById("peserta")) document.getElementById("peserta").value = tilokItem.peserta;
        if(document.getElementById("jenisUjian")) document.getElementById("jenisUjian").value = tilokItem.jenisUjian;
        if(editIndexHiddenInput) editIndexHiddenInput.value = index;

        if(submitButton) submitButton.textContent = "Update Data Tilok";
        if(cancelEditButton) cancelEditButton.classList.remove("d-none");

        if(dataInputForm) {
            dataInputForm.removeEventListener("submit", handleAddTilok);
            dataInputForm.addEventListener("submit", handleUpdateTilok);
        }
    }

    // Delete Tilok function (called from table button)
    window.deleteTilok = function(index) {
        if (currentUserRole !== "admin") {
            alert("Anda tidak memiliki izin untuk menghapus data ini.");
            return;
        }

        if (confirm("Apakah Anda yakin ingin menghapus data tilok ini beserta detail sesinya?")) {
            tilokData.splice(index, 1);
            saveData();
            updateTilokTable();
            populateTilokOptions();
            if(messageDiv) messageDiv.textContent = "Data tilok berhasil dihapus.";
        }
    }


    // Handler for adding new Detail Sesi data
    function handleAddDetail(e) {
        e.preventDefault();
        if (currentUserRole !== "admin") {
            if(detailMessageDiv) detailMessageDiv.textContent = "Anda tidak memiliki izin untuk menambah detail sesi.";
            return;
        }

        const tilokName = document.getElementById("selectTilokInput").value;
        const instansi = document.getElementById("detailInstansi").value;
        const tanggal = document.getElementById("detailTanggal").value;
        const sesiKe = parseInt(document.getElementById("detailSesi").value);
        const hadir = parseInt(document.getElementById("detailHadir").value);
        const tidakHadir = parseInt(document.getElementById("detailTidakHadir").value);
        const tertinggi = parseInt(document.getElementById("detailNilaiTertinggi").value);
        const terendah = parseInt(document.getElementById("detailNilaiTerendah").value);

        const tilokItem = tilokData.find(t => t.tilok === tilokName);
        if (tilokItem) {
            tilokItem.details.push({ instansi, tanggal, sesiKe, hadir, tidakHadir, tertinggi, terendah });
            saveData();
            updateTilokTable();
            this.reset();
            if(detailMessageDiv) detailMessageDiv.textContent = "Detail sesi ditambahkan.";
        } else {
            if(detailMessageDiv) detailMessageDiv.textContent = "Lokasi ujian (Tilok) tidak ditemukan.";
        }
    }

    // Handler for updating existing Detail Sesi data
    function handleUpdateDetail(e) {
        e.preventDefault();
        if (currentUserRole !== "admin") {
            if(detailMessageDiv) detailMessageDiv.textContent = "Anda tidak memiliki izin untuk mengedit detail sesi.";
            return;
        }

        const indices = editDetailIndexHiddenInput.value.split(',');
        const tilokIndex = parseInt(indices[0]);
        const detailIndex = parseInt(indices[1]);
        if (isNaN(tilokIndex) || isNaN(detailIndex) || !tilokData[tilokIndex] || !tilokData[tilokIndex].details[detailIndex]) return;

        const tilokItem = tilokData[tilokIndex];
        const detailItem = tilokItem.details[detailIndex];

        detailItem.instansi = document.getElementById("detailInstansi").value;
        detailItem.tanggal = document.getElementById("detailTanggal").value;
        detailItem.sesiKe = parseInt(document.getElementById("detailSesi").value);
        detailItem.hadir = parseInt(document.getElementById("detailHadir").value);
        detailItem.tidakHadir = parseInt(document.getElementById("detailTidakHadir").value);
        detailItem.tertinggi = parseInt(document.getElementById("detailNilaiTertinggi").value);
        detailItem.terendah = parseInt(document.getElementById("detailNilaiTerendah").value);

        saveData();
        updateTilokTable();
        // Re-show the modal with updated data if it was open
        const adminDetailModalElement = document.getElementById('adminDetailModal');
        if (adminDetailModalElement && adminDetailModalElement.classList.contains('show')) {
            showDetail(tilokIndex);
        }
        this.reset();
        if(detailMessageDiv) detailMessageDiv.textContent = "Detail sesi berhasil diperbarui.";

        if(submitDetailButton) submitDetailButton.textContent = "Tambah Detail Sesi";
        if(cancelEditDetailButton) cancelEditDetailButton.classList.add("d-none");
        if(detailInputForm) {
            detailInputForm.removeEventListener("submit", handleUpdateDetail);
            detailInputForm.addEventListener("submit", handleAddDetail);
        }
        if(editDetailIndexHiddenInput) editDetailIndexHiddenInput.value = "";
    }


    // Attach initial add handler for Detail Sesi form (if form exists)
    if (detailInputForm) {
        detailInputForm.addEventListener("submit", handleAddDetail);

        if (cancelEditDetailButton) {
            cancelEditDetailButton.addEventListener("click", function() {
                detailInputForm.reset();
                if(submitDetailButton) submitDetailButton.textContent = "Tambah Detail Sesi";
                cancelEditDetailButton.classList.add("d-none");
                detailInputForm.removeEventListener("submit", handleUpdateDetail);
                detailInputForm.addEventListener("submit", handleAddDetail);
                if(editDetailIndexHiddenInput) editDetailIndexHiddenInput.value = "";
                if(detailMessageDiv) detailMessageDiv.textContent = "";
            });
        }
    }


    // Edit Detail Sesi function (called from admin detail modal button)
    window.editDetail = function(tilokIndex, detailIndex) {
        if (currentUserRole !== "admin") {
            alert("Anda tidak memiliki izin untuk mengedit detail sesi ini.");
            return;
        }

        const tilokItem = tilokData[tilokIndex];
        if (!tilokItem || !tilokItem.details[detailIndex]) return;

        const detailItem = tilokItem.details[detailIndex];

        if(document.getElementById("selectTilokInput")) document.getElementById("selectTilokInput").value = tilokItem.tilok;
        if(document.getElementById("detailInstansi")) document.getElementById("detailInstansi").value = detailItem.instansi;
        if(document.getElementById("detailTanggal")) document.getElementById("detailTanggal").value = detailItem.tanggal;
        if(document.getElementById("detailSesi")) document.getElementById("detailSesi").value = detailItem.sesiKe;
        if(document.getElementById("detailHadir")) document.getElementById("detailHadir").value = detailItem.hadir;
        if(document.getElementById("detailTidakHadir")) document.getElementById("detailTidakHadir").value = detailItem.tidakHadir;
        if(document.getElementById("detailNilaiTertinggi")) document.getElementById("detailNilaiTertinggi").value = detailItem.tertinggi;
        if(document.getElementById("detailNilaiTerendah")) document.getElementById("detailNilaiTerendah").value = detailItem.terendah;
        if(editDetailIndexHiddenInput) editDetailIndexHiddenInput.value = `${tilokIndex},${detailIndex}`;

        if(submitDetailButton) submitDetailButton.textContent = "Update Detail Sesi";
        if(cancelEditDetailButton) cancelEditDetailButton.classList.remove("d-none");

        if(detailInputForm) {
            detailInputForm.removeEventListener("submit", handleAddDetail);
            detailInputForm.addEventListener("submit", handleUpdateDetail);
        }

        // Close the modal if it's open to allow editing the form
        const adminDetailModalElement = document.getElementById('adminDetailModal');
        if (adminDetailModalElement) {
            const adminDetailModal = bootstrap.Modal.getInstance(adminDetailModalElement);
            if (adminDetailModal) adminDetailModal.hide();
        }
    }

    // Delete Detail Sesi function (called from admin detail modal button)
    window.deleteDetail = function(tilokIndex, detailIndex) {
        if (currentUserRole !== "admin") {
            alert("Anda tidak memiliki izin untuk menghapus detail sesi ini.");
            return;
        }

        if (confirm("Apakah Anda yakin ingin menghapus detail sesi ini?")) {
            const tilokItem = tilokData[tilokIndex];
            if (tilokItem) {
                tilokItem.details.splice(detailIndex, 1);
                saveData();
                updateTilokTable();
                showDetail(tilokIndex); // Re-render modal details
                if(detailMessageDiv) detailMessageDiv.textContent = "Detail sesi berhasil dihapus.";
            }
        }
    }


    // Update main Tilok Table in Admin Panel
    function updateTilokTable() {
        if (!adminDataTableBody) return;

        adminDataTableBody.innerHTML = "";

        tilokData.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.jenisUjian}</td>
                <td>${item.tilok}</td>
                <td>${formatDate(item.mulai)} s.d. ${formatDate(item.selesai)}</td>
                <td>${item.sesi}</td>
                <td>${item.peserta}</td>
                <td>${item.details.length}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="showDetail(${index})" data-bs-toggle="modal" data-bs-target="#adminDetailModal">Lihat</button>
                    ${currentUserRole === 'admin' ? `
                    <button class="btn btn-sm btn-warning" onclick="editTilok(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTilok(${index})">Hapus</button>
                    ` : ''}
                </td>
            `;
            adminDataTableBody.appendChild(tr);
        });
    }

    // Show Detail Modal in Admin Panel
    window.showDetail = function(index) {
        const tilok = tilokData[index];
        if (!tilok) return;

        if (adminModalTilokName) adminModalTilokName.textContent = tilok.tilok;

        if (!adminDetailTableBody) return;
        adminDetailTableBody.innerHTML = "";

        tilok.details.forEach((detail, detailIndex) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${detail.instansi}</td>
                <td>${formatDate(detail.tanggal)}</td>
                <td>${detail.sesiKe}</td>
                <td>${detail.hadir}</td>
                <td>${detail.tidakHadir}</td>
                <td>${detail.tertinggi}</td>
                <td>${detail.terendah}</td>
                <td>
                    ${currentUserRole === 'admin' ? `
                    <button class="btn btn-sm btn-warning" onclick="editDetail(${index}, ${detailIndex})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDetail(${index}, ${detailIndex})">Hapus</button>
                    ` : ''}
                </td>
            `;
            adminDetailTableBody.appendChild(tr);
        });
    }

    // Populate Tilok to Datalist for Admin Detail Input Form
    function populateTilokOptions() {
        if (!tilokOptionsDatalist) return;

        tilokOptionsDatalist.innerHTML = "";
        tilokData.forEach(item => {
            const option = document.createElement("option");
            option.value = item.tilok;
            tilokOptionsDatalist.appendChild(option);
        });
    }

    // Export to Excel (Admin Panel)
    window.exportTilokToExcel = function() {
        const table = document.getElementById("adminDataTableBody");
        if (!table) {
            console.error("Admin data table body not found for export.");
            return;
        }
        const rows = table.querySelectorAll("tr");
        const data = [["Jenis Ujian", "Tilok", "Jadwal", "Sesi (Total)", "Peserta (Total)", "Jumlah Detail Sesi"]];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const rowData = [];
            for (let i = 0; i < 6; i++) { // Only take first 6 columns
                rowData.push(cells[i]?.innerText || "");
            }
            data.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DataTilok");

        XLSX.writeFile(workbook, "Data_Tilok.xlsx");
    }

    // Initial check for login status when admin.html is loaded
    document.addEventListener("DOMContentLoaded", () => {
        loadData(); // Load data initially from localStorage
        const storedUser = sessionStorage.getItem('loggedInUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                currentUserRole = user.role;
                loginSection.style.display = "none";
                adminPanelContent.style.display = "block";
                if (loggedInUserSpan) loggedInUserSpan.textContent = user.username;

                populateTilokOptions();
                updateTilokTable();

                // Sembunyikan/Tampilkan form input berdasarkan role
                if (currentUserRole !== "admin") {
                    if (tilokInputCard) tilokInputCard.style.display = "none";
                    if (detailInputCard) detailInputCard.style.display = "none";
                } else {
                    if (tilokInputCard) tilokInputCard.style.display = "block";
                    if (detailInputCard) detailInputCard.style.display = "block";
                }

            } catch (e) {
                console.error("Error parsing stored user data, showing login:", e);
                sessionStorage.removeItem('loggedInUser');
                loginSection.style.display = "block";
                adminPanelContent.style.display = "none";
            }
        } else {
            loginSection.style.display = "block";
            adminPanelContent.style.display = "none";
        }
    });

}
// --- END Admin Panel Functions ---


// --- Dashboard Functions (only run if dashboard elements exist) ---
if (tanggalPelaksanaanInput && pppkDateSpan && skbDateSpan) {
    // Handle date change
    tanggalPelaksanaanInput.addEventListener("change", (e) => {
        dashboardSelectedDate = e.target.value;
        updateDashboard();
    });

    // Change Year (Dashboard)
    window.changeYear = function(offset) {
        currentDashboardYear += offset;
        if (currentYearSpan) {
            currentYearSpan.textContent = currentDashboardYear;
        }
        // Set default date to Jan 1st of the new year, or keep selected day if available for that month
        const [oldYear, month, day] = dashboardSelectedDate.split('-');
        const newDate = new Date(currentDashboardYear, parseInt(month) - 1, parseInt(day));
        // Check if the day is valid for the new month/year, if not, adjust to last day of month
        if (newDate.getMonth() !== parseInt(month) - 1 || newDate.getFullYear() !== currentDashboardYear) {
            newDate.setDate(0); // Go to last day of previous month, then add 1 to get to 1st of current month
        }
        dashboardSelectedDate = newDate.toISOString().split('T')[0];

        if (tanggalPelaksanaanInput) {
            tanggalPelaksanaanInput.value = dashboardSelectedDate;
        }
        updateDashboard();
    }

    // Update Dashboard Tables
    function updateDashboard() {
        if (!pppkDateSpan || !skbDateSpan) return;

        pppkDateSpan.textContent = formatDate(dashboardSelectedDate); // Format date for display
        skbDateSpan.textContent = formatDate(dashboardSelectedDate); // Format date for display

        const pppkDataFiltered = tilokData.filter(item =>
            item.jenisUjian === "PPPK Tahap II" &&
            dashboardSelectedDate >= item.mulai &&
            dashboardSelectedDate <= item.selesai
        );

        const skbDataFiltered = tilokData.filter(item =>
            item.jenisUjian === "SKB CPNS" &&
            dashboardSelectedDate >= item.mulai &&
            dashboardSelectedDate <= item.selesai
        );

        renderTable(pppkDataFiltered, tableBodyPppk, paginationPppkUl, showingEntriesPppkPar, currentPppkPage, rowsPerPagePppk, searchPppkInput ? searchPppkInput.value : '', 'pppk');
        renderTable(skbDataFiltered, tableBodySkb, paginationSkbUl, showingEntriesSkbPar, currentSkbPage, rowsPerPageSkb, searchSkbInput ? searchSkbInput.value : '', 'skb');

        if (noDataPppkPar) {
            noDataPppkPar.style.display = pppkDataFiltered.length === 0 ? 'block' : 'none';
        }
        if (noDataSkbPar) {
            noDataSkbPar.style.display = skbDataFiltered.length === 0 ? 'block' : 'none';
        }
    }


    // Generic function to render tables with pagination and search
    function renderTable(data, tbodyElement, paginationElement, showingEntriesElement, currentPage, rowsPerPage, searchTerm, type) {
        if (!tbodyElement || !paginationElement || !showingEntriesElement) return;

        const filteredData = data.filter(item => {
            const lowerCaseSearchTerm = (searchTerm || '').toLowerCase();
            return (
                item.tilok.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.jenisUjian.toLowerCase().includes(lowerCaseSearchTerm) ||
                (item.mulai && item.mulai.includes(lowerCaseSearchTerm)) || // Check for null/undefined
                (item.selesai && item.selesai.includes(lowerCaseSearchTerm))
            );
        });

        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
        const paginatedData = filteredData.slice(startIndex, endIndex);

        tbodyElement.innerHTML = "";
        if (paginatedData.length === 0) {
            tbodyElement.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data untuk ditampilkan.</td></tr>`;
        } else {
            paginatedData.forEach(item => {
                const totalHadir = item.details.reduce((sum, detail) => sum + detail.hadir, 0);
                const totalTidakHadir = item.details.reduce((sum, detail) => sum + detail.tidakHadir, 0);
                const totalPesertaAktual = totalHadir + totalTidakHadir;
                const keterlaksanaan = item.peserta > 0 ? ((totalHadir / item.peserta) * 100).toFixed(2) : 0;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.tilok}</td>
                    <td>${formatDate(item.mulai)} s.d. ${formatDate(item.selesai)}</td>
                    <td>${item.sesi}</td>
                    <td>${item.peserta}</td>
                    <td>${keterlaksanaan}% (${totalHadir}/${totalPesertaAktual})</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showOverallDetail('${item.tilok}')" data-bs-toggle="modal" data-bs-target="#dataKeseluruhanModal">Detail</button>
                    </td>
                `;
                tbodyElement.appendChild(tr);
            });
        }

        renderPagination(paginationElement, totalPages, currentPage, type);
        showingEntriesElement.textContent = `Menampilkan ${startIndex + 1} sampai ${endIndex} dari ${filteredData.length} entri (total ${data.length} entri)`;
    }

    // Render pagination links
    function renderPagination(paginationElement, totalPages, currentPage, type) {
        paginationElement.innerHTML = "";

        const createPageItem = (page, isActive = false, isDisabled = false) => {
            const li = document.createElement("li");
            li.className = `page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
            const a = document.createElement("a");
            a.className = "page-link";
            a.href = "#";
            a.textContent = page === "prev" ? "Previous" : (page === "next" ? "Next" : page);
            a.onclick = (e) => {
                e.preventDefault();
                if (!isDisabled) {
                    if (type === 'pppk') {
                        currentPppkPage = (page === "prev") ? currentPage - 1 : (page === "next" ? currentPage + 1 : page);
                        updateDashboard();
                    } else if (type === 'skb') {
                        currentSkbPage = (page === "prev") ? currentPage - 1 : (page === "next" ? currentPage + 1 : page);
                        updateDashboard();
                    } else if (type === 'modal') {
                        currentModalPage = (page === "prev") ? currentPage - 1 : (page === "next" ? currentPage + 1 : page);
                        showOverallDetailModal(activeModalTilokDetails, modalTilokNameSpan ? modalTilokNameSpan.textContent : '');
                    }
                }
            };
            li.appendChild(a);
            return li;
        };

        paginationElement.appendChild(createPageItem("prev", false, currentPage === 1));

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationElement.appendChild(createPageItem(1));
            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                paginationElement.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationElement.appendChild(createPageItem(i, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                paginationElement.appendChild(ellipsis);
            }
            paginationElement.appendChild(createPageItem(totalPages));
        }

        paginationElement.appendChild(createPageItem("next", false, currentPage === totalPages));
    }

    // Show Overall Detail for Dashboard Modal
    window.showOverallDetail = function(tilokName) {
        const tilokItem = tilokData.find(t => t.tilok === tilokName);
        if (!tilokItem) return;

        if (modalTilokNameSpan) modalTilokNameSpan.textContent = tilokItem.tilok;
        if (dataKeseluruhanModalLabel) dataKeseluruhanModalLabel.textContent = `Data Keseluruhan ${tilokItem.jenisUjian}`;
        if (modalTilokDetailTitle) modalTilokDetailTitle.textContent = `Detail Sesi Tilok ${tilokItem.tilok}`;
        if (modalTilokNamaSpan) modalTilokNamaSpan.textContent = tilokItem.tilok;
        if (modalTilokTanggalSpan) modalTilokTanggalSpan.textContent = `${formatDate(tilokItem.mulai)} s.d. ${formatDate(tilokItem.selesai)}`;

        activeModalTilokDetails = tilokItem.details;
        currentModalPage = 1; // Reset to first page when opening modal
        showOverallDetailModal(activeModalTilokDetails, tilokItem.tilok);
    }

    // Function to render modal detail table with its own pagination/search
    function showOverallDetailModal(details, tilokName) {
        if (!tableBodyModal || !paginationModalUl || !showingEntriesModalPar) return;

        const searchTerm = (searchModalInput ? searchModalInput.value : '').toLowerCase();
        const filteredDetails = details.filter(detail =>
            detail.instansi.toLowerCase().includes(searchTerm) ||
            detail.tanggal.includes(searchTerm) ||
            String(detail.sesiKe).includes(searchTerm)
        );

        const totalPages = Math.ceil(filteredDetails.length / rowsPerPageModal);
        const startIndex = (currentModalPage - 1) * rowsPerPageModal;
        const endIndex = Math.min(startIndex + rowsPerPageModal, filteredDetails.length);
        const paginatedDetails = filteredDetails.slice(startIndex, endIndex);

        tableBodyModal.innerHTML = "";
        if (paginatedDetails.length === 0) {
            tableBodyModal.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada detail sesi untuk ditampilkan.</td></tr>`;
        } else {
            paginatedDetails.forEach(detail => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${detail.instansi}</td>
                    <td>${formatDate(detail.tanggal)}</td>
                    <td>${detail.sesiKe}</td>
                    <td>${detail.hadir}</td>
                    <td>${detail.tidakHadir}</td>
                    <td>${detail.tertinggi}</td>
                    <td>${detail.terendah}</td>
                `;
                tableBodyModal.appendChild(tr);
            });
        }

        renderPagination(paginationModalUl, totalPages, currentModalPage, 'modal');
        showingEntriesModalPar.textContent = `Menampilkan ${startIndex + 1} sampai ${endIndex} dari ${filteredDetails.length} entri (total ${details.length} entri)`;
    }

    // Event listeners for rows per page and search for Dashboard tables
    if (showEntriesPppkSelect) {
        showEntriesPppkSelect.addEventListener("change", (e) => {
            rowsPerPagePppk = parseInt(e.target.value);
            currentPppkPage = 1;
            updateDashboard();
        });
    }
    if (searchPppkInput) {
        searchPppkInput.addEventListener("keyup", () => {
            currentPppkPage = 1;
            updateDashboard();
        });
    }

    if (showEntriesSkbSelect) {
        showEntriesSkbSelect.addEventListener("change", (e) => {
            rowsPerPageSkb = parseInt(e.target.value);
            currentSkbPage = 1;
            updateDashboard();
        });
    }
    if (searchSkbInput) {
        searchSkbInput.addEventListener("keyup", () => {
            currentSkbPage = 1;
            updateDashboard();
        });
    }

    // Event listeners for rows per page and search for Dashboard Modal
    if (showEntriesModalSelect) {
        showEntriesModalSelect.addEventListener("change", (e) => {
            rowsPerPageModal = parseInt(e.target.value);
            currentModalPage = 1;
            showOverallDetailModal(activeModalTilokDetails, modalTilokNameSpan ? modalTilokNameSpan.textContent : '');
        });
    }
    if (searchModalInput) {
        searchModalInput.addEventListener("keyup", () => {
            currentModalPage = 1;
            showOverallDetailModal(activeModalTilokDetails, modalTilokNameSpan ? modalTilokNameSpan.textContent : '');
        });
    }

    // Initial load for Dashboard page
    document.addEventListener("DOMContentLoaded", () => {
        loadData(); // Load data initially from localStorage
        // Set initial date for dashboard input
        if (tanggalPelaksanaanInput && !tanggalPelaksanaanInput.value) {
            tanggalPelaksanaanInput.value = new Date().toISOString().split('T')[0];
            dashboardSelectedDate = tanggalPelaksanaanInput.value;
        }
        updateDashboard(); // Initial render of dashboard tables
    });
}
// --- END Dashboard Functions ---