<!doctype html>
<html lang="th">

<head>
    <meta charset="utf-8" />
    <title>ICONIC YOU | Monitoring</title>
    <!-- Meta -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="title" content="ICONIC YOU | Dashboard " />
    <meta name="author" content="ICONIC YOU" />
    <meta name="description" content="ICONIC YOU | Dashboard" />
    <meta name="keywords" content="ICONIC YOU | Dashboard " />

    <!-- CSS: Bootstrap, Bootstrap Icons, AdminLTE, custom -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <!-- เพิ่ม Font Awesome สำหรับไอคอนเพิ่มเติม -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="css/adminlte.css" />

    <!-- สำหรับปรับแต่งกราฟ -->
    <link rel="stylesheet" href="css/custom.css" />

    <!-- สำหรับปรับแต่งหน้าจอ -->
    <link rel="stylesheet" href="css/dashboard-styles.css" />

</head>

<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
    <div class="app-wrapper">
        <!-- Header -->
        <?php include 'layout/header.php'; ?>
        <!-- Sidebar -->
        <?php include 'layout/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="app-main">
            <!-- ใช้ iframe ในการดึงหน้าเว็บ https://iconicyou.pointit.co.th/ มาแสดงภายในหน้า monitoring.php -->
            <iframe src="https://iconicyou.pointit.co.th/"
                style="width: 100%; height: 100vh; border: 0;"
                title="ICONIC YOU"
                allowfullscreen>
            </iframe>
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
        <!-- JS: Bootstrap, ApexCharts, AdminLTE, index.js -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.min.js"></script>
        <script src="js/adminlte.js"></script>


    </div>
</body>

</html>