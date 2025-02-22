
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
