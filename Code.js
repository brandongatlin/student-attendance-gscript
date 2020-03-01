function getAttendanceSheets() {
    const ss = SpreadsheetApp.getActive();
    const sheetObjects = ss.getSheets()
    const attendanceSheets = [];

    sheetObjects.forEach(function(sheet) {
        const sheetName = sheet.getName();
        if (sheetName !== "Tags" && sheetName !== "Template" && sheetName !== "Summary" && sheetName !== "Students") {
            attendanceSheets.push(sheetName);
        }
    });
    return attendanceSheets;
}

function getAttendanceSheetsData() {
    const ss = SpreadsheetApp.getActive();
    const sheets = getAttendanceSheets();
    const data = [];
    const lastRow = ss.getSheetByName(sheets[0]).getLastRow();

    sheets.forEach(function(sheet) {
        const values = ss.getSheetByName(sheet).getSheetValues(2, 1, lastRow - 1, 2);
        data.push(values);
    });
    return data;
}

function getStudentNames() {
    const ss = SpreadsheetApp.getActive();
    const lastRow = ss.getLastRow();
    const names = ss.getSheetByName('Students').getSheetValues(1, 1, lastRow, 1);
    return names;
}

function combineAndCleanData(data) {
    let studentData = [];
    data.forEach(session => {
        studentData = studentData.concat(session.flat(1));
    });
    return studentData;
}

function crunch(data) {
    const studentNames = getStudentNames();
    let crunchedData = {};

    studentNames.forEach(name => {
        crunchedData[name] = { present: 0, absent: 0, remote: 0 };
    });

    let name, status;
    for (let i = 0; i < data.length; i += 2) {
        name = data[i + 1];
        status = data[i];
        if (status === 'ABSENT') {
            crunchedData[name].absent = crunchedData[name].absent + 1;
        } else if (status === 'REMOTE') {
            crunchedData[name].remote = crunchedData[name].remote + 1;
        } else if (status === '') {
            crunchedData[name].present = crunchedData[name].present + 1;
        } else {
            Logger.log('unknown status', status);
        }
    }
    return crunchedData;
}

function updateSummary(data) {
    const ss = SpreadsheetApp.getActive();
    const summary = ss.getSheetByName('Summary');
    const names = Object.keys(data);
    const values = Object.values(data);

    for (let i = 0; i < names.length - 1; i++) { // dont' use the last empty place in arr
        let name = names[i];
        let absent = values[i].absent;
        let remote = values[i].remote;
        summary.getRange(`A${i + 2}`).setValue(name);
        summary.getRange(`C${i + 2}`).setValue(absent);
        summary.getRange(`D${i + 2}`).setValue(remote);
    };
}

function main() {
    const data = getAttendanceSheetsData();
    const cleaned = combineAndCleanData(data);
    const crunched = crunch(cleaned);
    updateSummary(crunched);
}