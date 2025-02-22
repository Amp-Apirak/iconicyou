// form-handler.js
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
            chartObj.dataURI().then(({ imgURI }) => {
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