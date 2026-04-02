// Google Apps Script for handling Spreadsheet updates
// Deploy this as a Web App with the following settings:
// - Execute as: Me (your account)
// - Who has access: Anyone (for public access) or Anyone with Google account (more secure)

function doGet(e) {
  return HtmlService.createHtmlOutput('This is a POST endpoint for updating Google Sheets');
}

function doPost(e) {
  try {
    // Get parameters from the request
    const params = e.parameter;
    const sheetId = params.sheetId;
    const rowNumber = parseInt(params.row);
    const data = JSON.parse(params.data);
    
    // Open the spreadsheet using its ID
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    // Get the sheet named "Prompt"
    const sheet = spreadsheet.getSheetByName('Prompt');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Sheet "Prompt" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // For each column, update the cell in the specified row
    for (let i = 0; i < data.length; i++) {
      // Column A is 1, B is 2, etc. (1-indexed)
      const columnIndex = i + 1;
      sheet.getRange(rowNumber, columnIndex).setValue(data[i]);
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data updated successfully',
      updatedRow: rowNumber,
      updatedData: data
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to log requests - useful for debugging
function logRequest(request) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs') || 
                SpreadsheetApp.getActiveSpreadsheet().insertSheet('Logs');
  sheet.appendRow([new Date(), JSON.stringify(request)]);
} 