document.addEventListener('DOMContentLoaded', function() {
    console.log("Debug script loaded");
    
    // ตรวจสอบ elements ที่จำเป็น
    console.log("main-sidebar:", !!document.querySelector('.main-sidebar'));
    console.log("dropdown-menu-container:", !!document.querySelector('.dropdown-menu-container'));
    console.log("dropdown-toggle:", !!document.querySelector('.dropdown-toggle'));
    console.log("dropdown-menu:", !!document.querySelector('.dropdown-menu'));
    console.log("dropdown-items:", document.querySelectorAll('.dropdown-item').length);
    
    console.log("panels-container:", !!document.getElementById('panels-container'));
    console.log("ai-panel:", !!document.getElementById('ai-panel'));
    console.log("team-panel:", !!document.getElementById('team-panel'));
    
    // แก้ไขปัญหา dropdown menu
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
      console.log("Adding click event to dropdown toggle");
      dropdownToggle.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Dropdown toggle clicked");
        const parent = this.parentElement;
        parent.classList.toggle('active');
        console.log("Dropdown active:", parent.classList.contains('active'));
      });
    }
    
    // ตรวจสอบ URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    console.log("Current section from URL:", sectionParam);
    
    if (sectionParam) {
      console.log("Setting active state for section:", sectionParam);
      document.querySelectorAll('.dropdown-item').forEach(item => {
        if (item.getAttribute('data-section') === sectionParam) {
          item.classList.add('active');
          console.log("Item set to active:", item);
          
          // เปิด dropdown parent
          const dropdownParent = item.closest('.dropdown-menu-container');
          if (dropdownParent) {
            dropdownParent.classList.add('active');
            console.log("Dropdown parent set to active");
          }
        }
      });
    }
    
    // แก้ไขสำหรับกรณีที่มีการคลิก dropdown item
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', function(e) {
        const section = this.getAttribute('data-section');
        if (section) {
          console.log("Dropdown item clicked with section:", section);
        }
      });
    });
  });