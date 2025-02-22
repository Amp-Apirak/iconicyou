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

/**
 * ----------------------------------------------------------------
 * เพิ่ม: Mapping ชื่อกล้อง -> สี (ล็อกสีให้คงที่)
 * ----------------------------------------------------------------
 */
const cameraColorMap = {
  "ICONIC-01": "#0d6efd", // ตัวอย่างกำหนดให้ "Camera A" ได้สีฟ้า
  "ICONIC-02": "#20c997", // ตัวอย่างกำหนดให้ "Camera B" ได้สีเขียวมิ้นต์
  "ICONIC-03": "#ffc107", // ตัวอย่างกำหนดให้ "Camera C" ได้สีเหลือง
  "ICONIC-04": "#dc3545", // ตัวอย่างกำหนดให้ "Camera D" ได้สีแดง
  "Camera E": "#6610f2", // ตัวอย่างกำหนดให้ "Camera E" ได้สีม่วง
  // คุณสามารถเพิ่ม/แก้ไขได้ตามจริง
};

/**
 * ฟังก์ชันดึงสีของกล้องจาก cameraColorMap
 * ถ้าไม่เจอให้ใช้สี default (#999999)
 */
function getCameraColor(cameraName) {
  return cameraColorMap[cameraName] || "#999999";
}

// ==========================================
// ส่วนฟังก์ชันสำหรับแสดง/ซ่อน Loading Overlay
// ==========================================

function showLoading() {
  debug("แสดง Loading overlay");
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

async function loadCamerasAndZones() {
  try {
    debug("เริ่มโหลดข้อมูลกล้องและโซน");
    const computeId = document.querySelector("#compute_id").value;

    const url = `${API_BASE_URL}/analytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
    debug("API URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status})`);
    }

    const data = await response.json();
    debug("ได้รับข้อมูลจาก API", data.length + " รายการ");

    if (!Array.isArray(data)) {
      debug("ข้อมูลที่ได้ไม่ใช่ array");
      return;
    }

    const cameraSet = new Set();
    const zoneSet = new Set();

    data.forEach((item) => {
      if (item && item.data && item.data.sourceName) {
        cameraSet.add(item.data.sourceName);
      }

      if (item && item.data && item.data.analyticsResult) {
        if (Array.isArray(item.data.analyticsResult.objsInfo)) {
          item.data.analyticsResult.objsInfo.forEach((obj) => {
            if (obj && obj.roiName) {
              const zoneName = obj.roiName.replace("Zone:", "").trim();
              zoneSet.add(zoneName);
            }
          });
        } else if (
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

async function loadData(isRealtime = false) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isRealtime) {
        showLoading();
      }

      debug("เริ่มโหลดข้อมูลตามเงื่อนไข" + (isRealtime ? " (realtime)" : ""));

      const form = document.getElementById("search-form");
      if (!form) {
        throw new Error("ไม่พบฟอร์มค้นหา");
      }

      const formData = new FormData(form);
      const computeId = formData.get("compute_id") || 7;

      let url = `${API_BASE_URL}/getAnalytics/?compute_id=${computeId}&limit=${FIXED_LIMIT}`;
      const params = new URLSearchParams();

      if (formData.get("source_name")) {
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
      if (currentSearchParams) {
        url += `&${currentSearchParams}`;
      }

      debug("API URL สำหรับข้อมูล:", url);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `ไม่สามารถเชื่อมต่อกับ API ได้ (${response.status}): ${response.statusText}`
          );
        }

        const responseText = await response.text();

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

        if (!Array.isArray(data)) {
          debug("ข้อมูลที่ได้ไม่ใช่ array:", data);
          displayNoData();
          resolve();
          return;
        }

        if (data.length === 0) {
          debug("ไม่พบข้อมูล");
          displayNoData();
          resolve();
          return;
        }

        currentData = data;
        updateDashboard(data, isRealtime);
        resolve();
      } catch (fetchError) {
        debug("เกิดข้อผิดพลาดในการเรียก API:", fetchError);
        displayNoData(fetchError.message);
        resolve();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (!isRealtime) {
        alert(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`);
      }
      displayNoData(error.message);
      resolve();
    } finally {
      if (!isRealtime) {
        hideLoading();
      }
    }
  });
}

function displayNoData(errorMessage = null) {
  debug("แสดงข้อความไม่พบข้อมูล" + (errorMessage ? `: ${errorMessage}` : ""));

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

  horizontalBarCharts.forEach((chart, index) => {
    if (chart) {
      chart.updateOptions({
        series: [{ data: [] }],
      });
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

// ==========================================
// ส่วนฟังก์ชัน Realtime Update (startRealtimeUpdate)
// ==========================================

function startRealtimeUpdate() {
  debug("เริ่มการอัปเดตแบบ Realtime");
  stopRealtimeUpdate();
  document.getElementById("realtime-status").style.display = "inline-block";

  realtimeInterval = setInterval(() => {
    loadData(true);
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

// ==========================================
// ส่วนฟังก์ชันอัปเดตข้อมูลบน Dashboard
// ==========================================

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

    try {
      updateTimeSeriesChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟเส้น:", error);
    }

    try {
      updatePieChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟวงกลม:", error);
    }

    try {
      updateBarChart(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่ง:", error);
    }

    try {
      updateHorizontalBarCharts(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่งแนวนอน:", error);
    }

    try {
      updateStats(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถิติ:", error);
    }

    updateLastUpdatedTime();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดต Dashboard:", error);
    if (!isRealtime) {
      alert(`เกิดข้อผิดพลาดในการอัปเดต Dashboard: ${error.message}`);
    }
  }
}

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

function updateStats(data) {
  let totalPeople = 0;
  let cameraSet = new Set();

  data.forEach((item) => {
    const cnt = item?.data?.analyticsResult?.cnt || 0;
    totalPeople += cnt;

    const cameraName = item?.data?.sourceName || "unknown";
    cameraSet.add(cameraName);
  });

  const elTotalPeople = document.getElementById("total-people");
  const elTotalCameras = document.getElementById("total-cameras");
  const elTotalZones = document.getElementById("total-zones");

  if (elTotalPeople) {
    elTotalPeople.textContent = totalPeople.toLocaleString();
  }
  if (elTotalCameras) {
    elTotalCameras.textContent = cameraSet.size.toLocaleString();
  }
  if (elTotalZones) {
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

function updateTimeSeriesChart(data) {
  try {
    debug("อัปเดตกราฟเส้น Time Series");

    if (!Array.isArray(data) || data.length === 0) {
      debug("ไม่พบข้อมูลสำหรับกราฟเส้น");
      if (timeSeriesChart) {
        timeSeriesChart.updateOptions({
          series: [{ data: [] }],
        });
      }
      return;
    }

    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a?.time || 0);
      const timeB = new Date(b?.time || 0);
      return timeA - timeB;
    });

    const chartData = sortedData
      .map((item) => {
        if (!item || !item.time || !item.data || !item.data.analyticsResult) {
          return null;
        }
        const time = new Date(item.time).getTime();
        const cnt = item.data.analyticsResult.cnt || 0;
        return { x: time, y: cnt };
      })
      .filter((item) => item !== null);

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
      timeSeriesChart.updateOptions(options);
    } else {
      debug("สร้างกราฟเส้นใหม่");
      timeSeriesChart = new ApexCharts(chartEl, options);
      timeSeriesChart.render();
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟเส้น:", error);
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

function updatePieChart(data) {
  debug("อัปเดตกราฟวงกลม Pie Chart");

  const cameraData = {};
  data.forEach((item) => {
    const cam = item?.data?.sourceName || "ไม่ระบุ";
    const cnt = item?.data?.analyticsResult?.cnt || 0;
    cameraData[cam] = (cameraData[cam] || 0) + cnt;
  });

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
function updateBarChart(data) {
  debug("อัปเดตกราฟแท่ง Bar Chart");

  // สร้างข้อมูลตามชั่วโมงและกล้อง
  const hourCameraData = {};
  const cameraSet = new Set();

  data.forEach((item) => {
    if (!item || !item.data || !item.data.analyticsResult || !item.time) return;

    const cnt = item.data.analyticsResult.cnt || 0;
    const cameraName = item.data.sourceName || "ไม่ระบุ";
    const time = new Date(item.time);

    cameraSet.add(cameraName);

    const hour = time.getHours();
    const hourKey = `${hour.toString().padStart(2, "0")}:00`;

    if (!hourCameraData[hourKey]) {
      hourCameraData[hourKey] = {};
    }

    hourCameraData[hourKey][cameraName] =
      (hourCameraData[hourKey][cameraName] || 0) + cnt;
  });

  const hourKeys = Object.keys(hourCameraData).sort((a, b) => {
    const hourA = parseInt(a.split(":")[0]);
    const hourB = parseInt(b.split(":")[0]);
    return hourA - hourB;
  });

  const cameraNames = Array.from(cameraSet);

  // สร้าง series ตามกล้อง
  const series = cameraNames.map((camera) => {
    return {
      name: camera,
      data: hourKeys.map((hour) => hourCameraData[hour][camera] || 0),
    };
  });

  /**
   * ----------------------------------------------------------------
   * ส่วนสำคัญ: กำหนด colors เป็น array ที่เรียงตาม cameraNames
   * โดยแต่ละชื่อกล้องจะดึงสีจาก getCameraColor(cameraName)
   * ----------------------------------------------------------------
   */
  const colorArray = cameraNames.map((camera) => getCameraColor(camera));

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
    // ใช้ colorArray ที่เราสร้างจาก cameraNames
    colors: colorArray,
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
 * โดยแสดงข้อมูลจำนวนคนตามช่วงเวลาสำหรับแต่ละกล้อง
 * ต้องการ fix ลำดับกล้องดังนี้:
 *   ICONIC-01 -> Card ที่ 1
 *   ICONIC-02 -> Card ที่ 2
 *   ICONIC-03 -> Card ที่ 3
 *   ICONIC-04 -> Card ที่ 4
 */
function updateHorizontalBarCharts(data) {
  debug("อัปเดตกราฟแท่งแนวนอน (ใช้ข้อมูลจาก API เท่านั้น)");

  // 1) เก็บชื่อกล้องทั้งหมดที่พบ
  const cameraSet = new Set();
  data.forEach((item) => {
    if (item?.data?.sourceName) {
      cameraSet.add(item.data.sourceName);
    }
  });

  // 2) แปลงเป็น array
  let cameras = Array.from(cameraSet);

  // 3) กำหนดลำดับกล้องที่ต้องการให้แสดง
  //    เช่น ถ้าเจอ ICONIC-01, ICONIC-02, ... ให้เรียงตามนี้เสมอ
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];

  // 4) เรียง array cameras ตามลำดับใน cameraOrder
  //    - กล้องที่อยู่ใน cameraOrder จะอยู่ก่อน
  //    - ถ้ามีกล้องอื่น ๆ นอกเหนือจาก 4 ตัวนี้ จะอยู่ลำดับหลัง ๆ (หรือตัดทิ้งก็ได้)
  cameras.sort((a, b) => {
    const indexA = cameraOrder.indexOf(a);
    const indexB = cameraOrder.indexOf(b);

    // ถ้าไม่เจอใน cameraOrder ให้ส่งค่ามากกว่า 4 เพื่อให้อยู่ท้าย ๆ
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;

    return orderA - orderB;
  });

  // 5) ตรวจสอบว่ามีข้อมูลกล้องหรือไม่
  if (cameras.length === 0) {
    debug("ไม่พบข้อมูลกล้อง");
    // ถ้าไม่พบ ให้ล้างข้อมูลในกราฟทั้ง 4 การ์ด
    horizontalBarCharts.forEach((chart, index) => {
      if (chart) {
        chart.updateOptions({
          series: [{ data: [] }],
          xaxis: { categories: [] },
        });
        const containerId = `#horizontal-bar-chart-${index + 1}`;
        const chartEl = document.querySelector(containerId);
        if (chartEl) {
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

  // 6) กำหนดช่วงเวลา (timeRanges) ตามเดิม
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

  const timeRangeHours = timeRanges.map((range) => {
    const [start, end] = range.split(" - ");
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);
    return { startHour, endHour };
  });

  // 7) จำกัดให้แสดงเฉพาะ 4 กล้องแรก (ตามลำดับ cameraOrder)
  const cameraLimit = Math.min(cameras.length, 4);

  // 8) วนลูปตามจำนวนการ์ดที่ต้องการ (สูงสุด 4 การ์ด)
  for (let index = 0; index < cameraLimit; index++) {
    const cam = cameras[index]; // กล้องตัวที่ index
    const seriesData = Array(timeRanges.length).fill(0);
    const cameraData = data.filter((item) => item?.data?.sourceName === cam);

    // ประมวลผลข้อมูลตามช่วงเวลา
    cameraData.forEach((item) => {
      if (item?.time && item?.data?.analyticsResult?.cnt) {
        const time = new Date(item.time);
        const hour = time.getHours();
        const count = item.data.analyticsResult.cnt;

        // หา timeRanges ที่ hour ตรงกับช่วงไหน แล้วบวก count
        for (let i = 0; i < timeRangeHours.length; i++) {
          const { startHour, endHour } = timeRangeHours[i];
          if (
            (startHour < endHour && hour >= startHour && hour < endHour) ||
            (startHour > endHour && (hour >= startHour || hour < endHour))
          ) {
            seriesData[i] += count;
            break;
          }
        }
      }
    });

    // ตั้งค่า options สำหรับกราฟแท่งแนวนอน
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
      colors: ["#0d6efd"], // สามารถเปลี่ยนเป็น getCameraColor(cam) หรือ color mapping ก็ได้
      noData: {
        text: "ไม่พบข้อมูล",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
      },
    };

    // เลือก container ของการ์ดใบที่ index + 1
    const containerId = `#horizontal-bar-chart-${index + 1}`;
    const chartEl = document.querySelector(containerId);

    // ลบข้อความ "ไม่พบข้อมูล" เดิม (ถ้ามี)
    const noDataEl = chartEl?.querySelector(".no-data");
    if (noDataEl) {
      noDataEl.remove();
    }

    // อัปเดตหัวข้อการ์ด
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

  // 9) ถ้ามีการ์ดเหลือ (เช่น กล้องน้อยกว่า 4 ตัว) ให้ลบกราฟ/ใส่ข้อความว่าไม่พบข้อมูล
  for (let i = cameraLimit; i < 4; i++) {
    if (horizontalBarCharts[i]) {
      const containerId = `#horizontal-bar-chart-${i + 1}`;
      const chartEl = document.querySelector(containerId);

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

  const form = document.getElementById("search-form");
  const dateRangeSelect = document.getElementById("date_range");
  const computeIdSelect = document.getElementById("compute_id");
  const sourceNameSelect = document.getElementById("source_name");

  if (dateRangeSelect) {
    dateRangeSelect.value = "today";
  }

  if (computeIdSelect) {
    computeIdSelect.value = "7";
  }

  if (sourceNameSelect) {
    sourceNameSelect.value = "";
  }

  const today = calculateDates("today");
  const startDateInput = form.querySelector('input[name="start_date"]');
  const endDateInput = form.querySelector('input[name="end_date"]');

  if (startDateInput) startDateInput.value = today.startDate;
  if (endDateInput) endDateInput.value = today.endDate;

  loadCamerasAndZones();

  document.getElementById("compute_id").addEventListener("change", () => {
    loadCamerasAndZones();
  });

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    stopRealtimeUpdate();
    loadData().then(() => {
      startRealtimeUpdate();
    });
  });

  document
    .getElementById("date_range")
    .addEventListener("change", toggleDateFields);

  const realtimeToggle = document.getElementById("realtime-toggle");
  if (realtimeToggle) {
    realtimeToggle.checked = true;
    realtimeToggle.addEventListener("change", function () {
      if (this.checked) {
        startRealtimeUpdate();
      } else {
        stopRealtimeUpdate();
      }
    });
  }

  toggleDateFields();

  loadData().then(() => {
    startRealtimeUpdate();
  });
});

window.addEventListener("load", function () {
  debug("หน้าเว็บและทรัพยากรทั้งหมดโหลดเสร็จสมบูรณ์");
  hideLoading();
});
