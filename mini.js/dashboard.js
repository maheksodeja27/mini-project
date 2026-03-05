// Charts
new Chart(document.getElementById('attendanceChart'), {
  type: 'doughnut',
  data: {
    labels: ['Present','Absent'],
    datasets: [{
      data: [95,25],
      backgroundColor: ['#22c55e','#ef4444']
    }]
  }
});

new Chart(document.getElementById('weeklyChart'), {
  type: 'line',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri'],
    datasets: [{
      label: 'Attendance %',
      data: [85,90,88,92,95],
      borderColor: '#38bdf8',
      tension: 0.4
    }]
  }
});

// Search
document.getElementById('searchInput').addEventListener('keyup', function(){
  const value = this.value.toLowerCase();
  document.querySelectorAll('#attendanceTable tr').forEach((row,i)=>{
    if(i===0) return;
    row.style.display = row.cells[0].textContent.toLowerCase().includes(value) ? '' : 'none';
  });
});

function clearSearch(){
  document.getElementById('searchInput').value='';
  document.querySelectorAll('#attendanceTable tr').forEach(row=>row.style.display='');
}

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
