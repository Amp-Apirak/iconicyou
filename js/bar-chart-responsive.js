// ไฟล์: bar-chart-responsive.js

// ฟังก์ชันสำหรับอัปเดตกราฟแท่งให้ตอบสนองต่อขนาดหน้าจอ
function updateBarChartResponsive(data) {
    // ตรวจสอบขนาดหน้าจอปัจจุบัน
    const isSmallScreen = window.innerWidth < 768; // กำหนดว่าหน้าจอที่มีความกว้างน้อยกว่า 768px ถือเป็นหน้าจอขนาดเล็ก
  
    debug("กำลังอัปเดตกราฟแท่งแบบ responsive ตามขนาดหน้าจอ: " + (isSmallScreen ? "หน้าจอเล็ก" : "หน้าจอใหญ่"));
  
    // สร้างข้อมูลตามชั่วโมงและกล้อง (คงเดิมจากฟังก์ชัน updateBarChart เดิม)
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
  
      hourCameraData[hourKey][cameraName] = (hourCameraData[hourKey][cameraName] || 0) + cnt;
    });
  
    const hourKeys = Object.keys(hourCameraData).sort((a, b) => {
      const hourA = parseInt(a.split(":")[0]);
      const hourB = parseInt(b.split(":")[0]);
      return hourA - hourB;
    });
  
    const cameraNames = Array.from(cameraSet);
  
    // สร้าง series ตามกล้อง (คงเดิมจากฟังก์ชัน updateBarChart เดิม)
    const series = cameraNames.map((camera) => {
      return {
        name: camera,
        data: hourKeys.map((hour) => hourCameraData[hour][camera] || 0),
      };
    });
  
    // สร้าง array ของสีตามชื่อกล้อง (คงเดิมจากฟังก์ชัน updateBarChart เดิม)
    const colorArray = cameraNames.map((camera) => getCameraColor(camera));
  
    // สร้าง options สำหรับกราฟ - ตรงนี้เราจะปรับแต่งให้ตอบสนองต่อขนาดหน้าจอ
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
      // ส่วนที่สำคัญ: เราปรับแต่ง dataLabels ให้แสดงหรือซ่อนตามขนาดหน้าจอ
      dataLabels: {
        enabled: !isSmallScreen, // ซ่อนค่าเมื่อเป็นหน้าจอขนาดเล็ก
        formatter: function (val) {
          return val > 0 ? val : "";
        },
        offsetY: -20,
        style: {
          fontSize: isSmallScreen ? "8px" : "12px", // ลดขนาดตัวอักษรบนหน้าจอเล็ก (หากยังแสดง)
          colors: ["#304758"],
        },
      },
      xaxis: {
        categories: hourKeys,
        title: {
          text: "ช่วงเวลา (ชั่วโมง)",
        },
        labels: {
          // ปรับขนาดตัวอักษรของเวลาบนแกน X ให้เล็กลงบนหน้าจอขนาดเล็ก
          style: {
            fontSize: isSmallScreen ? "8px" : "12px",
          },
          // ลดการซ้อนทับของ label โดยให้หมุนบนหน้าจอเล็ก
          rotate: isSmallScreen ? -45 : 0,
          offsetY: isSmallScreen ? 5 : 0,
        },
      },
      yaxis: {
        title: {
          text: "จำนวนคน",
          style: {
            fontSize: isSmallScreen ? "10px" : "12px", // ลดขนาดชื่อแกน Y บนหน้าจอเล็ก
          },
        },
        min: 0,
        labels: {
          // ลดขนาดตัวเลขบนแกน Y สำหรับหน้าจอเล็ก
          style: {
            fontSize: isSmallScreen ? "8px" : "12px",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      title: {
        text: "จำนวนคนตามช่วงเวลารายชั่วโมงแยกตามกล้อง",
        align: "center",
        style: {
          fontSize: isSmallScreen ? "14px" : "16px", // ลดขนาดชื่อกราฟบนหน้าจอเล็ก
        },
      },
      tooltip: {
        // เพิ่มข้อมูลค่าใน tooltip เมื่อหน้าจอเล็กและไม่แสดงค่าบนกราฟแล้ว
        y: {
          formatter: function (val) {
            return val + " คน";
          },
        },
        // ปรับขนาด tooltip ให้เหมาะกับหน้าจอเล็ก
        style: {
          fontSize: isSmallScreen ? "10px" : "12px",
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        // ปรับขนาด legend ให้เหมาะกับหน้าจอเล็ก
        fontSize: isSmallScreen ? "10px" : "12px",
        itemMargin: {
          horizontal: isSmallScreen ? 5 : 10,
          vertical: isSmallScreen ? 2 : 5,
        },
      },
      // ใช้ colorArray ที่สร้างจาก cameraNames (คงเดิม)
      colors: colorArray,
    };
  
    // ค้นหา element ของกราฟแท่ง
    const barEl = document.querySelector("#bar-chart");
    if (!barEl) {
      debug("ไม่พบ element #bar-chart");
      return;
    }
  
    // อัปเดตหรือสร้างกราฟใหม่
    try {
      if (barChart) {
        barChart.updateOptions(options);
      } else {
        debug("สร้างกราฟแท่งใหม่");
        barChart = new ApexCharts(barEl, options);
        barChart.render();
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตกราฟแท่ง:", error);
    }
  }