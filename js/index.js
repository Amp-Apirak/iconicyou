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
const SHOW_DEBUG = false;

/**
 * ----------------------------------------------------------------
 * เพิ่ม: Mapping ชื่อกล้อง -> สี (ล็อกสีให้คงที่)
 * ----------------------------------------------------------------
 */
const cameraColorMap = {
  "ICONIC-01": "#0d6efd", // ตัวอย่างกำหนดให้ "Camera A" ได้สีฟ้า
  "ICONIC-02": "#20c997", // ตัวอย่างกำหนดให้ "Camera B" ได้สีเขียวมิ้นต์
  "ICONIC-03": "#ffc107", // ตัวอย่างกำหนดให้ "Camera C" ได้สีเหลือง
  "ICONIC-04": "#ff6b6b", // ตัวอย่างกำหนดให้ "Camera D" ได้สีแดง
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

    // เพิ่มการอัพเดทกราฟ Box Plot
    if (currentSearchParams) {
      fetchActivityDurationData(new URLSearchParams(currentSearchParams))
        .then((activityData) => {
          if (Array.isArray(activityData)) {
            updateActivityDurationChart(activityData);
          }
        })
        .catch((error) => {
          console.error("Error updating activity duration chart:", error);
        });
    }

    // ดึงข้อมูล Activity Gantt และอัพเดทกราฟ
    if (currentSearchParams) {
      fetchActivityGanttData(new URLSearchParams(currentSearchParams))
        .then((activityData) => {
          if (Array.isArray(activityData)) {
            for (let i = 0; i < 4; i++) {
              updateActivityChart(activityData, i);
            }
          }
        })
        .catch((error) => {
          console.error("Error updating activity charts:", error);
        });
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

  // รวบรวมข้อมูลตามกล้อง
  const cameraData = {};
  data.forEach((item) => {
    const cam = item?.data?.sourceName || "ไม่ระบุ";
    const cnt = item?.data?.analyticsResult?.cnt || 0;
    cameraData[cam] = (cameraData[cam] || 0) + cnt;
  });

  // ลำดับกล้องเดียวกับที่ใช้ในกราฟแท่งแนวนอน
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];

  // เรียงลำดับ keys (ชื่อกล้อง) ตามลำดับที่กำหนด เพื่อให้สอดคล้องกับกราฟอื่นๆ
  const sortedLabels = Object.keys(cameraData).sort((a, b) => {
    const indexA = cameraOrder.indexOf(a);
    const indexB = cameraOrder.indexOf(b);

    // ถ้าไม่เจอในลำดับที่กำหนด ให้ไปต่อท้าย
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;

    return orderA - orderB;
  });

  // สร้าง series (ข้อมูลจำนวน) ตามลำดับชื่อกล้องที่เรียงแล้ว
  const series = sortedLabels.map((label) => cameraData[label]);
  // ใช้ sortedLabels เป็นชื่อสำหรับกราฟวงกลม
  const labels = sortedLabels;

  // สร้าง array ของสีตามชื่อกล้อง - เพื่อให้แน่ใจว่ามีการใช้สีที่ถูกต้อง
  const colorArray = labels.map((camera) => getCameraColor(camera));

  // เพิ่มดีบั๊กเพื่อตรวจสอบ
  // debug("Labels ของกราฟวงกลม:", labels);
  // debug("สีที่ใช้ในกราฟวงกลม:", colorArray);

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
    // ใช้ colorArray ที่สร้างจาก getCameraColor เพื่อให้สีตรงกับกราฟแท่ง
    colors: colorArray,
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
    // สร้างกราฟใหม่ทุกครั้งแทนการอัปเดต เพื่อแก้ปัญหาสีไม่อัปเดต
    if (cameraPieChart) {
      // ลบกราฟเดิมก่อน
      cameraPieChart.destroy();
      cameraPieChart = null;
    }

    debug("สร้างกราฟวงกลมใหม่");
    cameraPieChart = new ApexCharts(pieEl, options);
    cameraPieChart.render();
  } catch (error) {
    console.error("Error updating pie chart:", error);
  }
}

// ==========================================
// ส่วนฟังก์ชันอัปเดตกราฟแท่งแนวนอน (Horizontal Bar Charts)
// ==========================================
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
  const cameraOrder = ["ICONIC-01", "ICONIC-02", "ICONIC-03", "ICONIC-04"];

  // 4) เรียง array cameras ตามลำดับใน cameraOrder
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
      // ใช้สีตาม getCameraColor สำหรับกราฟ
      colors: [getCameraColor(cam)],
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

    // อัปเดตหัวข้อการ์ด - เปลี่ยนจาก textContent เป็น innerHTML และใส่สีให้ชื่อกล้อง
    const cardHeader = chartEl
      ?.closest(".card")
      ?.querySelector(".card-header .card-title");
    if (cardHeader) {
      // ใช้ innerHTML แทน textContent เพื่อให้สามารถใส่ HTML tag และ style ได้
      // กำหนดสีให้กับชื่อกล้องโดยใช้ฟังก์ชัน getCameraColor
      const cameraColor = getCameraColor(cam);
      cardHeader.innerHTML = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : <span style="color: ${cameraColor}">${cam}</span>`;

      // เพิ่ม debug เพื่อตรวจสอบ - สามารถคอมเม้นทิ้งได้เมื่อแก้ไขปัญหาเสร็จแล้ว
      console.log(`กำหนดสีให้กล้อง ${cam}: ${cameraColor}`);
    }

    if (!chartEl) {
      debug(`ไม่พบ element ${containerId}`);
      continue;
    }

    try {
      // สร้างกราฟใหม่หรืออัปเดตกราฟที่มีอยู่
      if (horizontalBarCharts[index]) {
        // ตรวจสอบว่ามี method destroy หรือไม่ก่อนเรียกใช้
        if (typeof horizontalBarCharts[index].destroy === "function") {
          horizontalBarCharts[index].destroy();
          horizontalBarCharts[index] = null;
        } else {
          // ถ้าไม่มี method destroy ให้ใช้การอัปเดตแทน
          horizontalBarCharts[index].updateOptions(options);
          continue; // ข้ามการสร้างใหม่
        }
      }

      debug(`สร้างกราฟแท่งแนวนอนใหม่ ${index + 1}`);
      horizontalBarCharts[index] = new ApexCharts(chartEl, options);
      horizontalBarCharts[index].render();
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
          // ข้อความกรณีไม่พบข้อมูล ใช้สีเทา
          cardHeader.innerHTML = `จำนวนนับบุคคลตามช่วงเวลาจากกล้อง : <span style="color: #6c757d">ไม่พบข้อมูล</span>`;
        }
      }
    }
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

// ==========================================
// ส่วนการทำงานเมื่อหน้าเว็บโหลดเสร็จ (DOMContentLoaded)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
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

// ==========================================
// ฟังก์ชันสำหรับดึงข้อมูล Activity Gantt
// ==========================================

// เพิ่มในส่วนประกาศตัวแปร Global
let activityCharts = [null, null, null, null];

// ฟังก์ชันสำหรับดึงข้อมูล Activity Gantt
async function fetchActivityGanttData(params) {
  try {
    const computeId = params.get("compute_id") || 7;
    let url = `${API_BASE_URL}/activity_ganttchart?compute_id=${computeId}`;

    // เพิ่ม parameters วันที่
    if (params.get("start_date") && params.get("end_date")) {
      url += `&start_date=${params.get("start_date")}&end_date=${params.get(
        "end_date"
      )}`;
    } else {
      // ถ้าไม่มีการค้นหา ใช้วันปัจจุบันถึงพรุ่งนี้
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      url += `&start_date=${today.toISOString().split("T")[0]}`;
      url += `&end_date=${tomorrow.toISOString().split("T")[0]}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching activity gantt data:", error);
    return [];
  }
}

// ฟังก์ชันคำนวณระยะเวลาเป็นนาที
function calculateDurationInMinutes(start_time, end_time) {
  const start = new Date(start_time);
  const end = new Date(end_time);
  return Math.round((end - start) / (1000 * 60)); // แปลงเป็นนาที
}

// ฟังก์ชันประมวลผลข้อมูลสำหรับกราฟ
// ปรับปรุงฟังก์ชัน processActivityData
function processActivityData(data, sourceName) {
  try {
    // กรองข้อมูลตามกล้องและเฉพาะ person เท่านั้น
    const filteredData = data.filter(
      (item) =>
        item.data && item.data.source === sourceName && item.name === "person"
    );

    // คำนวณระยะเวลาและเก็บข้อมูลที่จำเป็น
    const durations = filteredData.map((item) => {
      const duration = calculateDurationInMinutes(
        item.data.start_time,
        item.data.end_time
      );
      return {
        duration,
        startTime: new Date(item.data.start_time),
        endTime: new Date(item.data.end_time),
      };
    });

    // เรียงลำดับตามระยะเวลาจากมากไปน้อย และเลือก 10 อันดับแรก
    return durations.sort((a, b) => b.duration - a.duration).slice(0, 10); // จำกัดแค่ 10 อันดับ
  } catch (error) {
    console.error(`Error processing activity data for ${sourceName}:`, error);
    return [];
  }
}

// ปรับปรุงฟังก์ชัน updateActivityChart
// ฟังก์ชันสำหรับประมวลผลข้อมูลกราฟ Activity
function updateActivityChart(data, cameraIndex) {
  // ตรวจสอบ container ของกราฟ
  const containerId = `activity-chart-${cameraIndex + 1}`;
  const chartEl = document.querySelector(`#${containerId}`);
  if (!chartEl) return;

  // กำหนดชื่อกล้องและโซน
  const cameraName = `ICONIC-0${cameraIndex + 1}`;
  const zoneNames = {
    "ICONIC-01": "Zone : 1 ทางเข้า-ออก",
    "ICONIC-02": "Zone : 2",
    "ICONIC-03": "Zone : 3",
    "ICONIC-04": "Zone : 4",
  };

  // ประมวลผลข้อมูล
  const processedData = processActivityData(data, cameraName);

  // กำหนด options สำหรับกราฟ
  const options = {
    series: [
      {
        name: "ระยะเวลา",
        data: processedData.map((d) => d.duration),
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
          customIcons: [],
        },
        export: {
          csv: {
            filename: `activity_${cameraName}_${new Date().toLocaleDateString()}`,
            columnDelimiter: ",",
            headerCategory: "อันดับ",
            headerValue: "ระยะเวลา (นาที)",
          },
          svg: {
            filename: `activity_${cameraName}_${new Date().toLocaleDateString()}`,
          },
          png: {
            filename: `activity_${cameraName}_${new Date().toLocaleDateString()}`,
          },
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "50%",
        distributed: true,
        dataLabels: {
          position: "top",
        },
        colors: {
          ranges: [
            {
              from: 0,
              to: Number.MAX_VALUE,
              color: getCameraColor(cameraName),
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " นาที";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
        fontWeight: "500",
      },
    },
    colors: [getCameraColor(cameraName)],
    xaxis: {
      categories: processedData.map((_, index) => `อันดับ ${index + 1}`),
      title: {
        text: "อันดับ",
        style: {
          fontSize: "13px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "ระยะเวลา (นาที)",
        style: {
          fontSize: "13px",
          fontWeight: 500,
        },
      },
      min: 0,
      labels: {
        formatter: (val) => Math.round(val),
        style: {
          fontSize: "12px",
        },
      },
    },
    title: {
      text: `${zoneNames[cameraName]} (${cameraName})`,
      align: "center",
      style: {
        fontSize: "14px",
        fontWeight: "600",
        color: getCameraColor(cameraName),
      },
      margin: 10,
    },
    subtitle: {
      text: `อันดับการใช้เวลาในพื้นที่สูงสุด 10 อันดับแรก\n${getDateRangeText()}`,
      align: "center",
      style: {
        fontSize: "12px",
        color: "#999999",
      },
      margin: 10,
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex }) {
        const data = processedData[dataPointIndex];
        const duration = data.duration;
        const avgDuration = calculateAverage(processedData);
        const isAboveAvg = duration > avgDuration;

        return `
          <div class="activity-tooltip p-3">
            <div class="tooltip-title mb-2 border-bottom pb-1">
              อันดับ ${dataPointIndex + 1}
            </div>
            <div class="tooltip-content">
              <div class="mb-1">
                <i class="bi bi-clock me-1"></i> 
                ระยะเวลา: <strong>${duration} นาที</strong>
                ${
                  isAboveAvg
                    ? ' <span class="text-danger">(สูงกว่าค่าเฉลี่ย)</span>'
                    : ""
                }
              </div>
              <div class="mb-1">
                <i class="bi bi-calendar-event me-1"></i>
                เริ่มต้น: ${formatDateTime(data.startTime)}
              </div>
              <div class="mb-1">
                <i class="bi bi-calendar-event me-1"></i>
                สิ้นสุด: ${formatDateTime(data.endTime)}
              </div>
              <div class="text-muted mt-2 pt-1 border-top">
                <small>ค่าเฉลี่ย: ${avgDuration} นาที</small>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      show: true,
      borderColor: "#f1f1f1",
      strokeDashArray: 0,
      position: "back",
      padding: {
        top: 20,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            bar: {
              columnWidth: "70%",
            },
          },
        },
      },
    ],
  };

  try {
    // สร้างหรืออัพเดทกราฟ
    if (activityCharts[cameraIndex]) {
      activityCharts[cameraIndex].updateOptions(options);
    } else {
      activityCharts[cameraIndex] = new ApexCharts(chartEl, options);
      activityCharts[cameraIndex].render();
    }
  } catch (error) {
    console.error(`Error updating activity chart ${cameraIndex + 1}:`, error);
    // แสดงข้อความ error บนกราฟ
    if (chartEl) {
      if (!chartEl.querySelector(".error-message")) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message alert alert-danger m-3";
        errorDiv.innerHTML = `
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          เกิดข้อผิดพลาดในการแสดงกราฟ: ${error.message}
        `;
        chartEl.appendChild(errorDiv);
      }
    }
  }
}

// ฟังก์ชันสำหรับสร้างข้อความแสดงช่วงเวลา
function getDateRangeText() {
  const form = document.getElementById("search-form");
  if (!form) return "";

  const formData = new FormData(form);
  const dateRange = formData.get("date_range") || "today";
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");

  if (dateRange === "custom" && startDate && endDate) {
    return `ช่วงวันที่ ${formatDate(startDate)} ถึง ${formatDate(endDate)}`;
  }

  switch (dateRange) {
    case "today":
      return "วันนี้";
    case "yesterday":
      return "เมื่อวาน";
    case "last7days":
      return "7 วันล่าสุด";
    case "last30days":
      return "30 วันล่าสุด";
    default:
      return "";
  }
}

// ฟังก์ชันสำหรับจัดรูปแบบวันที่
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function updateActivityChart(data, cameraIndex) {
  const containerId = `activity-chart-${cameraIndex + 1}`;
  const chartEl = document.querySelector(`#${containerId}`);
  if (!chartEl) return;

  const cameraName = `ICONIC-0${cameraIndex + 1}`;
  const processedData = processActivityData(data, cameraName);

  const options = {
    series: [
      {
        name: "ระยะเวลา",
        data: processedData.map((d) => d.duration),
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: "50%",
        distributed: true,
      },
    },
    colors: [getCameraColor(cameraName)],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " นาที";
      },
      style: {
        fontSize: "12px",
      },
    },
    xaxis: {
      categories: processedData.map((_, index) => `person ${index + 1}`),
      title: {
        text: "Person",
      },
    },
    yaxis: {
      title: {
        text: "ระยะเวลา (นาที)",
      },
      min: 0,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " นาที";
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  try {
    if (activityCharts[cameraIndex]) {
      activityCharts[cameraIndex].updateOptions(options);
    } else {
      activityCharts[cameraIndex] = new ApexCharts(chartEl, options);
      activityCharts[cameraIndex].render();
    }
  } catch (error) {
    console.error(`Error updating activity chart ${cameraIndex + 1}:`, error);
  }
}

// ==========================================
// เพิ่มตัวแปร Global สำหรับกราฟ Activity Duration
// ==========================================
let activityDurationChart = null;

// ==========================================
// ฟังก์ชันดึงข้อมูลกิจกรรมและระยะเวลา
// ==========================================
async function fetchActivityDurationData(params) {
  try {
    const computeId = params.get("compute_id") || 7;
    let url = `${API_BASE_URL}/activity_ganttchart?compute_id=${computeId}`;

    // เพิ่มพารามิเตอร์วันที่
    const startDate = params.get("start_date");
    const endDate = params.get("end_date");

    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    } else {
      // ถ้าไม่มีการค้นหา ใช้วันปัจจุบันถึงพรุ่งนี้
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      url += `&start_date=${today.toISOString().split("T")[0]}`;
      url += `&end_date=${tomorrow.toISOString().split("T")[0]}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching activity duration data:", error);
    return [];
  }
}

// ==========================================
// ฟังก์ชันประมวลผลข้อมูลสำหรับ Box Plot
// ==========================================
function processActivityDurationData(data) {
  // 1. สร้าง object เก็บข้อมูลตามกล้อง
  const cameraData = {
    "ICONIC-01": [], // Zone 1
    "ICONIC-02": [], // Zone 2
    "ICONIC-03": [], // Zone 3
    "ICONIC-04": [], // Zone 4
  };

  // 2. วนลูปข้อมูลและกรองเฉพาะ person เท่านั้น
  data.forEach((item) => {
    // เพิ่มเงื่อนไขตรวจสอบ name === "person"
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

      // เก็บข้อมูลตามกล้อง
      const cameraName = item.data.source;
      if (cameraData[cameraName]) {
        cameraData[cameraName].push({
          duration: duration,
          startTime: new Date(item.data.start_time),
          endTime: new Date(item.data.end_time),
        });
      }
    }
  });

  // 3. กำหนด mapping ระหว่างกล้องและ Zone
  const zoneMapping = {
    "ICONIC-01": "Zone 1 ทางเข้า-ออก",
    "ICONIC-02": "Zone 2",
    "ICONIC-03": "Zone 3",
    "ICONIC-04": "Zone 4",
  };

  // 4. ประมวลผลข้อมูลสถิติ
  return Object.entries(cameraData).map(([camera, dataPoints]) => {
    // เรียงข้อมูลตามระยะเวลา
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
        camera: camera,
        details: [], // เก็บรายละเอียดเพิ่มเติม
      };

    // คำนวณค่าสถิติ
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
      camera: camera,
      details: dataPoints.map((d) => ({
        duration: d.duration,
        startTime: d.startTime,
        endTime: d.endTime,
      })),
    };

    // เพิ่มการคำนวณค่าเฉลี่ย
    stats.average = durations.reduce((sum, val) => sum + val, 0) / n;

    return stats;
  });
}

// ==========================================
// ฟังก์ชันอัพเดทกราฟ Box Plot
// ==========================================
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
          camera: d.camera, // เก็บข้อมูลกล้องเพื่อใช้กำหนดสี
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
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
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
      title: {
        text: "Zone",
        style: {
          fontSize: "14px",
        },
      },
      labels: {
        style: {
          colors: processedData.map((d) => getCameraColor(d.camera)),
        },
      },
    },
    yaxis: {
      title: {
        text: "ระยะเวลา (นาที)",
        style: {
          fontSize: "14px",
        },
      },
      min: 0,
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
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
                <div>• กลาง: ${data.median} นาที</div>
                <div>• Q3 (75%): ${data.q3} นาที</div>
                <div>• สูงสุด: ${data.max} นาที</div>
              </div>
            </div>
          </div>
        `;
      },
    },
    // เพิ่ม colors array เพื่อให้แน่ใจว่าสีถูกใช้อย่างถูกต้อง
    colors: processedData.map((d) => getCameraColor(d.camera)),
  };

  const chartEl = document.querySelector("#activity-duration-chart");
  if (!chartEl) {
    console.error("ไม่พบ element สำหรับกราฟ Box Plot");
    return;
  }

  try {
    if (activityDurationChart) {
      activityDurationChart.updateOptions(options);
    } else {
      activityDurationChart = new ApexCharts(chartEl, options);
      activityDurationChart.render();
    }
  } catch (error) {
    console.error("Error updating activity duration chart:", error);
  }
}

// ==========================================
// Helper Functions
// ==========================================

// ฟังก์ชันคำนวณระยะเวลาเป็นนาที
function calculateDurationInMinutes(start_time, end_time) {
  const start = new Date(start_time);
  const end = new Date(end_time);
  return Math.round((end - start) / (1000 * 60));
}

// ฟังก์ชันการ Export ข้อมูล
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
  }
}

// เพิ่ม Event Listeners สำหรับปุ่ม Export
document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("export-activity-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (currentSearchParams) {
        fetchActivityDurationData(new URLSearchParams(currentSearchParams))
          .then((data) => exportActivityData(data))
          .catch((error) => console.error("Error exporting data:", error));
      }
    });
  }
<<<<<<< HEAD
});
=======
});
>>>>>>> dev3
