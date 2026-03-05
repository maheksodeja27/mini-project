let savedName = "";
let savedRFID = "";

// calendar state and events storage
let calMonth = null;
let calYear = null;
let calendarEvents = {}; // key format: 'YYYY-M-D' -> note text

// Sample attendance datasets (1 = present, 0 = absent)
const weeklyLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const weeklyData = [1,1,1,1,1,0,0];

// Generate a deterministic monthly pattern (30 days)
const monthlyLabels = Array.from({length:30}, (_,i)=> String(i+1));
const monthlyData = Array.from({length:30}, (_,i)=> ((i%7===5)||(i%7===6))?0:1 );

let weeklyChartObj = null;
let monthlyChartObj = null;
let overviewChartObj = null;
let audioCtx = null;

function burstConfetti(){
    const colors = ['#f87171','#34d399','#60a5fa','#fde047','#f472b6'];
    for(let i=0;i<40;i++){
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = `${Math.random()*100}%`;
        c.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        document.body.appendChild(c);
        setTimeout(()=> c.remove(),2200);
    }
}

function playClick(){
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type='triangle';
    o.frequency.setValueAtTime(400, audioCtx.currentTime);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    o.start();
    o.stop(audioCtx.currentTime+0.1);
}

function initParticles(){
    const canvas = document.getElementById('meshCanvas');
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z = 400;
    // particles
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count*3);
    for(let i=0;i<count*3;i++) positions[i]=(Math.random()-0.5)*1000;
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const material = new THREE.PointsMaterial({color:0xffffff,size:2,transparent:true,opacity:0.6});
    const points = new THREE.Points(geometry,material);
    scene.add(points);
    // add a rotating cube in center
    const cubeGeom = new THREE.BoxGeometry(100,100,100);
    const cubeMat = new THREE.MeshBasicMaterial({color:0x60a5fa,wireframe:true,opacity:0.4,transparent:true});
    const cube = new THREE.Mesh(cubeGeom,cubeMat);
    scene.add(cube);
    function animate(){
        requestAnimationFrame(animate);
        points.rotation.x += 0.0005;
        points.rotation.y += 0.0005;
        cube.rotation.x += 0.002;
        cube.rotation.y += 0.003;
        renderer.render(scene,camera);
    }
    window.addEventListener('resize',()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    });
    animate();
}

function showWeekly(){
    if(!savedName){ showAlert('Please submit your details first.','error'); return; }
    playClick();
    showAlert('Displaying weekly report','success');
    // show weekly and overview only
    document.getElementById('weeklyCard').style.display='';
    document.getElementById('weeklyCard').classList.add('visible','full');
    document.getElementById('monthlyCard').style.display='none';
    document.getElementById('monthlyCard').classList.remove('visible','full');
    document.getElementById('overviewCard').style.display='';
    document.getElementById('overviewCard').classList.add('visible');
    document.getElementById('weeklyBtn').classList.add('active');
    document.getElementById('monthlyBtn').classList.remove('active');
    if(!weeklyChartObj) createWeeklyChart();
    if(!overviewChartObj) createOverviewChart();
}

function showMonthly(){
    if(!savedName){ showAlert('Please submit your details first.','error'); return; }
    playClick();
    showAlert('Displaying monthly report','success');
    document.getElementById('weeklyCard').style.display='none';
    document.getElementById('weeklyCard').classList.remove('visible','full');
    document.getElementById('monthlyCard').style.display='';
    document.getElementById('monthlyCard').classList.add('visible','full');
    document.getElementById('overviewCard').style.display='';
    document.getElementById('overviewCard').classList.add('visible');
    document.getElementById('monthlyBtn').classList.add('active');
    document.getElementById('weeklyBtn').classList.remove('active');
    if(!monthlyChartObj) createMonthlyChart();
    if(!overviewChartObj) createOverviewChart();
}


function saveUser() {
    const name = document.getElementById('username').value.trim();
    const rfid = document.getElementById('rfid').value.trim();
    if(!name || !rfid){ alert('Please fill all details.'); return; }
    savedName = name; savedRFID = rfid;
    localStorage.setItem('savedName', savedName);
    localStorage.setItem('savedRFID', savedRFID);
    const box = document.getElementById('resultBox');
    box.innerHTML = `Welcome, <strong>${savedName}</strong> — RFID: ${savedRFID}`;
    box.animate([{transform:'translateY(-6px)',opacity:0.6},{transform:'translateY(0)',opacity:1}],{duration:420,easing:'ease-out'});
    updateSummary();
    // ensure charts are created/updated after saving
    if(!weeklyChartObj) createWeeklyChart();
    if(!monthlyChartObj) createMonthlyChart();
    burstConfetti();
}

function loadFromStorage(){
    const name = localStorage.getItem('savedName');
    const rfid = localStorage.getItem('savedRFID');
    if(name && rfid){
        savedName = name;
        savedRFID = rfid;
        document.getElementById('username').value = name;
        document.getElementById('rfid').value = rfid;
        updateSummary();
    }
}

function resetDashboard(){
    savedName = '';
    savedRFID = '';
    localStorage.removeItem('savedName');
    localStorage.removeItem('savedRFID');
    document.getElementById('username').value = '';
    document.getElementById('rfid').value = '';
    document.getElementById('resultBox').innerHTML = 'Attendance details will appear here.';
    // keep charts alive but clear overview data if necessary
    if(overviewChartObj){ overviewChartObj.destroy(); overviewChartObj=null; document.getElementById('overviewCard').style.display='none'; }
}

function applyThemeToCharts(){
    const isDark = document.body.classList.contains('dark');
    // weekly bar colors
    if(weeklyChartObj){
        const green = isDark ? 'rgba(74,222,128,0.9)' : 'rgba(34,197,94,0.9)';
        const red = isDark ? 'rgba(248,113,113,0.9)' : 'rgba(239,68,68,0.9)';
        weeklyChartObj.data.datasets[0].backgroundColor = weeklyData.map(v=> v?green:red);
        weeklyChartObj.options.scales.x.ticks.color = isDark ? '#f1f5f9' : '#0f172a';
        weeklyChartObj.options.scales.y.ticks.color = isDark ? '#f1f5f9' : '#0f172a';
        weeklyChartObj.update();
    }
    if(monthlyChartObj){
        const textColor = isDark ? '#f1f5f9' : '#0f172a';
        monthlyChartObj.options.scales.y.ticks.color = textColor;
        monthlyChartObj.options.scales.x.ticks.color = textColor;
        monthlyChartObj.update();
    }
    if(overviewChartObj){
        overviewChartObj.options.plugins.legend.labels.color = isDark ? '#f1f5f9' : '#0f172a';
        overviewChartObj.update();
    }
}

function toggleTheme(){
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark':'light');
    applyThemeToCharts();
}

function downloadReport(){
    if(!savedName){ showAlert('Submit your details to generate a report.','error'); return; }
    let csv = 'Date,Type,Value\n';
    // weekly data (mon-sun)
    weeklyLabels.forEach((lab,i)=>{ csv += `${lab},weekly,${weeklyData[i]}\n`; });
    // monthly data
    monthlyLabels.forEach((lab,i)=>{ csv += `${lab},monthly,${monthlyData[i]}\n`; });
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${savedName.replace(/\s+/g,'_')}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Report downloaded','success');
}


function updateSummary(){
    if(!savedName) return;
    const weeklyPresent = weeklyData.reduce((a,b)=>a+b,0);
    const monthlyPresent = monthlyData.reduce((a,b)=>a+b,0);
    const now = new Date().toLocaleString();
    const weeklyPct = ((weeklyPresent/7)*100).toFixed(0);
    const monthlyPct = ((monthlyPresent/30)*100).toFixed(0);
    const box = document.getElementById('resultBox');
    box.innerHTML = `<div>Student: <strong>${savedName}</strong></div>
        <div>Weekly: ${weeklyPresent} present, ${7-weeklyPresent} absent (${weeklyPct}%)</div>
        <div class="progress-bar weekly"><div class="fill" style="width:${weeklyPct}%"></div></div>
        <div>Monthly: ${monthlyPresent} present, ${30-monthlyPresent} absent (${monthlyPct}%)</div>
        <div class="progress-bar monthly"><div class="fill" style="width:${monthlyPct}%"></div></div>
        <div style="margin-top:4px;font-size:12px;color:#6b7280;">Updated: ${now}</div>`;
    if(weeklyPct < 50) showAlert('Weekly attendance below 50%!','error');
    if(monthlyPct < 50) showAlert('Monthly attendance below 50%!','error');
}

function createOverviewChart(){
    if(overviewChartObj) return;
    const ctx = document.getElementById('overviewChart').getContext('2d');
    const total = monthlyData.length;
    const present = monthlyData.reduce((a,b)=>a+b,0);
    const absent = total - present;
    overviewChartObj = new Chart(ctx,{
        type:'doughnut',
        data:{labels:['Present','Absent'],datasets:[{data:[present,absent],backgroundColor:['#34d399','#f87171'],hoverOffset:8}]},
        options:{animation:{animateScale:true},plugins:{legend:{position:'bottom'}}}
    });
}


function createWeeklyChart(){
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0,0,0,200);
    gradient.addColorStop(0,'rgba(34,197,94,0.9)');
    gradient.addColorStop(1,'rgba(34,197,94,0.3)');
    weeklyChartObj = new Chart(ctx,{
        type:'bar',
        data:{labels:weeklyLabels,datasets:[{label:'Present',data:weeklyData,backgroundColor:weeklyData.map(v=> v?gradient:'rgba(239,68,68,0.9)'),borderRadius:6,hoverBackgroundColor:'rgba(34,197,94,1)'}]},
        options:{animation:{duration:1200,easing:'easeOutBounce'},plugins:{legend:{display:false},tooltip:{callbacks:{label(ctx){let val=ctx.raw;return val? 'Present':'Absent';}}}},onClick(e,items){ if(items.length){ const i=items[0].index; showAlert(`Weekly ${weeklyLabels[i]}: ${weeklyData[i]?'Present':'Absent'}`); } },scales:{y:{beginAtZero:true,max:1.2,ticks:{stepSize:1}}}}
    });
}


function createMonthlyChart(){
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const grad = ctx.createLinearGradient(0,0,0,200);
    grad.addColorStop(0,'rgba(59,130,246,0.5)');
    grad.addColorStop(1,'rgba(59,130,246,0.05)');
    monthlyChartObj = new Chart(ctx,{
        type:'line',
        data:{labels:monthlyLabels,datasets:[{label:'Attendance',data:monthlyData,fill:true,backgroundColor:grad,borderColor:'rgba(59,130,246,0.95)',tension:0.3,pointRadius:4,pointHoverRadius:6}]},
        options:{animation:{duration:1500,easing:'easeInOutQuart'},plugins:{legend:{display:false},tooltip:{callbacks:{label(ctx){const val=ctx.raw;return val? 'Present':'Absent';}}}},onClick(e,items){ if(items.length){ const i=items[0].index; showAlert(`Monthly day ${monthlyLabels[i]}: ${monthlyData[i]?'Present':'Absent'}`); } },scales:{y:{beginAtZero:true,max:1.2,ticks:{stepSize:1}}}}
    });
}

function createRipple(e){
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter/2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    const existing = btn.getElementsByClassName('ripple')[0];
    if(existing) existing.remove();
    btn.appendChild(circle);
}

document.addEventListener('DOMContentLoaded',()=>{
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', (e)=>{ saveUser();
        // click animation
        saveBtn.classList.add('clicked');
        setTimeout(()=> saveBtn.classList.remove('clicked'),400);
    });
    document.getElementById('resetBtn').addEventListener('click', resetDashboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadReport);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    const weeklyBtn = document.getElementById('weeklyBtn');
    const monthlyBtn = document.getElementById('monthlyBtn');
    weeklyBtn.addEventListener('click', showWeekly);
    monthlyBtn.addEventListener('click', showMonthly);
    [weeklyBtn, monthlyBtn].forEach(b=> b.addEventListener('click', createRipple));

    // restore theme if previously set
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
    // add ripple and sound effect to most action buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', createRipple);
        btn.addEventListener('click', playClick);
    });
    // restore any previously entered user
    loadFromStorage();
    // Initialize charts placeholders immediately (hidden initially)
    createWeeklyChart();
    createMonthlyChart();
    applyThemeToCharts();

    // add 3d tilt on cards
    document.querySelectorAll('.card').forEach(card=>{
        card.addEventListener('mousemove', e=>{
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width/2;
            const cy = rect.height/2;
            const dx = (x-cx)/cx;
            const dy = (y-cy)/cy;
            const tiltX = dy * 8;
            const tiltY = dx * 8;
            card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });
    });

    initParticles();
    loadCalendarEvents();
    initCalendarControls();
    // show current month initially
    const now = new Date();
    showCalendar(now.getMonth(), now.getFullYear());
    loadNotes();
});

/* helpers */
function showAlert(msg,type='success'){
    const box = document.getElementById('alertBox');
    box.textContent = msg;
    box.className = type;
    box.style.display = 'block';
    setTimeout(()=> box.style.display='none',3000);
}

// load saved calendar events from localStorage
function loadCalendarEvents(){
    try{
        calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')||'{}');
    }catch(e){ calendarEvents = {}; }
}
function saveCalendarEvents(){
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
}

function monthName(m){
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][m];
}

function showCalendar(month, year){
    calMonth = month;
    calYear = year;
    const cal = document.getElementById('calendar');
    const header = document.getElementById('monthYear');
    if(!cal || !header) return;
    header.textContent = `${monthName(month)} ${year}`;
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    const first = new Date(year,month,1).getDay();
    const days = new Date(year,month+1,0).getDate();
    let html='<table><tr>';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=> html+=`<th>${d}</th>`);
    html+='</tr><tr>';
    for(let i=0;i<first;i++) html+='<td></td>';
    for(let d=1;d<=days;d++){
        const key = `${year}-${month}-${d}`;
        const hasEvent = !!calendarEvents[key];
        const isToday = d===todayDay && month===todayMonth && year===todayYear;
        const dt = new Date(year,month,d);
        const weekend = dt.getDay()===0 || dt.getDay()===6;
        let cls = '';
        if(isToday) cls+=' today';
        if(hasEvent) cls+=' event';
        if(weekend) cls+=' weekend';
        html+=`<td class="${cls.trim()}">${d}</td>`;
        if((first+d)%7===0) html+='</tr><tr>';
    }
    html+='</tr></table>';
    cal.innerHTML = html;
    cal.querySelectorAll('td').forEach(td=>{
        td.addEventListener('click',()=>{
            const txt = td.textContent.trim();
            if(txt==='') return;
            cal.querySelectorAll('td').forEach(x=>x.classList.remove('selected'));
            td.classList.add('selected');
            const day = parseInt(txt,10);
            const key = `${calYear}-${calMonth}-${day}`;
            const existing = calendarEvents[key] || '';
            const note = prompt(`Note for ${day} ${monthName(calMonth)} ${calYear}:`, existing);
            if(note!==null){
                if(note.trim()){
                    calendarEvents[key]=note.trim();
                } else {
                    delete calendarEvents[key];
                }
                saveCalendarEvents();
                showCalendar(calMonth, calYear); // re-render to show dot
                showAlert(`Date ${day} selected` + (note.trim()?`: ${note.trim()}`:''),'success');
            }
        });
    });
}

function initCalendarControls(){
    const prev = document.getElementById('prevMonth');
    const next = document.getElementById('nextMonth');
    if(prev) prev.addEventListener('click',()=>{
        let m = calMonth -1;
        let y = calYear;
        if(m<0){ m=11; y--; }
        showCalendar(m,y);
    });
    if(next) next.addEventListener('click',()=>{
        let m = calMonth +1;
        let y = calYear;
        if(m>11){ m=0; y++; }
        showCalendar(m,y);
    });
}

function saveNotes(){
    const text = document.getElementById('notes').value;
    localStorage.setItem('dashboardNotes', text);
    showAlert('Notes saved','success');
}
function loadNotes(){
    const t = localStorage.getItem('dashboardNotes')||'';
    const area = document.getElementById('notes');
    if(area) area.value = t;
}

// auto save notes every few seconds
setInterval(saveNotes, 5000);

