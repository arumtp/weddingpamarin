/**
 * Backend RSVP & Ucapan — Google Apps Script
 * ------------------------------------------------------------
 * 1. Buat Google Sheet baru, beri nama sheet (tab) "RSVP".
 *    Baris 1 (header): time | name | attend | count | message
 * 2. Extensions → Apps Script, tempel seluruh kode ini, Save.
 * 3. Deploy → New deployment → type "Web app"
 *      Execute as : Me
 *      Who has access : Anyone
 * 4. Salin URL Web App (…/exec) ke js/config.js → rsvpEndpoint.
 */
const SHEET_NAME = "RSVP";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["time", "name", "attend", "count", "message"]);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET → daftar ucapan (terbaru dulu)
function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const data = rows
    .filter(r => r[1])
    .map(r => ({
      time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      name: String(r[1]),
      attend: String(r[2]),
      count: Number(r[3]) || 0,
      message: String(r[4] || "")
    }))
    .reverse()
    .slice(0, 300);
  return json_({ ok: true, data });
}

// POST (body JSON sebagai text/plain) → simpan RSVP
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = JSON.parse(e.postData.contents || "{}");
    const clean = (s, n) => String(s || "").replace(/^[=+\-@]/, "'$&").slice(0, n); // cegah formula injection
    const name = clean(b.name, 60).trim();
    if (!name) return json_({ ok: false, error: "name required" });
    const attend = b.attend === "Hadir" ? "Hadir" : "Tidak Hadir";
    sheet_().appendRow([new Date(), name, attend, attend === "Hadir" ? Math.min(Number(b.count) || 1, 10) : 0, clean(b.message, 500)]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
