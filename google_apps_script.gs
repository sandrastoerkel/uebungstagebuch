// ============================================================
// Google Apps Script für Übungstagebuch Cloud-Sync
// ============================================================
// Dieses Script in Google Sheets unter Erweiterungen > Apps Script einfügen.
// Dann als Web-App bereitstellen (Zugriff: "Jeder").
//
// Das Google Sheet braucht zwei Tabellenblätter:
//   "Kind1" — Spalten: Datum | App | Stimmung | ID | Name
//   "Kind2" — Spalten: Datum | App | Lesen | Stimmung | ID | Name
// Die erste Zeile ist die Kopfzeile (wird automatisch erstellt).
// ============================================================

function doGet(e) {
  try {
    var sheet = getSheet(e.parameter.sheet);
    if (!sheet) return jsonResponse({ error: 'Sheet nicht gefunden' });

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonResponse({ entries: [], name: '' });

    var headers = data[0];
    var entries = [];
    var name = '';

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[0] === '__NAME__') {
        name = String(row[1]);
        continue;
      }
      var entry = {};
      for (var j = 0; j < headers.length; j++) {
        var key = String(headers[j]).toLowerCase();
        if (key === 'datum') entry.date = formatDate(row[j]);
        else if (key === 'app') entry.app = Number(row[j]) || 0;
        else if (key === 'lesen') entry.read = Number(row[j]) || 0;
        else if (key === 'stimmung') entry.mood = String(row[j]);
        else if (key === 'id') entry.id = Number(row[j]) || 0;
      }
      if (entry.date) entries.push(entry);
    }

    return jsonResponse({ entries: entries, name: name });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var sheetName = payload.sheet;
    var sheet = getSheet(sheetName);

    if (!sheet) {
      sheet = createSheet(sheetName);
    }

    if (action === 'save') {
      return saveEntry(sheet, sheetName, payload.entry);
    } else if (action === 'delete') {
      return deleteEntry(sheet, payload.id);
    } else if (action === 'changeName') {
      return changeNameEntry(sheet, payload.name);
    } else if (action === 'clearAll') {
      return clearAllEntries(sheet, sheetName);
    }

    return jsonResponse({ error: 'Unbekannte Aktion: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ── Helpers ──

function getSheet(name) {
  if (!name) return null;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

function createSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet(name);
  if (name === 'Kind1') {
    sheet.appendRow(['Datum', 'App', 'Stimmung', 'ID']);
  } else {
    sheet.appendRow(['Datum', 'App', 'Lesen', 'Stimmung', 'ID']);
  }
  return sheet;
}

function saveEntry(sheet, sheetName, entry) {
  // Remove existing row with same ID or same date
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var rowDate = formatDate(data[i][0]);
    var rowId = Number(data[i][getIdCol(sheetName)]);
    if (rowDate === entry.date || rowId === entry.id) {
      sheet.deleteRow(i + 1);
    }
  }

  // Append new row
  if (sheetName === 'Kind1') {
    sheet.appendRow([entry.date, entry.app || 0, entry.mood || '–', entry.id]);
  } else {
    sheet.appendRow([entry.date, entry.app || 0, entry.read || 0, entry.mood || '–', entry.id]);
  }

  return jsonResponse({ success: true });
}

function deleteEntry(sheet, id) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = -1;
  for (var j = 0; j < headers.length; j++) {
    if (String(headers[j]).toLowerCase() === 'id') { idCol = j; break; }
  }
  if (idCol === -1) return jsonResponse({ error: 'ID-Spalte nicht gefunden' });

  for (var i = data.length - 1; i >= 1; i--) {
    if (Number(data[i][idCol]) === Number(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: true, note: 'Eintrag nicht gefunden' });
}

function changeNameEntry(sheet, name) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '__NAME__') {
      sheet.getRange(i + 1, 2).setValue(name);
      return jsonResponse({ success: true });
    }
  }
  // Name row does not exist yet, add it
  sheet.appendRow(['__NAME__', name]);
  return jsonResponse({ success: true });
}

function clearAllEntries(sheet, sheetName) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return jsonResponse({ success: true });
}

function getIdCol(sheetName) {
  return sheetName === 'Kind1' ? 3 : 4;
}

function formatDate(val) {
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = ('0' + (val.getMonth() + 1)).slice(-2);
    var d = ('0' + val.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  return String(val);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
