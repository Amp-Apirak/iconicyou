// modal.js
document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชันสำหรับแสดงภาพในโหมด Modal
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
      imageModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const imgSrc = button.getAttribute('data-img');
        const zone = button.getAttribute('data-zone');
        const camera = button.getAttribute('data-camera');
        const title = button.getAttribute('data-title');
  
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.querySelector('#imageModal .modal-title');
  
        if (modalImage && imgSrc) {
          modalImage.src = imgSrc;
        }
  
        if (modalTitle) {
          let zoneColor = '';
          switch (zone) {
            case '1':
              zoneColor = '#4e95f4';
              break; // สีฟ้า
            case '2':
              zoneColor = '#4cd3a5';
              break; // สีเขียว
            case '3':
              zoneColor = '#ffc107';
              break; // สีเหลือง
            case '4':
              zoneColor = '#ff6b6b';
              break; // สีแดง
          }
  
          let titleText = title ? ` ${title}` : '';
          modalTitle.innerHTML = `<span style="color:${zoneColor}">Zone ${zone}${titleText}</span> - กล้อง ${camera}`;
        }
      });
    }
  });