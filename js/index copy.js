// ==========================================
// ส่วนกำหนดตัวแปรและค่าคงที่ (Global Variables / Constants)
// ==========================================

// กำหนดตัวแปรสำหรับเก็บ instance ของกราฟ
let timeSeriesChart = null;
let cameraPieChart = null;
let barChart = null;

// URL หลักของ API
const API_BASE_URL = "https://iconicyou-api.pointit.co.th";

// กำหนดจำนวนข้อมูลที่ดึงจาก API (Fix ที่ 1000 รายการ)
const FIXED_LIMIT = 1000;

// กำหนดตัวแปรสำหรับ interval ของ Realtime update
let realtimeInterval = null;
const REALTIME_UPDATE_INTERVAL = 30000; // อัปเดตทุก 30 วินาที

// ตัวแปรเก็บข้อมูลล่าสุดที่ใช้สำหรับแสดง dashboard
let currentData = [];

// ตัวแปรเก็บเงื่อนไขการค้นหาปัจจุบัน (เพื่อใช้ในการ reload)
let currentSearchParams = null;

// ==========================================
// ส่วนฟังก์ชันสำหรับแสดง/ซ่อน Loading Overlay
// ==========================================

/**
 * แสดง Loading overlay ขณะมีการโหลดข้อมูล
 */
function showLoading() {
  // ตรวจสอบว่ามี loading overlay อยู่แล้วหรือไม่
  if (document.getElementById("loading-overlay")) return;
  
  const loading = document.createElement("div");
  loading.id = "loading-overlay";
  loading.innerHTML = `
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">กำลังโหลด...</span>
    </div>
  `;
  document.body.appendChild(loading);
}

/**
 * ซ่อน Loading overlay เมื่อโหลดเสร็จ
 */
function hideLoading() {
  const loading = document.getElementById("loading-overlay");
  if (loading) {
    loading.remove();
  }
}

// ==========================================
// ส่วนฟังก์ชันคำนวณวันที่ (auto-calculate date range)
// ==========================================

/**
 * คำนวณวันที่เริ่มต้นและวันที่สิ้นสุดตามประเภทของช่วงวันที่ (range)
 * @param {string} range - ช่วงวันที่ เช่น today, yesterday, last7days, last30days
 * @returns {object} - { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
function calculateDates(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00
  
  let startDate = new Date(today);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999); // ตั้งเวลาเป็น 23:59:59.999

  switch (range) {
    case "today":
      // ไม่มีการเปลี่ยนแปลง startDate/endDate
      break;
    case "yesterday":
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last7days":
      startDate.setDate(today.getDate() - 6); // 7 วันรวมวันนี้
      break;
    case "last30days":
      startDate.setDate(today.getDate() - 29); // 30 วันรวมวันนี้
      break;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

// ==========================================
// ส่วนฟังก์ชันโหลดข้อมูลกล้องและโซน (loadCamerasAndZones)
// ==========================================

/**
 * โหลดรายชื่อกล้อง (camera) และโซน (zone) จาก API
 * โดยใช้ compute_id ที่ผู้ใช้เลือก
 */
async function loadCamerasAndZones() {
  try {
    // อ่านค่า compute_id จาก select (หน้าเว็บ)
    const computeId = document.querySelector("#compute_id").value;

    // เรียก API analytics/ ด้วย compute_id และ limit มากพอ (1000) เพื่อดึงข้อมูลทั้งหมด
    const response = await fetch(
      `${API_BASE_URL}/analytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`
    );
    if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อกับ API ได้");

    // แปลงข้อมูลที่ได้จาก API เป็นรูปแบบ JSON
    const data = await response.json();
    if (!Array.isArray(data)) return;

    // ใช้ Set เพื่อเก็บรายชื่อกล้อง และโซนไม่ให้ซ้ำ
    const cameraSet = new Set();
    const zoneSet = new Set();

    // วนลูปข้อมูลเพื่อนำค่ามาใส่ใน Set
    data.forEach((item) => {
      // ตรวจสอบว่ามี item.data.sourceName หรือไม่
      if (item && item.data && item.data.sourceName) {
        cameraSet.add(item.data.sourceName);
      }
      
      // ตรวจสอบว่ามี analyticsResult และ objsInfo หรือไม่
      if (item && item.data && item.data.analyticsResult) {
        // กรณีมี objsInfo เป็น Array
        if (Array.isArray(item.data.analyticsResult.objsInfo)) {
          item.data.analyticsResult.objsInfo.forEach(obj => {
            if (obj && obj.roiName) {
              const zoneName = obj.roiName.replace("Zone:", "").trim();
              zoneSet.add(zoneName);
            }
          });
        } 
        // กรณีมี objsInfo เป็น Object
        else if (item.data.analyticsResult.objsInfo && item.data.analyticsResult.objsInfo.roiName) {
          const zoneName = item.data.analyticsResult.objsInfo.roiName.replace("Zone:", "").trim();
          zoneSet.add(zoneName);
        }
      }
    });

    // อัปเดต select กล้อง
    const selectCamera = document.getElementById("source_name");
    if (selectCamera) {
      selectCamera.innerHTML = '<option value="">ทั้งหมด</option>';
      cameraSet.forEach((cam) => {
        selectCamera.innerHTML += `<option value="${cam}">${cam}</option>`;
      });
    }
  } catch (error) {
    console.error("Error loading cameras/zones:", error);
    alert("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้");
  }
}

// ==========================================
// ส่วนฟังก์ชันโหลดข้อมูลตามฟอร์ม (loadData)
// ==========================================

/**
 * โหลดข้อมูลการวิเคราะห์ตามเงื่อนไขในฟอร์ม
 * (compute_id, source_name, date_range)
 * @param {boolean} isRealtime - ใช้สำหรับบอกว่าเป็นการโหลดแบบ realtime หรือไม่
 */
async function loadData(isRealtime = false) {
  try {
    // แสดง loading เฉพาะกรณีไม่ใช่ realtime update
    if (!isRealtime) {
      showLoading();
    }
    
    const form = document.getElementById("search-form");
    const formData = new FormData(form);

    // ถ้า compute_id ไม่ได้เลือกใดๆ ให้ default = 7
    const computeId = formData.get("compute_id") || 7;

    // เริ่มสร้าง URL สำหรับเรียก API /getAnalytics
    let url = `${API_BASE_URL}/getAnalytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
    const params = new URLSearchParams();

    // source_name (กล้อง)
    if (formData.get("source_name")) {
      params.append("source_name", formData.get("source_name"));
    }

    // date_range
    const dateRange = formData.get("date_range");
    if (dateRange && dateRange !== "custom") {
      const dates = calculateDates(dateRange);
      params.set("start_date", dates.startDate);
      params.set("end_date", dates.endDate);
    } else {
      // custom
      const sDate = formData.get("start_date");
      const eDate = formData.get("end_date");
      if (sDate && eDate) {
        params.set("start_date", sDate);
        params.set("end_date", eDate);
      }
    }

    // เก็บพารามิเตอร์ปัจจุบันสำหรับ realtime
    currentSearchParams = params.toString();

    // ต่อพารามิเตอร์ใน URL
    if (currentSearchParams) {
      url += `&${currentSearchParams}`;
    }

    // เรียก API และตรวจสอบผลลัพธ์
    const response = await fetch(url);
    if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อกับ API ได้");

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log("ไม่พบข้อมูล");
      displayNoData();
      return;
    }

    // บันทึกข้อมูลล่าสุด
    currentData = data;

    // ส่งต่อไปอัปเดต Dashboard
    updateDashboard(data, isRealtime);
  } catch (error) {
    console.error("Error:", error);
    if (!isRealtime) {
      alert(error.message);
    }
  } finally {
    if (!isRealtime) {
      hideLoading();
    }
  }
}

/**
 * แสดงข้อความเมื่อไม่พบข้อมูล
 */
function displayNoData() {
  // ล้างกราฟทั้งหมด
  if (timeSeriesChart) {
    timeSeriesChart.updateOptions({
      series: [{ data: [] }]
    });
  }
  
  if (cameraPieChart) {
    cameraPieChart.updateOptions({
      series: [],
      labels: []
    });
  }
  
  if (barChart) {
    barChart.updateOptions({
      series: [{ data: [] }],
      xaxis: { categories: [] }
    });
  }
  
  // แสดงข้อความไม่พบข้อมูล
  const noDataElements = document.querySelectorAll('.chart-container');
  noDataElements.forEach(element => {
    // เช็คว่ามีข้อความไม่พบข้อมูลอยู่แล้วหรือไม่
    if (!element.querySelector('.no-data')) {
      const noDataDiv = document.createElement('div');
      noDataDiv.className = 'no-data';
      noDataDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i>
        <div class="no-data-text">ไม่พบข้อมูล</div>
      `;
      element.appendChild(noDataDiv);
    }
  });
}

// ==========================================
// ส่วนฟังก์ชัน Realtime Update (startRealtimeUpdate)
// ==========================================

/**
 * เริ่มการอัปเดตข้อมูลแบบ Realtime
 */
function startRealtimeUpdate() {
  // หยุด interval เดิมถ้ามี
  stopRealtimeUpdate();
  
  // เปิดสถานะ realtime
  document.getElementById('realtime-status').style.display = 'inline-block';
  
  // เริ่ม interval ใหม่
  realtimeInterval = setInterval(() => {
    loadData(true);
  }, REALTIME_UPDATE_INTERVAL);
}

/**
 * หยุดการอัปเดตข้อมูลแบบ Realtime
 */
function stopRealtimeUpdate() {
  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
  
  // ปิดสถานะ realtime
  document.getElementById('realtime-status').style.display = 'none';
}

// ==========================================
// ส่วนฟังก์ชันอัปเดตข้อมูลบน Dashboard
// ==========================================

/**
 * อัปเดตข้อมูลบน Dashboard โดยเรียกฟังก์ชันย่อย
 * @param {Array} data - ข้อมูล array ที่ได้จาก API
 * @param {boolean} isRealtime - ใช้บอกว่าเป็นการอัปเดตแบบ realtime หรือไม่
 */
function updateDashboard(data, isRealtime = false) {
  // ลบข้อความไม่พบข้อมูลถ้ามี
  const noDataElements = document.querySelectorAll('.no-data');
  noDataElements.forEach(element => element.remove());
  
  // 1) อัปเดตกราฟเส้น (Time Series Chart)
  updateTimeSeriesChart(data);

  // 2) อัปเดตกราฟวงกลม (Pie Chart)
  updatePieChart(data);

  // 3) สร้างและอัปเดตกราฟแท่ง (Bar Chart) แสดงข้อมูลตาม Zone
  updateBarChart(data);

  // 4) อัปเดตตัวเลขสถิติ
  updateStats(data);
  
  // 5) อัปเดตเวลาล่าสุด
  if (isRealtime) {
    updateLastUpdatedTime();
  }
}

/**
 * อัปเดตเวลาล่าสุดที่มีการอัปเดตข้อมูล
 */
function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('th-TH');
  const lastUpdatedElement = document.getElementById('last-updated-time');
  
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = timeString;
  }
}

// ==========================================
// ส่วนฟังก์ชันคำนวณและแสดงตัวเลขสถิติต่างๆ (updateStats)
// ==========================================

/**
 * คำนวณตัวเลขสถิติต่าง ๆ เช่น
 * - จำนวนคนทั้งหมด (totalPeople)
 * - จำนวนกล้อง (totalCameras)


// ส่วนฟังก์ชันคำนวณและแสดงตัวเลขสถิติต่างๆ (updateStats) - ต่อ
/**
 * คำนวณตัวเลขสถิติต่าง ๆ เช่น
 * - จำนวนคนทั้งหมด (totalPeople)
 * - จำนวนกล้อง (totalCameras)
 * - จำนวนโซน (totalZones)
 * - ค่าเฉลี่ยต่อชั่วโมง (avgPerHour)
 * และแสดงผลใน HTML
 * @param {Array} data - ข้อมูล array ที่ได้จาก API
 */
function updateStats(data) {
    // ประกาศตัวแปรสำหรับเก็บผลรวมและนับจำนวน
    let totalPeople = 0;          // จำนวนคนทั้งหมด
    let cameraSet = new Set();    // เก็บชื่อกล้องไม่ให้ซ้ำ
    
    // วนลูป data เพื่อสรุปค่า
    data.forEach(item => {
      // นับจำนวนคน
      const cnt = item?.data?.analyticsResult?.cnt || 0;
      totalPeople += cnt;
  
      // เก็บชื่อกล้อง
      const cameraName = item?.data?.sourceName || "unknown";
      cameraSet.add(cameraName);
    });
  
    // แสดงค่าลงใน HTML
    const elTotalPeople = document.getElementById("total-people");
    const elTotalCameras = document.getElementById("total-cameras");
    const elTotalZones = document.getElementById("total-zones");
  
    // ถ้ามี element เหล่านี้ใน DOM ให้ใส่ค่า
    if (elTotalPeople) {
      elTotalPeople.textContent = totalPeople.toLocaleString();
    }
    if (elTotalCameras) {
      elTotalCameras.textContent = cameraSet.size.toLocaleString();
    }
    if (elTotalZones) {
      // กำหนดให้จำนวนโซนเท่ากับจำนวนกล้อง (1 กล้อง = 1 โซน)
      elTotalZones.textContent = cameraSet.size.toLocaleString();
    }
  }


  // ==========================================
  // ส่วนฟังก์ชันอัปเดตกราฟเส้น (Time Series Chart)
  // ==========================================
  
  /**
   * สร้าง/อัปเดตกราฟเส้น (Area Chart) แสดงจำนวนตามเวลา
   * @param {Array} data - ข้อมูลจาก API
   */
  function updateTimeSeriesChart(data) {
    // เรียงลำดับข้อมูลตามเวลา
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a?.time || 0);
      const timeB = new Date(b?.time || 0);
      return timeA - timeB;
    });
  
    // แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสมกับ ApexCharts
    const chartData = sortedData.map((item) => {
      const time = item?.time;
      const cnt = item?.data?.analyticsResult?.cnt || 0;
  
      return {
        x: time ? new Date(time).getTime() : new Date().getTime(),
        y: cnt,
      };
    });
  
    const options = {
      series: [
        {
          name: "จำนวนคน",
          data: chartData,
        },
      ],
      chart: {
        type: "area",
        height: 400,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          format: "dd/MM/yy HH:mm",
        },
        title: {
          text: "เวลา"
        }
      },
      yaxis: {
        title: {
          text: "จำนวนคน",
        },
        min: 0,
        forceNiceScale: true
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
        y: {
          formatter: function(value) {
            return value + " คน";
          }
        }
      },
      colors: ["#0d6efd"],
      title: {
        text: "จำนวนคนตามช่วงเวลา",
        align: "center"
      }
    };
  
    const chartEl = document.querySelector("#time-series-chart");
    if (!chartEl) return;
  
    if (timeSeriesChart) {
      timeSeriesChart.updateOptions(options);
    } else {
      timeSeriesChart = new ApexCharts(chartEl, options);
      timeSeriesChart.render();
    }
  }
  
  // ==========================================
  // ส่วนฟังก์ชันอัปเดตกราฟวงกลม (Pie Chart)
  // ==========================================
  
  /**
   * สร้าง/อัปเดตกราฟวงกลม (Donut Chart) แสดงสัดส่วนตามกล้อง
   * @param {Array} data - ข้อมูลจาก API
   */
  function updatePieChart(data) {
    // นับจำนวนคนตามกล้อง
    const cameraData = {};
    data.forEach((item) => {
      const cam = item?.data?.sourceName || "ไม่ระบุ";
      const cnt = item?.data?.analyticsResult?.cnt || 0;
      cameraData[cam] = (cameraData[cam] || 0) + cnt;
    });
  
    // แปลงเป็น series และ labels สำหรับ ApexCharts
    const series = Object.values(cameraData);
    const labels = Object.keys(cameraData);
  
    const options = {
      series,
      chart: {
        type: "donut",
        height: 400,
        toolbar: {
          show: true
        }
      },
      labels,
      colors: ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6610f2", "#fd7e14", "#0dcaf0", "#198754", "#6c757d", "#d63384"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + " คน";
        }
      },
      tooltip: {
        y: {
          formatter: function(value) {
            return value + " คน";
          }
        }
      },
      title: {
        text: "สัดส่วนจำนวนคนตามกล้อง",
        align: "center"
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: "จำนวนรวม",
                formatter: function(w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + " คน";
                }
              }
            }
          }
        }
      }
    };
  
    const pieEl = document.querySelector("#camera-pie-chart");
    if (!pieEl) return;
  
    if (cameraPieChart) {
      cameraPieChart.updateOptions(options);
    } else {
      cameraPieChart = new ApexCharts(pieEl, options);
      cameraPieChart.render();
    }
  }
  
  // ==========================================
  // ส่วนฟังก์ชันอัปเดตกราฟแท่ง (Bar Chart)
  // ==========================================
  
  /**
   * สร้าง/อัปเดตกราฟแท่ง (Bar Chart) แสดงจำนวนคนตาม Zone
   * @param {Array} data - ข้อมูลจาก API
   */
  function updateBarChart(data) {
    // สร้างข้อมูลตามชั่วโมงและกล้อง
    const hourCameraData = {};
    const cameraSet = new Set();
    
    data.forEach((item) => {
      // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
      if (!item || !item.data || !item.data.analyticsResult || !item.time) return;
      
      const cnt = item.data.analyticsResult.cnt || 0;
      const cameraName = item.data.sourceName || "ไม่ระบุ";
      const time = new Date(item.time);
      
      // เก็บชื่อกล้องไม่ให้ซ้ำ
      cameraSet.add(cameraName);
      
      // สร้าง key เฉพาะชั่วโมง format: "HH:00" เช่น "08:00"
      const hour = time.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      // สร้างโครงสร้างข้อมูลถ้ายังไม่มี
      if (!hourCameraData[hourKey]) {
        hourCameraData[hourKey] = {};
      }
      
      // รวมจำนวนคนตามชั่วโมงและกล้อง
      hourCameraData[hourKey][cameraName] = (hourCameraData[hourKey][cameraName] || 0) + cnt;
    });
    
    // แปลงเป็น array ของชั่วโมงและเรียงตามเวลา
    const hourKeys = Object.keys(hourCameraData).sort((a, b) => {
      // เรียงตามชั่วโมง
      const hourA = parseInt(a.split(':')[0]);
      const hourB = parseInt(b.split(':')[0]);
      return hourA - hourB;
    });
    
    // แปลงชื่อกล้องเป็น array
    const cameraNames = Array.from(cameraSet);
    
    // สร้าง series สำหรับแต่ละกล้อง
    const series = cameraNames.map(camera => {
      return {
        name: camera,
        data: hourKeys.map(hour => hourCameraData[hour][camera] || 0)
      };
    });
    
    const options = {
      series: series,
      chart: {
        type: 'bar',
        height: 400,
        toolbar: {
          show: true
        },
        stacked: false
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val > 0 ? val : '';
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: hourKeys,
        title: {
          text: 'ช่วงเวลา (ชั่วโมง)'
        }
      },
      yaxis: {
        title: {
          text: 'จำนวนคน'
        },
        min: 0
      },
      fill: {
        opacity: 1
      },
      title: {
        text: 'จำนวนคนตามช่วงเวลารายชั่วโมงแยกตามกล้อง',
        align: 'center'
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val + " คน";
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      colors: ['#0d6efd', '#20c997', '#ffc107', '#dc3545', '#6610f2', '#fd7e14', '#0dcaf0', '#198754']
    };
    
    const barEl = document.querySelector("#bar-chart");
    if (!barEl) return;
    
    if (barChart) {
      barChart.updateOptions(options);
    } else {
      barChart = new ApexCharts(barEl, options);
      barChart.render();
    }
  }
  // ==========================================
  // ส่วนจัดการการแสดงฟิลด์วันที่แบบ custom
  // ==========================================
  
  /**
   * จัดการการแสดง/ซ่อนฟิลด์วันที่แบบ custom ตามที่ผู้ใช้เลือก
   */
  function toggleDateFields() {
    const dateRange = document.getElementById("date_range");
    const dateCustomFields = document.querySelectorAll(".date-custom");
    
    if (!dateRange) return;
    
    const isCustom = dateRange.value === "custom";
    dateCustomFields.forEach((field) => {
      field.style.display = isCustom ? "block" : "none";
    });
  }
  
  // ==========================================
  // ส่วนการทำงานเมื่อหน้าเว็บโหลดเสร็จ (DOMContentLoaded)
  // ==========================================
  
  document.addEventListener("DOMContentLoaded", () => {
    // 1) โหลดรายชื่อกล้อง/โซนครั้งแรก
    loadCamerasAndZones();
  
    // 2) หาก compute_id เปลี่ยน ให้โหลดรายชื่อกล้อง/โซนใหม่
    document.getElementById("compute_id").addEventListener("change", () => {
      loadCamerasAndZones();
    });
  
    // 3) ผูก event เมื่อมีการ submit form (กดปุ่มค้นหา)
    document.getElementById("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      // หยุด realtime update เมื่อมีการค้นหาแบบ manual
      stopRealtimeUpdate();
      
      // โหลดข้อมูลตามเงื่อนไขการค้นหา
      loadData();
    });
    
    // 4) ผูก event การเปลี่ยน date range
    document.getElementById("date_range").addEventListener("change", toggleDateFields);
    
    // 5) ผูก event ปุ่ม realtime
    document.getElementById('realtime-toggle').addEventListener('change', function() {
      if (this.checked) {
        startRealtimeUpdate();
      } else {
        stopRealtimeUpdate();
      }
    });
  
    // 6) แสดง/ซ่อนฟิลด์วันที่แบบ custom ตามค่าเริ่มต้น
    toggleDateFields();
  
    // 7) โหลดข้อมูลครั้งแรกทันที
    loadData();
  });


// ===============================
// ฟังก์ชันสำหรับกราฟแท่งแนวนอน (Horizontal Bar Charts)
// ===============================
/**
 * ฟังก์ชันสำหรับอัปเดตกราฟแท่งแนวนอน (Horizontal Bar Charts)
 * โดยแสดงข้อมูลจำนวนคนตามช่วงเวลาสำหรับแต่ละกล้อง
 * @param {Array} data - ข้อมูลจาก API
 */
function updateHorizontalBarCharts(data) {
    // แก้ไขให้ตรงกับชื่อกล้องจริงใน API
    // ตัวอย่าง: สมมติ API คืนค่า "BDH-01", "BDH-02", "BDH-03", "BDH-04"
    const cameras = ["BDH-01", "BDH-02", "BDH-03", "BDH-04"];
    
    // กำหนดช่วงเวลาที่ต้องการแสดง
    // หากเวลาจริงอยู่ในช่วงอื่น ให้เพิ่ม/แก้ตามต้องการ
    const timeRanges = [
      { start: "08:00", end: "09:00" },
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "12:00", end: "13:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
      { start: "16:00", end: "17:00" },
      { start: "17:00", end: "18:00" },
    ];
  
    // ฟังก์ชันช่วยเปลี่ยน "HH:MM" เป็นตัวเลขชั่วโมง (ทศนิยม)
    function parseTime(timeStr) {
      const parts = timeStr.split(":");
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
  
    // สร้างโครงสร้างข้อมูลสำหรับแต่ละกล้อง โดยให้ key เป็น "08:00 - 09:00" เป็นต้น
    const chartDataByCamera = {};
    cameras.forEach(cam => {
      chartDataByCamera[cam] = {};
      timeRanges.forEach(range => {
        const label = `${range.start} - ${range.end}`;
        chartDataByCamera[cam][label] = 0;
      });
    });
  
    // วนลูปข้อมูลจาก API เพื่อนับจำนวนคนตามช่วงเวลา
    data.forEach(item => {
      // อ่านชื่อกล้องจาก item.data.sourceName
      const cam = item?.data?.sourceName;
      if (cameras.includes(cam)) {
        const time = new Date(item.time);
        const hoursDecimal = time.getHours() + time.getMinutes() / 60;
        
        // เช็คว่าตรงกับช่วงเวลาไหน
        timeRanges.forEach(range => {
          const startDecimal = parseTime(range.start);
          const endDecimal = parseTime(range.end);
          if (hoursDecimal >= startDecimal && hoursDecimal < endDecimal) {
            const label = `${range.start} - ${range.end}`;
            // เพิ่มจำนวนคน (cnt)
            chartDataByCamera[cam][label] += item.data.analyticsResult?.cnt || 0;
          }
        });
      }
    });
  
    // สร้างกราฟสำหรับแต่ละกล้อง
    cameras.forEach((cam, index) => {
      // สร้าง array ของ labels ตามลำดับ timeRanges
      const labels = timeRanges.map(range => `${range.start} - ${range.end}`);
      // สร้าง array ของค่าจำนวนคน
      const seriesData = labels.map(label => chartDataByCamera[cam][label]);
  
      // ตั้งค่ากราฟ
      const options = {
        series: [{
          name: 'จำนวนคน',
          data: seriesData
        }],
        chart: {
          type: 'bar',
          height: 300,
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val;
          },
          offsetX: 0,
          style: {
            fontSize: '12px'
          }
        },
        xaxis: {
          title: {
            text: 'จำนวนคน'
          }
        },
        yaxis: {
          categories: labels,  // เรียงตาม timeRanges
          title: {
            text: 'ช่วงเวลา'
          }
        },
        title: {
          text: `กล้อง ${cam}`,
          align: 'center'
        }
      };
  
      // เลือก container ของกราฟ (horizontal-bar-chart-1..4)
      const containerId = `#horizontal-bar-chart-${index + 1}`;
      const chartEl = document.querySelector(containerId);
      if (!chartEl) {
        console.error("ไม่พบ container สำหรับ", containerId);
        return;
      }
  
      // สร้างกราฟใหม่
      const chart = new ApexCharts(chartEl, options);
      chart.render();
    });
  }
  

  