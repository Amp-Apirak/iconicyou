// ฟังก์ชันสำหรับเรียกข้อมูลสรุป (summaryMinute) จาก API สำหรับ 1 วัน
async function fetchSummaryForOneDay() {
  try {
    // เปลี่ยนพารามิเตอร์ minute=1440 เพื่อให้ดึงข้อมูลย้อนหลัง 1440 นาที (1 วัน)
    const response = await fetch(
      "https://iconicyou-api.pointit.co.th/summaryMinute?minute=1440&compute_id=7"
    );

    // ตรวจสอบว่าการตอบกลับของ API เป็นไปด้วยสถานะที่ถูกต้องหรือไม่ (response.ok)
    if (!response.ok) throw new Error("Network response was not ok");

    // แปลงข้อมูลจาก JSON เป็น Object
    const data = await response.json();
    return data;
  } catch (error) {
    // หากเกิดข้อผิดพลาดในกระบวนการเรียก API ให้แสดงข้อความใน console
    console.error("Error fetching summary data for one day:", error);
    return null;
  }
}

// ฟังก์ชันสำหรับสร้างและแสดงกราฟแท่ง (Bar Chart) โดยใช้ข้อมูลจาก API สำหรับ 1 วัน
async function renderDailyBarChart() {
  // เรียกข้อมูลจาก API สำหรับ 1 วัน
  const apiData = await fetchSummaryForOneDay();
  if (!apiData) return; // หากไม่สามารถดึงข้อมูลได้ ให้ออกจากฟังก์ชัน

  // กรองข้อมูลเพื่อเอาเฉพาะ key ที่เป็นชื่อกล้อง (ไม่รวม key "all_cam")
  const cameraNames = Object.keys(apiData).filter((key) => key !== "all_cam");
  // ดึงค่าจำนวนคนสำหรับแต่ละกล้องมาเก็บในอาร์เรย์
  const peopleCounts = cameraNames.map((name) => apiData[name]);

  // กำหนดตัวเลือก (options) สำหรับกราฟแท่งของ ApexCharts
  const options = {
    chart: {
      type: "bar", // กำหนดให้เป็นกราฟแท่ง
      height: 400, // ความสูงของกราฟ
      toolbar: { show: true }, // แสดง toolbar เพื่อให้ผู้ใช้สามารถดาวน์โหลดหรือปรับขนาดกราฟได้
    },
    series: [
      {
        name: "จำนวนคน", // ชื่อชุดข้อมูล (series)
        data: peopleCounts, // ข้อมูลแกน Y ซึ่งเป็นจำนวนคนของแต่ละกล้องใน 1 วัน
      },
    ],
    xaxis: {
      categories: cameraNames, // แสดงชื่อกล้องในแกน X
      title: { text: "กล้อง" }, // ชื่อแกน X
    },
    yaxis: {
      title: { text: "จำนวนคน (คน/วัน)" }, // ชื่อแกน Y
    },
    title: {
      text: "จำนวนคนในพื้นที่ต่อกล้อง (1 วัน)", // ชื่อกราฟ
      align: "center",
    },
    colors: ["#0d6efd"], // กำหนดสีของกราฟแท่ง
  };

  // สร้างกราฟแท่งใหม่โดยใช้ ApexCharts
  const chart = new ApexCharts(
    document.querySelector("#daily-bar-chart"),
    options
  );
  // แสดงกราฟบนหน้าเว็บ
  chart.render();
}

// เรียกใช้ฟังก์ชัน renderDailyBarChart เพื่อดึงข้อมูลและแสดงกราฟเมื่อโหลดหน้าเว็บ
renderDailyBarChart();
