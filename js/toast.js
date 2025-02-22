// toast.js
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