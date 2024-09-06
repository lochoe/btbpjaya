// Function to add a new parent and child information
function addParentChildInfo(namaPenuh, noIc, umur, namaParent, noTelefon, alamat, namaSekolah, levelSkill, levelPlay, photoURL) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ParentChildInfo');
  sheet.appendRow([namaPenuh, noIc, umur, namaParent, noTelefon, alamat, namaSekolah, levelSkill, levelPlay, photoURL]);
}

// Function to get all parent and child information
function getParentChildInfo() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ParentChildInfo');
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // Exclude header row
}

// Function to search for a parent and child information by noIc
function searchParentChildInfo(noIc) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ParentChildInfo');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === noIc) {
      return data[i];
    }
  }
  return null;
}

// Function to add a new event (only for admins)
function addEvent(eventName, eventDate, startTime, endTime, venue, venueImage, description) {
  const userEmail = Session.getActiveUser().getEmail();
  const adminSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Admins');
  const admins = adminSheet.getDataRange().getValues().flat();
  
  if (admins.includes(userEmail)) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Events');
    sheet.appendRow([eventName, eventDate, startTime, endTime, venue, venueImage, description, '']);
  } else {
    throw new Error('Unauthorized: Only admins can add events.');
  }
}

// Function to get all events
function getEvents() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Events');
  const data = sheet.getDataRange().getValues();
  Logger.log('Events data: ' + JSON.stringify(data)); // Add logging
  return data.slice(1); // Exclude header row
}

// Function to register a child for an event
function registerForEvent(eventName, noIc) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Events');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventName) {
      const participants = data[i][7] ? data[i][7].split(',') : [];
      participants.push(noIc);
      sheet.getRange(i + 1, 8).setValue(participants.join(','));
      break;
    }
  }
}

// Function to get participants for an event
function getEventParticipants(eventName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Events');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === eventName) {
      const participants = data[i][7] ? data[i][7].split(',') : [];
      return participants.map(noIc => searchParentChildInfo(noIc));
    }
  }
  return [];
}

// Function to mark attendance
function markAttendance(eventName, noIc, attended) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Attendance');
  sheet.appendRow([eventName, noIc, attended]);
}

// Function to get attendance data
function getAttendance() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues();
  Logger.log('Attendance data: ' + JSON.stringify(data)); // Add logging
  return data.slice(1); // Exclude header row
}

function doGet(e) {
  let page = e.parameter.mode || "Index";
  let html = HtmlService.createTemplateFromFile(page).evaluate();
  let htmlOutput = HtmlService.createHtmlOutput(html);
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  // Replace {{NAVBAR}} with the Navbar content
  htmlOutput.setContent(htmlOutput.getContent().replace("{{NAVBAR}}", getNavbar(page)));
  return htmlOutput;
}

// Create Navigation Bar
function getNavbar(activePage) {
  var scriptURLHome = getScriptURL();
  var scriptURLPage1 = getScriptURL("mode=eventList");
  var scriptURLPage2 = getScriptURL("mode=register");
  var scriptURLPage3 = getScriptURL("mode=eventRegister");
  var scriptURLPage4 = getScriptURL("mode=addEvent");
  var scriptURLPage5 = getScriptURL("mode=attendance");
  var scriptURLPage6 = getScriptURL("mode=codeCitations");

  var navbar = 
    `<nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
        <a class="navbar-brand" href="${scriptURLHome}">Sports Club</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-item nav-link ${activePage === 'Index' ? 'active' : ''}" href="${scriptURLHome}">Home</a>
            <a class="nav-item nav-link ${activePage === 'eventList' ? 'active' : ''}" href="${scriptURLPage1}">Event List</a>
            <a class="nav-item nav-link ${activePage === 'register' ? 'active' : ''}" href="${scriptURLPage2}">Register</a>
            <a class="nav-item nav-link ${activePage === 'eventRegister' ? 'active' : ''}" href="${scriptURLPage3}">Event Register</a>
            <a class="nav-item nav-link ${activePage === 'addEvent' ? 'active' : ''}" href="${scriptURLPage4}">Add Event</a>
            <a class="nav-item nav-link ${activePage === 'attendance' ? 'active' : ''}" href="${scriptURLPage5}">Attendance</a>
          </div>
        </div>
        </div>
      </nav>`;
  return navbar;
}

// Returns the URL of the Google Apps Script web app
function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if (qs) {
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}

// Include HTML parts, e.g., JavaScript, CSS, other HTML files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}