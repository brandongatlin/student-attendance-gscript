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
    Logger.log(crunchedData);
    // {Gina T={remote=0.0, present=2.0, absent=0.0}, Timmy Smith={present=1.0, absent=1.0, remote=0.0}, Shaun R={present=0.0, absent=2.0, remote=0.0}, Suzie Smith={present=2.0, absent=0.0, remote=0.0}, John T={present=2.0, absent=0.0, remote=0.0}, Hector G={remote=1.0, present=1.0, absent=0.0}, ={remote=0.0, present=0.0, absent=0.0}}
}

function main() {
    const data = getAttendanceSheetsData();
    const cleaned = combineAndCleanData(data);
    crunch(cleaned);
}