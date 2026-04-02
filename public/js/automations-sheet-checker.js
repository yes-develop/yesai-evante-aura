// Google Sheets Configuration — values injected via window.AppConfig from the loading Blade template
const SHEET_ID = (window.AppConfig && window.AppConfig.GOOGLE_SHEETS_ID) || '';
const API_KEY = (window.AppConfig && window.AppConfig.GOOGLE_SHEETS_API_KEY) || '';
const WEBHOOK_URL = (window.AppConfig && window.AppConfig.MAKE_WEBHOOK_AUTOMATIONS_URL) || '';
const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/automation?key=${API_KEY}`;
const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

// ฟังก์ชันหลักสำหรับตรวจสอบและอัปเดต automation
async function checkAutomations() {
    try {
        // ดึงข้อมูลจาก Google Sheet
        const response = await fetch(sheetUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Sheet');
        }
        
        const data = await response.json();
        if (!data.values || data.values.length <= 1) {
            console.log('No data found in the sheet or only headers present');
            return;
        }
        
        // ข้อมูลที่มีการเปลี่ยนแปลงจะถูกส่งไปยัง webhook
        const changedRows = [];
        const debugInfo = [];
        
        // เริ่มจากแถวที่ 2 (หลังจากแถวหัวข้อ)
        for (let i = 1; i < data.values.length; i++) {
            const row = data.values[i];
            
            // ตรวจสอบว่ามีข้อมูลในคอลัมน์ E (index 4) หรือไม่
            if (row.length >= 5 && row[4]) {
                // ตรวจสอบว่า Status (คอลัมน์ C, index 2) เป็น "manual chat" หรือไม่
                const status = row[2] ? row[2].trim() : '';
                if (status !== 'manual chat') {
                    continue; // ข้ามไปแถวถัดไปถ้าไม่ใช่ manual chat
                }
                
                // แปลงวันที่จาก string เป็น Date object
                const lastModifyDateStr = row[4];
                const lastModifyDate = new Date(lastModifyDateStr);
                
                const rowDebugInfo = {
                    row: i+1,
                    date_string: lastModifyDateStr,
                    is_valid_date: !isNaN(lastModifyDate.getTime()),
                    parsed_date: lastModifyDate.toString(),
                    current_time: new Date().toString()
                };
                
                // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
                if (!isNaN(lastModifyDate.getTime())) {
                    // คำนวณความต่างของเวลาในหน่วยนาที
                    const currentTime = new Date();
                    const diffMinutes = Math.floor((currentTime - lastModifyDate) / (1000 * 60));
                    
                    rowDebugInfo.diff_minutes = diffMinutes;
                    
                    // ถ้าเวลาผ่านไปมากกว่า 5 นาที
                    if (diffMinutes > 5) {
                        console.log(`Row ${i+1}: Last modified more than 5 minutes ago (${diffMinutes} minutes). Updating to empty.`);
                        
                        // เปลี่ยนค่าในคอลัมน์ C (index 2) เป็น empty (option manual chat)
                        try {
                            await updateCellValue(i+1, 'C', '');
                            rowDebugInfo.update_status = 'success';
                        } catch (error) {
                            rowDebugInfo.update_status = 'failed';
                            rowDebugInfo.update_error = error.message;
                        }
                        
                        // เพิ่มข้อมูลที่เปลี่ยนแปลงเพื่อส่งไปยัง webhook
                        changedRows.push({
                            row: i+1,
                            lineUuid: row[0] || '',
                            original_value: row[2] || '',
                            new_value: '',
                            last_modified: lastModifyDateStr,
                            diff_minutes: diffMinutes
                        });
                    }
                } else {
                    rowDebugInfo.error = 'Invalid date format';
                }
                
                debugInfo.push(rowDebugInfo);
            }
        }
        
        console.log('Debug info:', debugInfo);
        
        // ถ้ามีการเปลี่ยนแปลง ส่งข้อมูลไปยัง webhook
        if (changedRows.length > 0) {
            await sendToWebhook(changedRows);
        } else {
            console.log('No changes needed');
        }
        
        return {
            status: 'success',
            changes: changedRows,
            debug: debugInfo
        };
    } catch (error) {
        console.error('Error checking automations:', error);
        return {
            status: 'error',
            message: error.message
        };
    }
}

// ฟังก์ชันสำหรับอัปเดตค่าในเซลล์
async function updateCellValue(rowIndex, columnLetter, newValue) {
    try {
        // แปลงตัวอักษรคอลัมน์เป็นตัวเลข (A=0, B=1, C=2, ...)
        const columnIndex = columnLetter.charCodeAt(0) - 65;
        
        // สร้าง range สำหรับการอัปเดต
        const range = `automation!${columnLetter}${rowIndex}`;
        
        // สร้างข้อมูลสำหรับการอัปเดต
        const updateData = {
            range: range,
            values: [[newValue]],
            majorDimension: 'ROWS'
        };
        
        // ทำการอัปเดตผ่าน Google Sheets API
        const updateResponse = await fetch(`${updateUrl}/${range}?key=${API_KEY}&valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update cell: ${errorText}`);
        }
        
        console.log(`Cell ${columnLetter}${rowIndex} updated successfully`);
        return true;
    } catch (error) {
        console.error('Error updating cell:', error);
        return false;
    }
}

// ฟังก์ชันสำหรับส่งข้อมูลไปยัง webhook
async function sendToWebhook(changedData) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                changes: changedData,
                timestamp: new Date().toISOString(),
                sheet_id: SHEET_ID
            })
        });
        
        if (!response.ok) {
            throw new Error(`Webhook returned status ${response.status}`);
        }
        
        console.log('Data sent to webhook successfully');
        return true;
    } catch (error) {
        console.error('Error sending to webhook:', error);
        return false;
    }
}

// ตั้งเวลาให้ทำงานทุก 1 นาที
setInterval(checkAutomations, 60 * 1000);

// ทำงานครั้งแรกทันที
checkAutomations(); 