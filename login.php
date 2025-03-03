<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบ - ICONIC YOU</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link href="assets/css/login.css" rel="stylesheet">
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <img src="assets/img/AdminLTELogo.png" alt="ICONIC YOU Logo" class="mb-4">
            <h1 class="fw-bold">ICONIC YOU</h1>
            <p class="text-muted">ระบบจัดการการเข้าถึง</p>
        </div>

        <form method="post" action="auth.php">
            <div class="form-floating mb-4">
                <input type="text" class="form-control" id="username" name="username" placeholder="ชื่อผู้ใช้" required>
                <label for="username" class="text-secondary">
                    <i class="bi bi-person-fill me-2"></i>ชื่อผู้ใช้
                </label>
            </div>

            <div class="form-floating mb-4">
                <input type="password" class="form-control" id="password" name="password" placeholder="รหัสผ่าน" required>
                <label for="password" class="text-secondary">
                    <i class="bi bi-lock-fill me-2"></i>รหัสผ่าน
                </label>
            </div>

            <div class="remember-forgot d-flex justify-content-between align-items-center">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="remember">
                    <label class="form-check-label text-secondary" for="remember">จดจำฉัน</label>
                </div>
                <a href="#" class="forgot-link">ลืมรหัสผ่าน?</a>
            </div>

            <button type="submit" class="btn btn-primary w-100 btn-login">
                <i class="bi bi-box-arrow-in-right me-2"></i>เข้าสู่ระบบ
            </button>

            <div class="divider">
                <span>หรือ</span>
            </div>

            <button type="button" class="btn btn-outline-secondary w-100">
                <i class="bi bi-microsoft me-2"></i>เข้าสู่ระบบด้วย Microsoft
            </button>

            <div class="login-footer">
                <p class="mb-1">พบปัญหาการใช้งาน? <a href="#" class="text-primary">ติดต่อผู้ดูแลระบบ</a></p>
                <p class="mb-0">&copy; 2024 ICONIC YOU. All rights reserved.</p>
            </div>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
