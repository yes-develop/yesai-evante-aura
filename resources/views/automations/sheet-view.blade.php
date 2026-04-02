@extends('layouts.app')

@section('title', 'Automation Google Sheet')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/automations.css?time=') }}<?php echo time();?>">
<style>
    .sheet-container {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .sheet-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .sheet-table th, .sheet-table td {
        padding: 10px;
        border: 1px solid #e0e0e0;
    }
    
    .sheet-table th {
        background-color: #f5f5f5;
        font-weight: 600;
    }
    
    .action-btn {
        margin-bottom: 20px;
    }
    
    .btn-check-automation {
        background-color: #4a6cf7;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-check-automation:hover {
        background-color: #3a5bd9;
        transform: translateY(-2px);
    }
    
    .result-container {
        margin-top: 20px;
        padding: 15px;
        border-radius: 5px;
        background-color: #f9f9f9;
        border-left: 4px solid #4a6cf7;
        font-family: monospace;
        white-space: pre-wrap;
        display: none;
        max-height: 300px;
        overflow-y: auto;
    }
    
    .expired-row {
        background-color: #fff4f4;
    }
    
    .debug-info {
        color: #666;
        font-size: 0.9em;
    }
    
    .debug-warning {
        color: #e74c3c;
        font-weight: bold;
    }
    
    .debug-success {
        color: #2ecc71;
    }
    
    .toggle-debug {
        margin-left: 10px;
        font-size: 12px;
        color: #4a6cf7;
        cursor: pointer;
        text-decoration: underline;
    }
</style>
@endsection

@section('content')
<div class="content-header">
    <h1>Automation Google Sheet</h1>
    <p>ข้อมูลจาก Google Sheet สำหรับ Automations</p>
</div>

<div class="action-btn">
    <button class="btn-check-automation" id="checkNowBtn">
        <i class="fas fa-sync"></i> ตรวจสอบและอัปเดต Automations
    </button>
    <span class="toggle-debug" id="toggleDebugBtn">แสดง/ซ่อนรายละเอียดดีบัก</span>
</div>

<div class="result-container" id="resultContainer"></div>

<div class="sheet-container">
    <h2>ข้อมูลจาก Google Sheet</h2>
    <p>Sheet ID: <code>{{ config('services.google_sheets.id') }}</code></p>
    <p>Sheet Name: <code>automation</code></p>
    <div id="sheetData">
        <p>กำลังโหลดข้อมูล...</p>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const SHEET_ID = '{{ config('services.google_sheets.id') }}';
        const API_KEY = '{{ config('services.google_sheets.api_key') }}';
        const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/automation?key=${API_KEY}`;
        let isDebugVisible = false;
        
        // โหลดข้อมูลจาก Google Sheet
        loadSheetData();
        
        // Toggle debug information
        document.getElementById('toggleDebugBtn').addEventListener('click', function() {
            isDebugVisible = !isDebugVisible;
            const resultContainer = document.getElementById('resultContainer');
            resultContainer.style.display = isDebugVisible ? 'block' : 'none';
        });
        
        // เมื่อกดปุ่มตรวจสอบ automation
        document.getElementById('checkNowBtn').addEventListener('click', function() {
            const btn = this;
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังตรวจสอบ...';
            
            const resultContainer = document.getElementById('resultContainer');
            resultContainer.style.display = 'block';
            resultContainer.textContent = 'กำลังตรวจสอบและอัปเดต...';
            
            // เรียกใช้ API ที่สร้างไว้
            fetch('/api/automation-sheet-checker.php')
                .then(response => response.json())
                .then(data => {
                    // แสดงผลลัพธ์
                    resultContainer.textContent = JSON.stringify(data, null, 2);
                    
                    // โหลดข้อมูลใหม่หลังจากอัปเดต
                    loadSheetData();
                    
                    // แสดง notification
                    if (data.changes && data.changes.length > 0) {
                        showNotification(`อัปเดต ${data.changes.length} รายการเรียบร้อยแล้ว`, 'success');
                    } else {
                        let message = 'ไม่มีรายการที่ต้องอัปเดต';
                        let notificationType = 'info';
                        
                        if (data.debug && data.debug.length > 0) {
                            // ตรวจสอบว่ามีข้อมูลที่มีปัญหาเกี่ยวกับวันที่หรือไม่
                            let hasFutureDates = false;
                            let hasTimeExceeded = false;
                            let hasFormatIssues = false;
                            
                            data.debug.forEach(item => {
                                // ตรวจสอบการปรับเวลาในอนาคต
                                if (item.calculation_note && item.calculation_note.includes('ปรับปีที่อยู่ในอนาคต')) {
                                    hasFutureDates = true;
                                }
                                
                                // ตรวจสอบเวลาที่เกิน threshold
                                if (item.diff_minutes > 5) {
                                    hasTimeExceeded = true;
                                }
                                
                                // ตรวจสอบปัญหารูปแบบวันที่
                                if (item.is_valid_date === false) {
                                    hasFormatIssues = true;
                                }
                            });
                            
                            if (hasFormatIssues) {
                                message += ' (พบปัญหารูปแบบวันที่ไม่ถูกต้อง โปรดตรวจสอบรายละเอียดดีบัก)';
                                notificationType = 'warning';
                            } else if (hasFutureDates) {
                                message += ' (พบวันที่ในอนาคต ระบบได้ปรับเป็นวันที่ปัจจุบันในการคำนวณแล้ว)';
                                notificationType = 'warning';
                            } else if (hasTimeExceeded) {
                                message += ' (พบข้อมูลที่ควรอัปเดตแต่เกิดข้อผิดพลาด โปรดตรวจสอบรายละเอียดดีบัก)';
                                notificationType = 'warning';
                            }
                        }
                        
                        showNotification(message, notificationType);
                    }
                    
                    // คืนค่าปุ่มเดิม
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                })
                .catch(error => {
                    resultContainer.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
                    showNotification('เกิดข้อผิดพลาดในการตรวจสอบ', 'error');
                    
                    // คืนค่าปุ่มเดิม
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                });
        });
        
        // ฟังก์ชันโหลดข้อมูลจาก Google Sheet
        function loadSheetData() {
            const sheetDataContainer = document.getElementById('sheetData');
            sheetDataContainer.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';
            
            fetch(sheetUrl)
                .then(response => response.json())
                .then(data => {
                    if (!data.values || data.values.length === 0) {
                        sheetDataContainer.innerHTML = '<p>ไม่พบข้อมูลใน Sheet</p>';
                        return;
                    }
                    
                    // สร้างตาราง
                    const table = document.createElement('table');
                    table.className = 'sheet-table';
                    
                    // สร้างส่วนหัวตาราง
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    
                    // กำหนดชื่อคอลัมน์
                    const headers = data.values[0];
                    headers.forEach(header => {
                        const th = document.createElement('th');
                        th.textContent = header;
                        headerRow.appendChild(th);
                    });
                    
                    // เพิ่มคอลัมน์ Debug
                    const thDebug = document.createElement('th');
                    thDebug.textContent = 'สถานะ';
                    headerRow.appendChild(thDebug);
                    
                    thead.appendChild(headerRow);
                    table.appendChild(thead);
                    
                    // สร้างส่วนเนื้อหาตาราง
                    const tbody = document.createElement('tbody');
                    
                    // เริ่มจากแถวที่ 2 (หลังจากแถวหัวข้อ)
                    for (let i = 1; i < data.values.length; i++) {
                        const row = data.values[i];
                        const tr = document.createElement('tr');
                        
                        // ตรวจสอบว่าเวลาผ่านไปเกิน 5 นาทีหรือไม่ และเป็น manual chat หรือไม่
                        let isExpired = false;
                        let diffMinutes = 0;
                        let dateInfo = '';
                        let isManualChat = false;
                        let isValidDate = true;
                        
                        // ตรวจสอบว่าเป็น manual chat หรือไม่
                        if (row.length >= 3 && row[2]) {
                            const status = row[2].trim().toLowerCase();
                            isManualChat = (status === 'manual chat');
                        }
                        
                        if (row.length >= 5 && row[4]) {
                            try {
                                const lastModifyDate = new Date(row[4]);
                                if (!isNaN(lastModifyDate.getTime())) {
                                    const currentTime = new Date();
                                    diffMinutes = Math.floor((currentTime - lastModifyDate) / (1000 * 60));
                                    
                                    // ตรวจสอบวันที่ในอนาคต
                                    if (lastModifyDate > currentTime) {
                                        dateInfo = `⚠️ วันที่ในอนาคต: ${row[4]}`;
                                        isValidDate = false;
                                    } else {
                                        // แสดงวันที่และเวลาในรูปแบบที่อ่านง่าย
                                        const formattedDate = lastModifyDate.toLocaleString('th-TH', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        
                                        // คำนวณและแสดงเวลาที่ผ่านไป
                                        if (diffMinutes < 60) {
                                            dateInfo = `แก้ไขเมื่อ ${diffMinutes} นาทีที่แล้ว (${formattedDate})`;
                                        } else if (diffMinutes < 1440) {
                                            const hours = Math.floor(diffMinutes / 60);
                                            dateInfo = `แก้ไขเมื่อ ${hours} ชั่วโมงที่แล้ว (${formattedDate})`;
                                        } else {
                                            const days = Math.floor(diffMinutes / 1440);
                                            dateInfo = `แก้ไขเมื่อ ${days} วันที่แล้ว (${formattedDate})`;
                                        }
                                    }
                                    
                                    if (diffMinutes > 5 && isManualChat) {
                                        isExpired = true;
                                        tr.classList.add('expired-row');
                                    }
                                } else {
                                    dateInfo = `⚠️ รูปแบบวันที่ไม่ถูกต้อง: ${row[4]}`;
                                    isValidDate = false;
                                }
                            } catch (e) {
                                dateInfo = `⚠️ ไม่สามารถแปลงวันที่: ${row[4]} (${e.message})`;
                                isValidDate = false;
                            }
                        } else {
                            dateInfo = 'ไม่พบข้อมูลวันที่';
                        }
                        
                        // สร้างเซลล์สำหรับแต่ละคอลัมน์
                        row.forEach((cell, cellIndex) => {
                            const td = document.createElement('td');
                            td.textContent = cell || '';
                            tr.appendChild(td);
                        });
                        
                        // เพิ่มคอลัมน์ Debug
                        const tdDebug = document.createElement('td');
                        let debugInfo = '';
                        
                        if (!isValidDate) {
                            debugInfo = `<span class="debug-warning">${dateInfo}</span>`;
                        } else if (isManualChat) {
                            if (isExpired) {
                                debugInfo = `<span class="debug-warning">⚠️ ${dateInfo}<br>สถานะ "manual chat" ควรได้รับการอัปเดต</span>`;
                            } else {
                                debugInfo = `<span class="debug-info">${dateInfo}<br>สถานะ "manual chat" ยังไม่เกิน 5 นาที</span>`;
                            }
                        } else {
                            debugInfo = `<span class="debug-info">${dateInfo}<br>ไม่ใช่สถานะ "manual chat" (ไม่ต้องอัปเดต)</span>`;
                        }
                        
                        tdDebug.innerHTML = debugInfo;
                        tr.appendChild(tdDebug);
                        
                        tbody.appendChild(tr);
                    }
                    
                    table.appendChild(tbody);
                    
                    // แทนที่เนื้อหาเดิมด้วยตาราง
                    sheetDataContainer.innerHTML = '';
                    sheetDataContainer.appendChild(table);
                })
                .catch(error => {
                    sheetDataContainer.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</p>`;
                });
        }
        
        // ฟังก์ชันแสดง notification
        function showNotification(message, type = 'info') {
            // Check if function exists in automations.js, otherwise implement it here
            if (typeof window.showNotification === 'function') {
                window.showNotification(message, type);
            } else {
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-message">${message}</div>
                        <button class="notification-close">&times;</button>
                    </div>
                `;
                
                // Add notification to body
                document.body.appendChild(notification);
                
                // Show notification
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                // Close notification on click
                notification.querySelector('.notification-close').addEventListener('click', () => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                });
                
                // Auto close notification after 5 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 5000);
            }
        }
    });
</script>
@endsection 