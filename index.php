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

  <!-- สำหรับปรับแต่งกราฟ -->
  <link rel="stylesheet" href="css/custom.css" />

  <!-- สำหรับปรับแต่งหน้าจอ -->
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
                      <!-- <select class="form-control" name="source_name" id="source_name"> -->
                      <select class="form-control" name="source_name">
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
                    <!-- <button type="button" class="btn btn-sm btn-outline-secondary" id="refresh-chart">
                      <i class="bi bi-arrow-repeat me-1"></i> รีเฟรช
                    </button> -->
                  </div>
                </div>
                <div class="card-body chart-container">
                  <!-- กราฟแท่ง - bar-chart -->
                  <div id="bar-chart" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
          </div>


          <!-- ส่วนแสดงภาพโซนและกล้อง -->
          <div class="row mb-4">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-camera-video me-2"></i>ภาพแสดงโซนและตำแหน่งกล้องในระบบ
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row zone-gallery">
                    <!-- Zone 1 -->
                    <div class="col-md-3">
                      <div class="zone-item" data-bs-toggle="modal" data-bs-target="#imageModal" data-img="assets/img/001.png" data-zone="1" data-camera="ICONIC-01" data-title="ทางเข้า-ออก">
                        <img src="assets/img/001.png" alt="Zone 1" class="img-fluid rounded shadow-sm">
                        <div class="zone-info">
                          <h5 class="zone-title" style="color: #4e95f4 !important;">Zone : 1 ทางเข้า-ออก</h5>
                          <p class="zone-camera" style="color: #c4dcff !important;">กล้อง : ICONIC-01</p>
                        </div>
                      </div>
                    </div>

                    <!-- Zone 2 -->
                    <div class="col-md-3">
                      <div class="zone-item" data-bs-toggle="modal" data-bs-target="#imageModal" data-img="assets/img/002.png" data-zone="2" data-camera="ICONIC-02" data-title="">
                        <img src="assets/img/002.png" alt="Zone 2" class="img-fluid rounded shadow-sm">
                        <div class="zone-info">
                          <h5 class="zone-title" style="color: #4cd3a5 !important;">Zone : 2</h5>
                          <p class="zone-camera" style="color: #b8ffe2 !important;">กล้อง : ICONIC-02</p>
                        </div>
                      </div>
                    </div>

                    <!-- Zone 3 -->
                    <div class="col-md-3">
                      <div class="zone-item" data-bs-toggle="modal" data-bs-target="#imageModal" data-img="assets/img/003.png" data-zone="3" data-camera="ICONIC-03" data-title="">
                        <img src="assets/img/003.png" alt="Zone 3" class="img-fluid rounded shadow-sm">
                        <div class="zone-info">
                          <h5 class="zone-title" style="color: #ffc107 !important;">Zone : 3</h5>
                          <p class="zone-camera" style="color: #fff3c4 !important;">กล้อง : ICONIC-03</p>
                        </div>
                      </div>
                    </div>

                    <!-- Zone 4 -->
                    <div class="col-md-3">
                      <div class="zone-item" data-bs-toggle="modal" data-bs-target="#imageModal" data-img="assets/img/004.png" data-zone="4" data-camera="ICONIC-04" data-title="">
                        <img src="assets/img/004.png" alt="Zone 4" class="img-fluid rounded shadow-sm">
                        <div class="zone-info">
                          <h5 class="zone-title" style="color: #ff6b6b !important;">Zone : 4</h5>
                          <p class="zone-camera" style="color: #ffc4c4 !important;">กล้อง : ICONIC-04</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal สำหรับแสดงภาพขยาย -->
          <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="imageModalLabel">รายละเอียดโซน</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <img id="modalImage" src="" class="img-fluid" alt="Zone Detail">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
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
    document.addEventListener('DOMContentLoaded', function() {
      // 1. ผูก event listener สำหรับปุ่มรีเซ็ต (reset-btn)
      const resetBtn = document.getElementById('reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
          e.preventDefault();
          // รีเซ็ตฟอร์มค้นหา (ฟอร์มที่มี id="search-form")
          const searchForm = document.getElementById('search-form');
          if (searchForm) {
            searchForm.reset();
            showToast('รีเซ็ตฟอร์มแล้ว', 'success');
          }
        });
      }

      // 2. ผูก event listener สำหรับปุ่มรีเฟรชข้อมูล (refresh-btn)
      const refreshBtn = document.getElementById('refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
          e.preventDefault();
          // ตรวจสอบว่ามีฟังก์ชัน loadData() สำหรับดึงข้อมูลใหม่หรือไม่
          if (typeof loadData === 'function') {
            loadData().then(function() {
              showToast('รีเฟรชข้อมูลเรียบร้อยแล้ว', 'success');
            }).catch(function(error) {
              showToast('ไม่สามารถรีเฟรชข้อมูลได้', 'error');
            });
          } else {
            showToast('ไม่มีฟังก์ชันรีเฟรชข้อมูล', 'error');
          }
        });
      }

      // 3. ผูก event ให้กับปุ่มและรายการเมนูที่มีคลาส 'dropdown-item' หรือ 'button' (สำหรับดาวน์โหลดและรีเฟรชในแต่ละกราฟ)
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

            // หา chart object จากตัวแปรที่กำหนดไว้ (ปรับตามที่โปรเจคของคุณกำหนด)
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

        // ปุ่มรีเฟรชในแต่ละกราฟ (ยกเว้นปุ่ม refresh-btn และ refresh-chart)
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

            // ถ้ามีข้อมูลปัจจุบันในตัวแปร currentData ให้ใช้ฟังก์ชัน update สำหรับแต่ละกราฟ
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

        // ตัวเลือกอื่นๆ สำหรับ 'รายวัน' หรือ 'รายสัปดาห์'
        if (element.innerHTML.includes('รายวัน') || element.innerHTML.includes('รายสัปดาห์')) {
          element.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('กำลังพัฒนาฟีเจอร์นี้', 'info');
          });
        }

        // ตัวเลือกอื่นๆ สำหรับ 'กราฟแท่ง' หรือ 'กราฟวงกลม'
        if (element.innerHTML.includes('กราฟแท่ง') || element.innerHTML.includes('กราฟวงกลม')) {
          element.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('กำลังพัฒนาฟีเจอร์นี้', 'info');
          });
        }
      });
    });

    /**
     * ฟังก์ชันแสดงข้อความแจ้งเตือน (Toast)
     * @param {string} message - ข้อความที่ต้องการแสดง
     * @param {string} type - ประเภทของข้อความ (success, info, warning, error)
     */
    function showToast(message, type = 'info') {
      // ถ้ามี toast container แล้ว ให้ใช้ container เดิม
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

      // กำหนดสีและไอคอนสำหรับ Toast ตามประเภท
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

      // สร้าง Toast element
      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-white ${bgColor} border-0 mb-2`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');

      // กำหนดเนื้อหาของ Toast
      toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icon} me-2"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

      // เพิ่ม Toast ลงใน container และแสดง Toast ด้วย Bootstrap
      toastContainer.appendChild(toast);
      const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
      });
      bsToast.show();

      // ลบ Toast ออกจาก container เมื่อ Toast ถูกซ่อนไปแล้ว
      toast.addEventListener('hidden.bs.toast', function() {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
        // ลบ container ถ้าไม่มี Toast อยู่แล้ว
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      });
    }
  </script>

  <!-- 
  ==========================================
   เพิ่มโค้ด JavaScript สำหรับแสดงภาพในโหมด Modal
  ========================================== 
  -->

  <script>
    // เพิ่มโค้ดจัดการกับการแสดงภาพในโหมด Modal
    document.addEventListener('DOMContentLoaded', function() {
      // ฟังก์ชันสำหรับแสดงภาพในโหมด Modal
      const imageModal = document.getElementById('imageModal');
      if (imageModal) {
        imageModal.addEventListener('show.bs.modal', function(event) {
          const button = event.relatedTarget;
          const imgSrc = button.getAttribute('data-img');
          const zone = button.getAttribute('data-zone');
          const camera = button.getAttribute('data-camera');
          const title = button.getAttribute('data-title');

          const modalImage = document.getElementById('modalImage');
          const modalTitle = document.querySelector('#imageModal .modal-title');

          if (modalImage && imgSrc) {
            modalImage.src = imgSrc;
          }

          if (modalTitle) {
            let zoneColor = '';
            switch (zone) {
              case '1':
                zoneColor = '#4e95f4';
                break; // สีฟ้า
              case '2':
                zoneColor = '#4cd3a5';
                break; // สีเขียว
              case '3':
                zoneColor = '#ffc107';
                break; // สีเหลือง
              case '4':
                zoneColor = '#ff6b6b';
                break; // สีแดง
            }

            let titleText = title ? ` ${title}` : '';
            modalTitle.innerHTML = `<span style="color:${zoneColor}">Zone ${zone}${titleText}</span> - กล้อง ${camera}`;
          }
        });
      }
    });
  </script>



</body>

</html>