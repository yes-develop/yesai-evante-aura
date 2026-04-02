const links = [
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-chubby/css/uicons-thin-chubby.css',
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css',
    '/styles/calendar-booking.css'
];

// Load CSS files
links.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
});

const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/index.global.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/locales/th.global.min.js'
];

// Load JavaScript files
scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
});

function showCalendarbooking() {
    // Check if the calendar overlay already exists
    const existingOverlay = document.querySelector('.calendar-overlay');
    if (existingOverlay) {
        // อัปเดตทุก property ที่จำเป็นต้องใช้
        existingOverlay.style.display = 'flex';
        existingOverlay.style.justifyContent = 'center';
        existingOverlay.style.alignItems = 'center';
        // รีเฟรชปฏิทินเพื่อให้มั่นใจว่าทุกอย่างทำงานได้อย่างถูกต้อง
        refreshCalendar();
        return;
    }

    // Create the calendar overlay structure based on the provided HTML
    const calendarOverlay = document.createElement('div');
    calendarOverlay.className = 'calendar-overlay';
    
    // กำหนด styles ทั้งหมดที่จำเป็นโดยตรง
    calendarOverlay.style.position = 'fixed';
    calendarOverlay.style.top = '0';
    calendarOverlay.style.left = '0';
    calendarOverlay.style.right = '0';
    calendarOverlay.style.bottom = '0';
    calendarOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    calendarOverlay.style.zIndex = '1000';
    calendarOverlay.style.display = 'flex';
    calendarOverlay.style.justifyContent = 'center';
    calendarOverlay.style.alignItems = 'center';

    calendarOverlay.innerHTML = `
      <div class="calendar-popup">
        <div class="calendar-header">
          <h3>
            <i class="fi fi-tr-calendar-clock"></i>
            Scheduling Assistant
          </h3>
          <button class="close-calendar">
            <i class="fi fi-br-cross"></i>
          </button>
        </div>
        <div class="calendar-content">
          <div id="calendar-main-section">
            <div class="calendar-tabs">
              <button class="calendar-tab active" data-tab="local">Local Calendar</button>
              <button class="calendar-tab" data-tab="google">Google Calendar</button>
            </div>
  
            <div class="calendar-tab-content active" id="local-tab" style="display: block;">
              <div class="calendar-info-message">
                <i class="fas fa-info-circle"></i>
                This is a local calendar that stores events in your browser. Events won't sync with other devices.
              </div>
              <div id="calendar-container">
                <div id="close-btn">&times;</div>
                <div class="main-container">
                  <div id="external-events">
                    <p><strong>กิจกรรมที่สามารถลาก</strong></p>
                    <div class="external-event">ประชุม</div>
                    <div class="external-event">อบรม</div>
                    <div class="external-event">สัมมนา</div>
                    <div class="external-event">วันหยุด</div>
                    <div class="external-event">งานสำคัญ</div>
                    <p>
                      <input type="checkbox" id="drop-remove" checked>
                      <label for="drop-remove">ลบหลังจากใช้</label>
                    </p>
                  </div>
                  <div class="calendar-side">
                    <div id="calendar"></div>
                  </div>
                </div>
              </div>
              <div id="event-form-container">
                <div class="event-header">
                  <h3 id="booking_id">Booking #</h3>
                  <button type="button" id="cancel-event">
                    <i class="fi fi-br-cross"></i>
                  </button>
                </div>
                <form id="event-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-booking-id">Booking ID</label>
                      <input type="text" id="event-booking-id" placeholder="Booking ID" readonly disabled>
                    </div>
                    <div class="form-group">
                      <label for="event-room-id">Room ID</label>
                      <input type="text" id="event-room-id" placeholder="Room ID" readonly disabled>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-full-name">Full Name</label>
                      <input type="text" id="event-full-name" placeholder="Enter full name" readonly disabled>
                    </div>
                    <div class="form-group">
                      <label for="event-email">Email</label>
                      <input type="email" id="event-email" placeholder="example@email.com" readonly disabled>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-phone">Phone</label>
                      <input type="tel" id="event-phone" placeholder="Enter phone number" readonly disabled>
                    </div>
                    <div class="form-group">
                      <label for="event-line-id">Line ID</label>
                      <input type="text" id="event-line-id" placeholder="Enter Line ID" readonly disabled>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-room-number">Room Number</label>
                      <input type="text" id="event-room-number" placeholder="Enter room number" readonly disabled>
                    </div>
                    <div class="form-group">
                      <label for="event-price">Price</label>
                      <input type="number" id="event-price" placeholder="Enter price" readonly disabled>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-status">Status</label>
                      <select id="event-status" readonly disabled>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="event-payment-status">Payment Status</label>
                      <select id="event-payment-status" readonly disabled>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-channel">Channel</label>
                      <div class="channel-display">
                        <div id="channel-icon" class="channel-icon-default">
                          <i class="fas fa-question"></i>
                        </div>
                        <span id="channel-name">Not specified</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="event-start-date">Start Date</label>
                      <input type="date" id="event-start-date" readonly disabled>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-end-date">End Date</label>
                      <input type="date" id="event-end-date" readonly disabled>
                    </div>
                    <div class="form-group">
                      <label for="event-description">Description</label>
                      <textarea id="event-description" placeholder="Enter description" readonly disabled></textarea>
                    </div>
                  </div>

                  <div class="form-buttons" style="display: none;">
                    <button type="button" id="delete-event" class="delete-button">ลบ</button>
                    <button type="button" id="save-event">บันทึก</button>
                  </div>
                  <input type="hidden" id="event-id">
                </form>
              </div>
            </div>
            <div class="calendar-tab-content" id="google-tab" style="display: none;">
              <!-- Google Calendar content will be dynamically loaded -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(calendarOverlay);
    
    // Setup event listeners for UI elements
    setupEventListeners();
    
    // Initialize the calendar
    initializeCalendar();
    
    // Initialize draggable external events
    initializeDraggableEvents();
    
    // Hide the event form initially
    document.getElementById('event-form-container').style.display = 'none';
    
    // Add some styles for the delete button
    const style = document.createElement('style');
    style.textContent = `
      .delete-button {
        background-color: #ff3b30;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .delete-button:hover {
        background-color: #d63025;
      }
    `;
    document.head.appendChild(style);
}

/**
 * Setup event listeners for various UI elements
 */
function setupEventListeners() {
  // Close button listener
  document.querySelector('.close-calendar').addEventListener('click', hideCalendarTool);
  document.getElementById('close-btn').addEventListener('click', hideCalendarTool);
  
  // Tab switching listeners
  const tabs = document.querySelectorAll('.calendar-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Event form buttons
  const cancelEventBtn = document.getElementById('cancel-event');
  const saveEventBtn = document.getElementById('save-event');
  const deleteEventBtn = document.getElementById('delete-event');
  const startDateInput = document.getElementById('event-start-date');
  const endDateInput = document.getElementById('event-end-date');
  const startTimeInput = document.getElementById('event-start-time');
  const endTimeInput = document.getElementById('event-end-time');

  if (cancelEventBtn) {
    cancelEventBtn.addEventListener('click', hideEventForm);
  }
  if (saveEventBtn) {
    saveEventBtn.addEventListener('click', saveEventForm);
  }
  if (deleteEventBtn) {
    deleteEventBtn.addEventListener('click', function() {
      const eventId = document.getElementById('event-id').value;
      if (eventId) {
        deleteEvent(eventId);
      } else {
        hideEventForm();
      }
    });
  }

  if (startDateInput && endDateInput) {
    const todayStr = formatDate(new Date());
    startDateInput.min = todayStr;
    endDateInput.min = todayStr;

    const ensureFutureDate = (input) => {
      if (input.value && getStartOfDay(input.value) < getStartOfDay(new Date())) {
        input.value = todayStr;
      }
    };

    startDateInput.addEventListener('change', () => {
      ensureFutureDate(startDateInput);
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = startDateInput.value;
      }
      enforceTimeBounds(startDateInput, endDateInput, startTimeInput, endTimeInput);
    });

    endDateInput.addEventListener('change', () => {
      ensureFutureDate(endDateInput);
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = startDateInput.value;
      }
      enforceTimeBounds(startDateInput, endDateInput, startTimeInput, endTimeInput);
    });
  }

  enforceTimeBounds(startDateInput, endDateInput, startTimeInput, endTimeInput);
}

/**
 * Hide calendar tool
 */
function hideCalendarTool() {
  const calendarOverlay = document.querySelector('.calendar-overlay');
  if (calendarOverlay) {
    calendarOverlay.style.display = 'none';
  }
}

function switchTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.calendar-tab');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.calendar-tab-content');
    tabContents.forEach(content => {
      if (content.id === tabName + '-tab') {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
    
    // If Google tab is selected, we might need to initialize Google Calendar
    if (tabName === 'google') {
      // This would be implemented separately for Google Calendar integration
      document.getElementById('google-tab').innerHTML = `
                <div id="calendar-auth-section">
                    <div class="google-calendar-info">
                        <img src="https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" alt="Google Calendar" class="google-calendar-icon">
                        <h3>Connect with Google Calendar</h3>
                        <p>Sync your events with Google Calendar to:</p>
                        <ul>
                            <li><i class="fas fa-sync"></i> Keep events synchronized across devices</li>
                            <li><i class="fas fa-share-alt"></i> Share events with team members</li>
                            <li><i class="fas fa-bell"></i> Get notifications and reminders</li>
                            <li><i class="fas fa-video"></i> Add Google Meet video calls automatically</li>
                        </ul>
                    </div>
                    <button id="authorize-button" class="google-auth-button">
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" class="google-icon">
                        Sign in with Google
                    </button>
                    <p class="google-calendar-note">
                        <i class="fas fa-info-circle"></i>
                        Your calendar data will be securely synchronized
                    </p>
                </div>
            `;
    }
  }
  /**
   * Initialize FullCalendar
   */
  function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: false,
      droppable: false,
      selectable: false,
      selectMirror: false,
      dayMaxEvents: true,
      validRange: {
        start: formatDate(new Date())
      },
      locale: 'th',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      events: getEventsFromStorage(),
      eventContent: function(arg) {
        const props = arg.event.extendedProps;
        const channelIcon = props.channel_icon || '<div class="channel-icon-default"><i class="fas fa-question"></i></div>';
        const title = arg.event.title;
        
        return {
          html: `<div class="event-title-container">${channelIcon}<span class="event-title-text">${title}</span></div>`
        };
      },
      eventClick: function(info) {
        editEvent(info.event);
      }
    });
    
    calendar.render();
    calendarEl._calendar = calendar;
  }
  
  /**
   * Initialize draggable external events
   */
  function initializeDraggableEvents() {
    const draggableItems = document.querySelectorAll('.external-event');
    
    draggableItems.forEach(eventEl => {
      new FullCalendar.Draggable(eventEl, {
        itemSelector: '.external-event',
        eventData: function(eventEl) {
          return {
            title: eventEl.textContent,
            create: true
          };
        }
      });
      
      // Add random background color to each draggable event
      eventEl.style.backgroundColor = getRandomColor();
      eventEl.style.color = 'white';
      eventEl.style.padding = '5px 10px';
      eventEl.style.margin = '5px 0';
      eventEl.style.borderRadius = '3px';
      eventEl.style.cursor = 'pointer';
    });
  }
  
  /**
   * Generate a random color for events
   */
  function getRandomColor() {
    const colors = [
      '#3788d8', // Blue
      '#ff5722', // Deep Orange
      '#4caf50', // Green
      '#9c27b0', // Purple
      '#ff9800', // Orange
      '#e91e63', // Pink
      '#009688', // Teal
      '#795548'  // Brown
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Show event form for creating or editing an event
   */
  function showEventForm(info = null, eventToEdit = null) {
    const formContainer = document.getElementById('event-form-container');
    if (!formContainer) {
        console.error('Form container not found');
        return;
    }

    formContainer.style.display = 'block';
    
    const form = document.getElementById('event-form');
    if (!form) {
        console.error('Form not found');
        return;
    }

    form.reset();
    
    const bookingIdTitle = document.getElementById('booking_id');
    if (!bookingIdTitle) {
        console.error('Booking ID title not found');
        return;
    }

    // Get all form elements
    const eventId = document.getElementById('event-id');
    const eventBookingId = document.getElementById('event-booking-id');
    const eventRoomId = document.getElementById('event-room-id');
    const eventTitle = document.getElementById('event-title');
    const eventFullName = document.getElementById('event-full-name');
    const eventEmail = document.getElementById('event-email');
    const eventPhone = document.getElementById('event-phone');
    const eventLineId = document.getElementById('event-line-id');
    const eventRoomNumber = document.getElementById('event-room-number');
    const eventPrice = document.getElementById('event-price');
    const eventStatus = document.getElementById('event-status');
    const eventPaymentStatus = document.getElementById('event-payment-status');
    const eventDescription = document.getElementById('event-description');
    const eventStartDate = document.getElementById('event-start-date');
    const eventEndDate = document.getElementById('event-end-date');
    const channelIcon = document.getElementById('channel-icon');
    const channelName = document.getElementById('channel-name');

    if (eventToEdit) {
        console.log('Editing event:', eventToEdit);
        bookingIdTitle.textContent = `Booking #${eventToEdit.id}`;
        
        if (eventId) eventId.value = eventToEdit.id;
        if (eventBookingId) eventBookingId.value = eventToEdit.id;
        if (eventRoomId) eventRoomId.value = eventToEdit.extendedProps.room_id || '';
        if (eventTitle) eventTitle.value = eventToEdit.title;
        
        const props = eventToEdit.extendedProps;
        if (props) {
            if (eventFullName) eventFullName.value = props.full_name || '';
            if (eventEmail) eventEmail.value = props.email || '';
            if (eventPhone) eventPhone.value = props.phone || '';
            if (eventLineId) eventLineId.value = props.line_id || '';
            if (eventRoomNumber) eventRoomNumber.value = props.room_number || '';
            if (eventPrice) eventPrice.value = props.price || '';
            if (eventStatus) eventStatus.value = props.status || 'pending';
            if (eventPaymentStatus) eventPaymentStatus.value = props.payment_status || 'pending';
            if (eventDescription) eventDescription.value = props.description || '';
            
            // Update channel display
            if (props.channel) {
                const channel = props.channel.toLowerCase();
                if (channelIcon) {
                    channelIcon.className = 'channel-icon-default';
                    channelIcon.innerHTML = '<i class="fas fa-question"></i>';
                    
                    switch(channel) {
                        case 'agoda':
                            channelIcon.className = 'channel-icon-wrapper bg-light';
                            channelIcon.innerHTML = '<img src="/images/channels/agoda.png" alt="Agoda" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-hotel text-primary"></i></span>';
                            break;
                        case 'booking.com':
                            channelIcon.className = 'channel-icon-wrapper bg-light';
                            channelIcon.innerHTML = '<img src="/images/channels/booking.png" alt="Booking.com" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-hotel text-primary"></i></span>';
                            break;
                        case 'expedia':
                            channelIcon.className = 'channel-icon-wrapper bg-light';
                            channelIcon.innerHTML = '<img src="/images/channels/expedia.png" alt="Expedia" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-suitcase text-warning"></i></span>';
                            break;
                        case 'traveloka':
                            channelIcon.className = 'channel-icon-wrapper bg-light';
                            channelIcon.innerHTML = '<img src="/images/channels/traveloka.png" alt="Traveloka" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-plane text-info"></i></span>';
                            break;
                        case 'trip.com':
                            channelIcon.className = 'channel-icon-wrapper bg-light';
                            channelIcon.innerHTML = '<img src="/images/channels/trip.png" alt="Trip.com" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-globe text-primary"></i></span>';
                            break;
                        case 'direct':
                            channelIcon.className = 'channel-icon-direct';
                            channelIcon.innerHTML = '<i class="fas fa-globe"></i>';
                            break;
                        case 'phone':
                            channelIcon.className = 'channel-icon-phone';
                            channelIcon.innerHTML = '<i class="fas fa-phone-alt"></i>';
                            break;
                        case 'line':
                            channelIcon.className = 'channel-icon-line';
                            channelIcon.innerHTML = '<i class="fab fa-line"></i>';
                            break;
                    }
                }
                if (channelName) {
                    channelName.textContent = props.channel;
                }
            } else {
                if (channelIcon) {
                    channelIcon.className = 'channel-icon-default';
                    channelIcon.innerHTML = '<i class="fas fa-question"></i>';
                }
                if (channelName) {
                    channelName.textContent = 'Not specified';
                }
            }
        }
        
        // Set dates
        console.log('Event start date:', eventToEdit.start);
        console.log('Event end date:', eventToEdit.end);
        if (eventStartDate) eventStartDate.value = formatDate(eventToEdit.start);
        if (eventEndDate) eventEndDate.value = formatDate(eventToEdit.end);
    } else if (info) {
        console.log('Creating event from selection:', info);
        bookingIdTitle.textContent = 'New Booking';
        if (eventStartDate) eventStartDate.value = formatDate(info.start);
        if (eventEndDate) eventEndDate.value = formatDate(info.end);
        
        // Reset channel display for new events
        if (channelIcon) {
            channelIcon.className = 'channel-icon-default';
            channelIcon.innerHTML = '<i class="fas fa-question"></i>';
        }
        if (channelName) {
            channelName.textContent = 'Not specified';
        }
    } else {
        bookingIdTitle.textContent = 'New Booking';
        const today = new Date();
        if (eventStartDate) eventStartDate.value = formatDate(today);
        if (eventEndDate) eventEndDate.value = formatDate(today);
        
        // Reset channel display for new events
        if (channelIcon) {
            channelIcon.className = 'channel-icon-default';
            channelIcon.innerHTML = '<i class="fas fa-question"></i>';
        }
        if (channelName) {
            channelName.textContent = 'Not specified';
        }
    }
  }
  
  /**
   * Hide event form
   */
  function hideEventForm() {
    const formContainer = document.getElementById('event-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
  }
  
  /**
   * Save event from form data
   */
  function saveEventForm() {
    const form = document.getElementById('event-form');
    const title = document.getElementById('event-title').value;
    
    if (!title) {
        alert('กรุณาใส่ชื่อกิจกรรม');
        return;
    }
    
    const startDate = document.getElementById('event-start-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endDate = document.getElementById('event-end-date').value;
    const endTime = document.getElementById('event-end-time').value;
    const color = document.getElementById('event-color').value;
    const eventId = document.getElementById('event-id').value;
    
    if (!startDate || !endDate || !startTime || !endTime) {
        alert('กรุณาเลือกวันที่และเวลา');
        return;
    }
    
    // Create start and end date objects with time
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    // Check if end is after start
    if (end <= start) {
        alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
        return;
    }
    
    // Create event object
    const eventData = {
        id: eventId || generateUniqueId(),
        title: title,
        start: start,
        end: end,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
            full_name: document.getElementById('event-full-name').value,
            email: document.getElementById('event-email').value,
            phone: document.getElementById('event-phone').value,
            line_id: document.getElementById('event-line-id').value,
            room_number: document.getElementById('event-room-number').value,
            price: document.getElementById('event-price').value,
            status: document.getElementById('event-status').value,
            payment_status: document.getElementById('event-payment-status').value,
            description: document.getElementById('event-description').value
        }
    };
    
    // Save to storage
    if (eventId) {
        updateEventInStorage(eventData);
    } else {
        addEventToStorage(eventData);
    }
    
    // Hide form
    hideEventForm();
    
    // Refresh calendar
    refreshCalendar();
  }
  
  /**
   * Edit existing event
   */
  function editEvent(event) {
    showEventForm(null, event);
  }
  
  /**
   * Update event after drag or resize
   */
  function updateEvent(event) {
    const eventData = {
      id: event.id,
      booking_id: event.extendedProps.booking_id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.backgroundColor,
      extendedProps: event.extendedProps
    };
    
    updateEventInStorage(eventData);
  }
  
  /**
   * Delete event
   */
  function deleteEvent(eventId) {
    if (confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
      removeEventFromStorage(eventId);
      refreshCalendar();
      hideEventForm();
    }
  }
  
  /**
   * Refresh calendar with events from storage
   */
  function refreshCalendar() {
   
    const calendarEl = document.getElementById('calendar');
    const calendar = calendarEl._calendar;
    
    // Remove all events
    calendar.getEvents().forEach(event => event.remove());
    
    // Add events from storage
    const events = getEventsFromStorage();
    events.forEach(event => {
      calendar.addEvent(event);
    });

    
  }
  
  /**
   * Add event to local storage
   */
  function addEventToStorage(eventData) {
    const events = getEventsFromStorage();
    events.push(eventData);
    localStorage.setItem('localCalendarEvents', JSON.stringify(events));
  }
  
  /**
   * Update event in local storage
   */
  function updateEventInStorage(eventData) {
    const events = getEventsFromStorage();
    const index = events.findIndex(e => e.id === eventData.id);
    
    if (index !== -1) {
      events[index] = eventData;
      localStorage.setItem('localCalendarEvents', JSON.stringify(events));
    }
  }
  
  /**
   * Remove event from local storage
   */
  function removeEventFromStorage(eventId) {
    const events = getEventsFromStorage();
    const filteredEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('localCalendarEvents', JSON.stringify(filteredEvents));
  }
  
  function getEventsFromStorage() {
    if (!Array.isArray(bookingData) || bookingData.length === 0) {
        return getSampleEvents();
    }

    try {
        const events = bookingData.map(booking => {
            console.log('Processing booking:', booking);
            const startDate = new Date(booking.check_in);
            const endDate = new Date(booking.check_out);
            console.log('Converted dates:', { startDate, endDate });
            
            // Get channel icon HTML
            let channelIcon = '';
            if (booking.channel) {
                const channel = booking.channel.toLowerCase();
                switch(channel) {
                    case 'agoda':
                        channelIcon = '<div class="channel-icon-wrapper bg-light"><img src="/images/channels/agoda.png" alt="Agoda" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-hotel text-primary"></i></span></div>';
                        break;
                    case 'booking.com':
                        channelIcon = '<div class="channel-icon-wrapper bg-light"><img src="/images/channels/booking.png" alt="Booking.com" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-hotel text-primary"></i></span></div>';
                        break;
                    case 'expedia':
                        channelIcon = '<div class="channel-icon-wrapper bg-light"><img src="/images/channels/expedia.png" alt="Expedia" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-suitcase text-warning"></i></span></div>';
                        break;
                    case 'traveloka':
                        channelIcon = '<div class="channel-icon-wrapper bg-light"><img src="/images/channels/traveloka.png" alt="Traveloka" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-plane text-info"></i></span></div>';
                        break;
                    case 'trip.com':
                        channelIcon = '<div class="channel-icon-wrapper bg-light"><img src="/images/channels/trip.png" alt="Trip.com" class="channel-icon" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';"><span class="channel-icon-fallback" style="display:none;"><i class="fas fa-globe text-primary"></i></span></div>';
                        break;
                    case 'direct':
                        channelIcon = '<div class="channel-icon-direct"><i class="fas fa-globe"></i></div>';
                        break;
                    case 'phone':
                        channelIcon = '<div class="channel-icon-phone"><i class="fas fa-phone-alt"></i></div>';
                        break;
                    case 'line':
                        channelIcon = '<div class="channel-icon-line"><i class="fab fa-line"></i></div>';
                        break;
                    default:
                        channelIcon = '<div class="channel-icon-default"><i class="fas fa-question"></i></div>';
                }
            }
            
            return {
                id: booking.id,
                title: booking.full_name || 'Booking',
                start: startDate,
                end: endDate,
                backgroundColor: booking.status === 'confirmed' ? '#4caf50' : '#ff9800',
                borderColor: '#ccc',
                extendedProps: {
                    full_name: booking.full_name,
                    email: booking.email,
                    phone: booking.phone,
                    line_id: booking.user_line_id,
                    room_number: booking.room_count,
                    price: booking.total_price,
                    status: booking.status,
                    payment_status: booking.payment_status,
                    description: booking.notes || '',
                    channel: booking.channel || 'Not specified',
                    channel_icon: channelIcon
                }
            };
        });

        return events;
    } catch (e) {
        console.error('Error parsing booking data', e);
        return getSampleEvents();
    }
}
  /**
   * Get sample events for initial display
   */
  function getSampleEvents() {
    return [];
  }

  /**
   * Utility function to format date for input fields
   */
  function formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTime(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function getStartOfDay(value) {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date(NaN);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function enforceTimeBounds(startDateInput, endDateInput, startTimeInput, endTimeInput) {
    if (!startDateInput || !endDateInput || !startTimeInput || !endTimeInput) {
      return;
    }

    const today = new Date();
    const todayStr = formatDate(today);
    const nowTime = formatTime(today);

    const startDateValue = startDateInput.value || todayStr;
    const endDateValue = endDateInput.value || startDateValue;

    if (startDateValue === todayStr) {
      if (startTimeInput.min !== nowTime) {
        startTimeInput.min = nowTime;
      }
      if (!startTimeInput.value || startTimeInput.value < nowTime) {
        startTimeInput.value = nowTime;
      }
    } else {
      startTimeInput.min = '00:00';
    }

    let minEndTime = '00:00';
    if (endDateValue === startDateValue) {
      if (startTimeInput.value) {
        minEndTime = startTimeInput.value;
      } else if (startTimeInput.min) {
        minEndTime = startTimeInput.min;
      } else {
        minEndTime = nowTime;
      }
    }
    endTimeInput.min = minEndTime;
    if (endTimeInput.value && endTimeInput.value < minEndTime) {
      endTimeInput.value = minEndTime;
    }
  }

  /**
   * Generate a unique ID for events
   */
  function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }


  // Init function that can be called to show the calendar
  document.addEventListener('DOMContentLoaded', function() {
    // You can call showCalendarTool() here to display calendar on page load
    // Or it can be triggered by a button click elsewhere
  });