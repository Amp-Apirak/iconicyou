// ---------------------------------------------------------------------------------
// ส่วนที่ 1: การกำหนดตัวแปรหลัก (Global Variables)
// อธิบาย: ส่วนนี้กำหนดตัวแปรที่ใช้ทั่วทั้งโปรแกรม เช่น instance ของกราฟแต่ละตัว, URL API, และการตั้งค่าพื้นฐาน
// ---------------------------------------------------------------------------------
let timeSeriesChart = null; // ตัวแปรสำหรับกราฟเส้น (Time Series Chart) แสดงจำนวนคนตามเวลา
let cameraPieChart = null; // ตัวแปรสำหรับกราฟวงกลม (Pie Chart) แสดงสัดส่วนจำนวนคนตามกล้อง
let barChart = null; // ตัวแปรสำหรับกราฟแท่ง (Bar Chart) แสดงจำนวนคนตามชั่วโมงแยกตามกล้อง
let horizontalBarCharts = [null, null, null, null]; // ตัวแปรสำหรับกราฟแท่งแนวนอน 4 ตัว (Horizontal Bar Charts) แสดงจำนวนคนตามช่วงเวลาของแต่ละกล้อง
let activityDurationChart = null; // ตัวแปรสำหรับกราฟกล่อง (Box Plot) แสดงการกระจายระยะเวลาที่คนอยู่ในโซน

const API_BASE_URL = "https://iconicyou-api.pointit.co.th"; // URL หลักสำหรับเชื่อมต่อ API
const FIXED_LIMIT = 10000; // จำนวนข้อมูลสูงสุดที่ดึงจาก API
let realtimeInterval = null; // ตัวแปรสำหรับจัดการการอัปเดตข้อมูลแบบเรียลไทม์
const REALTIME_UPDATE_INTERVAL = 30000; // ช่วงเวลาอัปเดตเรียลไทม์ทุก 30 วินาที
let currentData = []; // ตัวแปรเก็บข้อมูลล่าสุดจาก API
let currentSearchParams = null; // ตัวแปรเก็บพารามิเตอร์การค้นหาปัจจุบัน
const SHOW_DEBUG = true; // เปิด/ปิดการแสดงข้อมูล Debug

// เพิ่มตัวแปรสถานะสำหรับติดตาม Loading Overlay
let isLoadingShown = false;

// การกำหนดสีสำหรับกล้องแต่ละตัว (ใช้ในกราฟทุกประเภท)
const cameraColorMap = {
  "ICONIC-01": "#0d6efd", // กล้อง 1 (โซน 1) - สีฟ้า
  "ICONIC-02": "#20c997", // กล้อง 2 (โซน 2) - สีเขียวมิ้นต์
  "ICONIC-03": "#ffc107", // กล้อง 3 (โซน 3) - สีเหลือง
  "ICONIC-04": "#dc3545", // กล้อง 4 (โซน 4) - สีแดง
};

// ฟังก์ชันดึงสีของกล้องตามชื่อ (ใช้ในกราฟทุกตัว)
function getCameraColor(cameraName) {
  return cameraColorMap[cameraName] || "#999999";
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 2: ฟังก์ชันจัดการ Loading Overlay และ Debug
// อธิบาย: ส่วนนี้จัดการการแสดง/ซ่อนหน้า Loading และการ Debug ข้อมูลใน Console
// ---------------------------------------------------------------------------------
function showLoading() {
  // แสดงหน้าจอ Loading ขณะโหลดข้อมูล
  if (isLoadingShown || document.getElementById("loading-overlay")) return;
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
  isLoadingShown = true;
  debug("แสดงหน้า Loading Overlay");
}

function hideLoading() {
  // ซ่อนหน้าจอ Loading หลังโหลดข้อมูลเสร็จ
  if (!isLoadingShown) {
    debug("หน้า Loading Overlay ไม่ได้แสดง, ข้ามการลบ");
    return;
  }
  const loading = document.getElementById("loading-overlay");
  if (loading) {
    if (document.body.contains(loading)) {
      document.body.removeChild(loading);
      debug("ซ่อนหน้า Loading Overlay เรียบร้อย");
    } else {
      debug("ไม่พบ element #loading-overlay ใน document.body, ข้ามการลบ");
    }
  } else {
    debug("ไม่พบ element #loading-overlay, ข้ามการลบ");
  }
  isLoadingShown = false;
}

function debug(message, data = null) {
  // แสดงข้อมูล Debug ใน Console ถ้าเปิด SHOW_DEBUG
  if (!SHOW_DEBUG) return;
  if (data) console.log(`[DEBUG] ${message}:`, data);
  else console.log(`[DEBUG] ${message}`);
}



// ---------------------------------------------------------------------------------
// ส่วนที่ 3: ฟังก์ชันคำนวณวันที่ (Calculate Dates)
// อธิบาย: ส่วนนี้คำนวณวันที่เริ่มต้นและสิ้นสุดตามตัวเลือกในฟอร์ม (ใช้ในทุกกราฟและสถิติ)
// ---------------------------------------------------------------------------------
function calculateDates(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let startDate = new Date(today);
  let endDate = new Date(today);

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

// ---------------------------------------------------------------------------------
// ส่วนที่ 4: ฟังก์ชันโหลดข้อมูลกล้องและโซน (Load Cameras and Zones)
// อธิบาย: ดึงข้อมูลกล้องจาก API เพื่อใช้ใน Dropdown ของกราฟ Time Series และส่วนอื่นๆ
// ---------------------------------------------------------------------------------
async function loadCamerasAndZones() {
  try {
    debug("เริ่มโหลดข้อมูลกล้องและโซน");
    const computeId = document.querySelector("#compute_id").value;
    const url = `${API_BASE_URL}/analytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
    debug("API URL:", url);

    const response = await fetchWithTimeout(url, 5000);
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

    updateCameraSelect(allCameras); // อัปเดต Dropdown สำหรับกราฟ Time Series
  } catch (error) {
    console.error("Error loading cameras/zones:", error);
    showToast("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้: " + error.message, "error");
  }
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 5: ฟังก์ชันโหลดข้อมูลหลัก (Load Data)
// อธิบาย: ดึงข้อมูลจาก API เพื่อใช้ในทุกกราฟและ Card สถิติ โดยกรองเฉพาะ label = "person"
// ---------------------------------------------------------------------------------
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

      if (!formData.get("source_name")) {
        params.append("source_name", "");
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

      fetchWithTimeout(url, 10000)
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

          if (
            !data.every(
              (item) => item && item.data && item.data.analyticsResult
            )
          ) {
            throw new Error("ข้อมูลจาก API ไม่ถูกต้อง");
          }

          currentData = data;
          updateDashboard(data, isRealtime); // อัปเดตทุกกราฟและ Card
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 6: ฟังก์ชัน Fetch ข้อมูลด้วย Timeout
// อธิบาย: ใช้สำหรับดึงข้อมูลจาก API พร้อมตั้งค่า Timeout ป้องกันการค้าง
// ---------------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 7: ฟังก์ชันแสดงข้อความเมื่อไม่มีข้อมูล (Display No Data)
// อธิบาย: แสดงข้อความในกราฟทุกตัวเมื่อไม่มีข้อมูลหรือเกิดข้อผิดพลาด
// ---------------------------------------------------------------------------------
function displayNoData(errorMessage = null) {
  debug("แสดงข้อความไม่พบข้อมูล" + (errorMessage ? `: ${errorMessage}` : ""));

  if (timeSeriesChart) {
    debug("ล้างข้อมูลกราฟ Time Series");
    timeSeriesChart.updateOptions({ series: [{ data: [] }] }); // กราฟเส้น
  }
  if (cameraPieChart) {
    debug("ล้างข้อมูลกราฟ Pie Chart");
    cameraPieChart.updateOptions({ series: [], labels: [] }); // กราฟวงกลม
  }
  if (barChart) {
    debug("ล้างข้อมูลกราฟ Bar Chart");
    barChart.updateOptions({
      series: [{ data: [] }],
      xaxis: { categories: [] },
    }); // กราฟแท่ง
  }
  horizontalBarCharts.forEach((chart, index) => {
    if (chart) {
      debug(`ล้างข้อมูลกราฟ Horizontal Bar Chart ${index + 1}`);
      chart.updateOptions({ series: [{ data: [] }] }); // กราฟแท่งแนวนอนทั้ง 4 ตัว
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

  document.getElementById("total-people").textContent = "0"; // Card จำนวนคน
  document.getElementById("total-cameras").textContent = "0"; // Card จำนวนกล้อง
  document.getElementById("total-zones").textContent = "0"; // Card จำนวนโซน
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 8: ฟังก์ชันจัดการ Realtime Update
// อธิบาย: ควบคุมการอัปเดตข้อมูลแบบเรียลไทม์สำหรับทุกกราฟและ Card
// ---------------------------------------------------------------------------------
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

function stopRealtimeUpdate() {
  debug("หยุดการอัปเดตแบบ Realtime");
  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
  document.getElementById("realtime-status").style.display = "none";
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 9: ฟังก์ชันอัปเดต Dashboard
// อธิบาย: อัปเดตข้อมูลทั้งหมดใน Dashboard รวมถึงทุกกราฟและ Card สถิติ
// ---------------------------------------------------------------------------------
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

    updateTimeSeriesChart(data); // อัปเดตกราฟเส้น (Time Series Chart)
    updatePieChart(data); // อัปเดตกราฟวงกลม (Pie Chart)
    updateBarChart(data); // อัปเดตกราฟแท่ง (Bar Chart)
    updateHorizontalBarCharts(data); // อัปเดตกราฟแท่งแนวนอน 4 ตัว (Horizontal Bar Charts)
    updateStats(data); // อัปเดต Card สถิติ (จำนวนคน, กล้อง, โซน)

    if (currentSearchParams) {
      fetchActivityDurationData(new URLSearchParams(currentSearchParams))
        .then((activityData) => {
          if (Array.isArray(activityData))
            updateActivityDurationChart(activityData); // อัปเดตกราฟกล่อง (Box Plot)
        })
        .catch((error) =>
          console.error("Error updating activity duration chart:", error)
        );
    }

    updateLastUpdatedTime(); // อัปเดตเวลาล่าสุดที่ข้อมูลถูกอัปเดต
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต Dashboard:", error);
    if (!isRealtime)
      showToast(
        `เกิดข้อผิดพลาดในการอัปเดต Dashboard: ${error.message}`,
        "error"
      );
  }
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 10: ฟังก์ชันอัปเดตเวลา (Last Updated Time)
// อธิบาย: อัปเดตเวลาล่าสุดที่ข้อมูลใน Dashboard ถูกอัปเดต
// ---------------------------------------------------------------------------------
function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("th-TH");
  const lastUpdatedElement = document.getElementById("last-updated-time");
  if (lastUpdatedElement) lastUpdatedElement.textContent = timeString;
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 11: ฟังก์ชันอัปเดต Card สถิติ (Update Stats)
// อธิบาย: อัปเดตข้อมูลใน Card จำนวนคน, จำนวนกล้อง, และจำนวนโซน โดยใช้เฉพาะ label = "person"
// ---------------------------------------------------------------------------------
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
            if (obj.label === "person")
              totalPeople += item.data.analyticsResult.cnt || 0;
          });
        } else if (item.data.analyticsResult.objsInfo.label === "person") {
          totalPeople += item.data.analyticsResult.cnt || 0;
        }
      }
    }
  });

  totalPeople = Math.round(totalPeople / 2);

  document.getElementById("total-people").textContent =
    totalPeople.toLocaleString(); // Card จำนวนคน
  document.getElementById("total-cameras").textContent =
    cameraSet.size.toLocaleString(); // Card จำนวนกล้อง
  document.getElementById("total-zones").textContent =
    cameraSet.size.toLocaleString(); // Card จำนวนโซน

  debug("อัปเดตสถิติเรียบร้อย  ", { totalPeople, cameras: cameraSet.size });
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 12: ฟังก์ชันอัปเดต Dropdown ของ Time Series Chart
// อธิบาย: อัปเดต Dropdown เลือกกล้องสำหรับกราฟเส้น (Time Series Chart)
// ---------------------------------------------------------------------------------
let selectedCameraForTimeSeries = "ICONIC-01"; // ค่าเริ่มต้นสำหรับกราฟเส้น
function updateCameraSelect(cameras = null) {
  const cameraSelect = document.getElementById("cameraSelectTimeSeries");
  if (!cameraSelect) {
    debug("ไม่พบ element #cameraSelectTimeSeries");
    return;
  }

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

  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];
  cameraList.sort((a, b) => cameraOrder.indexOf(a) - cameraOrder.indexOf(b));

  cameraSelect.innerHTML = "";
  cameraList.forEach((camera) => {
    cameraSelect.innerHTML += `<option value="${camera}">${camera}</option>`;
  });

  if (cameraList.includes("ICONIC-01")) {
    cameraSelect.value = "ICONIC-01";
  } else if (cameraList.length > 0) {
    cameraSelect.value = cameraList[0];
  }

  selectedCameraForTimeSeries = cameraSelect.value;
  debug(
    "อัปเดต Dropdown กล้องสำเร็จ, ค่าเริ่มต้น: " + selectedCameraForTimeSeries
  );
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 13: ฟังก์ชันอัปเดตกราฟเส้น (Time Series Chart)
// อธิบาย: อัปเดตกราฟเส้นแสดงจำนวนคนตามเวลาสำหรับกล้องที่เลือก โดยใช้เฉพาะ label = "person"
// ---------------------------------------------------------------------------------
function updateTimeSeriesChart(data) {
  try {
    debug("อัปเดตกราฟเส้น Time Series  ");
    if (!Array.isArray(data) || data.length === 0) {
      debug("ไม่พบข้อมูลสำหรับกราฟเส้น");
      if (timeSeriesChart)
        timeSeriesChart.updateOptions({ series: [{ data: [] }] });
      return;
    }

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
          cnt = item.data.analyticsResult.objsInfo
            .filter((obj) => obj.label === "person")
            .reduce(
              (sum, obj) => sum + (item.data.analyticsResult.cnt || 0),
              0
            );
        } else if (item.data.analyticsResult.objsInfo.label === "person") {
          cnt = item.data.analyticsResult.cnt || 0;
        }
        const time = new Date(item.time).getTime();
        return { x: time, y: cnt };
      })
      .filter((item) => item !== null);

    const options = {
      series: [
        { name: `จำนวนคน (${selectedCameraForTimeSeries})`, data: chartData },
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
      yaxis: { title: { text: "จำนวนคน" }, min: 0, forceNiceScale: true },
      tooltip: {
        x: { format: "dd/MM/yy HH:mm" },
        y: { formatter: (value) => value + " คน" },
      },
      colors: [getCameraColor(selectedCameraForTimeSeries)],
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 14: ฟังก์ชันอัปเดตกราฟวงกลม (Pie Chart)
// อธิบาย: อัปเดตกราฟวงกลมแสดงสัดส่วนจำนวนคนตามกล้องทั้งหมด โดยใช้เฉพาะ label = "person"
// ---------------------------------------------------------------------------------
function updatePieChart(data) {
  debug("อัปเดตกราฟวงกลม Pie Chart  ");

  const cameraData = {};
  data.forEach((item) => {
    const cam = item?.data?.sourceName || "ไม่ระบุ";
    let cnt = 0;
    if (item?.data?.analyticsResult?.objsInfo) {
      if (Array.isArray(item.data.analyticsResult.objsInfo)) {
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 15: ฟังก์ชันอัปเดตกราฟแท่ง (Bar Chart)
// อธิบาย: อัปเดตกราฟแท่งแสดงจำนวนคนตามชั่วโมงแยกตามกล้อง โดยใช้เฉพาะ label = "person"
// ---------------------------------------------------------------------------------
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
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
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
      style: { fontSize: isSmallScreen ? "8px" : "12px", colors: ["#304758"] },
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 16: ฟังก์ชันอัปเดตกราฟแท่งแนวนอน (Horizontal Bar Charts)
// อธิบาย: อัปเดตกราฟแท่งแนวนอน 4 ตัว แสดงจำนวนคนตามช่วงเวลา (06:00 - 21:00) สำหรับแต่ละกล้อง โดยใช้เฉพาะ label = "person"
// ---------------------------------------------------------------------------------
function updateHorizontalBarCharts(data) {
  debug("อัปเดตกราฟแท่งแนวนอนแบบรายชั่วโมง (06:00 - 21:00)");

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
  const cameraSet = new Set();

  data.forEach((item) => {
    if (!item || !item.data || !item.data.analyticsResult) return;
    const cameraName = item.data.sourceName || "ไม่ระบุ";
    let cnt = 0;
    if (item?.data?.analyticsResult?.objsInfo) {
      if (Array.isArray(item.data.analyticsResult.objsInfo)) {
        cnt = item.data.analyticsResult.objsInfo
          .filter((obj) => obj.label === "person")
          .reduce((sum, obj) => sum + (item.data.analyticsResult.cnt || 0), 0);
      } else if (item.data.analyticsResult.objsInfo.label === "person") {
        cnt = item.data.analyticsResult.cnt || 0;
      }
    }
    if (cnt > 0) cameraSet.add(cameraName);
  });

  let cameras = Array.from(cameraSet);
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];
  cameras.sort(
    (a, b) =>
      cameraOrder.indexOf(a) - cameraOrder.indexOf(b) ||
      (cameraOrder.indexOf(a) === -1 ? 1 : -1)
  );

  if (cameras.length === 0) {
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

  const cameraLimit = Math.min(cameras.length, 4);

  for (let index = 0; index < cameraLimit; index++) {
    const cam = cameras[index];
    const seriesData = Array(timeRanges.length).fill(0);
    const cameraData = data.filter((item) => item?.data?.sourceName === cam);

    cameraData.forEach((item) => {
      if (item?.time && item?.data?.analyticsResult?.cnt) {
        let cnt = 0;
        if (item?.data?.analyticsResult?.objsInfo) {
          if (Array.isArray(item.data.analyticsResult.objsInfo)) {
            cnt = item.data.analyticsResult.objsInfo
              .filter((obj) => obj.label === "person")
              .reduce(
                (sum, obj) => sum + (item.data.analyticsResult.cnt || 0),
                0
              );
          } else if (item.data.analyticsResult.objsInfo.label === "person") {
            cnt = item.data.analyticsResult.cnt || 0;
          }
        }
        if (cnt > 0) {
          const time = new Date(item.time);
          const hour = time.getHours();
          if (hour >= 6 && hour < 21) {
            const rangeIndex = hour - 6;
            if (rangeIndex >= 0 && rangeIndex < seriesData.length) {
              seriesData[rangeIndex] += cnt;
            }
          }
        }
      }
    });

    const options = {
      series: [{ name: "จำนวนคน", data: seriesData }],
      chart: {
        type: "bar",
        height: 500,
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
      xaxis: { categories: timeRanges, title: { text: "จำนวนคน" } },
      yaxis: {
        labels: { show: true, style: { fontSize: "10px" } },
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
      colors: [getCameraColor(cam)],
      noData: {
        text: "ไม่พบข้อมูล",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 600 },
            plotOptions: { bar: { barHeight: "60%" } },
            yaxis: { labels: { style: { fontSize: "8px" } } },
          },
        },
      ],
    };

    const containerId = `#horizontal-bar-chart-${index + 1}`;
    const chartEl = document.querySelector(containerId);
    if (!chartEl) {
      debug(`ไม่พบ element ${containerId}`);
      continue;
    }

    const noDataEl = chartEl.querySelector(".no-data");
    if (noDataEl) noDataEl.remove();

    const cardHeader = chartEl
      .closest(".card")
      ?.querySelector(".card-header .card-title");
    if (cardHeader) {
      cardHeader.innerHTML = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : <span style="color: ${getCameraColor(
        cam
      )}">${cam}</span> (รายชั่วโมง)`;
    }

    try {
      if (horizontalBarCharts[index]) {
        debug(`อัปเดตกราฟ Horizontal Bar Chart ${index + 1} ด้วยข้อมูลใหม่`);
        horizontalBarCharts[index].destroy();
      }
      horizontalBarCharts[index] = new ApexCharts(chartEl, options);
      horizontalBarCharts[index].render();
    } catch (error) {
      console.error(`Error updating horizontal bar chart ${index + 1}:`, error);
      showToast(
        `เกิดข้อผิดพลาดในการอัปเดตกราฟแท่งแนวนอน ${index + 1}: ${
          error.message
        }`,
        "error"
      );
    }
  }

  for (let i = cameraLimit; i < 4; i++) {
    if (horizontalBarCharts[i]) {
      const containerId = `#horizontal-bar-chart-${i + 1}`;
      const chartEl = document.querySelector(containerId);
      if (chartEl) {
        debug(`ล้างข้อมูลกราฟ Horizontal Bar Chart ${i + 1}`);
        horizontalBarCharts[i].updateOptions({ series: [{ data: [] }] });
        if (!chartEl.querySelector(".no-data")) {
          const noDataDiv = document.createElement("div");
          noDataDiv.className = "no-data";
          noDataDiv.innerHTML = `<i class="bi bi-exclamation-triangle"></i><div class="no-data-text">ไม่พบข้อมูลกล้อง (label = 'person')</div>`;
          chartEl.appendChild(noDataDiv);
        }
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 17: ฟังก์ชันจัดการข้อมูลและกราฟกล่อง (Box Plot - Activity Duration Chart)
// อธิบาย: ดึงและประมวลผลข้อมูลระยะเวลาคนอยู่ในโซน และอัปเดตกราฟกล่อง
// ---------------------------------------------------------------------------------
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
    const response = await fetchWithTimeout(url, 5000);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลระยะเวลา:", error);
    return [];
  }
}

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
      if (duration > 0) {
        console.log(
          `Camera: ${item.data.source}, Duration: ${duration} นาที, Start: ${item.data.start_time}, End: ${item.data.end_time}`
        );
        const cameraName = item.data.source;
        if (cameraData[cameraName]) {
          const cappedDuration = Math.min(duration, 1440);
          cameraData[cameraName].push({
            duration: cappedDuration,
            startTime: new Date(item.data.start_time),
            endTime: new Date(item.data.end_time),
          });
        }
      }
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

    if (n === 0) {
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
    }

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

function calculateDurationInMinutes(start_time, end_time) {
  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start) || isNaN(end)) {
    console.warn(
      `วันที่ไม่ถูกต้อง: start_time=${start_time}, end_time=${end_time}`
    );
    return 0;
  }
  const durationSeconds = (end - start) / 1000;
  return Math.round(durationSeconds / 60);
}

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
      text: "การกระจายของระยะเวลาที่ผู้เยี่ยมชมใช้ในแต่ละโซน",
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
        return `
          <div class="activity-tooltip p-3">
            <div class="fw-bold mb-2 border-bottom pb-2">${data.zone}</div>
            <div class="px-3">
              <div>จำนวนคน: ${data.count} คน</div>
              <div>ระยะเวลาเฉลี่ย: ${Math.round(data.average)} นาที</div>
              <div class="mt-2">การกระจายของเวลา:</div>
              <div class="ps-2">
                <div>• ต่ำสุด: ${data.min} นาที</div>
                <div>• Q1 (25%): ${data.q1} นาที</div>
                <div>• ค่ากลาง: ${data.median} นาที</div>
                <div>• Q3 (75%): ${data.q3} นาที</div>
                <div>• สูงสุด: ${data.max} นาที</div>
              </div>
            </div>
          </div>`;
      },
    },
    colors: processedData.map((d) => getCameraColor(d.camera)),
  };

  const chartEl = document.querySelector("#activity-duration-chart");
  if (!chartEl) {
    console.log("ไม่พบ element #activity-duration-chart");
    return;
  }

  try {
    if (window.activityDurationChart) {
      console.log("อัปเดตกราฟ Activity Duration ด้วยข้อมูลใหม่");
      window.activityDurationChart.updateOptions(options);
    } else {
      console.log("สร้างกราฟ Activity Duration ใหม่");
      window.activityDurationChart = new ApexCharts(chartEl, options);
      window.activityDurationChart.render();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟระยะเวลา:", error);
    showToast(
      `เกิดข้อผิดพลาดในการอัปเดตกราฟระยะเวลา: ${error.message}`,
      "error"
    );
  }
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 18: ฟังก์ชันส่งออกข้อมูล (Export Activity Data)
// อธิบาย: ส่งออกข้อมูลระยะเวลาคนอยู่ในโซนเป็นไฟล์ CSV
// ---------------------------------------------------------------------------------
function exportActivityData(data, format = "csv") {
  const processedData = processActivityDurationData(data);
  if (format === "csv") {
    let csv = "Zone,Count,Min,Q1,Median,Q3,Max\n";
    processedData.forEach((d) => {
      csv += `${d.zone},${d.count},${d.min},${d.q1},${d.median},${d.q3},${d.max}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_duration_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log("ส่งออกข้อมูลสำเร็จ");
  }
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 19: การเริ่มต้นเมื่อหน้าโหลด (DOMContentLoaded)
// อธิบาย: ตั้งค่าเริ่มต้นและเรียกใช้งานฟังก์ชันต่างๆ เมื่อหน้าเว็บโหลด
// ---------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // คำนวณวันที่ปัจจุบันและวันพรุ่งนี้
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
  const startDateStr = today.toISOString().split("T")[0]; // วันที่ปัจจุบัน
  const endDateStr = tomorrow.toISOString().split("T")[0]; // วันพรุ่งนี้

  // ตั้งค่าพารามิเตอร์สำหรับการดึงข้อมูล โดยใช้ start_date และ end_date จากวันที่ปัจจุบันและวันพรุ่งนี้
  const sampleParams = new URLSearchParams({
    compute_id: "7",
    start_date: startDateStr, // เปลี่ยนเป็นวันที่ปัจจุบัน
    end_date: endDateStr, // เปลี่ยนเป็นวันพรุ่งนี้
  });

  // เรียกข้อมูลสำหรับกราฟกล่อง (Box Plot) โดยใช้พารามิเตอร์วันที่ใหม่
  fetchActivityDurationData(sampleParams)
    .then((data) => {
      updateActivityDurationChart(data); // อัปเดตกราฟกล่องเมื่อหน้าโหลด
    })
    .catch((error) => {
      console.error("ไม่สามารถดึงข้อมูลได้:", error);
    });

  const exportBtn = document.getElementById("export-activity-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      fetchActivityDurationData(sampleParams)
        .then((data) => exportActivityData(data))
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการส่งออก:", error);
          showToast(
            "เกิดข้อผิดพลาดในการส่งออกข้อมูล: " + error.message,
            "error"
          );
        });
    });
  }
});

// ---------------------------------------------------------------------------------
// ส่วนที่ 20: ฟังก์ชันจัดการ Modal, Form และ Toast
// อธิบาย: จัดการการแสดง Modal, การส่งฟอร์ม, และการแจ้งเตือน Toast
// ---------------------------------------------------------------------------------
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
            break;
          case "2":
            zoneColor = "#4cd3a5";
            break;
          case "3":
            zoneColor = "#ffc107";
            break;
          case "4":
            zoneColor = "#ff6b6b";
            break;
        }
        let titleText = title ? ` ${title}` : "";
        modalTitle.innerHTML = `<span style="color:${zoneColor}">Zone ${zone}${titleText}</span> - กล้อง ${camera}`;
      }
    });
  }
}

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
    stopRealtimeUpdate();
    loadData()
      .then(() => startRealtimeUpdate())
      .catch((error) => console.error("Form submit failed:", error));
  });

  document
    .getElementById("date_range")
    .addEventListener("change", toggleDateFields);

  const realtimeToggle = document.getElementById("realtime-toggle");
  if (realtimeToggle) {
    realtimeToggle.checked = true;
    realtimeToggle.addEventListener("change", function () {
      if (this.checked) startRealtimeUpdate();
      else stopRealtimeUpdate();
    });
  }
}

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
      break;
    case "warning":
      bgColor = "bg-warning";
      icon = "bi-exclamation-triangle";
      break;
    case "error":
      bgColor = "bg-danger";
      icon = "bi-x-circle";
      break;
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

// ---------------------------------------------------------------------------------
// ส่วนที่ 21: ฟังก์ชันจัดการ Responsive Listener
// อธิบาย: ปรับขนาดกราฟ Bar Chart เมื่อหน้าจอเปลี่ยนขนาด
// ---------------------------------------------------------------------------------
function setupResponsiveListener() {
  if (typeof _ === "undefined") {
    console.error("Lodash ไม่ถูกโหลด โปรดตรวจสอบการรวมไฟล์ lodash.min.js");
    return;
  }
  window.addEventListener(
    "resize",
    _.debounce(function () {
      if (currentData.length > 0) {
        debug("ปรับขนาดหน้าจอ เรียกอัปเดตกราฟ Bar Chart");
        updateBarChart(currentData);
      }
    }, 250)
  );
}

// ---------------------------------------------------------------------------------
// ส่วนที่ 22: การเริ่มต้น Dashboard เมื่อหน้าโหลด (DOMContentLoaded)
// อธิบาย: ตั้งค่าเริ่มต้นทั้งหมดและเรียกโหลดข้อมูลเมื่อหน้าเว็บโหลด
// ---------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initModal();
  initFormHandlers();

  const form = document.getElementById("search-form");
  if (!form) {
    debug("ไม่พบฟอร์มค้นหาในหน้าเว็บ");
    showToast("ไม่พบฟอร์มค้นหาในหน้าเว็บ", "error");
    return;
  }

  const dateRangeSelect = document.getElementById("date_range");
  const computeIdSelect = document.getElementById("compute_id");
  const sourceNameSelect = document.getElementById("source_name");

  if (dateRangeSelect) dateRangeSelect.value = "today";
  if (computeIdSelect) computeIdSelect.value = "7";
  if (sourceNameSelect) sourceNameSelect.value = "";

  const today = calculateDates("today");
  const startDateInput = form.querySelector('input[name="start_date"]');
  const endDateInput = form.querySelector('input[name="end_date"]');
  if (startDateInput) startDateInput.value = today.startDate;
  if (endDateInput) endDateInput.value = today.endDate;

  loadCamerasAndZones().catch((error) => {
    console.error("Failed to load cameras/zones:", error);
    showToast("ไม่สามารถโหลดข้อมูลกล้อง/โซนได้: " + error.message, "error");
  });

  updateCameraSelect();

  const cameraSelect = document.getElementById("cameraSelectTimeSeries");
  if (cameraSelect) {
    cameraSelect.addEventListener("change", function () {
      selectedCameraForTimeSeries = this.value;
      if (currentData.length > 0) {
        debug("เปลี่ยนกล้องใน Dropdown, อัปเดตกราฟ Time Series  ");
        updateTimeSeriesChart(currentData);
      }
    });
  } else {
    debug("ไม่พบ element #cameraSelectTimeSeries");
    showToast("ไม่พบ Dropdown สำหรับเลือกกล้อง", "error");
  }

  toggleDateFields();

  loadData()
    .then(() => {
      debug("โหลดข้อมูลเริ่มต้นสำเร็จ, เริ่ม Realtime Update  ");
      startRealtimeUpdate();
    })
    .catch((error) => {
      console.error("Initial load failed:", error);
      showToast("ไม่สามารถโหลดข้อมูลเริ่มต้นได้: " + error.message, "error");
    });

  const exportBtn = document.getElementById("export-activity-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (currentSearchParams) {
        debug("เริ่มการส่งออกข้อมูล Activity Duration");
        fetchActivityDurationData(new URLSearchParams(currentSearchParams))
          .then((data) => exportActivityData(data))
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

  setupResponsiveListener();
});

// ---------------------------------------------------------------------------------
// ส่วนที่ 23: การจัดการเมื่อหน้าโหลดเสร็จสมบูรณ์ (Window Load)
// อธิบาย: ซ่อน Loading Overlay เมื่อหน้าเว็บและทรัพยากรโหลดเสร็จ
// ---------------------------------------------------------------------------------
window.addEventListener("load", function () {
  debug("หน้าเว็บและทรัพยากรทั้งหมดโหลดเสร็จสมบูรณ์");
  hideLoading();
});
