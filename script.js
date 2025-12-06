let excelTimes = [];
let matchFound = false;

// Update clock every second
function updateClock() {
const now = new Date();


// Convert to UTC+14
const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
const utcPlus14 = new Date(utcTime + (14 * 3600000));

const hours = utcPlus14.getHours();
const minutes = utcPlus14.getMinutes();
const seconds = utcPlus14.getSeconds();

const timeString = formatTime(hours, minutes, seconds);
const clockElement = document.getElementById('clockDisplay');
clockElement.textContent = timeString;

// Check for match
matchFound = excelTimes.some(time => 
    time.H === hours && time.M === minutes && time.S === seconds
);

if (matchFound) {
    clockElement.classList.add('matched');
} else {
    clockElement.classList.remove('matched');
}


}

function formatTime(h, m, s) {
return ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')};
}

// Handle file upload
document.getElementById(‘fileInput’).addEventListener(‘change’, function(e) {
const file = e.target.files[0];
if (!file) return;


document.getElementById('fileName').textContent = `Uploaded: ${file.name}`;

const reader = new FileReader();
reader.onload = function(e) {
    try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        excelTimes = jsonData
            .map(row => ({
                H: parseInt(row.H),
                M: parseInt(row.M),
                S: parseInt(row.S)
            }))
            .filter(time => 
                !isNaN(time.H) && !isNaN(time.M) && !isNaN(time.S) &&
                time.H >= 0 && time.H <= 23 &&
                time.M >= 0 && time.M <= 59 &&
                time.S >= 0 && time.S <= 59
            );
        
        if (excelTimes.length === 0) {
            showMessage('No valid time data found. Please ensure columns are named H, M, S.', 'error');
            document.getElementById('timesList').innerHTML = '';
            return;
        }
        
        showMessage(`Successfully loaded ${excelTimes.length} time(s)`, 'success');
        displayTimesList();
        
    } catch (error) {
        showMessage('Error reading Excel file. Please check the format.', 'error');
        console.error(error);
    }
};

reader.readAsArrayBuffer(file);


});

function showMessage(message, type) {
const statusDiv = document.getElementById(‘statusMessage’);
statusDiv.innerHTML = <div class="status-message status-${type}">${message}</div>;
}

function displayTimesList() {
const listDiv = document.getElementById(‘timesList’);
listDiv.innerHTML = ‘<div class="times-list">’ +
excelTimes.map(time =>
<div class="time-item">${formatTime(time.H, time.M, time.S)}</div>
).join(’’) +
‘</div>’;
}

// Start the clock
setInterval(updateClock, 1000);
updateClock();