<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>ICONIC YOU | Dashboard</title>
  <!-- Meta -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="title" content="ICONIC YOU | Dashboard " />
  <meta name="author" content="ColorlibHQ" />
  <meta name="description" content="ICONIC YOU | Dashboard" />
  <meta name="keywords" content="ICONIC YOU | Dashboard " />

  <!-- CSS: Bootstrap, Bootstrap Icons, AdminLTE, custom -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />
  <link rel="stylesheet" href="css/adminlte.css" />
  <link rel="stylesheet" href="css/custom.css" />

  <!-- ApexCharts -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.css"
  />
</head>
<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
  <div class="app-wrapper">
    <!-- Header -->
    <nav class="app-header navbar navbar-expand bg-body">
      <div class="container-fluid">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button">
              <i class="bi bi-list"></i>
            </a>
          </li>
          <li class="nav-item d-none d-md-block">
            <a href="#" class="nav-link">Dashboard</a>
          </li>
        </ul>
        
        <!-- Header right items -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <div class="form-check form-switch mt-2">
              <input class="form-check-input" type="checkbox" id="realtime-toggle">
              <label class="form-check-label" for="realtime-toggle">Realtime</label>
              <span id="realtime-status" class="badge bg-danger" style="display: none;">LIVE</span>
            </div>
          </li>
          <li class="nav-item">
            <span class="nav-link">
              อัปเดตล่าสุด: <span id="last-updated-time">-</span>
            </span>
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
            class="brand-image opacity-75 shadow"
          />
          <span class="brand-text fw-light">ICONIC YOU</span>
        </a>
      </div>
      <div class="sidebar-wrapper">
        <nav class="mt-2">
          <ul
            class="nav sidebar-menu flex-column"
            data-lte-toggle="treeview"
            role="menu"
            data-accordion="false"
          >
            <li class="nav-item">
              <a href="index.html" class="nav-link active">
                <i class="nav-icon bi bi-speedometer"></i>
                <p>Dashboard</p>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="nav-icon bi bi-camera-video"></i>
                <p>กล้องทั้งหมด</p>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="nav-icon bi bi-file-earmark-text"></i>
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
                  <a href="#">Home</a>
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
            <div class="card-header">
              <h5 class="card-title">ค้นหาข้อมูล</h5>
              <div class="card-tools">
                <button
                  type="button"
                  class="btn btn-tool"
                  data-lte-toggle="card-collapse"
                >
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
                      <label>ประเภทการวิเคราะห์</label>
                      <select class="form-control" name="compute_id" id="compute_id" required>
                        <option value="7">People Counting</option>
                        <option value="1">Face Detection</option>
                        <option value="11">People Monitoring</option>
                      </select>
                    </div>
                  </div>
                  <!-- เลือกกล้อง (ดึงจาก API) -->
                  <div class="col-md-4">
                    <div class="form-group mb-3">
                      <label>กล้อง</label>
                      <select class="form-control" name="source_name" id="source_name">
                        <option value="">ทั้งหมด</option>
                      </select>
                    </div>
                  </div>
                  <!-- ช่วงวันที่ -->
                  <div class="col-md-4">
                    <div class="form-group mb-3">
                      <label>ช่วงวันที่</label>
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
                      <label>วันที่เริ่มต้น</label>
                      <input type="date" name="start_date" class="form-control" />
                    </div>
                  </div>
                  <div class="col-md-4 date-custom">
                    <div class="form-group mb-3">
                      <label>วันที่สิ้นสุด</label>
                      <input type="date" name="end_date" class="form-control" />
                    </div>
                  </div>
                  <!-- ปุ่มค้นหา -->
                  <div class="col-md-4 align-self-end">
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-search me-1"></i> ค้นหา
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- ส่วนแสดงข้อมูลสถิติ -->
          <div class="row">
            <div class="col-md-4">
              <div class="stat-box">
                <h5 class="stat-title">จำนวนคนทั้งหมด</h5>
                <div class="stat-number" id="total-people">0</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box">
                <h5 class="stat-title">จำนวนกล้อง</h5>
                <div class="stat-number" id="total-cameras">0</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box">
                <h5 class="stat-title">จำนวนโซน</h5>
                <div class="stat-number" id="total-zones">0</div>
              </div>
            </div>
          </div>

          <!-- ส่วนแสดงกราฟ -->
          <div class="row">
            <div class="col-md-12">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title">กราฟแท่งจำนวนคนเฉลี่ยต่อชั่วโมง แยกตามโซน/กล้อง</h5>
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
                <div class="card-header">
                  <h5 class="card-title">กล้องตัวที่ 1</h5>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-1-->
                  <div id="horizontal-bar-chart-1" style="min-height: 400px;"></div>
                  
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title">กล้องตัวที่ 2</h5>
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
                <div class="card-header">
                  <h5 class="card-title">กล้องตัวที่ 3</h5>
                </div>
                <div class="card-body chart-container">
                  <!-- horizontal-bar-chart-3 -->
                  <div id="horizontal-bar-chart-3" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title">กล้องตัวที่ 4</h5>
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
                <div class="card-header">
                  <h5 class="card-title">กราฟจำนวนตามเวลา</h5>
                </div>
                <div class="card-body chart-container">
                  <!-- time-series-chart -->
                  <div id="time-series-chart" style="min-height: 400px;"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="card-title">สัดส่วนตามกล้อง</h5>
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
    <footer class="app-footer">
      <div class="float-end d-none d-sm-inline">
        ICONIC YOU Dashboard
      </div>
      <strong>
        Copyright &copy; 2024
        <a href="#">ICONIC YOU</a>.
      </strong>
      All rights reserved.
    </footer>
  </div>

  <!-- JS: Bootstrap, ApexCharts, AdminLTE, index.js -->
  <script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  ></script>
  <script
    src="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.min.js"
  ></script>
  <script src="js/adminlte.js"></script>
  <script src="js/index.js"></script>
</body>
</html>