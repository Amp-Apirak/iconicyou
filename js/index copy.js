// ==========================================
// ส่วนกำหนดตัวแปรและค่าคงที่ (Global Variables / Constants)
// ==========================================

// กำหนดตัวแปรสำหรับเก็บ instance ของกราฟ
let timeSeriesChart = null;
let cameraPieChart = null;
let barChart = null;
// เก็บ instance ของกราฟแท่งแนวนอน
let horizontalBarCharts = [null, null, null, null];

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

// ตัวแปรควบคุมการแสดง debug
const SHOW_DEBUG = true;

// ==========================================
// ส่วนฟังก์ชันสำหรับแสดง/ซ่อน Loading Overlay
// ==========================================

/**
 * แสดง Loading overlay ขณะมีการโหลดข้อมูล
 */
function showLoading() {
  debug("แสดง Loading overlay");
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
  debug("ซ่อน Loading overlay");
  const loading = document.getElementById("loading-overlay");
  if (loading) {
    loading.remove();
  }
}

// ==========================================
// ส่วนฟังก์ชันสำหรับ Debug
// ==========================================

/**
 * แสดงข้อความ debug ใน console
 * @param {string} message - ข้อความที่ต้องการแสดง
 * @param {any} data - ข้อมูลที่ต้องการแสดง (ถ้ามี)
 */
function debug(message, data = null) {
  if (!SHOW_DEBUG) return;

  if (data) {
    console.log(`[DEBUG] ${message}:`, data);
  } else {
    console.log(`[DEBUG] ${message}`);
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

  // สำหรับทุกกรณี กำหนดให้ endDate เป็นวันพรุ่งนี้
  if (range === "today") {
    startDate.setDate(today.getDate() + 1);
    endDate.setDate(today.getDate() + 2); // วันสิ้นสุดเป็นวันพรุ่งนี้
  } else {
    endDate.setHours(23, 59, 59, 999); // ตั้งเวลาเป็น 23:59:59.999 สำหรับกรณีอื่นๆ
  }

  switch (range) {
    case "today":
      // ไม่มีการเปลี่ยนแปลง startDate, endDate ปรับไว้ข้างบนแล้ว
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
    case "custom":
      // ไม่มีการคำนวณสำหรับ custom นำวันที่จาก input มาใช้โดยตรง
      break;
  }

  debug(`คำนวณช่วงวันที่ ${range}:`, {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  });

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
    debug("เริ่มโหลดข้อมูลกล้องและโซน");
    // อ่านค่า compute_id จาก select (หน้าเว็บ)
    const computeId = document.querySelector("#compute_id").value;

    // เรียก API analytics/ ด้วย compute_id และ limit มากพอ (1000) เพื่อดึงข้อมูลทั้งหมด
    const url = `${API_BASE_URL}/analytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
    debug("API URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status})`);
    }

    // แปลงข้อมูลที่ได้จาก API เป็นรูปแบบ JSON
    const data = await response.json();
    debug("ได้รับข้อมูลจาก API", data.length + " รายการ");

    if (!Array.isArray(data)) {
      debug("ข้อมูลที่ได้ไม่ใช่ array");
      return;
    }

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
          item.data.analyticsResult.objsInfo.forEach((obj) => {
            if (obj && obj.roiName) {
              const zoneName = obj.roiName.replace("Zone:", "").trim();
              zoneSet.add(zoneName);
            }
          });
        }
        // กรณีมี objsInfo เป็น Object
        else if (
          item.data.analyticsResult.objsInfo &&
          item.data.analyticsResult.objsInfo.roiName
        ) {
          const zoneName = item.data.analyticsResult.objsInfo.roiName
            .replace("Zone:", "")
            .trim();
          zoneSet.add(zoneName);
        }
      }
    });

    debug("รายชื่อกล้องที่พบ:", Array.from(cameraSet));
    debug("โซนที่พบ:", Array.from(zoneSet));

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
    alert("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้: " + error.message);
  }
}

// ==========================================
// ส่วนฟังก์ชันโหลดข้อมูลตามฟอร์ม (loadData)
// ==========================================

/**
 * โหลดข้อมูลการวิเคราะห์ตามเงื่อนไขในฟอร์ม
 * (compute_id, source_name, date_range)
 * @param {boolean} isRealtime - ใช้สำหรับบอกว่าเป็นการโหลดแบบ realtime หรือไม่
 * @returns {Promise} - Promise ที่จะ resolve เมื่อโหลดข้อมูลเสร็จ
 */
async function loadData(isRealtime = false) {
  return new Promise(async (resolve, reject) => {
    try {
      // แสดง loading เฉพาะกรณีไม่ใช่ realtime update
      if (!isRealtime) {
        showLoading();
      }

      debug("เริ่มโหลดข้อมูลตามเงื่อนไข" + (isRealtime ? " (realtime)" : ""));

      const form = document.getElementById("search-form");
      if (!form) {
        throw new Error("ไม่พบฟอร์มค้นหา");
      }

      const formData = new FormData(form);

      // ถ้า compute_id ไม่ได้เลือกใดๆ ให้ default = 7 (People Counting)
      const computeId = formData.get("compute_id") || 7;

      // เริ่มสร้าง URL สำหรับเรียก API /getAnalytics
      let url = `${API_BASE_URL}/getAnalytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
      const params = new URLSearchParams();

      // source_name (กล้อง)
      if (formData.get("source_name")) {
        params.append("source_name", formData.get("source_name"));
      }

      // date_range
      const dateRange = formData.get("date_range") || "today"; // ถ้าไม่มีค่าให้ใช้ "today"

      // สำหรับ date_range ที่ไม่ใช่ custom
      if (dateRange !== "custom") {
        const dates = calculateDates(dateRange);
        params.set("start_date", dates.startDate);
        params.set("end_date", dates.endDate);

        // กำหนดค่าให้กับ input ในฟอร์มด้วย
        const startDateInput = form.querySelector('input[name="start_date"]');
        const endDateInput = form.querySelector('input[name="end_date"]');
        if (startDateInput) startDateInput.value = dates.startDate;
        if (endDateInput) endDateInput.value = dates.endDate;
      } else {
        // custom date
        let sDate = formData.get("start_date");
        let eDate = formData.get("end_date");

        // ถ้าไม่มีค่าให้ใช้วันปัจจุบันและวันถัดไป
        if (!sDate || !eDate) {
          const today = calculateDates("today");
          sDate = today.startDate;
          eDate = today.endDate;

          // กำหนดค่าให้กับ input ในฟอร์มด้วย
          const startDateInput = form.querySelector('input[name="start_date"]');
          const endDateInput = form.querySelector('input[name="end_date"]');
          if (startDateInput) startDateInput.value = sDate;
          if (endDateInput) endDateInput.value = eDate;
        }

        params.set("start_date", sDate);
        params.set("end_date", eDate);
      }

      // เก็บพารามิเตอร์ปัจจุบันสำหรับ realtime
      currentSearchParams = params.toString();

      // ต่อพารามิเตอร์ใน URL
      if (currentSearchParams) {
        url += `&${currentSearchParams}`;
      }

      debug("API URL สำหรับข้อมูล:", url);

      // เรียก API และตรวจสอบผลลัพธ์
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status}): ${response.statusText}`
          );
        }

        // บันทึก response text เพื่อใช้ debug กรณีมีปัญหา
        const responseText = await response.text();

        let data;
        try {
          // พยายามแปลง JSON
          data = JSON.parse(responseText);
        } catch (parseError) {
          debug("ไม่สามารถแปลง response เป็น JSON ได้:", responseText);
          throw new Error(
            `ไม่สามารถแปลงข้อมูลจาก API เป็น JSON ได้: ${parseError.message}`
          );
        }

        debug(
          "ได้รับข้อมูลจาก API",
          (Array.isArray(data) ? data.length : 0) + " รายการ"
        );

        if (!Array.isArray(data)) {
          debug("ข้อมูลที่ได้ไม่ใช่ array:", data);
          displayNoData();
          resolve(); // ถึงแม้ไม่ใช่ array ก็ถือว่าเสร็จสิ้นการทำงาน
          return;
        }

        if (data.length === 0) {
          debug("ไม่พบข้อมูล");
          displayNoData();
          resolve(); // ถึงแม้ไม่พบข้อมูล ก็ถือว่าเสร็จสิ้นการทำงาน
          return;
        }

        // บันทึกข้อมูลล่าสุด
        currentData = data;

        // ส่งต่อไปอัปเดต Dashboard
        updateDashboard(data, isRealtime);

        // ทำงานเสร็จสมบูรณ์
        resolve();
      } catch (fetchError) {
        debug("เกิดข้อผิดพลาดในการเรียก API:", fetchError);
        // แสดงข้อความว่าไม่พบข้อมูล แทนที่จะแสดงข้อผิดพลาด
        displayNoData(fetchError.message);
        resolve(); // ให้ Promise resolve ถึงแม้จะมีข้อผิดพลาด
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (!isRealtime) {
        alert(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`);
      }
      displayNoData(error.message);
      resolve(); // ให้ Promise resolve ถึงแม้จะมีข้อผิดพลาด
    } finally {
      if (!isRealtime) {
        hideLoading();
      }
    }
  });
}

/**
 * แสดงข้อความเมื่อไม่พบข้อมูล
 * @param {string} errorMessage - ข้อความข้อผิดพลาดที่ต้องการแสดง (ถ้ามี)
 */
function displayNoData(errorMessage = null) {
  debug("แสดงข้อความไม่พบข้อมูล" + (errorMessage ? `: ${errorMessage}` : ""));

  // ล้างกราฟทั้งหมด
  if (timeSeriesChart) {
    timeSeriesChart.updateOptions({
      series: [{ data: [] }],
    });
  }

  if (cameraPieChart) {
    cameraPieChart.updateOptions({
      series: [],
      labels: [],
    });
  }

  if (barChart) {
    barChart.updateOptions({
      series: [{ data: [] }],
      xaxis: { categories: [] },
    });
  }

  // ล้างกราฟแท่งแนวนอน
  horizontalBarCharts.forEach((chart, index) => {
    if (chart) {
      // ถ้ามีกราฟอยู่แล้ว ให้ล้างข้อมูล
      chart.updateOptions({
        series: [{ data: [] }],
      });
    }
  });

  // แสดงข้อความไม่พบข้อมูล
  const chartContainers = document.querySelectorAll(".chart-container");
  chartContainers.forEach((element) => {
    // เช็คว่ามีข้อความไม่พบข้อมูลอยู่แล้วหรือไม่
    if (!element.querySelector(".no-data")) {
      const noDataDiv = document.createElement("div");
      noDataDiv.className = "no-data";
      noDataDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i>
        <div class="no-data-text">${
          errorMessage ? `ข้อผิดพลาด: ${errorMessage}` : "ไม่พบข้อมูล"
        }</div>
      `;
      element.appendChild(noDataDiv);
    }
  });

  // ล้างข้อมูลสถิติ
  document.getElementById("total-people").textContent = "0";
  document.getElementById("total-cameras").textContent = "0";
  document.getElementById("total-zones").textContent = "0";
}

// ==========================================
// ส่วนฟังก์ชัน Realtime Update (startRealtimeUpdate)
// ==========================================

/**
 * เริ่มการอัปเดตข้อมูลแบบ Realtime
 */
function startRealtimeUpdate() {
  debug("เริ่มการอัปเดตแบบ Realtime");

  // หยุด interval เดิมถ้ามี
  stopRealtimeUpdate();

  // เปิดสถานะ realtime
  document.getElementById("realtime-status").style.display = "inline-block";

  // เริ่ม interval ใหม่
  realtimeInterval = setInterval(() => {
    loadData(true);
  }, REALTIME_UPDATE_INTERVAL);
}

/**
 * หยุดการอัปเดตข้อมูลแบบ Realtime
 */
function stopRealtimeUpdate() {
  debug("หยุดการอัปเดตแบบ Realtime");

  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }

  // ปิดสถานะ realtime
  document.getElementById("realtime-status").style.display = "none";
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
  try {
    debug("อัปเดต Dashboard" + (isRealtime ? " (realtime)" : ""));

    // ตรวจสอบว่า data เป็น array หรือไม่
    if (!Array.isArray(data)) {
      console.error("ข้อมูลที่ได้รับไม่ใช่ array:", data);
      displayNoData();
      return;
    }

    // ลบข้อความไม่พบข้อมูลและข้อผิดพลาดถ้ามี
    const noDataElements = document.querySelectorAll(".no-data");
    noDataElements.forEach((element) => element.remove());

    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => element.remove());

    // 1) อัปเดตกราฟเส้น (Time Series Chart)
    try {
      updateTimeSeriesChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟเส้น:", error);
    }

    // 2) อัปเดตกราฟวงกลม (Pie Chart)
    try {
      updatePieChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟวงกลม:", error);
    }

    // 3) สร้างและอัปเดตกราฟแท่ง (Bar Chart) แสดงข้อมูลตาม Zone
    try {
      updateBarChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่ง:", error);
    }

    // 4) อัปเดตกราฟแท่งแนวนอน (Horizontal Bar Charts)
    try {
      updateHorizontalBarCharts(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่งแนวนอน:", error);
    }

    // 5) อัปเดตตัวเลขสถิติ
    try {
      updateStats(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถิติ:", error);
    }

    // 6) อัปเดตเวลาล่าสุด
    updateLastUpdatedTime();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต Dashboard:", error);
    if (!isRealtime) {
      // แจ้งเตือนผู้ใช้เฉพาะกรณีไม่ใช่ realtime
      alert(`เกิดข้อผิดพลาดในการอัปเดต Dashboard: ${error.message}`);
    }
  }
}

/**
 * อัปเดตเวลาล่าสุดที่มีการอัปเดตข้อมูล
 */
function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("th-TH");
  const lastUpdatedElement = document.getElementById("last-updated-time");

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
 * - จำนวนโซน (totalZones)
 * และแสดงผลใน HTML
 * @param {Array} data - ข้อมูล array ที่ได้จาก API
 */
function updateStats(data) {
  // ประกาศตัวแปรสำหรับเก็บผลรวมและนับจำนวน
  let totalPeople = 0; // จำนวนคนทั้งหมด
  let cameraSet = new Set(); // เก็บชื่อกล้องไม่ให้ซ้ำ

  // วนลูป data เพื่อสรุปค่า
  data.forEach((item) => {
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

  debug("อัปเดตสถิติเรียบร้อย", {
    totalPeople,
    cameras: cameraSet.size,
  });
}

// ==========================================
// ส่วนฟังก์ชันอัปเดตกราฟเส้น (Time Series Chart)
// ==========================================

/**
 * สร้าง/อัปเดตกราฟเส้น (Area Chart) แสดงจำนวนตามเวลา
 * @param {Array} data - ข้อมูลจาก API
 */
function updateTimeSeriesChart(data) {
  try {
    debug("อัปเดตกราฟเส้น Time Series");

    // ตรวจสอบว่าข้อมูลที่ได้รับมาถูกต้องหรือไม่
    if (!Array.isArray(data) || data.length === 0) {
      debug("ไม่พบข้อมูลสำหรับกราฟเส้น");

      // หากมีกราฟอยู่แล้ว ให้ล้างข้อมูล
      if (timeSeriesChart) {
        timeSeriesChart.updateOptions({
          series: [{ data: [] }],
        });
      }

      return;
    }

    // เรียงลำดับข้อมูลตามเวลา
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a?.time || 0);
      const timeB = new Date(b?.time || 0);
      return timeA - timeB;
    });

    // แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสมกับ ApexCharts
    const chartData = sortedData
      .map((item) => {
        // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
        if (!item || !item.time || !item.data || !item.data.analyticsResult) {
          return null; // ข้ามข้อมูลที่ไม่ครบถ้วน
        }

        const time = new Date(item.time).getTime();
        const cnt = item.data.analyticsResult.cnt || 0;

        return {
          x: time,
          y: cnt,
        };
      })
      .filter((item) => item !== null); // กรองข้อมูลที่เป็น null ออก

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
            reset: true,
          },
        },
        animations: {
          enabled: true,
        },
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
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          format: "dd/MM/yy HH:mm",
        },
        title: {
          text: "เวลา",
        },
      },
      yaxis: {
        title: {
          text: "จำนวนคน",
        },
        min: 0,
        forceNiceScale: true,
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
        y: {
          formatter: function (value) {
            return value + " คน";
          },
        },
      },
      colors: ["#0d6efd"],
      title: {
        text: "จำนวนคนตามช่วงเวลา",
        align: "center",
      },
      noData: {
        text: "ไม่พบข้อมูล",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
      },
    };

    const chartEl = document.querySelector("#time-series-chart");
    if (!chartEl) {
      debug("ไม่พบ element #time-series-chart");
      return;
    }

    if (timeSeriesChart) {
      // ถ้ามีกราฟอยู่แล้ว ให้อัปเดตข้อมูล
      timeSeriesChart.updateOptions(options);
    } else {
      // สร้างกราฟใหม่
      debug("สร้างกราฟเส้นใหม่");
      timeSeriesChart = new ApexCharts(chartEl, options);
      timeSeriesChart.render();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟเส้น:", error);

    // แสดงข้อความข้อผิดพลาดในกราฟ
    const chartEl = document.querySelector("#time-series-chart");
    if (chartEl) {
      if (!chartEl.querySelector(".error-message")) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill"></i>
            เกิดข้อผิดพลาดในการแสดงกราฟ: ${error.message}
          </div>
        `;
        chartEl.appendChild(errorDiv);
      }
    }
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
  debug("อัปเดตกราฟวงกลม Pie Chart");

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
        show: true,
      },
    },
    labels,
    colors: [
      "#0d6efd",
      "#20c997",
      "#ffc107",
      "#dc3545",
      "#6610f2",
      "#fd7e14",
      "#0dcaf0",
      "#198754",
      "#6c757d",
      "#d63384",
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      formatter: function (seriesName, opts) {
        return (
          seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + " คน"
        );
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return value + " คน";
        },
      },
    },
    title: {
      text: "สัดส่วนจำนวนคนตามกล้อง",
      align: "center",
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
              formatter: function (w) {
                return (
                  w.globals.seriesTotals.reduce((a, b) => a + b, 0) + " คน"
                );
              },
            },
          },
        },
      },
    },
  };

  const pieEl = document.querySelector("#camera-pie-chart");
  if (!pieEl) {
    debug("ไม่พบ element #camera-pie-chart");
    return;
  }

  try {
    if (cameraPieChart) {
      cameraPieChart.updateOptions(options);
    } else {
      debug("สร้างกราฟวงกลมใหม่");
      cameraPieChart = new ApexCharts(pieEl, options);
      cameraPieChart.render();
    }
  } catch (error) {
    console.error("Error updating pie chart:", error);
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
  debug("อัปเดตกราฟแท่ง Bar Chart");

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
    const hourKey = `${hour.toString().padStart(2, "0")}:00`;

    // สร้างโครงสร้างข้อมูลถ้ายังไม่มี
    if (!hourCameraData[hourKey]) {
      hourCameraData[hourKey] = {};
    }

    // รวมจำนวนคนตามชั่วโมงและกล้อง
    hourCameraData[hourKey][cameraName] =
      (hourCameraData[hourKey][cameraName] || 0) + cnt;
  });

  // แปลงเป็น array ของชั่วโมงและเรียงตามเวลา
  const hourKeys = Object.keys(hourCameraData).sort((a, b) => {
    // เรียงตามชั่วโมง
    const hourA = parseInt(a.split(":")[0]);
    const hourB = parseInt(b.split(":")[0]);
    return hourA - hourB;
  });

  // แปลงชื่อกล้องเป็น array
  const cameraNames = Array.from(cameraSet);

  // สร้าง series สำหรับแต่ละกล้อง
  const series = cameraNames.map((camera) => {
    return {
      name: camera,
      data: hourKeys.map((hour) => hourCameraData[hour][camera] || 0),
    };
  });

  const options = {
    series: series,
    chart: {
      type: "bar",
      height: 400,
      toolbar: {
        show: true,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val > 0 ? val : "";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: hourKeys,
      title: {
        text: "ช่วงเวลา (ชั่วโมง)",
      },
    },
    yaxis: {
      title: {
        text: "จำนวนคน",
      },
      min: 0,
    },
    fill: {
      opacity: 1,
    },
    title: {
      text: "จำนวนคนตามช่วงเวลารายชั่วโมงแยกตามกล้อง",
      align: "center",
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " คน";
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    colors: [
      "#0d6efd",
      "#20c997",
      "#ffc107",
      "#dc3545",
      "#6610f2",
      "#fd7e14",
      "#0dcaf0",
      "#198754",
    ],
  };

  const barEl = document.querySelector("#bar-chart");
  if (!barEl) {
    debug("ไม่พบ element #bar-chart");
    return;
  }

  try {
    if (barChart) {
      barChart.updateOptions(options);
    } else {
      debug("สร้างกราฟแท่งใหม่");
      barChart = new ApexCharts(barEl, options);
      barChart.render();
    }
  } catch (error) {
    console.error("Error updating bar chart:", error);
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

// ===============================
// ฟังก์ชันสำหรับกราฟแท่งแนวนอน (Horizontal Bar Charts)
// ===============================

/**
 * ฟังก์ชันสำหรับอัปเดตกราฟแท่งแนวนอน (Horizontal Bar Charts)
 * โดยแสดงข้อมูลจำนวนคนตามช่วงเวลาสำหรับแต่ละกล้อง โดยใช้ข้อมูลจาก API เท่านั้น
 * @param {Array} data - ข้อมูลจาก API
 */
function updateHorizontalBarCharts(data) {
  debug("อัปเดตกราฟแท่งแนวนอน (ใช้ข้อมูลจาก API เท่านั้น)");

  // ดึงชื่อกล้องจริงจากข้อมูล API
  const cameraSet = new Set();
  data.forEach((item) => {
    if (item?.data?.sourceName) {
      cameraSet.add(item.data.sourceName);
    }
  });

  // แปลงเป็น array ของกล้องทั้งหมด
  let cameras = Array.from(cameraSet);

  // ถ้าไม่มีข้อมูลกล้อง ให้แสดงข้อความว่าไม่พบข้อมูล
  if (cameras.length === 0) {
    debug("ไม่พบข้อมูลกล้อง");

    // ลบกราฟเดิมทั้งหมด (ถ้ามี)
    horizontalBarCharts.forEach((chart, index) => {
      if (chart) {
        chart.updateOptions({
          series: [{ data: [] }],
          xaxis: { categories: [] },
        });

        // แสดงข้อความไม่พบข้อมูล
        const containerId = `#horizontal-bar-chart-${index + 1}`;
        const chartEl = document.querySelector(containerId);
        if (chartEl) {
          // เช็คว่ามีข้อความไม่พบข้อมูลอยู่แล้วหรือไม่
          if (!chartEl.querySelector(".no-data")) {
            const noDataDiv = document.createElement("div");
            noDataDiv.className = "no-data";
            noDataDiv.innerHTML = `
              <i class="bi bi-exclamation-triangle"></i>
              <div class="no-data-text">ไม่พบข้อมูลกล้อง</div>
            `;
            chartEl.appendChild(noDataDiv);
          }
        }
      }
    });

    return;
  }

  // กำหนดช่วงเวลาที่ต้องการวิเคราะห์ (24 ชั่วโมง แบ่งเป็นช่วงๆ ละ 3 ชั่วโมง)
  const timeRanges = [
    "00:00 - 03:00",
    "03:00 - 06:00",
    "06:00 - 09:00",
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00",
    "21:00 - 00:00",
  ];

  // แปลงช่วงเวลาเป็นชั่วโมงเริ่มต้นและสิ้นสุดเพื่อใช้ในการเปรียบเทียบ
  const timeRangeHours = timeRanges.map((range) => {
    const [start, end] = range.split(" - ");
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);
    return { startHour, endHour };
  });

  // แสดงกราฟเฉพาะ 4 กล้องแรก
  const cameraLimit = Math.min(cameras.length, 4);

  // วนลูปสร้างข้อมูลสำหรับแต่ละกล้อง
  for (let index = 0; index < cameraLimit; index++) {
    const cam = cameras[index];

    // ข้อมูลที่จะใช้ในการแสดงกราฟ
    const seriesData = Array(timeRanges.length).fill(0);

    // กรองข้อมูลเฉพาะของกล้องนี้
    const cameraData = data.filter((item) => item?.data?.sourceName === cam);

    // ประมวลผลข้อมูลตามช่วงเวลา
    cameraData.forEach((item) => {
      if (item?.time && item?.data?.analyticsResult?.cnt) {
        const time = new Date(item.time);
        const hour = time.getHours();
        const count = item.data.analyticsResult.cnt;

        // หาว่าชั่วโมงนี้อยู่ในช่วงเวลาใด
        for (let i = 0; i < timeRangeHours.length; i++) {
          const { startHour, endHour } = timeRangeHours[i];

          // ตรวจสอบว่าอยู่ในช่วงเวลานี้หรือไม่
          if (
            (startHour < endHour && hour >= startHour && hour < endHour) ||
            (startHour > endHour && (hour >= startHour || hour < endHour)) // กรณีข้ามวัน เช่น 21:00 - 00:00
          ) {
            seriesData[i] += count;
            break;
          }
        }
      }
    });

    // ตั้งค่ากราฟใหม่
    const options = {
      series: [
        {
          name: "จำนวนคน",
          data: seriesData,
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: "right",
          },
          barHeight: "75%",
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#000"],
        },
        formatter: function (val) {
          return val;
        },
        offsetX: 0,
      },
      xaxis: {
        categories: timeRanges,
        title: {
          text: "จำนวนคน",
        },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            fontSize: "12px",
          },
        },
        title: {
          text: "ช่วงเวลา",
        },
      },
      title: {
        text: `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : ${cam}`,
        align: "center",
      },
      tooltip: {
        shared: false,
        x: {
          formatter: function (val) {
            return val;
          },
        },
        y: {
          formatter: function (val) {
            return val + " คน";
          },
        },
      },
      colors: ["#0d6efd"],
      noData: {
        text: "ไม่พบข้อมูล",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
      },
    };

    // เลือก container ของกราฟ
    const containerId = `#horizontal-bar-chart-${index + 1}`;
    const chartEl = document.querySelector(containerId);

    // ลบข้อความไม่พบข้อมูล (ถ้ามี) เพราะตอนนี้มีข้อมูลแล้ว
    const noDataEl = chartEl?.querySelector(".no-data");
    if (noDataEl) {
      noDataEl.remove();
    }

    // อัปเดตชื่อกล้องในหัวข้อการ์ด
    const cardHeader = chartEl
      ?.closest(".card")
      ?.querySelector(".card-header .card-title");
    if (cardHeader) {
      cardHeader.textContent = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : ${cam}`;
    }

    if (!chartEl) {
      debug(`ไม่พบ element ${containerId}`);
      continue;
    }

    try {
      // ตรวจสอบว่ามีกราฟอยู่แล้วหรือไม่
      if (horizontalBarCharts[index]) {
        // อัปเดตกราฟที่มีอยู่แล้ว
        horizontalBarCharts[index].updateOptions(options);
      } else {
        // สร้างกราฟใหม่
        debug(`สร้างกราฟแท่งแนวนอนใหม่ ${index + 1}`);
        horizontalBarCharts[index] = new ApexCharts(chartEl, options);
        horizontalBarCharts[index].render();
      }
    } catch (error) {
      console.error(`Error updating horizontal bar chart ${index + 1}:`, error);
    }
  }

  // ลบกราฟที่เกินจำนวนกล้องที่มี
  for (let i = cameraLimit; i < 4; i++) {
    if (horizontalBarCharts[i]) {
      const containerId = `#horizontal-bar-chart-${i + 1}`;
      const chartEl = document.querySelector(containerId);

      // แสดงข้อความไม่พบข้อมูล
      if (chartEl) {
        horizontalBarCharts[i].updateOptions({
          series: [{ data: [] }],
        });

        if (!chartEl.querySelector(".no-data")) {
          const noDataDiv = document.createElement("div");
          noDataDiv.className = "no-data";
          noDataDiv.innerHTML = `
          <i class="bi bi-exclamation-triangle"></i>
          <div class="no-data-text">ไม่พบข้อมูลกล้อง</div>
        `;
          chartEl.appendChild(noDataDiv);
        }

        // อัปเดตหัวข้อการ์ด
        const cardHeader = chartEl
          .closest(".card")
          ?.querySelector(".card-header .card-title");
        if (cardHeader) {
          cardHeader.textContent = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : ไม่พบข้อมูล`;
        }
      }
    }
  }
}

// ==========================================
// ส่วนการทำงานเมื่อหน้าเว็บโหลดเสร็จ (DOMContentLoaded)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  debug("หน้าเว็บโหลดเสร็จสมบูรณ์");

  // 1) ตั้งค่าเริ่มต้นสำหรับวันที่
  const form = document.getElementById("search-form");
  const dateRangeSelect = document.getElementById("date_range");
  const computeIdSelect = document.getElementById("compute_id");
  const sourceNameSelect = document.getElementById("source_name");

  // ตั้งค่า default เป็น today
  if (dateRangeSelect) {
    dateRangeSelect.value = "today";
  }

  // ตั้งค่า compute_id เป็น People Counting (7) เป็นค่าเริ่มต้น
  if (computeIdSelect) {
    computeIdSelect.value = "7"; // 7 = People Counting
  }

  // ตั้งค่ากล้องเป็น "ทั้งหมด"
  if (sourceNameSelect) {
    sourceNameSelect.value = ""; // ทั้งหมด
  }

  // ตั้งค่าวันที่เริ่มต้นและวันที่สิ้นสุดตามวันปัจจุบัน
  const today = calculateDates("today");
  const startDateInput = form.querySelector('input[name="start_date"]');
  const endDateInput = form.querySelector('input[name="end_date"]');

  if (startDateInput) startDateInput.value = today.startDate;
  if (endDateInput) endDateInput.value = today.endDate;

  // 2) โหลดรายชื่อกล้อง/โซนครั้งแรก
  loadCamerasAndZones();

  // 3) หาก compute_id เปลี่ยน ให้โหลดรายชื่อกล้อง/โซนใหม่
  document.getElementById("compute_id").addEventListener("change", () => {
    loadCamerasAndZones();
  });

  // 4) ผูก event เมื่อมีการ submit form (กดปุ่มค้นหา)
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();

    // หยุด realtime update ชั่วคราว และเริ่มใหม่หลังจากโหลดข้อมูล
    stopRealtimeUpdate();

    // โหลดข้อมูลตามเงื่อนไขการค้นหา
    loadData().then(() => {
      // เริ่ม realtime update หลังจากโหลดข้อมูลเสร็จ
      startRealtimeUpdate();
    });
  });

  // 5) ผูก event การเปลี่ยน date range
  document
    .getElementById("date_range")
    .addEventListener("change", toggleDateFields);

  // 6) ผูก event ปุ่ม realtime
  const realtimeToggle = document.getElementById("realtime-toggle");
  if (realtimeToggle) {
    // เปิด Realtime เป็นค่าเริ่มต้น
    realtimeToggle.checked = true;

    realtimeToggle.addEventListener("change", function () {
      if (this.checked) {
        startRealtimeUpdate();
      } else {
        stopRealtimeUpdate();
      }
    });
  }

  // 7) แสดง/ซ่อนฟิลด์วันที่แบบ custom ตามค่าเริ่มต้น
  toggleDateFields();

  // 8) โหลดข้อมูลครั้งแรกทันที
  loadData().then(() => {
    // 9) เริ่ม Realtime update หลังจากโหลดข้อมูลครั้งแรกเสร็จ
    startRealtimeUpdate();
  });
});

// ==========================================
// ส่วนการทำงานเมื่อหน้าเว็บโหลดเสร็จสมบูรณ์ (window.onload)
// ==========================================

window.addEventListener("load", function () {
  debug("หน้าเว็บและทรัพยากรทั้งหมดโหลดเสร็จสมบูรณ์");

  // ซ่อน Loading เมื่อโหลดเสร็จทั้งหมด
  hideLoading();
});
