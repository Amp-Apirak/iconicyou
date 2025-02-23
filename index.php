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
    <?php include 'layout/header.php'; ?>
    <!-- Sidebar -->
    <?php include 'layout/sidebar.php'; ?>

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

          <!-- เพิ่มในส่วนที่ต้องการแสดงกราฟ -->
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title">
                    <i class="bi bi-clock-history me-2"></i>
                    ระยะเวลาการอยู่ในพื้นที่: <span style="color: #0d6efd">Zone : 1 ทางเข้า-ออก</span>
                  </h5>
                </div>
                <div class="card-body">
                  <div id="activity-chart-1" style="min-height: 350px;"></div>
                </div>
              </div>
            </div>
            <!-- ทำซ้ำสำหรับกราฟที่ 2-4 โดยเปลี่ยน id เป็น activity-chart-2, activity-chart-3, activity-chart-4 -->
          </div>



        </div> <!-- container-fluid -->
      </div> <!-- app-content -->
    </main>

    <?php
    // โหลดส่วน Footer
    include 'layout/footer.php';
    ?>

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
    <script src="js/toast.js"></script>
    <script src="js/modal.js"></script>
    <script src="js/form-handler.js"></script>
    <script src="js/main.js"></script>





</body>

</html>