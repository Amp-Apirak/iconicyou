<!doctype html>
<html lang="th">

<head>
    <meta charset="utf-8" />
    <title>ICONIC YOU | Time Report</title>
    <!-- Meta -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="title" content="ICONIC YOU | Time Report" />
    <meta name="author" content="ICONIC YOU" />
    <meta name="description" content="ICONIC YOU | Time Report" />
    <meta name="keywords" content="ICONIC YOU | Time Report" />

    <!-- CSS: Bootstrap, Bootstrap Icons, AdminLTE, custom, DataTables -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="css/adminlte.css" />
    <link rel="stylesheet" href="css/custom.css" />
    <link rel="stylesheet" href="css/dashboard-styles.css" />
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css">

    <style>
        /* สไตล์เพิ่มเติมสำหรับตาราง */
        .table-container {
            max-height: 70vh;
            overflow-y: auto;
        }

        .table-responsive {
            margin-top: 20px;
        }

        .table {
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .table th,
        .table td {
            vertical-align: middle;
        }

        .table-hover tbody tr:hover {
            background-color: #f8f9fa;
        }

        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        }

        .spinner-wrapper {
            text-align: center;
        }

        .loading-text {
            margin-top: 15px;
            font-weight: 500;
            color: #0d6efd;
        }

        /* สไตล์สำหรับสถานะข้อผิดพลาด */
        .no-data, .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #6c757d;
            z-index: 10;
        }

        .no-data i, .error-message i {
            font-size: 2.5rem;
            margin-bottom: 10px;
            display: block;
            color: #d9d9d9;
        }

        .no-data-text, .error-text {
            font-size: 1rem;
            font-weight: 500;
        }

        /* สไตล์สำหรับฟอร์มค้นหา */
        .search-form {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .form-group {
            margin-bottom: 10px;
        }

        .btn-primary {
            border-radius: 8px;
            padding: 8px 20px;
            font-weight: 500;
            transition: all 0.3s ease;
            background: linear-gradient(45deg, #0d6efd, #6610f2);
            border: none;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
            background: linear-gradient(45deg, #0a58ca, #5204c4);
        }
    </style>
</head>

<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
    <div class="app-wrapper">
        <!-- Header -->
        <?php include 'layout/header.php'; ?>
        <!-- Sidebar -->
        <?php include 'layout/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="app-main">
            <div class="app-content-header">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-sm-6">
                            <h3 class="mb-0">Time Report</h3>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-end">
                                <li class="breadcrumb-item">
                                    <a href="index.php"><i class="bi bi-house-door"></i> Home</a>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">
                                    Time Report
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="app-content">
                <div class="container-fluid">
                    <!-- Card: Form ค้นหา -->
                    <div class="card mb-4 search-form">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title m-0">
                                <i class="bi bi-search me-2"></i>ค้นหาข้อมูล
                            </h5>
                        </div>
                        <div class="card-body">
                            <form id="search-form" onsubmit="return false;">
                                <div class="row">
                                    <!-- ค้นหาด้วยกล้อง -->
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label><i class="bi bi-camera me-1"></i> กล้อง</label>
                                            <select class="form-control" name="source_name" id="source_name">
                                                <option value="">ทั้งหมด</option>
                                                <option value="ICONIC-01">ICONIC-01</option>
                                                <option value="ICONIC-02">ICONIC-02</option>
                                                <option value="ICONIC-03">ICONIC-03</option>
                                                <option value="ICONIC-04">ICONIC-04</option>
                                            </select>
                                        </div>
                                    </div>
                                    <!-- ค้นหาด้วยระยะเวลาในพื้นที่ (นาที) -->
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label><i class="bi bi-clock me-1"></i> ระยะเวลาในพื้นที่ (นาที)</label>
                                            <input type="number" class="form-control" name="duration" id="duration" placeholder="ระบุระยะเวลา (นาที)">
                                        </div>
                                    </div>
                                    <!-- ปุ่มค้นหา -->
                                    <div class="col-md-12 text-end">
                                        <button type="submit" class="btn btn-primary" id="search-btn">
                                            <i class="bi bi-search me-1"></i> ค้นหา
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary ms-2" id="reset-btn">
                                            <i class="bi bi-arrow-counterclockwise me-1"></i> รีเซ็ต
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Card: ตารางรายงาน -->
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title m-0">
                                <i class="bi bi-clock-history me-2"></i>รายงานระยะเวลาการอยู่ในโซน
                            </h5>
                            <div class="card-tools">
                                <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse">
                                    <i class="bi bi-dash-lg"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body ">
                            <div class="table-responsive">
                                <table id="activity-table" class="table table-bordered table-hover" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th>ลำดับที่</th>
                                            <th>กล้อง</th>
                                            <th>เวลาเริ่มต้น</th>
                                            <th>เวลาสิ้นสุด</th>
                                            <th>ระยะเวลาในพื้นที่ (นาที)</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                                <div id="no-data" class="no-data" style="display: none;">
                                    <i class="bi bi-exclamation-triangle"></i>
                                    <div class="no-data-text">ไม่พบข้อมูล</div>
                                </div>
                                <div id="error-message" class="error-message" style="display: none;">
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                    <div class="error-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <?php include 'layout/footer.php'; ?>

        <!-- Loading Overlay -->
        <div id="loading-overlay" style="display: none;">
            <div class="spinner-wrapper">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">กำลังโหลด...</span>
                </div>
                <div class="loading-text">กำลังโหลดข้อมูล...</div>
            </div>
        </div>

        <!-- JS: jQuery (ต้องโหลดก่อน), Bootstrap, AdminLTE, DataTables, Custom -->
        <script src="https://code.jquery.com/jquery-3.7.0.min.js" integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g=" crossorigin="anonymous"></script>
        <script>
            // Fallback หาก CDN jQuery ล้มเหลว
            if (typeof jQuery === 'undefined') {
                document.write('<script src="/path/to/local/jquery-3.7.0.min.js"><\/script>');
            }
        </script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="js/adminlte.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
        <script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>
        <script src="https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js"></script>
        <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
        <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js"></script>
        <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
        <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
        <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.colVis.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

        <script>
            // URL หลักของ API
            const API_BASE_URL = "https://iconicyou-api.pointit.co.th";

            // ฟังก์ชันแสดง/ซ่อน Loading Overlay
            function showLoading() {
                document.getElementById("loading-overlay").style.display = "flex";
            }

            function hideLoading() {
                document.getElementById("loading-overlay").style.display = "none";
            }

            // ฟังก์ชัน Fetch กับ Timeout
            async function fetchWithTimeout(url, ms) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), ms);
                try {
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeout);
                    return response;
                } catch (error) {
                    if (error.name === "AbortError") throw new Error("Request timed out");
                    throw error;
                }
            }

            // ฟังก์ชันคำนวณระยะเวลาเป็นนาที
            function calculateDurationInMinutes(start_time, end_time) {
                const start = new Date(start_time);
                const end = new Date(end_time);
                return Math.round((end - start) / (1000 * 60));
            }

            // ตัวแปรเก็บข้อมูลทั้งหมด
            let activityData = [];

            // ฟังก์ชันดึงข้อมูลจาก API
            async function fetchActivityData() {
                try {
                    showLoading();

                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const startDate = today.toISOString().split("T")[0];
                    const endDate = tomorrow.toISOString().split("T")[0];

                    const url = `${API_BASE_URL}/activity_ganttchart?compute_id=7&start_date=${startDate}&end_date=${endDate}`;
                    console.log("Fetching data from:", url);

                    const response = await fetchWithTimeout(url, 5000); // Timeout 5 วินาที
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    console.log("Received data:", data);

                    // ตรวจสอบโครงสร้างข้อมูลจาก API
                    if (!Array.isArray(data)) {
                        throw new Error("ข้อมูลจาก API ไม่ใช่ array");
                    }

                    return data.filter(item => 
                        item.name === "person" && 
                        item.data && 
                        item.data.start_time && 
                        item.data.end_time && 
                        item.data.source
                    );
                } catch (error) {
                    console.error("Error fetching activity data:", error);
                    const tableContainer = document.querySelector('.table-container');
                    const errorMessage = document.getElementById('error-message');
                    errorMessage.style.display = 'block';
                    if (tableContainer) {
                        tableContainer.style.opacity = '0.5'; // ลดความโปร่งใสของตาราง
                    }
                    return [];
                } finally {
                    hideLoading();
                }
            }

            // ฟังก์ชันประมวลผลข้อมูลสำหรับตาราง
            function processData(data, filters = {}) {
                let filteredData = [...data];

                if (filters.source_name && filters.source_name !== "") {
                    filteredData = filteredData.filter(item => item.data.source === filters.source_name);
                }

                if (filters.duration) {
                    filteredData = filteredData.filter(item => {
                        const duration = calculateDurationInMinutes(item.data.start_time, item.data.end_time);
                        return duration === parseInt(filters.duration);
                    });
                }

                return filteredData.map((item, index) => ({
                    id: index + 1,
                    camera: item.data.source || "ไม่ระบุ",
                    startTime: new Date(item.data.start_time).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
                    endTime: new Date(item.data.end_time).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
                    duration: calculateDurationInMinutes(item.data.start_time, item.data.end_time)
                }));
            }

            // ฟังก์ชันเริ่มต้น DataTable
            function initDataTable(data) {
                const table = $('#activity-table');
                const noData = document.getElementById('no-data');
                const errorMessage = document.getElementById('error-message');
                const tableContainer = document.querySelector('.table-container');

                // ลบสถานะข้อผิดพลาดและไม่พบข้อมูลก่อน
                noData.style.display = 'none';
                errorMessage.style.display = 'none';
                if (tableContainer) {
                    tableContainer.style.opacity = '1'; // คืนความโปร่งใสของตาราง
                }

                if ($.fn.DataTable.isDataTable('#activity-table')) {
                    table.DataTable().destroy();
                }

                if (data.length === 0) {
                    noData.style.display = 'block';
                    table.hide();
                    return;
                } else {
                    table.show();
                }

                table.DataTable({
                    data: data,
                    columns: [
                        { data: 'id', title: 'ลำดับที่' },
                        { data: 'camera', title: 'กล้อง' },
                        { data: 'startTime', title: 'เวลาเริ่มต้น' },
                        { data: 'endTime', title: 'เวลาสิ้นสุด' },
                        { data: 'duration', title: 'ระยะเวลาในพื้นที่ (นาที)' }
                    ],
                    responsive: true,
                    pageLength: 50, // แสดง 100 รายการต่อหน้า
                    lengthMenu: [10, 25, 50, 100], // ตัวเลือกจำนวนรายการต่อหน้า
                    autoWidth: false,
                    buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
                    language: {
                        search: "ค้นหา:",
                        info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                        infoEmpty: "แสดง 0 ถึง 0 จาก 0 รายการ",
                        infoFiltered: "(กรองจาก _MAX_ รายการทั้งหมด)",
                        lengthMenu: "แสดง _MENU_ รายการ",
                        paginate: {
                            first: "หน้าแรก",
                            last: "หน้าสุดท้าย",
                            next: "ถัดไป",
                            previous: "ก่อนหน้า"
                        }
                    },
                    initComplete: function() {
                        // ซ่อนคอลัมน์ลำดับที่จากการค้นหา
                        this.api().column(0).visible(false);
                    }
                }).buttons().container().appendTo('#activity-table_wrapper .col-md-6:eq(0)');
            }

            // ฟังก์ชันโหลดข้อมูลและเริ่มต้นตาราง
            async function loadAndDisplayData(filters = {}) {
                if (!activityData.length) {
                    activityData = await fetchActivityData();
                }
                const processedData = processData(activityData, filters);
                initDataTable(processedData);
            }

            // เริ่มต้นเมื่อหน้าเว็บโหลด
            document.addEventListener("DOMContentLoaded", () => {
                // ตรวจสอบว่าจQueryโหลดสำเร็จก่อนทำงาน
                if (typeof jQuery === 'undefined') {
                    console.error('jQuery not loaded');
                    alert('ไม่สามารถโหลด jQuery ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ CDN');
                    return;
                }

                loadAndDisplayData();

                // จัดการฟอร์มค้นหา
                document.getElementById('search-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const filters = {
                        source_name: document.getElementById('source_name').value,
                        duration: document.getElementById('duration').value
                    };
                    loadAndDisplayData(filters);
                });

                // จัดการปุ่มรีเซ็ต
                document.getElementById('reset-btn').addEventListener('click', () => {
                    document.getElementById('source_name').value = '';
                    document.getElementById('duration').value = '';
                    loadAndDisplayData();
                });
            });
        </script>
    </div>
</body>

</html>