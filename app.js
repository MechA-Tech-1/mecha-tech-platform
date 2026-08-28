const A={q:s=>document.querySelector(s),html:s=>{document.querySelector('#app').innerHTML=s},esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),get:async(action,p={})=>{let u=new URL(API_URL);u.searchParams.set('action',action);Object.entries(p).forEach(([k,v])=>u.searchParams.set(k,typeof v==='object'?JSON.stringify(v):v));let r=await fetch(u);return r.json()},post:async(action,p={})=>{let r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...p})});return r.json()},toast:m=>{let d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),3500)},token:()=>localStorage.getItem('mt_token')};
const nav=()=>{let u=null;try{u=JSON.parse(localStorage.getItem('mt_user')||'null')}catch(e){};let active=window.MT_ACTIVE||'home';let b=(label,key,fn,cls='ghost')=>`<button class="btn ${cls} ${active===key?'navActive':''}" onclick="${fn}">${label}</button>`;let account=u?`<div class="accountChip" title="${A.esc(u.email||'')}"><span class="accountName">${A.esc(u.fullName||u.email||'Member')}</span>${u.adminLevel&&u.adminLevel!=='MEMBER'?`<span class="accountRole">${A.esc(u.adminLevel)}</span>`:''}</div>`:'';let isLoggedIn=!!u&&!!A.token();let isMember=isLoggedIn&&(!u.adminLevel||u.adminLevel==='MEMBER');let publicLinks=`${b('Home','home','home()')}${b('About','about','about()')}${b('Who We Are','who','who()')}`;let guestLinks=isLoggedIn?'':`${b('Apply','apply','apply()')}${b('Application Status','status','statusPage()')}`;let portal=isLoggedIn?(u.adminLevel&&u.adminLevel!=='MEMBER'?`${b('Admin Dashboard','admin','adminDash()','primary')}${b('Activity Tracking','activity','adminActivity()')}`:`${b('Member Portal','member','memberDash()','primary')}${b('Team Activity','activity','activityPage()')}`):b('Member Login','login','login()','primary');return `<div class="nav"><div class="navin"><div class="brand" onclick="home()" style="cursor:pointer"><img src="logo.jpg"><b>MECHA-<span>TECH</span></b></div><div class="links">${publicLinks}${isMember?'':guestLinks}${portal}</div>${account}</div></div>`};
const foot=()=>`<div class="footer"><div class="wrap"><b>MECHA-TECH ROBOTICS</b><br><br>For more information or inquiries: 01016771230 · 01159650095</div></div>`;
function page(key){window.MT_ACTIVE=key} function shell(content){A.html(nav()+`<main class="wrap">${content}</main>`+foot())}
function home(){
  page('home');
  let u=null;try{u=JSON.parse(localStorage.getItem('mt_user')||'null')}catch(e){}
  if(u){
    let isAdmin=u.adminLevel&&u.adminLevel!=='MEMBER';
    shell(`<section class="hero"><div><span class="pill">ROBOTICS TEAM</span><h1>MECHA-<span>TECH</span><br>ROBOTICS</h1><p>Welcome back, <b>${A.esc(u.fullName||u.email)}</b> 👋</p><div class="topActions"><button class="btn primary" onclick="${isAdmin?'adminDash()':'memberDash()'}">${isAdmin?'Admin Dashboard':'Member Portal'}</button><button class="btn" onclick="logout()">Logout</button></div></div><div class="heroCard"><img class="heroLogo" src="logo.jpg"><h3>Build. Test. Improve.</h3><p class="muted">Your MECHA-TECH workspace for meetings, tasks, schedules, and team activity.</p></div></section><section class="section"><h2 class="title">Your Upcoming Activity</h2><p class="subtitle">Your next meeting and the task with the closest deadline.</p><div id="homeMemberHighlights" class="grid"><div class="card"><p class="muted">Loading your upcoming activity...</p></div></div></section>`);
    if(!isAdmin)loadMemberHomeHighlights();
    else A.q('#homeMemberHighlights').innerHTML='<div class="card"><h3>👑 Admin Workspace</h3><p class="muted">Manage applicants, members, teams, tasks, events, and interview slots from the Admin Dashboard.</p><button class="btn primary" onclick="adminDash()">Open Admin Dashboard</button></div>';
    return;
  }
  shell(`<section class="hero"><div><span class="pill">ROBOTICS TEAM</span><h1>MECHA-<span>TECH</span><br>ROBOTICS</h1><p>Student engineers building practical robotic systems through innovation, teamwork, and hands-on development.</p><div class="topActions"><button class="btn primary" onclick="apply()">New Application</button><button class="btn" onclick="statusPage()">Application Status</button><button class="btn" onclick="login()">Member Login</button></div></div><div class="heroCard"><img class="heroLogo" src="logo.jpg"><h3>Build. Test. Improve.</h3><p class="muted">A unified platform for applications, interviews, teams, tasks, schedules, and results.</p></div></section><section class="section"><h2 class="title">Explore MECHA-TECH</h2><p class="subtitle">Everything is organized around the team and its members.</p><div class="grid"><div class="card"><h3>📝 New Application</h3><p class="muted">Join MECHA-TECH and tell us about your experience, motivation, and interests.</p><button class="btn primary" onclick="apply()">Apply Now</button></div><div class="card"><h3>🔎 Application Status</h3><p class="muted">Use your email and phone to track review, interview, and final result.</p><button class="btn" onclick="statusPage()">Check Status</button></div><div class="card"><h3>👥 Member Portal</h3><p class="muted">Members can access their team tasks, submissions, meetings, and schedules.</p><button class="btn" onclick="login()">Login</button></div></div></section>`);
}
async function loadMemberHomeHighlights(){
  const box=A.q('#homeMemberHighlights');if(!box)return;
  try{
    const r=await A.post('member',{token:A.token()});
    if(!r.ok){box.innerHTML='<div class="card"><p class="muted">Could not load your upcoming activity.</p></div>';return;}
    const now=Date.now();
    const events=(r.data.events||[]).filter(x=>x.DateTimeISO&&new Date(x.DateTimeISO).getTime()>now).sort((a,b)=>new Date(a.DateTimeISO)-new Date(b.DateTimeISO));
    const tasks=(r.data.tasks||[]).filter(x=>{
      const t=new Date(x.DeadlineISO).getTime();
      return Number.isFinite(t)&&t>now&&String(x.Status||'').toLowerCase()!=='completed';
    }).sort((a,b)=>new Date(a.DeadlineISO)-new Date(b.DeadlineISO));
    const cards=[];
    if(events[0]){
      const x=events[0],dt=new Date(x.DateTimeISO);
      cards.push(`<div class="card"><span class="pill">NEXT MEETING</span><h3>📅 ${A.esc(x.Title||'Team Meeting')}</h3><p><b>${A.esc(dt.toLocaleString('en-US',{timeZone:'Africa/Cairo',weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}))}</b></p><p class="muted">${A.esc(x.Location||'')}</p>${x.MeetingLink?`<a class="btn primary" href="${A.esc(x.MeetingLink)}" target="_blank">Join Meeting</a>`:''}<div class="count" id="homeMeetingCount"></div></div>`);
    }
    if(tasks[0]){
      const x=tasks[0],dt=new Date(x.DeadlineISO);
      cards.push(`<div class="card"><span class="pill">NEXT TASK DEADLINE</span><h3>📝 ${A.esc(x.Title||'Task')}</h3><p><b>Deadline:</b> ${A.esc(dt.toLocaleString('en-US',{timeZone:'Africa/Cairo',weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}))}</p><p class="muted">${A.esc(x.Description||'')}</p><button class="btn primary" onclick="memberDash()">Open Task</button><div class="count" id="homeTaskCount"></div></div>`);
    }
    if(!cards.length){
      box.innerHTML=`<div class="card"><h3>✨ All clear</h3><p class="muted">There are no upcoming meetings or pending tasks at the moment.</p><button class="btn primary" onclick="memberDash()">Open Member Portal</button></div>`;
    }else{
      box.innerHTML=cards.join('');
    }
    if(events[0])countdown(new Date(events[0].DateTimeISO),1,'homeMeetingCount');
    if(tasks[0])countdown(new Date(tasks[0].DeadlineISO),1,'homeTaskCount');
  }catch(e){
    box.innerHTML='<div class="card"><p class="muted">Could not load your upcoming activity.</p></div>';
  }
}
function about(){page('about');shell(`<section class="section"><h1 class="title">About the Team</h1><p class="subtitle">A student-driven robotics team built around engineering, teamwork, and innovation.</p><div class="card"><p style="line-height:1.9">MECHA-TECH brings together students passionate about mechanical design, electronics, embedded systems, and robotics.</p><p style="line-height:1.9">Our team focuses on transforming engineering ideas into practical robotic solutions through teamwork, innovation, and hands-on development.</p></div></section>`)}
function who(){page('who');shell(`<section class="section"><h1 class="title">Who We Are</h1><p class="subtitle">The values behind MECHA-TECH.</p><div class="grid"><div class="card"><h3>💡 Innovative</h3><p>We turn ideas into practical solutions.</p></div><div class="card"><h3>🤝 Collaborative</h3><p>We believe strong teamwork creates better engineering.</p></div><div class="card"><h3>🛠 Hands-on</h3><p>We design, build, test, and improve our systems ourselves.</p></div><div class="card"><h3>🎯 Impact-driven</h3><p>We use robotics to address real-world challenges.</p></div></div><div class="card" style="margin-top:18px"><h2>Our Mission</h2><p>To develop reliable robotic systems that combine engineering innovation with real-world impact.</p></div></section>`)}
const techFields=['Mechanical','Hardware','Software','WEP','APP'], nonFields=['Media & Design','Marketing','PR','Sponsorship','HR & Management'], tools=['C / C++','Python','Java','HTML / CSS / JavaScript','MATLAB','Git / GitHub','Arduino','ESP32','Raspberry Pi','ROS / ROS 2','Sensors & Actuators','Basic Electronics / Circuit Design','SolidWorks','AutoCAD','Fusion 360','3D Printing','CNC / Manufacturing','Other'], nonTools=['Canva','Photoshop','Illustrator','Premiere Pro','After Effects','Microsoft Excel','Microsoft PowerPoint','Social Media Management','Google Workspace','Other'];
const choices=(name,arr,type='checkbox')=>`<div class="choices">${arr.map((x,i)=>`<label class="choice"><input type="${type}" name="${name}" value="${A.esc(x)}"> ${A.esc(x)}</label>`).join('')}</div>`;
function apply(){page('apply');shell(`<section class="section"><div class="form"><h1 class="title">New Application</h1><p class="subtitle">Join MECHA-TECH — all fields marked with * are required.</p><form id="appForm" onsubmit="submitApp(event)"><div class="card"><h2>SECTION 1 — Personal Information</h2>${f('Full Name','fullName','text','Name (up to fourth name)',true)}${f('Current academic year','academicYear','select','',true,['1st Year','2nd Year','3rd Year','4th Year','5th Year','Graduate / Other'])}${f('College / University','university','text','',true)}${f('Email address','email','email','',true)}${f('WhatsApp / Phone Number','phone','text','11 digits',true)}${f('Do you have a CV?','hasCV','select','',true,['Yes','No'])}<div id="cvBox" class="hidden">${f('Upload your CV','cv','file','PDF only')}</div></div><div class="card"><h2>SECTION 2 — Motivation & Experience</h2>${f('Why do you want to join MECHA-TECH?','motivation','textarea','',true)}${f('Previous experiences, projects, courses, or activities','experience','textarea','If none, write None',true)}</div><div class="card"><h2>SECTION 3 — Team Selection</h2>${f('Which type of role are you interested in?','roleType','select','',true,['Technical','Non-Technical','Both Technical & Non-Technical'])}<div id="techSec" class="hidden"><h3>Technical</h3><label>Technical field(s)</label>${choices('technicalFields',techFields)}${f('Current technical level','technicalLevel','select','',true,['Level 0 — Beginner','Level 1 — Basic','Level 2 — Intermediate','Level 3 — Advanced'])}<label>Tools, technologies, or programming languages</label>${choices('tools',tools)}${f('One technical project','technicalProject','textarea','',true)}${f('Anything you built/worked on that you are proud of?','proudProject','textarea','Optional')}</div><div id="nonSec" class="hidden"><h3>Non-Technical</h3><label>Non-technical field(s)</label>${choices('nonTechnicalFields',nonFields)}${f('Experience in selected field(s)','nonTechnicalExperience','textarea','',true)}<label>Tools or platforms</label>${choices('nonTechnicalTools',nonTools)}${f('Project, event, campaign, design, or activity','nonTechnicalProject','textarea','',true)}${f('Portfolio / work link','portfolio','url','Optional')}</div></div><div class="card"><h2>SECTION 4 — Commitment</h2>${f('Weekly commitment','weeklyCommitment','select','',true,['Less than 3 hours','3–5 hours','5–8 hours','8–12 hours','More than 12 hours'])}${f('Regular meetings and activities','meetingAvailability','select','',true,['Yes, regularly','Usually, but I may have occasional conflicts','My availability is limited'])}${f('How do you handle a task you do not know?','unknownTaskApproach','select','',true,['I research and try to solve it myself first','I ask someone immediately','I try first, then ask for help if I am stuck','I am not sure'])}${f('Comfortable under deadlines and competition pressure?','deadlinePressure','select','',true,['Yes','Sometimes','Not really'])}</div><div class="card"><h2>SECTION 5 — Financial / Team Support</h2>${f('Paid technical courses or training contribution','paidCourses','select','',true,['Yes','Maybe, depending on the cost','No'])}${f('Materials or component contribution','materialsContribution','select','',true,['Yes','Maybe, depending on the cost','No'])}</div><div class="card"><h2>SECTION 6 — Interview Scheduling</h2>
<p class="mini">Choose one available interview slot. Interviews are 60 minutes. Slots are shown only when they are available and in the future.</p>
${f('Interview Day','interviewDate','select','',true)}
${f('Interview Time','interviewTime','select','',true)}
<input type="hidden" id="interviewSlotId">
<div id="slotMessage" class="mini"></div>
</div><div class="card"><h2>SECTION 7 — Final</h2>${f('Anything else you would like us to know?','anythingElse','textarea','Optional')}<p class="muted">For more information or inquiries: <b>01016771230</b> · <b>01159650095</b></p><button class="btn primary" type="submit">Submit Application</button></div></form></div></section>`);A.q('#hasCV').onchange=e=>A.q('#cvBox').classList.toggle('hidden',e.target.value!=='Yes');const syncRoleSections=()=>{
  const role=A.q('#roleType')?.value||'';
  const tech=A.q('#techSec'), non=A.q('#nonSec');
  if(!tech||!non)return;
  const showTech=role==='Technical'||role==='Both Technical & Non-Technical';
  const showNon=role==='Non-Technical'||role==='Both Technical & Non-Technical';
  tech.classList.toggle('hidden',!showTech); non.classList.toggle('hidden',!showNon);
  [tech,non].forEach(sec=>sec.querySelectorAll('[required]').forEach(el=>el.required=false));
  if(showTech){['technicalLevel','technicalProject'].forEach(id=>{let el=A.q('#'+id);if(el)el.required=true;});}
  if(showNon){['nonTechnicalExperience','nonTechnicalProject'].forEach(id=>{let el=A.q('#'+id);if(el)el.required=true;});}
};
A.q('#roleType').onchange=syncRoleSections;syncRoleSections();bindValidation();loadInterviewSlots();}
function f(label,name,type='text',ph='',req=false,opts=[]){
  if(type==='select')return `<div class="field"><label>${label}${req?' *':''}</label><select class="select" id="${name}" ${req?'required':''}><option value="">Select...</option>${opts.map(x=>`<option>${A.esc(x)}</option>`).join('')}</select><small id="${name}Error" class="fieldError"></small></div>`;
  let inputType=type==='textarea'?'':type;
  let attrs=type==='file'?'accept="application/pdf"':(name==='phone'?'inputmode="numeric" autocomplete="tel" maxlength="11"':name==='email'?'autocomplete="email" autocapitalize="none" spellcheck="false"':name==='fullName'?'autocomplete="name" autocapitalize="words" spellcheck="false" maxlength="80"':'');
  return `<div class="field"><label>${label}${req?' *':''}</label><${type==='textarea'?'textarea':'input'} class="${type==='textarea'?'textarea':'input'}" id="${name}" type="${inputType}" ${attrs} placeholder="${A.esc(ph)}" ${req?'required':''}></${type==='textarea'?'textarea':'input'}><small id="${name}Error" class="fieldError"></small></div>`;
}
function setFieldError(id,msg){let e=A.q('#'+id+'Error');if(e)e.textContent=msg||'';let el=A.q('#'+id);if(el)el.classList.toggle('invalid',!!msg)}
function validatePhone(id='phone'){
  const el=A.q('#'+id); if(!el)return true;
  const v=el.value;
  if(!/^\d*$/.test(v)){
    setFieldError(id,'Phone number must contain numbers only.');
    return false;
  }
  if(v.length>11){
    setFieldError(id,`You entered ${v.length} digits. You must enter exactly 11 digits.`);
    return false;
  }
  if(v.length>0 && !v.startsWith('01')){
    setFieldError(id,'Egyptian phone number must start with 01.');
    return false;
  }
  if(v.length!==11){
    setFieldError(id,`You entered ${v.length} digits. You must enter exactly 11 digits.`);
    return false;
  }
  setFieldError(id,''); return true;
}
function validateEmail(id){
  const el=A.q('#'+id); if(!el)return true;
  const v=el.value.trim();
  if(v!==v.toLowerCase()){
    setFieldError(id,'Email must use lowercase letters only.'); return false;
  }
  if(!/^[a-z0-9][a-z0-9._%+-]*@gmail\.com$/.test(v)){
    setFieldError(id,'Please enter a valid lowercase Gmail address ending with @gmail.com.'); return false;
  }
  setFieldError(id,''); return true;
}
function validateName(id='fullName'){
  const el=A.q('#'+id); if(!el)return true;
  const v=el.value;
  if(v.length===0){setFieldError(id,'Please enter your full name.');return false;}
  if(!/^[A-Za-z ]*$/.test(v)){
    setFieldError(id,'Name must contain English letters and spaces only.'); return false;
  }
  if(/\s{2,}/.test(v) || /^\s|\s$/.test(v)){
    setFieldError(id,'Use one space between each name and no spaces at the beginning or end.'); return false;
  }
  const words=v.split(' ').filter(Boolean);
  if(words.length!==4){
    setFieldError(id,`Please enter exactly 4 names. You entered ${words.length}.`); return false;
  }
  if(v.replace(/\s/g,'').length<10){
    setFieldError(id,'The four-name entry must contain at least 10 letters.'); return false;
  }
  setFieldError(id,''); return true;
}
function bindValidation(){
  const phoneIds=['phone','sPhone','emPhone','cmPhone'];
  phoneIds.forEach(id=>{let el=A.q('#'+id);if(el){
  el.addEventListener('input',()=>validatePhone(id));
  el.addEventListener('blur',()=>validatePhone(id));
}});
  ['email','sEmail','loginEmail','emEmail','cmEmail'].forEach(id=>{let el=A.q('#'+id);if(el){el.addEventListener('input',()=>{el.value=el.value.toLowerCase();validateEmail(id)});el.addEventListener('blur',()=>validateEmail(id));}});
  let n=A.q('#fullName');if(n){n.addEventListener('input',()=>validateName('fullName'));n.addEventListener('blur',()=>validateName('fullName'));}
}
function vals(name){return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(x=>x.value)}

function prettyInterviewDate_(s){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));
  if(!m)return String(s||'');
  const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `${days[d.getDay()]} — ${Number(m[3])} ${names[Number(m[2])-1]} ${m[1]}`;
}
function prettyInterviewTime_(s, iso){
  let raw=String(s||'').trim();
  if(/^1899-12-30T/.test(raw) && iso){
    const d=new Date(iso);
    if(!isNaN(d.getTime())){
      const p=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Cairo',hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(d);
      const g=k=>p.find(x=>x.type===k)?.value||'';
      return `${g('hour')}:${g('minute')} ${g('dayPeriod')}`;
    }
  }
  const m=/^(\d{1,2}):(\d{2})/.exec(raw);
  if(!m)return raw;
  let h=Number(m[1]),mm=m[2],ampm=h>=12?'PM':'AM',hh=h%12||12;
  return `${hh}:${mm} ${ampm}`;
}
async function loadInterviewSlots(){
  const d=A.q('#interviewDate'),t=A.q('#interviewTime'),id=A.q('#interviewSlotId'),msg=A.q('#slotMessage');
  if(!d||!t)return;
  d.innerHTML='<option value="">Loading available dates...</option>';t.innerHTML='<option value="">Select time...</option>';
  let r;
  try{r=await A.get('slots',{});}catch(e){msg.textContent='Could not load interview slots. Please try again.';return;}
  if(!r.ok){msg.textContent=r.error||'No interview slots available.';return;}
  const slots=r.data.slots||[];
  if(!slots.length){d.innerHTML='<option value="">No available interview slots</option>';t.innerHTML='<option value="">No times available</option>';msg.textContent='There are currently no available interview appointments. Please check again later.';return;}
  const dates=[...new Map(slots.map(s=>[s.Date,s])).keys()];
  d.innerHTML='<option value="">Select date...</option>'+dates.map(x=>`<option value="${A.esc(x)}">${A.esc(prettyInterviewDate_(x))}</option>`).join('');
  const render=()=>{
    const date=d.value;
    const ss=slots.filter(s=>s.Date===date);
    t.innerHTML='<option value="">Select time...</option>'+ss.map(s=>`<option value="${A.esc(s.SlotID)}">${A.esc(prettyInterviewTime_(s.Time))} — ${A.esc(String(s.Available))} spot(s) left</option>`).join('');
    id.value='';
    msg.textContent=date&&ss.length?`${ss.length} available time slot(s) on this day.`:'';
  };
  d.onchange=render;
  t.onchange=()=>{id.value=t.value;};
}
async function submitApp(e){
  e.preventDefault();
  let g=id=>A.q('#'+id)?.value||'';
  if(!validateName('fullName')||!validateEmail('email')||!validatePhone('phone')){
    A.toast('Please correct the highlighted fields before submitting.');return;
  }
  if(!g('interviewSlotId')){A.toast('Please choose an available interview date and time.');return;}
  const role=g('roleType');
  if((role==='Technical'||role==='Both Technical & Non-Technical') && !vals('technicalFields').length){A.toast('Please select at least one technical field.');return;}
  if((role==='Non-Technical'||role==='Both Technical & Non-Technical') && !vals('nonTechnicalFields').length){A.toast('Please select at least one non-technical field.');return;}
  let form=document.querySelector('#appForm');
  if(!form.checkValidity()){form.reportValidity();return;}
  let cv=null,file=A.q('#cv')?.files?.[0];
  if(g('hasCV')==='Yes'){
    if(!file||file.type!=='application/pdf')return A.toast('Please upload a PDF CV.');
    if(file.size>8*1024*1024)return A.toast('CV must be 8 MB or smaller.');
    cv={name:file.name,base64:await dataURL(file)}
  }
  let p={fullName:g('fullName'),academicYear:g('academicYear'),university:g('university'),email:g('email'),phone:g('phone'),hasCV:g('hasCV'),cv,motivation:g('motivation'),experience:g('experience'),roleType:g('roleType'),technicalFields:vals('technicalFields'),technicalLevel:g('technicalLevel'),tools:vals('tools'),technicalProject:g('technicalProject'),proudProject:g('proudProject'),nonTechnicalFields:vals('nonTechnicalFields'),nonTechnicalExperience:g('nonTechnicalExperience'),nonTechnicalTools:vals('nonTechnicalTools'),nonTechnicalProject:g('nonTechnicalProject'),portfolio:g('portfolio'),weeklyCommitment:g('weeklyCommitment'),meetingAvailability:g('meetingAvailability'),unknownTaskApproach:g('unknownTaskApproach'),deadlinePressure:g('deadlinePressure'),paidCourses:g('paidCourses'),materialsContribution:g('materialsContribution'),interviewSlotId:g('interviewSlotId'),anythingElse:g('anythingElse')};
  let btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Submitting...'}
  try{
    let r=await A.post('apply',p);
    if(!r.ok){A.toast(r.error||'Submission failed.');if(btn){btn.disabled=false;btn.textContent='Submit Application'}return;}
    shell(`<section class="section"><div class="card" style="max-width:700px;margin:auto;text-align:center"><h1>Application Submitted Successfully</h1><p>Thank you for applying to MECHA-TECH.</p><p>Your Application ID is <b>${A.esc(r.data.applicantId)}</b>.</p><div class="status"><b>Under Review</b><br><span class="muted">Interview: ${A.esc(prettyInterviewDate_(r.data.interview.Date))} at ${A.esc(prettyInterviewTime_(r.data.interview.Time,r.data.interview.DateTimeISO))}</span></div><div class="topActions" style="justify-content:center"><button class="btn primary" onclick="statusPage()">Check Application Status</button><button class="btn" onclick="home()">Back to Home</button></div></div></section>`);
  }catch(err){A.toast('Could not submit the application. Please try again.');if(btn){btn.disabled=false;btn.textContent='Submit Application'}}
}
function dataURL(file){return new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function statusPage(){page('status');shell(`<section class="section"><div class="form"><h1 class="title">Application Status</h1><p class="subtitle">Enter the same email and phone used in your application.</p><div class="card">${f('Email','sEmail','email','',true)}${f('Phone','sPhone','text','11 digits',true)}<button class="btn primary" onclick="checkStatus()">Check Status</button></div><div id="statusOut"></div></div></section>`);bindValidation();}
async function checkStatus(){
  let r;
  try{r=await A.get('status',{email:A.q('#sEmail').value.trim(),phone:A.q('#sPhone').value});}
  catch(e){return A.toast('Could not connect to the platform. Please try again.')}
  if(!r.ok)return A.toast(r.error);
  let d=r.data,i=d.interview,dt=i?new Date(i.DateTimeISO):null;
  const finalResult=d.result&&['Accepted','Rejected','Waitlisted'].includes(String(d.result.Status));
  let extra=d.additionalInfoRequired&&!d.additionalInfoSubmitted&&!finalResult?`<div class="status" style="margin-top:15px"><h3>Additional Information Required</h3><p>Please provide the requested information below.</p>${f('Age','aiAge','number','',true)}${f('Your phone number','aiNationalPhone','text','',false)}${f('Your national number','aiNationalNumber','text','',true)}${f('Your university code','aiUniversityCode','text','',true)}${f('National ID expiry date (MM/YYYY)','aiIDExpiry','text','5/2025',true)}${f('National ID number','aiNationalID','text','',true)}${f('Front view of the card URL','aiFrontID','url','Drive link',true)}${f('Back view of the card URL','aiBackID','url','Drive link',true)}${f('Formal Image URL','aiFormal','url','Drive link',true)}${f('Second emergency phone number','aiEmergencyPhone','text','',true)}${f('Emergency Contact Name (Arabic)','aiEmergencyName','text','',true)}<button class="btn primary" onclick="submitAdditionalInfo()">Submit Additional Information</button></div>`:'';
  let resultHtml=d.result?`<div class="status" style="margin-top:15px"><h3>Result: ${A.esc(d.result.Status)}</h3><p>${A.esc(d.result.Message||'')}</p></div>`:'';
  let interviewHtml=!finalResult&&i?`<div class="status"><h3>Interview Scheduled</h3><p>📅 ${A.esc(prettyInterviewDate_(String(i.Date).slice(0,10)))} · ⏰ ${A.esc(prettyInterviewTime_(i.Time,i.DateTimeISO))}</p>${i.InterviewLink?`<p><a class="btn primary" href="${A.esc(i.InterviewLink)}" target="_blank">Join Interview</a></p>`:''}<div id="count" class="count"></div></div>`:'';
  A.q('#statusOut').innerHTML=`<div class="card"><span class="pill">${A.esc(d.applicant.Status)}</span><h2>${A.esc(d.applicant.FullName)}</h2>${finalResult?resultHtml:interviewHtml}${extra}</div>`;
  if(!finalResult&&dt)countdown(dt,i.DurationMinutes||60);
}
async function submitAdditionalInfo(){
  let email=A.q('#sEmail').value.trim(),phone=A.q('#sPhone').value;
  let payload={email,phone,age:A.q('#aiAge')?.value,nationalPhone:A.q('#aiNationalPhone')?.value,nationalNumber:A.q('#aiNationalNumber')?.value,universityCode:A.q('#aiUniversityCode')?.value,idExpiry:A.q('#aiIDExpiry')?.value,nationalId:A.q('#aiNationalID')?.value,frontIdUrl:A.q('#aiFrontID')?.value,backIdUrl:A.q('#aiBackID')?.value,formalImageUrl:A.q('#aiFormal')?.value,emergencyPhone2:A.q('#aiEmergencyPhone')?.value,emergencyContactArabic:A.q('#aiEmergencyName')?.value};
  if(!/^\d{1,3}$/.test(String(payload.age||'')))return A.toast('Please enter a valid age.');
  if(!/^\d{1,2}\/\d{4}$/.test(String(payload.idExpiry||'')))return A.toast('Expiry date must be written like 5/2025.');
  let r=await A.post('submitAdditionalInfo',payload);if(!r.ok)return A.toast(r.error);A.toast('Additional information submitted.');checkStatus();
}
function countdown(dt,duration,targetId='count'){let end=new Date(dt.getTime()+duration*60000),el=A.q('#'+targetId);if(!el)return;let t=setInterval(()=>{let n=Date.now(),diff=dt-n;if(n>=end){clearInterval(t);el.innerHTML='<span class="ok">Thank you for the interview. Please wait for the result.</span>';return}if(diff<=0){el.innerHTML='<span class="ok">Activity is in progress</span>';return}let s=Math.floor(diff/1000),d=Math.floor(s/86400);s%=86400;let h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;el.textContent=`${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m : ${String(s).padStart(2,'0')}s`},1000)}
function login(){page('login');shell(`<section class="section"><div class="form"><h1 class="title">Member Login</h1><div class="card">${f('Email','loginEmail','email','',true)}${f('Password','loginPassword','password','',true)}<button class="btn primary" onclick="doLogin()">Login</button><p class="mini">Members use Email + Password only. Accounts are created by the Admin.</p></div></div></section>`);bindValidation();}
async function doLogin(){let r=await A.post('login',{email:A.q('#loginEmail').value,password:A.q('#loginPassword').value});if(!r.ok)return A.toast(r.error);localStorage.setItem('mt_token',r.data.session.token);localStorage.setItem('mt_user',JSON.stringify(r.data.user));r.data.user.adminLevel==='SUPER'||r.data.user.adminLevel==='TEAM_ADMIN'?adminDash():memberDash()}
async function memberDash(){page('member');let r=await A.post('member',{token:A.token()});if(!r.ok)return login();let d=r.data,next=d.events.find(x=>new Date(x.DateTimeISO)>new Date());shell(`<section class="section"><div class="topActions"><button class="btn" onclick="home()">Home</button><button class="btn primary" onclick="activityPage()">Team Activity</button><button class="btn" onclick="logout()">Logout</button></div><h1 class="title">Welcome, ${A.esc(d.user.fullName)}</h1><p class="subtitle">Team: <b>${A.esc(d.user.team)}</b></p>${next?`<div class="card"><span class="pill">NEXT EVENT</span><h3>${A.esc(next.Title)}</h3><div class="count" id="memberCount"></div><p>${A.esc(next.DateTimeISO)} · ${A.esc(next.Location||'')}</p></div>`:''}<div class="grid2"><div class="card"><h2>Tasks</h2>${d.tasks.length?`<table class="table"><tr><th>Task</th><th>Deadline</th><th>Status</th></tr>${d.tasks.map(t=>{let sub=d.submissions.find(x=>String(x.TaskID)===String(t.TaskID));return `<tr><td>${A.esc(t.Title)}<br><span class="mini">${A.esc(t.Description)}</span></td><td>${A.esc(t.DeadlineISO)}</td><td>${sub?`Submitted ${A.esc(sub.SubmittedAt)}`:'Not submitted'}<br><button class="btn" onclick="submitTaskUI('${t.TaskID}')">${sub?'Update Submission':'Submit'}</button></td></tr>`}).join('')}</table>`:'<p class="muted">No tasks assigned to you or your team yet.</p>'}</div><div class="card"><h2>Schedule</h2>${d.events.length?d.events.slice(0,10).map(x=>`<div class="status" style="margin:8px 0"><b>${A.esc(x.Title)}</b><br>${A.esc(x.DateTimeISO)}<br>${A.esc(x.Location||'')} ${x.MeetingLink?`<a href="${A.esc(x.MeetingLink)}" target="_blank">Join</a>`:''}</div>`).join(''):'<p class="muted">No events yet.</p>'}</div></div></section>`);markActivityViews(d.tasks,'TASK');markActivityViews(d.events,'EVENT');if(next)countdown(new Date(next.DateTimeISO),1)}
async function activityPage(){page('activity');let r=await A.post('member',{token:A.token()});if(!r.ok)return login();let d=r.data;let now=Date.now();let tasks=d.tasks.slice().sort((a,b)=>new Date(a.DeadlineISO)-new Date(b.DeadlineISO));let events=d.events.slice().sort((a,b)=>new Date(a.DateTimeISO)-new Date(b.DateTimeISO));shell(`<section class="section"><div class="topActions"><button class="btn" onclick="memberDash()">Member Portal</button><button class="btn" onclick="home()">Home</button><button class="btn" onclick="logout()">Logout</button></div><h1 class="title">Team Activity</h1><p class="subtitle">All tasks and events assigned to ${A.esc(d.user.team)}. Opening this page records that you viewed the activity.</p><div class="card"><h2>Tasks</h2>${tasks.length?tasks.map(t=>{let sub=d.submissions.find(x=>String(x.TaskID)===String(t.TaskID));let overdue=new Date(t.DeadlineISO).getTime()<now&&!sub;return `<div class="status" style="margin:10px 0"><h3>📝 ${A.esc(t.Title)}</h3><p>${A.esc(t.Description||'')}</p><p><b>Deadline:</b> ${A.esc(t.DeadlineISO)}</p><p><b>Status:</b> ${sub?`Submitted at ${A.esc(sub.SubmittedAt)}`:(overdue?'Overdue — not submitted':'Pending')}</p>${t.AttachmentUrl?`<a class="btn" href="${A.esc(t.AttachmentUrl)}" target="_blank">Attachment</a>`:''}<button class="btn primary" onclick="submitTaskUI('${t.TaskID}')">${sub?'Update Submission':'Submit Task'}</button></div>`}).join(''):'<p class="muted">No tasks available.</p>'}</div><div class="card" style="margin-top:18px"><h2>Events</h2>${events.length?events.map(x=>`<div class="status" style="margin:10px 0"><h3>📅 ${A.esc(x.Title)}</h3><p>${A.esc(x.Description||'')}</p><p><b>Date:</b> ${A.esc(x.DateTimeISO)}</p><p>${A.esc(x.Location||'')} ${x.MeetingLink?`<a class="btn primary" href="${A.esc(x.MeetingLink)}" target="_blank">Join Event</a>`:''}</p></div>`).join(''):'<p class="muted">No events available.</p>'}</div></section>`);markActivityViews(tasks,'TASK');markActivityViews(events,'EVENT')}
async function markActivityViews(items,type){if(!items?.length)return;await Promise.all(items.map(x=>A.post('markViewed',{token:A.token(),type,itemId:x.TaskID||x.EventID}).catch(()=>null)))}
async function adminDash(){page('admin');let r=await A.post('admin',{token:A.token()});if(!r.ok)return login();let d=r.data;window.ADMIN=d;shell(`<section class="section"><div class="topActions"><button class="btn" onclick="home()">Home</button><button class="btn" onclick="logout()">Logout</button></div><h1 class="title">Admin Dashboard</h1><p class="subtitle">${A.esc(d.role)} · Full management access according to permissions.</p><div class="grid"><div class="card"><h3>Applicants</h3><div class="count">${d.apps.length}</div></div><div class="card"><h3>Members</h3><div class="count">${d.members.length}</div></div><div class="card"><h3>Teams</h3><div class="count">${d.teams.length}</div></div></div><div class="card" style="margin-top:18px"><div class="adminTabs"><button class="btn primary" onclick="showApps()">Applicants</button><button class="btn" onclick="showMembers()">Members</button><button class="btn" onclick="showTeams()">Teams</button><button class="btn" onclick="showCreate()">Create Member</button><button class="btn" onclick="showTaskCreate()">Create Task</button><button class="btn" onclick="showEventCreate()">Create Event</button><button class="btn" onclick="adminActivity()">Activity Tracking</button><button class="btn" onclick="showSlotCreate()">Interview Slots</button></div><div id="adminArea"></div></div></section>`);showApps()}
function adminActivity(){page('activity');let d=window.ADMIN;if(!d)return adminDash();let memberMap=Object.fromEntries(d.members.map(m=>[String(m.MemberID),m]));let subMap={};(d.submissions||[]).forEach(x=>{if(!subMap[x.TaskID])subMap[x.TaskID]={};subMap[x.TaskID][x.MemberID]=x});let viewMap={};(d.views||[]).forEach(x=>{if(!viewMap[x.Type])viewMap[x.Type]={};if(!viewMap[x.Type][x.ItemID])viewMap[x.Type][x.ItemID]={};viewMap[x.Type][x.ItemID][x.MemberID]=x});const targets=(x,isTask)=>d.members.filter(m=>{let team=String(x.Team||'All').trim().toLowerCase(),mt=String(m.Team||'').trim().toLowerCase();if(isTask&&x.AssignedMemberID)return String(x.AssignedMemberID)===String(m.MemberID);return team==='all'||team===mt});const table=(x,isTask)=>targets(x,isTask).map(m=>{let sub=isTask?subMap[x.TaskID]?.[m.MemberID]:null;let view=viewMap[isTask?'TASK':'EVENT']?.[isTask?x.TaskID:x.EventID]?.[m.MemberID];return `<tr><td>${A.esc(m.FullName)}</td><td>${A.esc(m.Team)}</td><td>${view?`Seen: ${A.esc(view.ViewedAt)}`:'<span class="pill">Not viewed</span>'}</td><td>${isTask?(sub?`<b>Submitted</b><br>${A.esc(sub.SubmittedAt)}`:'<span class="pill">Not submitted</span>'):A.esc(x.DateTimeISO)}</td></tr>`}).join('');A.q('#adminArea').innerHTML=`<h2>Task & Event Tracking</h2><p class="subtitle">Created by, exact deadline/event time, who viewed, and who submitted.</p><h3>Tasks</h3>${d.tasks.length?d.tasks.map(t=>`<div class="card" style="margin:12px 0"><h3>📝 ${A.esc(t.Title)}</h3><p><b>Created by:</b> ${A.esc(t.CreatedBy||'—')} · <b>Deadline:</b> ${A.esc(t.DeadlineISO)}</p><table class="table"><tr><th>Member</th><th>Team</th><th>Viewed</th><th>Submission</th></tr>${table(t,true)||'<tr><td colspan="4">No targeted members.</td></tr>'}</table></div>`).join(''):'<p class="muted">No tasks.</p>'}<h3 style="margin-top:24px">Events</h3>${d.events.length?d.events.map(x=>`<div class="card" style="margin:12px 0"><h3>📅 ${A.esc(x.Title)}</h3><p><b>Created by:</b> ${A.esc(x.CreatedBy||'—')} · <b>Event time:</b> ${A.esc(x.DateTimeISO)}</p><table class="table"><tr><th>Member</th><th>Team</th><th>Viewed</th><th>Event time</th></tr>${table(x,false)||'<tr><td colspan="4">No targeted members.</td></tr>'}</table></div>`).join(''):'<p class="muted">No events.</p>'}<button class="btn" onclick="adminDash()">Back to Admin Dashboard</button>`}
function showApps(){let d=window.ADMIN;A.q('#adminArea').innerHTML=`<table class="table"><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr>${d.apps.slice().reverse().map(a=>`<tr><td>${A.esc(a.FullName)}<br><span class="mini">${A.esc(a.ApplicantID)}</span></td><td>${A.esc(a.Email)}<br>${A.esc(a.Phone)}</td><td><span class="pill">${A.esc(a.Status)}</span></td><td><button class="btn" onclick="editApp('${a.ApplicantID}')">Manage</button></td></tr>`).join('')}</table>`}
function editApp(id){let a=window.ADMIN.apps.find(x=>x.ApplicantID===id),i=window.ADMIN.interviews.find(x=>x.ApplicantID===id);A.q('#adminArea').innerHTML=`<h2>${A.esc(a.FullName)}</h2><p class="muted">${A.esc(a.Email)} · ${A.esc(a.Phone)}</p><div class="grid2"><div>${f('Status','edStatus','select','',false,['Under Review','Accepted for Interview','Interview Completed','Accepted','Rejected','Waitlisted'])}${f('Admin note','edNote','textarea','')}</div><div><h3>Schedule Interview</h3>${f('Date & time','intDT','datetime-local','')}${f('Duration minutes','intDur','number','60')}${f('Capacity for this exact slot','intCap','number','1')}${f('Interview link','intLink','url','Google Meet / Zoom')}${f('Interviewer / Team','intInterviewer','text','')}</div></div><div class="topActions"><button class="btn primary" onclick="saveApp('${id}')">Save Applicant</button><button class="btn" onclick="schedule('${id}')">Schedule / Update Interview</button><button class="btn" onclick="publishResult('${id}')">Publish Result</button><button class="btn" onclick="requestAdditional('${id}',true)">Request Extra Info</button><button class="btn" onclick="requestAdditional('${id}',false)">Cancel Extra Info</button><button class="btn" onclick="showApps()">Back</button></div>`;A.q('#edStatus').value=a.Status;A.q('#edNote').value=a.AdminNote||'';if(i){
let editDT=i.DateTimeISO?(()=>{const z=new Date(i.DateTimeISO);if(isNaN(z.getTime()))return '';const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(z);const g=k=>p.find(x=>x.type===k)?.value||'';return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`})():'';
A.q('#intDT').value=editDT;A.q('#intDur').value=i.DurationMinutes;A.q('#intCap').value=i.Capacity;A.q('#intLink').value=i.InterviewLink;A.q('#intInterviewer').value=i.Interviewer}}
async function saveApp(id){let r=await A.post('updateApplicant',{token:A.token(),applicantId:id,status:A.q('#edStatus').value,adminNote:A.q('#edNote').value});if(!r.ok)return A.toast(r.error);A.toast('Applicant updated');adminDash()}
async function schedule(id){let r=await A.post('interview',{token:A.token(),applicantId:id,dateTimeISO:new Date(A.q('#intDT').value).toISOString(),duration:A.q('#intDur').value,capacity:A.q('#intCap').value,link:A.q('#intLink').value,interviewer:A.q('#intInterviewer').value});if(!r.ok)return A.toast(r.error);A.toast('Interview scheduled');adminDash()}
async function publishResult(id){let st=prompt('Result status (Accepted / Rejected / Waitlisted)');if(!st)return;let msg=prompt('Result message');let r=await A.post('result',{token:A.token(),applicantId:id,resultStatus:st,message:msg||''});if(!r.ok)return A.toast(r.error);A.toast('Result published and emailed');adminDash()}

function showSlotCreate(){
  let today=new Date(),iso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  A.q('#adminArea').innerHTML=`<h2>Interview Slots</h2><p class="mini">Choose today or any future day. Each interview is fixed at 60 minutes, from 6:00 PM to 12:00 AM. The system creates 6 hourly slots: 6, 7, 8, 9, 10 and 11 PM. Capacity can be 1, 2, 3, or any number.</p>${f('Interview Day','slotDate','date',iso,true)}${f('Capacity per hour','slotCap','number','1',true)}<button class="btn primary" onclick="createInterviewSlots()">Create 6 Hourly Slots</button><div id="slotAdminMsg" class="mini"></div>`;A.q('#slotDate').min=iso;}
async function createInterviewSlots(){let date=A.q('#slotDate').value,cap=A.q('#slotCap').value;if(!date||Number(cap)<1)return A.toast('Choose a date and capacity.');let r=await A.post('createSlots',{token:A.token(),date,capacity:cap});if(!r.ok)return A.toast(r.error);A.toast(`Interview day ready: ${r.data.created||0} created, ${r.data.updated||0} updated.`);adminDash();}
async function requestAdditional(id,required){let r=await A.post('requestAdditionalInfo',{token:A.token(),applicantId:id,required});if(!r.ok)return A.toast(r.error);A.toast(required?'Additional information requested and email sent.':'Additional information request cancelled.');adminDash();}
function showTaskCreate(){let teams=['All',...window.ADMIN.teams.map(x=>x.Name)];A.q('#adminArea').innerHTML=`<h2>Create Task</h2>${f('Title','ctTitle','text','',true)}${f('Description','ctDesc','textarea','',true)}${f('Team','ctTeam','select','',true,teams)}${f('Deadline','ctDeadline','datetime-local','',true)}${f('Attachment URL','ctAttach','url','Optional')}<button class="btn primary" onclick="createTask()">Create Task</button>`}
async function createTask(){let r=await A.post('task',{token:A.token(),title:A.q('#ctTitle').value,description:A.q('#ctDesc').value,team:A.q('#ctTeam').value,deadline:A.q('#ctDeadline').value,attachment:A.q('#ctAttach').value});if(!r.ok)return A.toast(r.error);A.toast('Task created');adminDash()}
function showEventCreate(){let teams=['All',...window.ADMIN.teams.map(x=>x.Name)];A.q('#adminArea').innerHTML=`<h2>Create Event</h2>${f('Title','ceTitle','text','',true)}${f('Description','ceDesc','textarea','',true)}${f('Date & time','ceDT','datetime-local','',true)}${f('Location','ceLoc','text','')}${f('Meeting link','ceLink','url','Optional')}${f('Team','ceTeam','select','',true,teams)}<button class="btn primary" onclick="createEvent()">Create Event</button>`}
async function createEvent(){let r=await A.post('event',{token:A.token(),title:A.q('#ceTitle').value,description:A.q('#ceDesc').value,dateTimeISO:new Date(A.q('#ceDT').value).toISOString(),location:A.q('#ceLoc').value,link:A.q('#ceLink').value,team:A.q('#ceTeam').value});if(!r.ok)return A.toast(r.error);A.toast('Event created');adminDash()}
function showMembers(){let d=window.ADMIN;A.q('#adminArea').innerHTML=`<table class="table"><tr><th>Name</th><th>Email</th><th>Team</th><th>Role</th><th>Admin</th><th></th></tr>${d.members.map(m=>`<tr><td>${A.esc(m.FullName)}</td><td>${A.esc(m.Email)}</td><td>${A.esc(m.Team)}</td><td>${A.esc(m.Role)}</td><td>${A.esc(m.AdminLevel)}</td><td>${d.role==='SUPER'?`<button class="btn" onclick="editMember('${m.MemberID}')">Manage</button>`:''}</td></tr>`).join('')}</table>`}
function showTeams(){let d=window.ADMIN;A.q('#adminArea').innerHTML=`<h2>Teams</h2>${d.teams.map(t=>`<div class="status" style="margin:8px 0"><b>${A.esc(t.Name)}</b> · ${A.esc(t.Category)} · ${t.Active?'Active':'Disabled'} ${d.role==='SUPER'?`<button class="btn" onclick="toggleTeam('${t.TeamID}',${!t.Active})">${t.Active?'Disable':'Enable'}</button>`:''}</div>`).join('')}`}
async function toggleTeam(id,active){let t=window.ADMIN.teams.find(x=>x.TeamID===id);let r=await A.post('updateTeam',{token:A.token(),teamId:id,name:t.Name,category:t.Category,active});if(!r.ok)return A.toast(r.error);adminDash()}
function editMember(id){let m=window.ADMIN.members.find(x=>x.MemberID===id),teams=window.ADMIN.teams.map(x=>x.Name);A.q('#adminArea').innerHTML=`<h2>Manage Member</h2>${f('Full Name','emName','text','',true)}${f('Email','emEmail','email','',true)}${f('Phone','emPhone','text','')}${f('Team','emTeam','select','',true,teams)}${f('Role','emRole','text','Member',true)}${f('Admin Level','emAdmin','select','',true,['MEMBER','TEAM_ADMIN','SUPER'])}<div class="field"><label>Admin Teams</label>${choices('emAdminTeams',teams)}</div>${f('Active','emActive','select','',true,['true','false'])}<button class="btn primary" onclick="saveMember('${id}')">Save</button><button class="btn" onclick="showMembers()">Back</button>`;A.q('#emName').value=m.FullName;A.q('#emEmail').value=m.Email;A.q('#emPhone').value=m.Phone;A.q('#emTeam').value=m.Team;A.q('#emRole').value=m.Role;A.q('#emAdmin').value=m.AdminLevel;A.q('#emActive').value=String(m.Active);let at=[];try{at=JSON.parse(m.AdminTeams||'[]')}catch(e){};document.querySelectorAll('[name="emAdminTeams"]').forEach(x=>x.checked=at.includes(x.value))}
async function saveMember(id){let r=await A.post('updateMember',{token:A.token(),memberId:id,fullName:A.q('#emName').value,email:A.q('#emEmail').value,phone:A.q('#emPhone').value,team:A.q('#emTeam').value,role:A.q('#emRole').value,adminLevel:A.q('#emAdmin').value,adminTeams:vals('emAdminTeams'),active:A.q('#emActive').value==='true'});if(!r.ok)return A.toast(r.error);A.toast('Member updated');adminDash()}
function showCreate(){let teams=window.ADMIN.teams.filter(x=>x.Active===true||String(x.Active)==='true').map(x=>x.Name);A.q('#adminArea').innerHTML=`<h2>Create Member</h2>${f('Full Name','cmName','text','',true)}${f('Email','cmEmail','email','',true)}${f('Phone','cmPhone','text','')}${f('Team','cmTeam','select','',true,teams)}<div class="field" id="adminTeamsField"><label>Admin access</label>${choices('cmAdminTeams',teams)}</div>${f('Role','cmRole','text','Member',true)}${f('Admin Level','cmAdmin','select','',true,['MEMBER','TEAM_ADMIN'])}${f('Password (optional)','cmPw','password','Leave empty to generate')}<button class="btn primary" onclick="createMember()">Create Member</button>`;A.q('#cmAdmin').onchange=e=>A.q('#adminTeamsField').classList.toggle('hidden',e.target.value!=='TEAM_ADMIN');A.q('#adminTeamsField').classList.add('hidden')}
async function createMember(){let r=await A.post('createMember',{token:A.token(),fullName:A.q('#cmName').value,email:A.q('#cmEmail').value,phone:A.q('#cmPhone').value,team:A.q('#cmTeam').value,role:A.q('#cmRole').value,adminLevel:A.q('#cmAdmin').value,adminTeams:vals('cmAdminTeams'),password:A.q('#cmPw').value});if(!r.ok)return A.toast(r.error);A.toast('Member created; credentials emailed.');adminDash()}
function logout(){localStorage.clear();login()}
if(API_URL.includes('PASTE_')){A.html('<div class="wrap"><div class="card"><h1>MECHA-TECH Platform</h1><p>Set your Apps Script Web App URL in <b>config.js</b> before deploying.</p></div></div>')}else home();
