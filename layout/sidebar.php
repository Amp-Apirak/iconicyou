<!-- Sidebar -->
<aside class="app-sidebar shadow" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);" data-bs-theme="dark">
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
            <?php
            // ดึงชื่อไฟล์ของหน้าปัจจุบัน
            $currentPage = basename($_SERVER['PHP_SELF']);

            // ตั้งค่าให้เมนู Dashboard เป็น active โดยค่าเริ่มต้นถ้าเราอยู่ในหน้า index.php, home.php หรือไม่มีค่าใน $currentPage
            $dashboardActive = ($currentPage == 'index.php' || $currentPage == '' || $currentPage == 'home.php') ? 'active' : '';

            // ตั้งค่าให้เมนู Time Report เป็น active เฉพาะเมื่อเราอยู่ในหน้า time-report.php
            $timeReportActive = ($currentPage == 'time-report.php') ? 'active' : '';

            // ตั้งค่าให้เมนู Monitoring เป็น active เฉพาะเมื่อเราอยู่ในหน้า monitoring.php
            $monitoringActive = ($currentPage == 'monitoring.php') ? 'active' : '';

            // ตั้งค่าให้เมนู Document API เป็น active เฉพาะเมื่อเราอยู่ในหน้า document-api.php
            $documentApiActive = ($currentPage == 'document-api.php') ? 'active' : '';

            // ถ้าไม่มีเมนูไหนถูก active ให้ทำให้เมนู Dashboard เป็น active โดยค่าเริ่มต้น
            if ($dashboardActive == '' && $timeReportActive == '' && $monitoringActive == '' && $documentApiActive == '') {
                $dashboardActive = 'active';
            }
            ?>
            <ul class="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                <li class="nav-item">
                    <a href="index.php" class="nav-link <?php echo $dashboardActive; ?>">
                        <i class="nav-icon bi bi-speedometer2"></i>
                        <p>Dashboard</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="time-report.php" class="nav-link <?php echo $timeReportActive; ?>">
                        <i class="nav-icon bi bi-clock-history"></i>
                        <p>Time Report</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="monitoring.php" class="nav-link <?php echo $monitoringActive; ?>">
                        <i class="nav-icon bi bi-graph-up"></i>
                        <p>Monitoring</p>
                    </a>
                </li>
                <!-- <li class="nav-item">
                    <a href="document-api.php" class="nav-link <?php echo $documentApiActive; ?>">
                        <i class="nav-icon bi bi-file-text"></i>
                        <p>Document API</p>
                    </a>
                </li> -->
            </ul>
        </nav>
    </div>
</aside>