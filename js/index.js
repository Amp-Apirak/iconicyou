// index.js สำหรับ ICONIC YOU Dashboard (ปรับปรุงเพื่อใช้เฉพาะ label = "person")

// ตัวแปรสำหรับเก็บ instance ของกราฟ
// เก็บตัวแปรสำหรับกราฟแต่ละประเภทเพื่อใช้ในการอัปเดตและแสดงผล
let timeSeriesChart = null;
let cameraPieChart = null;
let barChart = null;
let horizontalBarCharts = [null, null, null, null];
let activityDurationChart = null;
let activityCharts = [null, null, null, null];

// URL หลักของ API
// กำหนด URL หลักสำหรับเรียกข้อมูลจากเซิร์ฟเวอร์ API
const API_BASE_URL = "https://iconicyou-api.pointit.co.th";

// จำนวนข้อมูลที่ดึงจาก API (Fix ที่ 1000 รายการ)
// จำกัดจำนวนข้อมูลที่ดึงจาก API เพื่อป้องกันการโหลดข้อมูลมากเกินไป
const FIXED_LIMIT = 100;

// Interval สำหรับ Realtime Update
// ตัวแปรสำหรับจัดการการอัปเดตข้อมูลแบบเรียลไทม์
let realtimeInterval = null;
const REALTIME_UPDATE_INTERVAL = 30000; // อัปเดตทุก 30 วินาที

// ตัวแปรเก็บข้อมูลล่าสุด
// เก็บข้อมูลปัจจุบันที่ดึงจาก API เพื่อใช้ใน Dashboard
let currentData = [];
let currentSearchParams = null;

// ตัวแปรควบคุมการแสดง Debug
// เปิด/ปิดการแสดงข้อมูล Debug ใน Console
const SHOW_DEBUG = true; // เปิด Debug เพื่อตรวจสอบปัญหา

// Mapping ชื่อกล้อง -> สี
// กำหนดสีสำหรับแต่ละกล้องให้สอดคล้องกับกราฟอื่นๆ ใน Dashboard
const cameraColorMap = {
  "ICONIC-01": "#0d6efd", // สีฟ้า (โซน 1)
  "ICONIC-02": "#20c997", // สีเขียวมิ้นต์
  "ICONIC-03": "#ffc107", // สีเหลือง
  "ICONIC-04": "#dc3545", // สีแดง
};

// ฟังก์ชันดึงสีของกล้อง
// ใช้เพื่อกำหนดสีของกราฟตามชื่อกล้องที่เลือก
function getCameraColor(cameraName) {
  return cameraColorMap[cameraName] || "#999999";
}

// ฟังก์ชันแสดง/ซ่อน Loading Overlay
// แสดงหรือซ่อนหน้าจอ Loading เมื่อโหลดข้อมูล
function showLoading() {
  // ตรวจสอบว่า Loading Overlay ยังไม่ถูกสร้าง
  if (document.getElementById("loading-overlay")) return;
  const loading = document.createElement("div");
  loading.id = "loading-overlay";
  loading.innerHTML = `
    <div class="spinner-wrapper">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <div class="loading-text">กำลังโหลดข้อมูล...</div>
    </div>
  `;
  document.body.appendChild(loading);
}

function hideLoading() {
  // ลบ Loading Overlay ออกจาก DOM เมื่อโหลดเสร็จ
  const loading = document.getElementById("loading-overlay");
  if (loading) loading.remove();
}

// ฟังก์ชัน Debug
// ใช้สำหรับแสดงข้อมูล Debug ใน Console หากเปิดใช้งาน
function debug(message, data = null) {
  if (!SHOW_DEBUG) return;
  if (data) console.log(`[DEBUG] ${message}:`, data);
  else console.log(`[DEBUG] ${message}`);
}

// ฟังก์ชันคำนวณวันที่
// คำนวณช่วงวันที่ตามตัวเลือกในฟอร์ม (เช่น วันนี้, เมื่อวาน, 7 วันล่าสุด)
function calculateDates(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let startDate = new Date(today);
  let endDate = new Date(today);

  // ถ้าเป็น "วันนี้" ให้ตั้งวันที่สิ้นสุดเป็นวันถัดไป
  if (range === "today") {
    startDate.setDate(today.getDate() + 1);
    endDate.setDate(today.getDate() + 2);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  switch (range) {
    case "today":
      break;
    case "yesterday":
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last7days":
      startDate.setDate(today.getDate() - 6);
      break;
    case "last30days":
      startDate.setDate(today.getDate() - 29);
      break;
    case "custom":
      break;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

// ฟังก์ชันโหลดข้อมูลกล้องและโซน
// ดึงข้อมูลกล้องและโซนจาก API เพื่อใช้ใน Dropdown
async function loadCamerasAndZones() {
  try {
    debug("เริ่มโหลดข้อมูลกล้องและโซน");
    const computeId = document.querySelector("#compute_id").value;

    const url = `${API_BASE_URL}/analytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
    debug("API URL:", url);

    const response = await fetchWithTimeout(url, 5000); // Timeout 5 วินาที
    if (!response.ok)
      throw new Error(`ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status})`);

    const data = await response.json();
    debug("ได้รับข้อมูลจาก API", data.length + " รายการ");

    if (!Array.isArray(data)) {
      debug("ข้อมูลจาก API ไม่ใช่ array");
      throw new Error("ข้อมูลจาก API ไม่ถูกต้อง");
    }

    const cameraSet = new Set();
    const zoneSet = new Set();

    data.forEach((item) => {
      if (item && item.data && item.data.sourceName)
        cameraSet.add(item.data.sourceName);
      if (item && item.data && item.data.analyticsResult) {
        if (Array.isArray(item.data.analyticsResult.objsInfo)) {
          item.data.analyticsResult.objsInfo.forEach((obj) => {
            if (obj && obj.roiName)
              zoneSet.add(obj.roiName.replace("Zone:", "").trim());
          });
        } else if (item.data.analyticsResult.objsInfo?.roiName) {
          zoneSet.add(
            item.data.analyticsResult.objsInfo.roiName
              .replace("Zone:", "")
              .trim()
          );
        }
      }
    });

    // เก็บข้อมูลกล้องทั้งหมดจาก API
    const allCameras = Array.from(cameraSet).filter(
      (cam) => cam && cameraColorMap.hasOwnProperty(cam)
    );
    debug("กล้องทั้งหมดจาก API:", allCameras);

    const selectCamera = document.getElementById("source_name");
    if (selectCamera) {
      selectCamera.innerHTML = '<option value="">ทั้งหมด</option>';
      allCameras.forEach((cam) => {
        selectCamera.innerHTML += `<option value="${cam}">${cam}</option>`;
      });
    }

    // อัปเดต Dropdown ของ Time Series Chart ด้วยข้อมูลกล้องทั้งหมด
    updateCameraSelect(allCameras);
  } catch (error) {
    console.error("Error loading cameras/zones:", error);
    showToast("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้: " + error.message, "error");
  }
}

// ฟังก์ชันโหลดข้อมูล
// ดึงข้อมูลจาก API เพื่ออัปเดต Dashboard
async function loadData(isRealtime = false) {
  return new Promise((resolve, reject) => {
    try {
      if (!isRealtime) showLoading();

      debug("เริ่มโหลดข้อมูลตามเงื่อนไข" + (isRealtime ? " (realtime)" : ""));

      const form = document.getElementById("search-form");
      if (!form) throw new Error("ไม่พบฟอร์มค้นหา");

      const formData = new FormData(form);
      const computeId = formData.get("compute_id") || 7;

      let url = `${API_BASE_URL}/getAnalytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
      const params = new URLSearchParams();

      // ดึงข้อมูลจากทุกกล้องหากไม่ได้ระบุ source_name
      if (!formData.get("source_name")) {
        params.append("source_name", ""); // ดึงข้อมูลจากทุกกล้อง
      } else {
        params.append("source_name", formData.get("source_name"));
      }

      const dateRange = formData.get("date_range") || "today";

      if (dateRange !== "custom") {
        const dates = calculateDates(dateRange);
        params.set("start_date", dates.startDate);
        params.set("end_date", dates.endDate);

        const startDateInput = form.querySelector('input[name="start_date"]');
        const endDateInput = form.querySelector('input[name="end_date"]');
        if (startDateInput) startDateInput.value = dates.startDate;
        if (endDateInput) endDateInput.value = dates.endDate;
      } else {
        let sDate = formData.get("start_date");
        let eDate = formData.get("end_date");

        if (!sDate || !eDate) {
          const today = calculateDates("today");
          sDate = today.startDate;
          eDate = today.endDate;

          const startDateInput = form.querySelector('input[name="start_date"]');
          const endDateInput = form.querySelector('input[name="end_date"]');
          if (startDateInput) startDateInput.value = sDate;
          if (endDateInput) endDateInput.value = eDate;
        }

        params.set("start_date", sDate);
        params.set("end_date", eDate);
      }

      currentSearchParams = params.toString();
      if (currentSearchParams) url += `&${currentSearchParams}`;

      debug("API URL สำหรับข้อมูล:", url);

      fetchWithTimeout(url, 10000) // Timeout 10 วินาที
        .then((response) => {
          if (!response.ok)
            throw new Error(
              `ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status}): ${response.statusText}`
            );
          return response.text();
        })
        .then((responseText) => {
          let data;
          try {
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

          if (!Array.isArray(data) || data.length === 0) {
            displayNoData();
            resolve();
            return;
          }

          currentData = data;
          updateDashboard(data, isRealtime);
          resolve();
        })
        .catch((error) => {
          console.error("Error loading data:", error);
          if (!isRealtime)
            showToast(
              `เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`,
              "error"
            );
          displayNoData(error.message);
          resolve();
        })
        .finally(() => {
          if (!isRealtime) hideLoading();
        });
    } catch (error) {
      console.error("Error in loadData setup:", error);
      if (!isRealtime)
        showToast(
          `เกิดข้อผิดพลาดในการตั้งค่าโหลดข้อมูล: ${error.message}`,
          "error"
        );
      displayNoData(error.message);
      resolve();
    }
  });
}

// ฟังก์ชัน Fetch กับ Timeout
// เรียก API พร้อมกำหนดเวลา Timeout เพื่อป้องกันการค้าง
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Request timed out");
    throw error;
  }
}

// ฟังก์ชันแสดงข้อความไม่พบข้อมูล
// แสดงข้อความเมื่อไม่มีข้อมูลหรือเกิดข้อผิดพลาด
function displayNoData(errorMessage = null) {
  debug("แสดงข้อความไม่พบข้อมูล" + (errorMessage ? `: ${errorMessage}` : ""));

  if (timeSeriesChart) {
    debug("ล้างข้อมูลกราฟ Time Series");
    timeSeriesChart.updateOptions({ series: [{ data: [] }] });
  }
  if (cameraPieChart) {
    debug("ล้างข้อมูลกราฟ Pie Chart");
    cameraPieChart.updateOptions({ series: [], labels: [] });
  }
  if (barChart) {
    debug("ล้างข้อมูลกราฟ Bar Chart");
    barChart.updateOptions({
      series: [{ data: [] }],
      xaxis: { categories: [] },
    });
  }
  horizontalBarCharts.forEach((chart, index) => {
    if (chart) {
      debug(`ล้างข้อมูลกราฟ Horizontal Bar Chart ${index + 1}`);
      chart.updateOptions({ series: [{ data: [] }] });
    }
  });

  const chartContainers = document.querySelectorAll(".chart-container");
  chartContainers.forEach((element) => {
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

  document.getElementById("total-people").textContent = "0";
  document.getElementById("total-cameras").textContent = "0";
  document.getElementById("total-zones").textContent = "0";
}

// ฟังก์ชัน Realtime Update
// เริ่มการอัปเดตข้อมูลแบบเรียลไทม์
function startRealtimeUpdate() {
  debug("เริ่มการอัปเดตแบบ Realtime");
  stopRealtimeUpdate();
  document.getElementById("realtime-status").style.display = "inline-block";

  realtimeInterval = setInterval(() => {
    loadData(true).catch((error) =>
      console.error("Realtime update failed:", error)
    );
  }, REALTIME_UPDATE_INTERVAL);
}

// หยุดการอัปเดตแบบ Realtime
// หยุดการเรียกข้อมูลแบบเรียลไทม์เมื่อไม่ต้องการ
function stopRealtimeUpdate() {
  debug("หยุดการอัปเดตแบบ Realtime");
  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
  document.getElementById("realtime-status").style.display = "none";
}

// ฟังก์ชันอัปเดต Dashboard
// อัปเดตข้อมูลทั้งหมดใน Dashboard รวมถึงกราฟและสถิติ
function updateDashboard(data, isRealtime = false) {
  try {
    debug("อัปเดต Dashboard" + (isRealtime ? " (realtime)" : ""));

    if (!Array.isArray(data)) {
      console.error("ข้อมูลที่ได้รับไม่ใช่ array:", data);
      displayNoData();
      return;
    }

    const noDataElements = document.querySelectorAll(".no-data");
    noDataElements.forEach((element) => element.remove());

    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => element.remove());

    updateTimeSeriesChart(data); // อัปเดตกราฟจำนวนตามเวลา
    updatePieChart(data); // อัปเดตกราฟวงกลม
    updateBarChart(data); // อัปเดตกราฟแท่ง
    updateHorizontalBarCharts(data); // อัปเดตกราฟแท่งแนวนอน
    updateStats(data); // อัปเดตสถิติ

    if (currentSearchParams) {
      fetchActivityDurationData(new URLSearchParams(currentSearchParams))
        .then((activityData) => {
          if (Array.isArray(activityData))
            updateActivityDurationChart(activityData);
        })
        .catch((error) =>
          console.error("Error updating activity duration chart:", error)
        );
    }

    updateLastUpdatedTime();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต Dashboard:", error);
    if (!isRealtime)
      showToast(
        `เกิดข้อผิดพลาดในการอัปเดต Dashboard: ${error.message}`,
        "error"
      );
  }
}

// ฟังก์ชันอัปเดตเวลา
// อัปเดตเวลาล่าสุดที่ข้อมูลถูกอัปเดต
function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("th-TH");
  const lastUpdatedElement = document.getElementById("last-updated-time");
  if (lastUpdatedElement) lastUpdatedElement.textContent = timeString;
}

// ฟังก์ชันคำนวณและแสดงสถิติ
// คำนวณและแสดงจำนวนคน, กล้อง, และโซนใน Dashboard โดยใช้เฉพาะ label = "person"
function updateStats(data) {
  let totalPeople = 0;
  let cameraSet = new Set();

  data.forEach((item) => {
    const cameraName = item?.data?.sourceName || "unknown";
    cameraSet.add(cameraName);

    if (cameraName === "ICONIC-01") {
      if (item?.data?.analyticsResult?.objsInfo) {
        if (Array.isArray(item.data.analyticsResult.objsInfo)) {
          item.data.analyticsResult.objsInfo.forEach((obj) => {
            // ใช้เฉพาะข้อมูลที่มี label = "person"
            if (obj.label === "person")
              totalPeople += item.data.analyticsResult.cnt || 0;
          });
        } else if (item.data.analyticsResult.objsInfo.label === "person") {
          // ใช้เฉพาะข้อมูลที่มี label = "person"
          totalPeople += item.data.analyticsResult.cnt || 0;
        }
      }
    }
  });

  totalPeople = Math.round(totalPeople / 2);

  document.getElementById("total-people").textContent =
    totalPeople.toLocaleString();
  document.getElementById("total-cameras").textContent =
    cameraSet.size.toLocaleString();
  document.getElementById("total-zones").textContent =
    cameraSet.size.toLocaleString();

  debug("อัปเดตสถิติเรียบร้อย  ", { totalPeople, cameras: cameraSet.size });
}

// ฟังก์ชันอัปเดต Dropdown ของกล้องสำหรับ Time Series Chart (แสดงชื่อกล้องทั้งหมด)
let selectedCameraForTimeSeries = "ICONIC-01"; // ตั้งค่า Default เป็นกล้อง 1 (โซน 1)

function updateCameraSelect(cameras = null) {
  // อัปเดต Dropdown เพื่อแสดงชื่อกล้องทั้งหมดจาก API หรือ currentData
  const cameraSelect = document.getElementById("cameraSelectTimeSeries");
  if (!cameraSelect) {
    debug("ไม่พบ element #cameraSelectTimeSeries");
    return;
  }

  // ใช้ข้อมูลกล้องจากพารามิเตอร์หรือจาก currentData หากไม่ระบุ
  let cameraList = cameras;
  if (!cameraList) {
    cameraList = [
      ...new Set(
        currentData.map((item) => item?.data?.sourceName || "ไม่ระบุ")
      ),
    ].filter((cam) => cam && cameraColorMap.hasOwnProperty(cam));
  }

  if (cameraList.length === 0) {
    cameraSelect.innerHTML =
      '<option value="" disabled selected>ไม่มีกล้อง</option>';
    debug("ไม่พบข้อมูลกล้องใน currentData หรือพารามิเตอร์");
    return;
  }

  // สร้างตัวเลือกสำหรับแต่ละกล้อง โดยเรียงตามลำดับใน cameraColorMap
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];
  cameraList.sort((a, b) => cameraOrder.indexOf(a) - cameraOrder.indexOf(b));

  cameraSelect.innerHTML = ""; // ล้างตัวเลือกเดิม
  cameraList.forEach((camera) => {
    cameraSelect.innerHTML += `<option value="${camera}">${camera}</option>`;
  });

  // ตั้งค่า Default เป็น ICONIC-01 หากมีในรายการ
  if (cameraList.includes("ICONIC-01")) {
    cameraSelect.value = "ICONIC-01";
  } else if (cameraList.length > 0) {
    cameraSelect.value = cameraList[0]; // ถ้าไม่มี ICONIC-01 ใช้กล้องแรก
  }

  // อัปเดตค่า selectedCameraForTimeSeries
  selectedCameraForTimeSeries = cameraSelect.value;
  debug(
    "อัปเดต Dropdown กล้องสำเร็จ, ค่าเริ่มต้น: " + selectedCameraForTimeSeries
  );
}

// ฟังก์ชันอัปเดตกราฟ Time Series (แสดงข้อมูลตามกล้องที่เลือก โดยใช้เฉพาะ label = "person")
function updateTimeSeriesChart(data) {
  // อัปเดตกราฟจำนวนตามเวลาด้วยข้อมูลจากกล้องที่เลือก โดยใช้เฉพาะ label = "person"
  try {
    debug("อัปเดตกราฟเส้น Time Series  ");

    if (!Array.isArray(data) || data.length === 0) {
      debug("ไม่พบข้อมูลสำหรับกราฟเส้น");
      if (timeSeriesChart)
        timeSeriesChart.updateOptions({ series: [{ data: [] }] });
      return;
    }

    // กรองข้อมูลเฉพาะกล้องที่เลือกและ label = "person"
    let filteredData = data.filter(
      (item) =>
        item?.data?.sourceName === selectedCameraForTimeSeries &&
        item?.data?.analyticsResult?.objsInfo &&
        (Array.isArray(item.data.analyticsResult.objsInfo)
          ? item.data.analyticsResult.objsInfo.some(
              (obj) => obj.label === "person"
            )
          : item.data.analyticsResult.objsInfo.label === "person")
    );
    if (filteredData.length === 0) {
      debug(
        "ไม่พบข้อมูลสำหรับกล้องที่เลือก (label = 'person'): " +
          selectedCameraForTimeSeries
      );
      if (timeSeriesChart)
        timeSeriesChart.updateOptions({ series: [{ data: [] }] });
      showToast(
        `ไม่พบข้อมูลสำหรับกล้อง ${selectedCameraForTimeSeries} (label = 'person')`,
        "warning"
      );
      return;
    }

    const sortedData = [...filteredData].sort((a, b) => {
      const timeA = new Date(a?.time || 0);
      const timeB = new Date(b?.time || 0);
      return timeA - timeB;
    });

    const chartData = sortedData
      .map((item) => {
        if (!item || !item.time || !item.data || !item.data.analyticsResult)
          return null;
        let cnt = 0;
        if (Array.isArray(item.data.analyticsResult.objsInfo)) {
          // รวม cnt จาก objsInfo ที่มี label = "person"
          cnt = item.data.analyticsResult.objsInfo
            .filter((obj) => obj.label === "person")
            .reduce(
              (sum, obj) => sum + (item.data.analyticsResult.cnt || 0),
              0
            );
        } else if (item.data.analyticsResult.objsInfo.label === "person") {
          // ใช้ cnt หาก objsInfo เป็น object เดียวและ label = "person"
          cnt = item.data.analyticsResult.cnt || 0;
        }
        const time = new Date(item.time).getTime();
        return { x: time, y: cnt };
      })
      .filter((item) => item !== null);

    const options = {
      series: [
        {
          name: `จำนวนคน (${selectedCameraForTimeSeries})`, // แสดงชื่อกล้องที่เลือก
          data: chartData,
        },
      ],
      chart: {
        type: "area",
        height: 400,
        toolbar: { show: true },
        animations: { enabled: true },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
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
        labels: { datetimeUTC: false, format: "dd/MM/yy HH:mm" },
        title: { text: "เวลา" },
      },
      yaxis: {
        title: { text: "จำนวนคน" },
        min: 0,
        forceNiceScale: true,
      },
      tooltip: {
        x: { format: "dd/MM/yy HH:mm" },
        y: { formatter: (value) => value + " คน" },
      },
      colors: [getCameraColor(selectedCameraForTimeSeries)], // ใช้สีตามกล้องที่เลือก
      title: {
        text: `จำนวนคนตามช่วงเวลา (${selectedCameraForTimeSeries})  `,
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
      debug("อัปเดตกราฟ Time Series ด้วยข้อมูลใหม่  ");
      timeSeriesChart.updateOptions(options);
    } else {
      debug("สร้างกราฟเส้นใหม่  ");
      timeSeriesChart = new ApexCharts(chartEl, options);
      timeSeriesChart.render();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟเส้น:", error);
    const chartEl = document.querySelector("#time-series-chart");
    if (chartEl && !chartEl.querySelector(".error-message")) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill"></i> เกิดข้อผิดพลาดในการแสดงกราฟ: ${error.message}</div>`;
      chartEl.appendChild(errorDiv);
    }
  }
}

// ฟังก์ชันอัปเดตกราฟ Pie Chart (ใช้เฉพาะ label = "person")
function updatePieChart(data) {
  debug("อัปเดตกราฟวงกลม Pie Chart  ");

  const cameraData = {};
  data.forEach((item) => {
    const cam = item?.data?.sourceName || "ไม่ระบุ";
    let cnt = 0;
    if (item?.data?.analyticsResult?.objsInfo) {
      if (Array.isArray(item.data.analyticsResult.objsInfo)) {
        // รวม cnt จาก objsInfo ที่มี label = "person"
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
        // ใช้ cnt หาก objsInfo เป็น object เดียวและ label = "person"
        cnt = item.data.analyticsResult.cnt || 0;
      }
    }
    if (cnt > 0) cameraData[cam] = (cameraData[cam] || 0) + cnt;
  });

  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];
  const sortedLabels = Object.keys(cameraData).sort((a, b) => {
    const indexA = cameraOrder.indexOf(a);
    const indexB = cameraOrder.indexOf(b);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

  const series = sortedLabels.map((label) => cameraData[label] || 0);
  const labels = sortedLabels;
  const colorArray = labels.map((camera) => getCameraColor(camera));

  const options = {
    series,
    chart: { type: "donut", height: 400, toolbar: { show: true } },
    labels,
    colors: colorArray,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      formatter: (seriesName, opts) =>
        `${seriesName}:  ${opts.w.globals.series[opts.seriesIndex]} คน`,
    },
    tooltip: { y: { formatter: (value) => value + " คน" } },
    title: { text: "สัดส่วนจำนวนคนตามกล้อง  ", align: "center" },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "จำนวนรวม",
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0) + " คน",
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
      debug("อัปเดตกราฟ Pie Chart ด้วยข้อมูลใหม่  ");
      cameraPieChart.destroy();
    }
    cameraPieChart = new ApexCharts(pieEl, options);
    cameraPieChart.render();
  } catch (error) {
    console.error("Error updating pie chart:", error);
    showToast(`เกิดข้อผิดพลาดในการอัปเดตกราฟวงกลม: ${error.message}`, "error");
  }
}

// ฟังก์ชันอัปเดตกราฟแท่ง (Bar Chart) แบบ Responsive (ใช้เฉพาะ label = "person")
function updateBarChart(data) {
  debug("อัปเดตกราฟแท่ง Bar Chart แบบ responsive  ");
  const isSmallScreen = window.innerWidth < 768;

  debug(
    "กำลังอัปเดตกราฟแท่งแบบ responsive ตามขนาดหน้าจอ: " +
      (isSmallScreen ? "หน้าจอเล็ก" : "หน้าจอใหญ่")
  );

  const hourCameraData = {};
  const cameraSet = new Set();

  data.forEach((item) => {
    if (!item || !item.data || !item.data.analyticsResult || !item.time) return;
    const cameraName = item.data.sourceName || "ไม่ระบุ";
    const time = new Date(item.time);
    let cnt = 0;
    if (item?.data?.analyticsResult?.objsInfo) {
      if (Array.isArray(item.data.analyticsResult.objsInfo)) {
        // รวม cnt จาก objsInfo ที่มี label = "person"
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
        // ใช้ cnt หาก objsInfo เป็น object เดียวและ label = "person"
        cnt = item.data.analyticsResult.cnt || 0;
      }
    }
    if (cnt > 0) {
      cameraSet.add(cameraName);
      const hour = time.getHours();
      const hourKey = `${hour.toString().padStart(2, "0")}:00`;
      if (!hourCameraData[hourKey]) hourCameraData[hourKey] = {};
      hourCameraData[hourKey][cameraName] =
        (hourCameraData[hourKey][cameraName] || 0) + cnt;
    }
  });

  const hourKeys = Object.keys(hourCameraData).sort(
    (a, b) => parseInt(a.split(":")[0]) - parseInt(b.split(":")[0])
  );
  const cameraNames = Array.from(cameraSet);

  const series = cameraNames.map((camera) => ({
    name: camera,
    data: hourKeys.map((hour) => hourCameraData[hour][camera] || 0),
  }));

  const colorArray = cameraNames.map((camera) => getCameraColor(camera));

  const options = {
    series,
    chart: {
      type: "bar",
      height: 400,
      toolbar: { show: true },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: !isSmallScreen,
      formatter: (val) => (val > 0 ? val : ""),
      offsetY: -20,
      style: {
        fontSize: isSmallScreen ? "8px" : "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: hourKeys,
      title: { text: "ช่วงเวลา (ชั่วโมง)" },
      labels: {
        style: { fontSize: isSmallScreen ? "8px" : "12px" },
        rotate: isSmallScreen ? -45 : 0,
        offsetY: isSmallScreen ? 5 : 0,
      },
    },
    yaxis: {
      title: { text: "จำนวนคน" },
      min: 0,
      labels: { style: { fontSize: isSmallScreen ? "8px" : "12px" } },
    },
    fill: { opacity: 1 },
    title: {
      text: "จำนวนคนตามช่วงเวลารายชั่วโมงแยกตามกล้อง  ",
      align: "center",
      style: { fontSize: isSmallScreen ? "14px" : "16px" },
    },
    tooltip: {
      y: { formatter: (val) => val + " คน" },
      style: { fontSize: isSmallScreen ? "10px" : "12px" },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: isSmallScreen ? "10px" : "12px",
      itemMargin: {
        horizontal: isSmallScreen ? 5 : 10,
        vertical: isSmallScreen ? 2 : 5,
      },
    },
    colors: colorArray,
  };

  const barEl = document.querySelector("#bar-chart");
  if (!barEl) {
    debug("ไม่พบ element #bar-chart");
    return;
  }

  try {
    if (barChart) {
      debug("อัปเดตกราฟ Bar Chart ด้วยข้อมูลใหม่  ");
      barChart.updateOptions(options);
    } else {
      debug("สร้างกราฟแท่งใหม่  ");
      barChart = new ApexCharts(barEl, options);
      barChart.render();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่ง:", error);
    showToast(`เกิดข้อผิดพลาดในการอัปเดตกราฟแท่ง: ${error.message}`, "error");
  }
}

// ฟังก์ชันอัปเดตกราฟแท่งแนวนอน (ใช้เฉพาะ label = "person")
function updateHorizontalBarCharts(data) {
  // แสดงข้อความ debug
  debug("อัปเดตกราฟแท่งแนวนอนแบบรายชั่วโมง (06:00 - 21:00)");

  // กำหนดช่วงเวลารายชั่วโมงตั้งแต่ 06:00 - 21:00
  const timeRanges = [
    "06:00 - 07:00",
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
  ];

  // สร้าง Set เพื่อเก็บชื่อกล้องที่ไม่ซ้ำกัน
  const cameraSet = new Set();

  // วนลูปข้อมูลเพื่อรวบรวมชื่อกล้องที่มีข้อมูล
  data.forEach((item) => {
    // ตรวจสอบว่าข้อมูลที่ได้รับมีโครงสร้างที่ถูกต้อง
    if (!item || !item.data || !item.data.analyticsResult) return;

    // ดึงชื่อกล้องจากข้อมูล
    const cameraName = item.data.sourceName || "ไม่ระบุ";

    // ตรวจสอบข้อมูลการตรวจจับคน
    let cnt = 0;
    if (item?.data?.analyticsResult?.objsInfo) {
      if (Array.isArray(item.data.analyticsResult.objsInfo)) {
        // กรณีมีหลายวัตถุ ให้กรองเฉพาะที่เป็น "person" และรวมจำนวน
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
        // กรณีมีวัตถุเดียว ถ้าเป็น "person" ให้นับจำนวน
        cnt = item.data.analyticsResult.cnt || 0;
      }
    }

    // ถ้ามีการตรวจจับคน (cnt > 0) ให้เพิ่มชื่อกล้องเข้าไปใน Set
    if (cnt > 0) cameraSet.add(cameraName);
  });

  // แปลง Set เป็น Array เพื่อให้สามารถจัดเรียงได้
  let cameras = Array.from(cameraSet);

  // กำหนดลำดับการแสดงผลของกล้อง
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];

  // เรียงลำดับกล้องตาม cameraOrder
  cameras.sort(
    (a, b) =>
      cameraOrder.indexOf(a) - cameraOrder.indexOf(b) ||
      (cameraOrder.indexOf(a) === -1 ? 1 : -1)
  );

  // ตรวจสอบว่ามีข้อมูลกล้องหรือไม่
  if (cameras.length === 0) {
    // ถ้าไม่มีข้อมูลกล้อง ให้แสดงข้อความ "ไม่พบข้อมูล" ในทุกกราฟ
    horizontalBarCharts.forEach((chart, index) => {
      if (chart) {
        debug(`ล้างข้อมูลกราฟ Horizontal Bar Chart ${index + 1}`);
        chart.updateOptions({ series: [{ data: [] }] });

        const containerId = `#horizontal-bar-chart-${index + 1}`;
        const chartEl = document.querySelector(containerId);

        if (chartEl && !chartEl.querySelector(".no-data")) {
          const noDataDiv = document.createElement("div");
          noDataDiv.className = "no-data";
          noDataDiv.innerHTML = `<i class="bi bi-exclamation-triangle"></i><div class="no-data-text">ไม่พบข้อมูลกล้อง (label = 'person')</div>`;
          chartEl.appendChild(noDataDiv);
        }
      }
    });
    return;
  }

  // จำกัดจำนวนกล้องที่จะแสดงไม่เกิน 4 ตัว
  const cameraLimit = Math.min(cameras.length, 4);

  // วนลูปสร้างกราฟสำหรับแต่ละกล้อง
  for (let index = 0; index < cameraLimit; index++) {
    const cam = cameras[index];

    // สร้างอาร์เรย์เก็บข้อมูลจำนวนคนตามช่วงเวลา โดยเริ่มต้นให้ทุกช่วงเวลาเป็น 0
    const seriesData = Array(timeRanges.length).fill(0);

    // กรองข้อมูลเฉพาะกล้องที่กำลังพิจารณา
    const cameraData = data.filter((item) => item?.data?.sourceName === cam);

    // วนลูปข้อมูลของกล้องนี้
    cameraData.forEach((item) => {
      if (item?.time && item?.data?.analyticsResult?.cnt) {
        // ตรวจสอบข้อมูลการตรวจจับคน
        let cnt = 0;
        if (item?.data?.analyticsResult?.objsInfo) {
          if (Array.isArray(item.data.analyticsResult.objsInfo)) {
            // กรณีมีหลายวัตถุ ให้กรองเฉพาะที่เป็น "person" และรวมจำนวน
            cnt = item.data.analyticsResult.objsInfo
              .filter((obj) => obj.label === "person")
              .reduce(
                (sum, obj) => sum + (item.data.analyticsResult.cnt || 0),
                0
              );
          } else if (item.data.analyticsResult.objsInfo.label === "person") {
            // กรณีมีวัตถุเดียว ถ้าเป็น "person" ให้นับจำนวน
            cnt = item.data.analyticsResult.cnt || 0;
          }
        }

        // ถ้ามีการตรวจจับคน (cnt > 0)
        if (cnt > 0) {
          // แปลงเวลาจาก string เป็น Date object
          const time = new Date(item.time);
          // ดึงชั่วโมงจากเวลา
          const hour = time.getHours();

          // ตรวจสอบว่าอยู่ในช่วง 06:00 - 21:00 หรือไม่
          if (hour >= 6 && hour < 21) {
            // คำนวณ index ของช่วงเวลา (06:00 = 0, 07:00 = 1, ...)
            const rangeIndex = hour - 6;

            // เพิ่มจำนวนคนในช่วงเวลาที่เหมาะสม
            if (rangeIndex >= 0 && rangeIndex < seriesData.length) {
              seriesData[rangeIndex] += cnt;
            }
          }
        }
      }
    });

    // กำหนดค่า options สำหรับกราฟ
    const options = {
      series: [
        {
          name: "จำนวนคน",
          data: seriesData,
        },
      ],
      chart: {
        type: "bar",
        height: 500, // เพิ่มความสูงเพื่อรองรับข้อมูลจำนวนมากขึ้น
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
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: { position: "right" },
          barHeight: "75%",
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: { colors: ["#000"] },
        formatter: (val) => val,
        offsetX: 0,
      },
      xaxis: {
        categories: timeRanges,
        title: { text: "จำนวนคน" },
      },
      yaxis: {
        labels: {
          show: true,
          style: { fontSize: "10px" }, // ลดขนาดตัวอักษรเนื่องจากมีข้อมูลมากขึ้น
        },
        title: { text: "ช่วงเวลา" },
      },
      title: {
        text: `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : ${cam} (รายชั่วโมง)`,
        align: "center",
      },
      tooltip: {
        shared: false,
        x: { formatter: (val) => val },
        y: { formatter: (val) => val + " คน" },
      },
      colors: [getCameraColor(cam)], // ดึงสีตามกล้อง
      noData: {
        text: "ไม่พบข้อมูล",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
      },
      // เพิ่มความสามารถในการปรับขนาดตามหน้าจอ
      responsive: [
        {
          breakpoint: 768, // สำหรับหน้าจอขนาดเล็ก
          options: {
            chart: {
              height: 600, // เพิ่มความสูงสำหรับหน้าจอเล็ก
            },
            plotOptions: {
              bar: {
                barHeight: "60%", // ลดความสูงของแท่งเพื่อให้พอดีกับหน้าจอ
              },
            },
            yaxis: {
              labels: {
                style: {
                  fontSize: "8px", // ลดขนาดตัวอักษรสำหรับหน้าจอเล็ก
                },
              },
            },
          },
        },
      ],
    };

    // ค้นหา element ที่จะใช้แสดงกราฟ
    const containerId = `#horizontal-bar-chart-${index + 1}`;
    const chartEl = document.querySelector(containerId);

    // ตรวจสอบว่าพบ element หรือไม่
    if (!chartEl) {
      debug(`ไม่พบ element ${containerId}`);
      continue;
    }

    // ลบข้อความ "ไม่พบข้อมูล" ถ้ามี
    const noDataEl = chartEl.querySelector(".no-data");
    if (noDataEl) noDataEl.remove();

    // อัปเดตหัวข้อกราฟให้แสดงชื่อกล้อง
    const cardHeader = chartEl
      .closest(".card")
      ?.querySelector(".card-header .card-title");
    if (cardHeader) {
      cardHeader.innerHTML = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : <span style="color: ${getCameraColor(
        cam
      )}">${cam}</span> (รายชั่วโมง)`;
    }

    // สร้างหรืออัปเดตกราฟ
    try {
      if (horizontalBarCharts[index]) {
        debug(`อัปเดตกราฟ Horizontal Bar Chart ${index + 1} ด้วยข้อมูลใหม่`);
        // ทำลายกราฟเดิมก่อนสร้างใหม่ เพื่อป้องกันปัญหา
        horizontalBarCharts[index].destroy();
      }

      // สร้างกราฟใหม่ด้วย ApexCharts
      horizontalBarCharts[index] = new ApexCharts(chartEl, options);
      // แสดงกราฟ
      horizontalBarCharts[index].render();
    } catch (error) {
      // จัดการข้อผิดพลาดที่อาจเกิดขึ้น
      console.error(`Error updating horizontal bar chart ${index + 1}:`, error);
      showToast(
        `เกิดข้อผิดพลาดในการอัปเดตกราฟแท่งแนวนอน ${index + 1}: ${
          error.message
        }`,
        "error"
      );
    }
  }

  // จัดการกับกล้องที่ไม่มีข้อมูล (กรณีมีกล้องน้อยกว่า 4 ตัว)
  for (let i = cameraLimit; i < 4; i++) {
    // ถ้ามีกราฟอยู่แล้ว
    if (horizontalBarCharts[i]) {
      const containerId = `#horizontal-bar-chart-${i + 1}`;
      const chartEl = document.querySelector(containerId);

      if (chartEl) {
        debug(`ล้างข้อมูลกราฟ Horizontal Bar Chart ${i + 1}`);
        horizontalBarCharts[i].updateOptions({ series: [{ data: [] }] });

        // เพิ่มข้อความ "ไม่พบข้อมูล" ถ้ายังไม่มี
        if (!chartEl.querySelector(".no-data")) {
          const noDataDiv = document.createElement("div");
          noDataDiv.className = "no-data";
          noDataDiv.innerHTML = `<i class="bi bi-exclamation-triangle"></i><div class="no-data-text">ไม่พบข้อมูลกล้อง (label = 'person')</div>`;
          chartEl.appendChild(noDataDiv);
        }

        // อัปเดตหัวข้อให้แสดงว่าไม่พบข้อมูล
        const cardHeader = chartEl
          .closest(".card")
          ?.querySelector(".card-header .card-title");
        if (cardHeader) {
          cardHeader.innerHTML = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : <span style="color: #6c757d">ไม่พบข้อมูล</span>`;
        }
      }
    }
  }
}

// ฟังก์ชันสำหรับดึงข้อมูล Activity Duration
// ดึงข้อมูลระยะเวลาการอยู่ในโซนจาก API
async function fetchActivityDurationData(params) {
  try {
    const computeId = params.get("compute_id") || 7;
    let url = `${API_BASE_URL}/activity_ganttchart?compute_id=${computeId}`;

    const startDate = params.get("start_date");
    const endDate = params.get("end_date");

    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    } else {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      url += `&start_date=${today.toISOString().split("T")[0]}&end_date=${
        tomorrow.toISOString().split("T")[0]
      }`;
    }

    const response = await fetchWithTimeout(url, 5000); // Timeout 5 วินาที
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching activity duration data:", error);
    return [];
  }
}

// ฟังก์ชันประมวลผลข้อมูล Activity Duration
// ประมวลผลข้อมูลเพื่อสร้างกราฟ Box Plot แสดงระยะเวลาที่อยู่ในโซน
function processActivityDurationData(data) {
  const cameraData = {
    "ICONIC-01": [],
    "ICONIC-02": [],
    "ICONIC-03": [],
    "ICONIC-04": [],
  };

  data.forEach((item) => {
    if (
      item.name === "person" &&
      item.data &&
      item.data.start_time &&
      item.data.end_time &&
      item.data.source
    ) {
      const duration = calculateDurationInMinutes(
        item.data.start_time,
        item.data.end_time
      );
      const cameraName = item.data.source;
      if (cameraData[cameraName])
        cameraData[cameraName].push({
          duration: Math.min(duration, 1440), // จำกัดระยะเวลาไม่เกิน 1 วัน
          startTime: new Date(item.data.start_time),
          endTime: new Date(item.data.end_time),
        });
    }
  });

  const zoneMapping = {
    "ICONIC-01": "Zone 1 ทางเข้า-ออก",
    "ICONIC-02": "Zone 2",
    "ICONIC-03": "Zone 3",
    "ICONIC-04": "Zone 4",
  };

  return Object.entries(cameraData).map(([camera, dataPoints]) => {
    const durations = dataPoints.map((d) => d.duration).sort((a, b) => a - b);
    const n = durations.length;

    if (n === 0)
      return {
        zone: zoneMapping[camera] || camera,
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        count: 0,
        camera,
        details: [],
      };

    const stats = {
      zone: zoneMapping[camera] || camera,
      min: durations[0],
      q1: durations[Math.floor(n / 4)],
      median:
        n % 2 === 0
          ? (durations[n / 2 - 1] + durations[n / 2]) / 2
          : durations[Math.floor(n / 2)],
      q3: durations[Math.floor((3 * n) / 4)],
      max: durations[n - 1],
      count: n,
      camera,
      details: dataPoints.map((d) => ({
        duration: d.duration,
        startTime: d.startTime,
        endTime: d.endTime,
      })),
    };

    stats.average = durations.reduce((sum, val) => sum + val, 0) / n;
    return stats;
  });
}

// ฟังก์ชันคำนวณระยะเวลาเป็นนาที
// คำนวณระยะเวลาที่ผู้เยี่ยมชมอยู่ในโซนจากเวลาเริ่มและสิ้นสุด
function calculateDurationInMinutes(start_time, end_time) {
  const start = new Date(start_time);
  const end = new Date(end_time);
  return Math.round((end - start) / (1000 * 60));
}

// ฟังก์ชันอัปเดตกราฟ Activity Duration (Box Plot)
// อัปเดตกราฟ Box Plot แสดงการกระจายของระยะเวลาที่ใช้ในแต่ละโซน
function updateActivityDurationChart(data) {
  const processedData = processActivityDurationData(data);

  const options = {
    series: [
      {
        name: "ระยะเวลา",
        type: "boxPlot",
        data: processedData.map((d) => ({
          x: d.zone,
          y: [d.min, d.q1, d.median, d.q3, d.max],
          camera: d.camera,
        })),
      },
    ],
    chart: {
      type: "boxPlot",
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
          exportToSVG: true,
          exportToPNG: true,
          exportToCSV: true,
        },
      },
    },
    title: {
      text: "การกระจายของระยะเวลาที่ผู้เยี่ยมชมใช้ในแต่ละโซน (หน่วยเป็นนาที)",
      align: "center",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    plotOptions: {
      boxPlot: {
        colors: processedData.map((d) => ({
          upper: getCameraColor(d.camera),
          lower: getCameraColor(d.camera),
          line: getCameraColor(d.camera),
        })),
      },
    },
    xaxis: {
      title: { text: "Zone", style: { fontSize: "14px" } },
      labels: {
        style: { colors: processedData.map((d) => getCameraColor(d.camera)) },
      },
    },
    yaxis: {
      title: { text: "ระยะเวลา (นาที)", style: { fontSize: "14px" } },
      min: 0,
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const data = processedData[dataPointIndex];
        return `<div class="activity-tooltip p-3"><div class="fw-bold mb-2 border-bottom pb-2">${
          data.zone
        }</div><div class="px-3"><div>จำนวนคน: ${
          data.count
        } คน</div><div>ระยะเวลาเฉลี่ย: ${Math.round(
          data.average
        )} นาที</div><div class="mt-2">การกระจายของเวลา:</div><div class="ps-2"><div>• ต่ำสุด: ${
          data.min
        } นาที</div><div>• Q1 (25%): ${data.q1} นาที</div><div>• กลาง: ${
          data.median
        } นาที</div><div>• Q3 (75%): ${data.q3} นาที</div><div>• สูงสุด: ${
          data.max
        } นาที</div></div></div></div>`;
      },
    },
    colors: processedData.map((d) => getCameraColor(d.camera)),
  };

  const chartEl = document.querySelector("#activity-duration-chart");
  if (!chartEl) {
    debug("ไม่พบ element #activity-duration-chart");
    return;
  }

  try {
    if (activityDurationChart) {
      debug("อัปเดตกราฟ Activity Duration ด้วยข้อมูลใหม่");
      activityDurationChart.updateOptions(options);
    } else {
      debug("สร้างกราฟ Activity Duration ใหม่");
      activityDurationChart = new ApexCharts(chartEl, options);
      activityDurationChart.render();
    }
  } catch (error) {
    console.error("Error updating activity duration chart:", error);
    showToast(
      `เกิดข้อผิดพลาดในการอัปเดตกราฟระยะเวลา: ${error.message}`,
      "error"
    );
  }
}

// ฟังก์ชัน Export ข้อมูล
// ส่งออกข้อมูลระยะเวลาการอยู่ในโซนเป็นไฟล์ CSV
function exportActivityData(data, format = "csv") {
  const processedData = processActivityDurationData(data);

  if (format === "csv") {
    let csv = "Zone,Count,Min,Q1,Median,Q3,Max\n";
    processedData.forEach(
      (d) =>
        (csv += `${d.zone},${d.count},${d.min},${d.q1},${d.median},${d.q3},${d.max}\n`)
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_duration_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    debug("ส่งออกข้อมูลสำเร็จ");
  }
}

// ฟังก์ชันจัดการ Modal
// จัดการการแสดงภาพโซนใน Modal เมื่อคลิก
function initModal() {
  const imageModal = document.getElementById("imageModal");
  if (imageModal) {
    imageModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const imgSrc = button.getAttribute("data-img");
      const zone = button.getAttribute("data-zone");
      const camera = button.getAttribute("data-camera");
      const title = button.getAttribute("data-title");

      const modalImage = document.getElementById("modalImage");
      const modalTitle = document.querySelector("#imageModal .modal-title");

      if (modalImage && imgSrc) modalImage.src = imgSrc;

      if (modalTitle) {
        let zoneColor = "";
        switch (zone) {
          case "1":
            zoneColor = "#4e95f4";
            break; // สีฟ้า
          case "2":
            zoneColor = "#4cd3a5";
            break; // สีเขียว
          case "3":
            zoneColor = "#ffc107";
            break; // สีเหลือง
          case "4":
            zoneColor = "#ff6b6b";
            break; // สีแดง
        }
        let titleText = title ? ` ${title}` : "";
        modalTitle.innerHTML = `<span style="color:${zoneColor}">Zone ${zone}${titleText}</span> - กล้อง ${camera}`;
      }
    });
  }
}

// ฟังก์ชันจัดการ Form
// จัดการการส่งฟอร์มค้นหาและการอัปเดตข้อมูล
function initFormHandlers() {
  const form = document.getElementById("search-form");
  if (!form) {
    debug("ไม่พบฟอร์มค้นหาในหน้าเว็บ");
    showToast("ไม่พบฟอร์มค้นหาในหน้าเว็บ", "error");
    return;
  }

  document
    .getElementById("compute_id")
    .addEventListener("change", loadCamerasAndZones);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    stopRealtimeUpdate(); // หยุดการอัปเดตแบบ Realtime ก่อนโหลดข้อมูลใหม่
    loadData()
      .then(() => startRealtimeUpdate()) // เริ่มการอัปเดตแบบ Realtime หลังโหลดข้อมูลสำเร็จ
      .catch((error) => console.error("Form submit failed:", error));
  });

  document
    .getElementById("date_range")
    .addEventListener("change", toggleDateFields);

  const realtimeToggle = document.getElementById("realtime-toggle");
  if (realtimeToggle) {
    realtimeToggle.checked = true; // ตั้งค่าเริ่มต้นให้เปิดการอัปเดตแบบ Realtime
    realtimeToggle.addEventListener("change", function () {
      if (this.checked) startRealtimeUpdate(); // เริ่มการอัปเดตเมื่อเปิดสวิตช์
      else stopRealtimeUpdate(); // หยุดการอัปเดตเมื่อปิดสวิตช์
    });
  }
}

// ฟังก์ชันจัดการฟิลด์วันที่แบบ custom
// แสดงหรือซ่อนฟิลด์วันที่ตามตัวเลือก "กำหนดเอง"
function toggleDateFields() {
  const dateRange = document.getElementById("date_range");
  const dateCustomFields = document.querySelectorAll(".date-custom");

  if (!dateRange) {
    debug("ไม่พบ element #date_range");
    return;
  }
  const isCustom = dateRange.value === "custom";
  dateCustomFields.forEach(
    (field) => (field.style.display = isCustom ? "block" : "none")
  );
}

// ฟังก์ชันแสดง Toast
// แสดงข้อความแจ้งเตือนแบบลอยบนหน้าจอ
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  let bgColor = "bg-info";
  let icon = "bi-info-circle";

  switch (type) {
    case "success":
      bgColor = "bg-success";
      icon = "bi-check-circle";
      break; // แจ้งเตือนสำเร็จ
    case "warning":
      bgColor = "bg-warning";
      icon = "bi-exclamation-triangle";
      break; // แจ้งเตือนเตือน
    case "error":
      bgColor = "bg-danger";
      icon = "bi-x-circle";
      break; // แจ้งเตือนข้อผิดพลาด
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white ${bgColor} border-0 mb-2`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="bi ${icon} me-2"></i> ${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;

  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
  bsToast.show();

  toast.addEventListener("hidden.bs.toast", function () {
    if (toastContainer.contains(toast)) toastContainer.removeChild(toast);
    if (toastContainer.children.length === 0)
      document.body.removeChild(toastContainer);
  });
}

// ฟังก์ชันตั้งค่า Responsive Listener
// ปรับขนาดกราฟตามขนาดหน้าจอเมื่อมีการเปลี่ยนแปลง
function setupResponsiveListener() {
  window.addEventListener(
    "resize",
    _.debounce(function () {
      if (currentData.length > 0) {
        debug("ปรับขนาดหน้าจอ เรียกอัปเดตกราฟ Bar Chart");
        updateBarChart(currentData); // อัปเดตกราฟแท่งเมื่อหน้าจอเปลี่ยนขนาด
      }
    }, 250)
  );
}

// เริ่มต้นเมื่อหน้าเว็บโหลด
// เริ่มการทำงานของ Dashboard เมื่อหน้าเว็บโหลดสำเร็จ
document.addEventListener("DOMContentLoaded", () => {
  initModal(); // เริ่มการทำงานของ Modal
  initFormHandlers(); // เริ่มการทำงานของฟอร์ม

  const form = document.getElementById("search-form");
  if (!form) {
    debug("ไม่พบฟอร์มค้นหาในหน้าเว็บ");
    showToast("ไม่พบฟอร์มค้นหาในหน้าเว็บ", "error");
    return;
  }

  const dateRangeSelect = document.getElementById("date_range");
  const computeIdSelect = document.getElementById("compute_id");
  const sourceNameSelect = document.getElementById("source_name");

  if (dateRangeSelect) dateRangeSelect.value = "today"; // ตั้งค่าเริ่มต้นเป็น "วันนี้"
  if (computeIdSelect) computeIdSelect.value = "7"; // ตั้งค่าเริ่มต้นเป็น People Counting
  if (sourceNameSelect) sourceNameSelect.value = ""; // ตั้งค่าเริ่มต้นเป็น "ทั้งหมด"

  const today = calculateDates("today");
  const startDateInput = form.querySelector('input[name="start_date"]');
  const endDateInput = form.querySelector('input[name="end_date"]');

  if (startDateInput) startDateInput.value = today.startDate; // ตั้งค่าเริ่มต้นวันที่เริ่มต้น
  if (endDateInput) endDateInput.value = today.endDate; // ตั้งค่าเริ่มต้นวันที่สิ้นสุด

  loadCamerasAndZones() // โหลดข้อมูลกล้องและโซนจาก API
    .catch((error) => {
      console.error("Failed to load cameras/zones:", error);
      showToast("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้: " + error.message, "error");
    });

  updateCameraSelect(); // อัปเดต Dropdown สำหรับ Time Series Chart

  const cameraSelect = document.getElementById("cameraSelectTimeSeries");
  if (cameraSelect) {
    cameraSelect.addEventListener("change", function () {
      selectedCameraForTimeSeries = this.value; // อัปเดตกล้องที่เลือก
      if (currentData.length > 0) {
        debug("เปลี่ยนกล้องใน Dropdown, อัปเดตกราฟ Time Series  ");
        updateTimeSeriesChart(currentData); // อัปเดตกราฟตามกล้องที่เลือก
      }
    });
  } else {
    debug("ไม่พบ element #cameraSelectTimeSeries");
    showToast("ไม่พบ Dropdown สำหรับเลือกกล้อง", "error");
  }

  toggleDateFields(); // แสดง/ซ่อนฟิลด์วันที่ตามตัวเลือก

  // เรียกโหลดข้อมูลเริ่มต้นและเริ่มการอัปเดตแบบ Realtime
  loadData()
    .then(() => {
      debug("โหลดข้อมูลเริ่มต้นสำเร็จ, เริ่ม Realtime Update  ");
      startRealtimeUpdate();
    })
    .catch((error) => {
      console.error("Initial load failed:", error);
      showToast("ไม่สามารถโหลดข้อมูลเริ่มต้นได้: " + error.message, "error");
    });

  // เพิ่ม Event Listener สำหรับปุ่ม Export
  const exportBtn = document.getElementById("export-activity-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (currentSearchParams) {
        debug("เริ่มการส่งออกข้อมูล Activity Duration");
        fetchActivityDurationData(new URLSearchParams(currentSearchParams))
          .then((data) => exportActivityData(data)) // ส่งออกข้อมูลเป็น CSV
          .catch((error) => {
            console.error("Error exporting data:", error);
            showToast(
              "เกิดข้อผิดพลาดในการส่งออกข้อมูล: " + error.message,
              "error"
            );
          });
      }
    });
  } else {
    debug("ไม่พบปุ่ม Export Activity Data");
    showToast("ไม่พบปุ่มส่งออกข้อมูล", "warning");
  }

  setupResponsiveListener(); // เริ่มการตรวจสอบขนาดหน้าจอ
});

// เหตุการณ์เมื่อหน้าเว็บและทรัพยากรทั้งหมดโหลดเสร็จ
// ซ่อน Loading Overlay เมื่อโหลดสำเร็จ
window.addEventListener("load", function () {
  debug("หน้าเว็บและทรัพยากรทั้งหมดโหลดเสร็จสมบูรณ์");
  hideLoading();
});
