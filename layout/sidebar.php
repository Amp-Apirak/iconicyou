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
            <?php
            // Get current page filename
            $currentPage = basename($_SERVER['PHP_SELF']);

            // Set Dashboard as active by default if we're on the homepage or index
            $dashboardActive = ($currentPage == 'index.php' || $currentPage == '' || $currentPage == 'home.php') ? 'active' : '';

            // Only set Time Report as active if we're specifically on that page
            $timeReportActive = ($currentPage == 'time-report.php') ? 'active' : '';

            // If no page is active, make Dashboard active by default
            if ($dashboardActive == '' && $timeReportActive == '') {
                $dashboardActive = 'active';
            }
            ?>
            <ul
                class="nav sidebar-menu flex-column"
                data-lte-toggle="treeview"
                role="menu"
                data-accordion="false">
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
            </ul>
        </nav>
    </div>
</aside>