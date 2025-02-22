<!doctype html>
<html lang="th">

<head>
  <meta charset="utf-8" />
  <title>ICONIC YOU | Dashboard</title>
  <!-- Meta -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="title" content="ICONIC YOU | Dashboard " />
  <meta name="author" content="ICONIC YOU" />
  <meta name="description" content="ICONIC YOU | Dashboard" />
  <meta name="keywords" content="ICONIC YOU | Dashboard " />

  <!-- CSS: Bootstrap, Bootstrap Icons, AdminLTE, custom -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <!-- เพิ่ม Font Awesome สำหรับไอคอนเพิ่มเติม -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link rel="stylesheet" href="css/adminlte.css" />
  <link rel="stylesheet" href="css/custom.css" />

  <!-- นำเข้า CSS เพิ่มเติม -->
  <link rel="stylesheet" href="css/dashboard-styles.css" />

  <!-- ApexCharts -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.css" />

</head>

<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
  <div class="app-wrapper">
    <!-- Header -->
    <nav class="app-header navbar navbar-expand bg-body shadow-sm">
      <div class="container-fluid">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button">
              <i class="bi bi-list"></i>
            </a>
          </li>
          <li class="nav-item d-none d-md-block">
            <a href="#" class="nav-link">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard
            </a>
          </li>
        </ul>

        <!-- Header right items -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <div class="form-check form-switch mt-2 d-flex align-items-center">
              <input class="form-check-input me-2" type="checkbox" id="realtime-toggle" checked>
              <label class="form-check-label me-2" for="realtime-toggle">Realtime</label>
              <span id="realtime-status" class="badge bg-danger">LIVE</span>
            </div>
          </li>
          <li class="nav-item border-start ms-3 ps-3">
            <span class="nav-link d-flex align-items-center">
              <i class="bi bi-clock-history me-2"></i>
              อัปเดตล่าสุด: <span id="last-updated-time" class="ms-1 fw-semibold">-</span>
            </span>
          </li>
          <li class="nav-item ms-2">
            <button id="refresh-btn" class="btn btn-sm btn-outline-primary rounded-circle" title="รีเฟรชข้อมูล">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div class="sidebar-brand">
        <a href="#" class="brand-link">
          <img
            src="assets/img/AdminLTELogo.png"
            alt="Logo"
            class="brand-image opacity-75 shadow" />
          <span class="brand-text fw-light">ICONIC YOU</span>
        </a>
      </div>
      <div class="sidebar-wrapper">
        <nav class="mt-2">
          <ul
            class="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            role="menu"
            data-accordion="false">
            <li class="nav-item">
              <a href="index.php" class="nav-link active">
                <i class="nav-icon bi bi-speedometer2"></i>
                <p>Dashboard</p>
              </a>
            </li>
            <!-- เพิ่มเมนูใหม่ -->
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="nav-icon bi bi-camera-video"></i>
                <p>จัดการกล้อง</p>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="nav-icon bi bi-file-earmark-bar-graph"></i>
                <p>รายงาน</p>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="nav-icon bi bi-gear"></i>
                <p>ตั้งค่า</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="app-main">
      <!-- Content Header -->
      <div class="app-content-header">
        <div class="container-fluid">
          <div class="row">
            <div class="col-sm-6">
              <h3 class="mb-0">Dashboard</h3>
            </div>
            <div class="col-sm-6">
              <ol class="breadcrumb float-sm-end">
                <li class="breadcrumb-item">
                  <a href="#"><i class="bi bi-house-door"></i> Home</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  Dashboard
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
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title m-0">
                <i class="bi bi-search me-2"></i>ค้นหาข้อมูล
              </h5>
              <div class="card-tools">
                <button
                  type="button"
                  class="btn btn-tool"
                  data-lte-toggle="card-collapse">
                  <i class="bi bi-dash-lg"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <form id="search-form" onsubmit="return false;">
                <div class="row">
                  <!-- ประเภทการวิเคราะห์ -->
                  <div class="col-md-4">
                    <div class="form-group mb-3">
                      <label><i class="bi bi-camera-reels me-1"></i> ประเภทการวิเคราะห์</label>
                      <select class="form-control" name="compute_id" id="compute_id" required>
                        <option value="7">People Counting</option>
                        <!-- <option value="1">Face Detection</option>
                        <option value="11">People Monitoring</option>
                        <option value="0">All</option> -->
                      </select>
                    </div>
                  </div>
                  <!-- เลือกกล้อง (ดึงจาก API) -->
                  <div class="col-md-4">
                    <div class="form-group mb-3">
                      <label><i class="bi bi-camera me-1"></i> กล้อง</label>
                      <select class="form-control" name="source_name" id="source_name">
                        <option value="">ทั้งหมด</option>
                      </select>
                    </div>
                  </div>
                  <!-- ช่วงวันที่ -->
                  <div class="col-md-4">
                    <div class="form-group mb-3">
                      <label><i class="bi bi-calendar-range me-1"></i> ช่วงวันที่</label>
                      <select class="form-control" name="date_range" id="date_range">
                        <option value="today">วันนี้</option>
                        <option value="yesterday">เมื่อวาน</option>
                        <option value="last7days">7 วันล่าสุด</option>
                        <option value="last30days">30 วันล่าสุด</option>
                        <option value="custom">กำหนดเอง</option>
                      </select>
                    </div>
                  </div>
                  <!-- ฟิลด์วันที่ custom -->
                  <div class="col-md-4 date-custom">
                    <div class="form-group mb-3">
                      <label><i class="bi bi-calendar-event me-1"></i> วันที่เริ่มต้น</label>
                      <input type="date" name="start_date" class="form-control" />
                    </div>
                  </div>
                  <div class="col-md-4 date-custom">
                    <div class="form-group mb-3">
                      <label><i class="bi bi-calendar-event me-1"></i> วันที่สิ้นสุด</label>
                      <input type="date" name="end_date" class="form-control" />
                    </div>
                  </div>
                  <!-- ปุ่มค้นหา -->
                  <div class="col-md-4 align-self-end">
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-search me-1"></i> ค้นหา
                    </button>
                    <button type="button" id="reset-btn" class="btn btn-outline-secondary ms-2">
                      <i class="bi bi-arrow-counterclockwise me-1"></i> รีเซ็ต
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- ส่วนแสดงข้อมูลสถิติ -->
          <div class="row">
            <div class="col-md-4">
              <div class="stat-box box-people">
                <div class="stat-icon people-icon">
                  <i class="fas fa-users"></i>
                </div>
                <h5 class="stat-title">จำนวนคนทั้งหมด</h5>
                <div class="stat-number" id="total-people">0</div>
                <div class="mt-3 text-muted small">ผู้ใช้งานทั้งหมดในระบบ</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box box-cameras">
                <div class="stat-icon camera-icon">
                  <i class="fas fa-video"></i>
                </div>
                <h5 class="stat-title">จำนวนกล้อง</h5>
                <div class="stat-number" id="total-cameras">0</div>
                <div class="mt-3 text-muted small">กล้องทั้งหมดที่ทำงานในระบบ</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box box-zones">
                <div class="stat-icon zone-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <h5 class="stat-title">จำนวนโซน</h5>
                <div class="stat-number" id="total-zones">0</div>
                <div class="mt-3 text-muted small">โซนพื้นที่ทั้งหมดในระบบ</div>
              </div>
            </div>
          </div>

          <!-- ส่วนแสดงกราฟ -->
          <div class="row">
            <div class="col-md-12">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-bar-chart-line me-2"></i>กราฟแท่งจำนวนคนเฉลี่ยต่อชั่วโมง แยกตามโซน/กล้อง
                  </h5>
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="download-chart">
                      <i class="bi bi-download me-1"></i> ดาวน์โหลด
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="refresh-chart">
                      <i class="bi bi-arrow-repeat me-1"></i> รีเฟรช
                    </button>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- กราฟแท่ง - bar-chart -->
                  <div id="bar-chart" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-bar-chart me-2"></i>จำนวนนับบุคคลตามช่วงเวลาจากกล้อง :
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-1-->
                  <div id="horizontal-bar-chart-1" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-bar-chart me-2"></i>จำนวนนับบุคคลตามช่วงเวลาจากกล้อง :
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-2 -->
                  <div id="horizontal-bar-chart-2" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-bar-chart me-2"></i>จำนวนนับบุคคลตามช่วงเวลาจากกล้อง :
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton3" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton3">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-3 -->
                  <div id="horizontal-bar-chart-3" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-bar-chart me-2"></i>จำนวนนับบุคคลตามช่วงเวลาจากกล้อง :
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton4" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton4">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-4 -->
                  <div id="horizontal-bar-chart-4" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-graph-up me-2"></i>กราฟจำนวนตามเวลา
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownTimeSeriesChart" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownTimeSeriesChart">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                      <li>
                        <hr class="dropdown-divider">
                      </li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-calendar-range me-1"></i> แสดงข้อมูลรายวัน</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-calendar-week me-1"></i> แสดงข้อมูลรายสัปดาห์</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- time-series-chart -->
                  <div id="time-series-chart" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-pie-chart-fill me-2"></i>สัดส่วนตามกล้อง
                  </h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownPieChart" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-gear me-1"></i> ตัวเลือก
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownPieChart">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-download me-1"></i> ดาวน์โหลด</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-arrow-repeat me-1"></i> รีเฟรช</a></li>
                      <li>
                        <hr class="dropdown-divider">
                      </li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-graph-up-arrow me-1"></i> แสดงเป็นกราฟแท่ง</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-pie-chart me-1"></i> แสดงเป็นกราฟวงกลม</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- camera-pie-chart -->
                  <div id="camera-pie-chart" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
          </div>

        </div> <!-- container-fluid -->
      </div> <!-- app-content -->
    </main>

    <!-- Footer -->
    <footer class="app-footer border-top py-3">
      <div class="float-end d-none d-sm-inline">
        <strong>Version</strong> 1.0.0
      </div>
      <strong>
        Copyright &copy; 2024
        <a href="#" class="text-decoration-none">ICONIC YOU</a>.
      </strong>
      All rights reserved.
    </footer>
  </div>

  <!-- Loading Overlay - ปรับปรุงใหม่ให้สวยงามขึ้น -->
  <div id="loading-overlay" style="display: none;">
    <div class="spinner-wrapper">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <div class="loading-text">กำลังโหลดข้อมูล...</div>
    </div>
  </div>

  <!-- JS: Bootstrap, ApexCharts, AdminLTE, index.js -->
  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script
    src="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.min.js"></script>
  <script src="js/adminlte.js"></script>
  <script src="js/index.js"></script>

  <!-- เพิ่มโค้ด JavaScript สำหรับปุ่มเพิ่มเติม -->
  <script>
    // เพิ่มเหตุการณ์ (event) สำหรับปุ่มดาวน์โหลดและตัวเลือกอื่นๆ ในทุกกราฟ
    document.addEventListener('DOMContentLoaded', function() {
      // เพิ่มเหตุการณ์ให้กับทุกปุ่มและรายการเมนูที่มีคลาส 'download-chart'
      document.querySelectorAll('.dropdown-item, button').forEach(element => {
        // ปุ่มดาวน์โหลด
        if (element.innerHTML.includes('ดาวน์โหลด') || element.id === 'download-chart') {
          element.addEventListener('click', function(e) {
            e.preventDefault();

            // หาว่าอยู่ในการ์ดไหน
            const card = this.closest('.card');
            if (!card) return;

            // หา chart container
            const chartContainer = card.querySelector('.chart-container');
            if (!chartContainer) return;

            // หา chart ID
            const chartId = chartContainer.querySelector('div[id]')?.id;
            if (!chartId) return;

            // หา chart object จากตัวแปรที่กำหนดไว้
            let chartObj;
            if (chartId === 'bar-chart') {
              chartObj = barChart;
            } else if (chartId === 'time-series-chart') {
              chartObj = timeSeriesChart;
            } else if (chartId === 'camera-pie-chart') {
              chartObj = cameraPieChart;
            } else if (chartId.includes('horizontal-bar-chart')) {
              const index = chartId.split('-').pop() - 1;
              chartObj = horizontalBarCharts[index];
            }

            // ถ้าพบกราฟ ให้ดาวน์โหลด
            if (chartObj) {
              chartObj.dataURI().then(({
                imgURI
              }) => {
                // สร้าง link สำหรับดาวน์โหลด
                const downloadLink = document.createElement('a');
                downloadLink.href = imgURI;
                downloadLink.download = `${chartId}.png`;

                // เพิ่ม link ลงใน DOM, คลิกและลบออก
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                showToast('ดาวน์โหลดกราฟเรียบร้อยแล้ว', 'success');
              });
            } else {
              showToast('ไม่สามารถดาวน์โหลดกราฟได้', 'error');
            }
          });
        }

        // ปุ่มรีเฟรช
        if (element.innerHTML.includes('รีเฟรช') && element.id !== 'refresh-btn' && element.id !== 'refresh-chart') {
          element.addEventListener('click', function(e) {
            e.preventDefault();

            // หาว่าอยู่ในการ์ดไหน
            const card = this.closest('.card');
            if (!card) return;

            // หา chart container
            const chartContainer = card.querySelector('.chart-container');
            if (!chartContainer) return;

            // หา chart ID
            const chartId = chartContainer.querySelector('div[id]')?.id;
            if (!chartId) return;

            // ถ้ามีข้อมูลปัจจุบัน
            if (currentData && currentData.length > 0) {
              if (chartId === 'bar-chart') {
                updateBarChart(currentData);
              } else if (chartId === 'time-series-chart') {
                updateTimeSeriesChart(currentData);
              } else if (chartId === 'camera-pie-chart') {
                updatePieChart(currentData);
              } else if (chartId.includes('horizontal-bar-chart')) {
                updateHorizontalBarCharts(currentData);
              }

              showToast('รีเฟรชกราฟเรียบร้อยแล้ว', 'success');
            } else {
              // ถ้าไม่มีข้อมูล ให้โหลดใหม่
              loadData().then(() => {
                showToast('รีเฟรชกราฟเรียบร้อยแล้ว', 'success');
              });
            }
          });
        }

        // ตัวเลือกอื่นๆ
        if (element.innerHTML.includes('รายวัน') || element.innerHTML.includes('รายสัปดาห์')) {
          element.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('กำลังพัฒนาฟีเจอร์นี้', 'info');
          });
        }

        if (element.innerHTML.includes('กราฟแท่ง') || element.innerHTML.includes('กราฟวงกลม')) {
          element.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('กำลังพัฒนาฟีเจอร์นี้', 'info');
          });
        }
      });
    });

    /**
     * แสดงข้อความแจ้งเตือน (Toast)
     * @param {string} message - ข้อความที่ต้องการแสดง
     * @param {string} type - ประเภทของข้อความ (success, info, warning, error)
     */
    function showToast(message, type = 'info') {
      // ถ้ามี toast container แล้ว ให้ลบออก
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        // สร้าง toast container
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
      }

      // กำหนดสี toast ตามประเภท
      let bgColor = 'bg-info';
      let icon = 'bi-info-circle';

      switch (type) {
        case 'success':
          bgColor = 'bg-success';
          icon = 'bi-check-circle';
          break;
        case 'warning':
          bgColor = 'bg-warning';
          icon = 'bi-exclamation-triangle';
          break;
        case 'error':
          bgColor = 'bg-danger';
          icon = 'bi-x-circle';
          break;
      }

      // สร้าง toast element
      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-white ${bgColor} border-0 mb-2`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');

      // กำหนดเนื้อหาของ toast
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi ${icon} me-2"></i> ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `;

      // เพิ่ม toast ลงใน container
      toastContainer.appendChild(toast);

      // สร้าง Bootstrap toast instance และแสดง
      const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
      });
      bsToast.show();

      // ลบ toast หลังจากซ่อน
      toast.addEventListener('hidden.bs.toast', function() {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }

        // ลบ container ถ้าไม่มี toast อยู่แล้ว
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      });
    }
  </script>


</body>

</html>