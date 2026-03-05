// Sample Audit Data
let allLogs = [
  {timestamp: '19-02-2026 09:15', name: 'John Smith', id: 'EMP001', rfid: 'RFID-2024-001', event: 'Clock In', location: 'Gate 1', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 09:23', name: 'Sarah Johnson', id: 'EMP002', rfid: 'RFID-2024-002', event: 'Clock In', location: 'Gate 2', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 09:45', name: 'Mike Brown', id: 'EMP003', rfid: 'RFID-2024-003', event: 'Late Entry', location: 'Gate 1', status: 'Success', remarks: 'Marked as late'},
  {timestamp: '19-02-2026 10:12', name: 'Emma Davis', id: 'EMP004', rfid: 'RFID-2024-004', event: 'Clock In', location: 'Gate 3', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 10:30', name: 'Admin User', id: 'ADM001', rfid: 'ADMIN-001', event: 'Manual Edit', location: 'System', status: 'Success', remarks: 'Edited EMP003 time'},
  {timestamp: '19-02-2026 11:00', name: 'John Smith', id: 'EMP001', rfid: 'RFID-2024-001', event: 'Failed Login', location: 'System', status: 'Failed', remarks: 'Invalid credentials'},
  {timestamp: '19-02-2026 11:05', name: 'John Smith', id: 'EMP001', rfid: 'RFID-2024-001', event: 'Login', location: 'System', status: 'Success', remarks: 'Successful login'},
  {timestamp: '19-02-2026 13:45', name: 'Robert Wilson', id: 'EMP005', rfid: 'RFID-2024-005', event: 'Clock Out', location: 'Gate 1', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 14:20', name: 'Lisa Anderson', id: 'EMP006', rfid: 'RFID-2024-006', event: 'Clock In', location: 'Gate 2', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 15:00', name: 'Device Gateway 1', id: 'DEV-001', rfid: 'N/A', event: 'Device Offline', location: 'Gate 1', status: 'Failed', remarks: 'Connection lost'},
  {timestamp: '19-02-2026 15:30', name: 'Device Gateway 1', id: 'DEV-001', rfid: 'N/A', event: 'Device Online', location: 'Gate 1', status: 'Success', remarks: 'Reconnected'},
  {timestamp: '19-02-2026 16:00', name: 'Tom Martinez', id: 'EMP007', rfid: 'RFID-2024-007', event: 'Early Exit', location: 'Gate 3', status: 'Success', remarks: 'Left early'},
  {timestamp: '19-02-2026 16:45', name: 'Jennifer Lee', id: 'EMP008', rfid: 'RFID-2024-008', event: 'Clock In', location: 'Gate 1', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '19-02-2026 17:15', name: 'Admin User', id: 'ADM001', rfid: 'ADMIN-001', event: 'Manual Edit', location: 'System', status: 'Success', remarks: 'Corrected EMP007 time'},
  {timestamp: '19-02-2026 17:45', name: 'David Green', id: 'EMP009', rfid: 'RFID-2024-009', event: 'Failed Login', location: 'System', status: 'Failed', remarks: 'Wrong password'},
  {timestamp: '19-02-2026 18:00', name: 'Management User', id: 'ADM002', rfid: 'ADMIN-002', event: 'Login', location: 'System', status: 'Success', remarks: 'Admin access'},
  {timestamp: '19-02-2026 18:30', name: 'Robert Wilson', id: 'EMP005', rfid: 'RFID-2024-005', event: 'Clock Out', location: 'Gate 2', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '18-02-2026 09:00', name: 'Kevin White', id: 'EMP010', rfid: 'RFID-2024-010', event: 'Clock In', location: 'Gate 1', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '18-02-2026 17:45', name: 'Kevin White', id: 'EMP010', rfid: 'RFID-2024-010', event: 'Clock Out', location: 'Gate 3', status: 'Success', remarks: 'RFID scan'},
  {timestamp: '18-02-2026 18:15', name: 'Device Gateway 2', id: 'DEV-002', rfid: 'N/A', event: 'Device Offline', location: 'Gate 2', status: 'Failed', remarks: 'Power issue'},
];

let filteredLogs = [...allLogs];

// Initialize Page
window.onload = function(){
  updateSummaryCards();
  populateTable();
  initCharts();
  updateLiveFeed();
  setDateDefaults();
};

// Set date filter defaults
function setDateDefaults(){
  let today = new Date();
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 7);
  
  document.getElementById('fromDate').valueAsDate = yesterday;
  document.getElementById('toDate').valueAsDate = today;
}

// Update Summary Cards With Animation
function updateSummaryCards(){
  let totalLogsCount = allLogs.length;
  let scans = allLogs.filter(a => a.event.includes('Clock') || a.event.includes('Entry') || a.event.includes('Exit')).length;
  let failedLogins = allLogs.filter(a => a.event === 'Failed Login').length;
  let manualEdits = allLogs.filter(a => a.event === 'Manual Edit').length;
  let devicesOffline = allLogs.filter(a => a.event === 'Device Offline').length;
  
  animate('totalLogs', totalLogsCount);
  animate('totalScans', scans);
  animate('failedLogins', failedLogins);
  animate('manualEdits', manualEdits);
  animate('devicesOffline', devicesOffline);
}

// Animate Counter
function animate(id, end){
  let start = 0;
  let obj = document.getElementById(id);
  let increment = Math.ceil(end / 30);
  let timer = setInterval(()=>{
    start += increment;
    if(start >= end) start = end;
    obj.innerText = start;
    if(start >= end) clearInterval(timer);
  }, 20);
}

// Apply Filters
function applyFilters(){
  let fromDate = new Date(document.getElementById('fromDate').value);
  let toDate = new Date(document.getElementById('toDate').value);
  let userName = document.getElementById('searchUserName').value.toLowerCase();
  let userID = document.getElementById('searchUserID').value.toLowerCase();
  let rfid = document.getElementById('searchRFID').value.toLowerCase();
  let eventType = document.getElementById('eventType').value;
  let statusFilter = document.getElementById('status').value;
  
  filteredLogs = allLogs.filter(log =>{
    let logDate = new Date(log.timestamp.split(' ')[0].split('-').reverse().join('-'));
    let dateMatch = logDate >= fromDate && logDate <= toDate;
    let nameMatch = log.name.toLowerCase().includes(userName);
    let idMatch = log.id.toLowerCase().includes(userID);
    let rfidMatch = log.rfid.toLowerCase().includes(rfid);
    let eventMatch = !eventType || log.event === eventType;
    let statusMatch = !statusFilter || log.status === statusFilter;
    
    return dateMatch && nameMatch && idMatch && rfidMatch && eventMatch && statusMatch;
  });
  
  populateTable();
}

// Reset Filters
function resetFilters(){
  document.getElementById('searchUserName').value = '';
  document.getElementById('searchUserID').value = '';
  document.getElementById('searchRFID').value = '';
  document.getElementById('eventType').value = '';
  document.getElementById('status').value = '';
  setDateDefaults();
  filteredLogs = [...allLogs];
  populateTable();
}

// Populate Table
function populateTable(){
  let tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  
  if(filteredLogs.length === 0){
    document.getElementById('noData').style.display = 'block';
    document.getElementById('auditTable').style.display = 'none';
    return;
  }
  
  document.getElementById('noData').style.display = 'none';
  document.getElementById('auditTable').style.display = 'table';
  
  filteredLogs.forEach((log, idx) =>{
    let statusClass = log.status === 'Success' ? 'success' : (log.status === 'Failed' ? 'error-status' : 'warning');
    let row = `
      <tr>
        <td>${log.timestamp}</td>
        <td>${log.name}</td>
        <td>${log.id}</td>
        <td>${log.rfid}</td>
        <td>${log.event}</td>
        <td>${log.location}</td>
        <td><span class="status ${statusClass}">${log.status}</span></td>
        <td>${log.remarks}</td>
        <td><button class="action-btn" onclick="showDetails(${allLogs.indexOf(log)})">View</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Show Details Modal
function showDetails(idx){
  let log = allLogs[idx];
  let modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <div class="detail-item">
      <div class="detail-label">Timestamp</div>
      <div class="detail-value">${log.timestamp}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">User Name</div>
      <div class="detail-value">${log.name}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">User ID</div>
      <div class="detail-value">${log.id}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">RFID Tag</div>
      <div class="detail-value">${log.rfid}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Event Type</div>
      <div class="detail-value">${log.event}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Location</div>
      <div class="detail-value">${log.location}</div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Status</div>
      <div class="detail-value"><span class="status ${log.status === 'Success' ? 'success' : 'error-status'}">${log.status}</span></div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Remarks</div>
      <div class="detail-value">${log.remarks}</div>
    </div>
  `;
  
  document.getElementById('detailModal').style.display = 'block';
}

function closeModal(){
  document.getElementById('detailModal').style.display = 'none';
}

// Update Live Feed
function updateLiveFeed(){
  let feed = document.getElementById('liveFeed');
  let recent = filteredLogs.slice(-5).reverse();
  
  feed.innerHTML = '';
  recent.forEach(log => {
    let feedHTML = `
      <div class="feed-item">
        <strong>${log.name}</strong> - ${log.event} at ${log.location}
        <div class="feed-time">${log.timestamp}</div>
      </div>
    `;
    feed.innerHTML += feedHTML;
  });
  
  if(recent.length === 0){
    feed.innerHTML = '<div class="feed-item">No recent activities</div>';
  }
}

// Initialize Charts
function initCharts(){
  // Attendance Trend Chart
  new Chart(document.getElementById('attendanceChart'), {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
      datasets: [{
        label: 'Clock Ins',
        data: [12, 15, 14, 16, 13, 8],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {legend: {display: false}}
    }
  });
  
  // Failed Login Chart
  new Chart(document.getElementById('failureChart'), {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
      datasets: [{
        label: 'Failed Attempts',
        data: [2, 1, 3, 1, 2, 2],
        backgroundColor: '#ef4444'
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {legend: {display: false}}
    }
  });
  
  // Device Status Chart
  new Chart(document.getElementById('deviceChart'), {
    type: 'doughnut',
    data: {
      labels: ['Online', 'Offline', 'Error'],
      datasets: [{
        data: [8, 1, 1],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Export CSV
function exportCSV(){
  let csv = 'Timestamp,User Name,User ID,RFID Tag ID,Event Type,Location,Status,Remarks\n';
  filteredLogs.forEach(log => {
    csv += `"${log.timestamp}","${log.name}","${log.id}","${log.rfid}","${log.event}","${log.location}","${log.status}","${log.remarks}"\n`;
  });
  
  let blob = new Blob([csv], {type: 'text/csv'});
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'audit_logs_' + new Date().getTime() + '.csv';
  a.click();
}

// Export Excel (using CSV for simplicity, can be enhanced)
function exportExcel(){
  exportCSV();
}

// Clear Old Logs
function clearOldLogs(){
  if(confirm('Are you sure you want to delete logs older than 30 days?\nThis action cannot be undone.')){
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let initialCount = allLogs.length;
    allLogs = allLogs.filter(log => {
      let logDate = new Date(log.timestamp.split(' ')[0].split('-').reverse().join('-'));
      return logDate >= thirtyDaysAgo;
    });
    
    let deletedCount = initialCount - allLogs.length;
    alert(`Deleted ${deletedCount} old log entries.`);
    
    updateSummaryCards();
    resetFilters();
    applyFilters();
  }
}

// Toggle Theme
function toggleTheme(){
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Load Theme Preference
if(localStorage.getItem('theme') === 'dark'){
  document.body.classList.add('dark');
}

// Auto-refresh live feed every 5 seconds
setInterval(updateLiveFeed, 5000);

// Close modal when clicking outside
window.onclick = function(event){
  let modal = document.getElementById('detailModal');
  if(event.target == modal){
    modal.style.display = 'none';
  }
};

// Theme toggle
function toggleTheme(){
  document.body.classList.toggle('dark');
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function(){
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = '☀️';
  }
});
