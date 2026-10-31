import {state,mutate,activeCourse} from './store.js';
import {CATALOG,DAYS,SUBJECTS,GRADES,TOPICS,GOALS,COURSE_FOCUS} from '../data/mock-data.js';
import {sliderFields,bindSliderReadings,readSliders,neutralPreferences} from './preferences.js';
import {planFor,planProgress} from './plans.js';
import {matchTutors,matchGroups,WEIGHTS,descriptions} from './matching.js';
import {$,$$,workspace,esc,money,tag,btn,avatar,progress,panel,stat,empty,item,formSelect,field,choices,feedback} from './ui.js';
const q=(k)=>new URLSearchParams(location.search).get(k);
const getTutor=(s,id)=>s.catalog.tutors.find(x=>x.id===id);
const label=(key)=>({step:'Step-by-step explanations',practice:'Practice drills',concept:'Concept building',encouraging:'Encouraging guidance',independent:'Let me try independently',slow:'Slow & detailed',medium:'Moderate pace',fast:'Fast-paced'})[key]||key;
const ftopics=topic=>TOPICS[topic]||[];
export function renderStudent(page){
 if(page==='dashboard')return dashboard();
 if(page==='request')return request();
 if(page==='matching')return matching();
 if(page==='tutor')return profile();
 if(page==='booking')return booking();
 if(page==='courses')return courses();
 if(page==='progress')return studentProgress();
}
function dashboard(){const s=state(),stud=s.student;
 if(!activeCourse(s)){
  const phase=stud.request?'Learning request submitted':'New account created';
  workspace('student','dashboard',`Welcome to TutorPair${stud.name==='New Student'?'':', '+esc(stud.name)}!`,'Your journey starts here. Your dashboard will grow as you book your first course.',
   `<section class="welcome new"><div><div class="welcome-kicker">✦ ${phase.toUpperCase()}</div><h2>Find your first tutor and build your learning plan.</h2><p>No classes yet. Start by telling us which school subject you’d like to improve.</p>${btn(stud.request?'See your matches →':'Start tutor matching →',stud.request?'/student/matching.html':'/student/request.html','white')}</div><div class="empty-illustration">✧<span>0 classes enrolled</span></div></section>
   <div class="stats-grid">${stat('Active courses','0','You haven’t enrolled yet','▤')}${stat('Completed lessons','0','Your lessons will appear here','◷')}${stat('Latest quiz','—','A tutor can record scores later','▥')}${stat('Upcoming class','—','Book a class to get started','▦')}</div>
   <div class="two-col">${panel('Your next steps',`${item('01 · Complete your learning profile','Tell us your grade, goal, pace and availability',stud.request?tag('Complete','green'):tag('To do'))}${item('02 · Compare Top 3 matches','See why each recommended tutor fits',tag('Next'))}${item('03 · Confirm your first lesson','Begin your online course',tag('Next'))}`)}${panel('Your learning space',empty('Nothing scheduled yet','Once you enroll, your timetable, course progress and next steps appear here.'))}</div>`);
  return;
 }
 const c=stud.course,pc=Math.round(c.completed/c.sessions*100),note=s.notes.at(-1);
 workspace('student','dashboard',`Welcome back, ${esc(stud.name)}!`,'Here’s your current course, next lesson and learning progress.',
 `<section class="welcome"><div><div class="welcome-kicker">✦ YOUR LEARNING JOURNEY</div><h2>Every lesson brings you closer to your school goal.</h2><p>${esc(c.title)} · ${esc(c.tutorName)}</p><div class="actions">${btn('Open my courses →','/student/courses.html','white')}${btn('See progress','/student/progress.html','soft-white')}</div></div><div class="completion-ring"><strong>${pc}%</strong><small>course completed</small></div></section>
 <div class="stats-grid">${stat('Active courses','1','Mathematics learning package','▤')}${stat('Lessons completed',`${c.completed}/${c.sessions}`,'Updated as sessions are recorded','◷')}${stat('Latest quiz',note?`${note.score}/${note.total}`:'—','From tutor session notes','▥')}${stat('Upcoming class',c.nextLesson||'Thursday','Google Meet / Zoom (demo)','▦')}</div>
 <div class="two-col">${panel('Current course',`<div class="course-header">${avatar('MA','lavender','large')}<div><h3>${esc(c.title)}</h3><p>${esc(c.tutorName)} · Online 1-on-1</p></div>${tag('Enrolled','green')}</div><div class="between"><span>Course completion</span><strong>${c.completed} / ${c.sessions} lessons</strong></div>${progress(pc)}<div class="row-actions">${btn('View course →','/student/courses.html')}</div>`)}${panel('Your next learning milestone',note?`${item('Last topic',esc(note.topic),tag('Reviewed','green'))}${item('Next practice',esc(note.homework),tag('To do'))}`:`<p class="muted">Your first lesson is booked. Tutor notes and quiz results will appear after a session is recorded.</p>${btn('Open progress →','/student/progress.html','outline')}`)}</div>`);
}
function request(){
 const s=state(),prior=s.student.request||{};
 const topicOptions=(ftopics(prior.subject||'Mathematics')).map(t=>[t,t]);
 const html=`<div class="wizard-top"><div class="wizard-tabs"><span class="on" data-step-label="0">1. Academic goals</span><span data-step-label="1">2. Learning preferences</span><span data-step-label="2">3. Schedule & budget</span></div><div class="small">3 steps · approximately 3 minutes</div></div>
 <div class="two-col form-split"><section class="panel"><form id="request-form" novalidate>
 <div class="wizard-page" data-step="0"><div class="form-intro"><h2>What do you want to improve?</h2><p>We’ll use your school goal and weak topics to find the right expertise.</p></div>
 <div class="form-grid">${formSelect('grade','Grade level',GRADES,prior.grade||'M.4')}${formSelect('subject','Subject',SUBJECTS,prior.subject||'Mathematics')}</div>
 ${formSelect('goalType','Main academic goal',GOALS,prior.goalType||'school-grade')}
 ${formSelect('courseFocus','What do you want to prepare for?',COURSE_FOCUS,prior.courseFocus||'Midterm exam')}
 <div class="form-grid">${formSelect('currentGrade','Current school grade', ['1.0','1.5','2.0','2.5','3.0','3.5','4.0'],prior.currentGrade||'2.5')}${formSelect('targetGrade','Target school grade',['2.0','2.5','3.0','3.5','4.0'],prior.targetGrade||'3.5')}</div>
 <label class="field"><span>Your specific goal</span><textarea name="goal" required rows="3" placeholder="e.g., improve my Math grade by the next midterm">${esc(prior.goal||'Improve my school Mathematics grade before the next exam')}</textarea></label>
 <div class="field"><span>Topics where you need help (choose any)</span><div id="topic-choices">${choices('topics',topicOptions,prior.topics||['Algebra','Functions'])}</div></div>
 <label class="field"><span>School worksheet / syllabus (optional)</span><input name="worksheet" type="file" accept=".pdf,.png,.jpg,.jpeg"><small>Demo only: the file name is shown, not uploaded or analyzed by AI.</small></label></div>
 <div class="wizard-page" data-step="1" hidden><div class="form-intro"><h2>How do you prefer to learn?</h2><p>These preferences help compare you with each tutor’s stated teaching approach. They are not fixed learning-style labels.</p></div>
 ${formSelect('currentLevel','Current understanding',[{value:'foundation',label:'Building foundations'},{value:'intermediate',label:'Can do most questions with some help'},{value:'advanced',label:'Ready for challenging questions'}],prior.currentLevel||'foundation')}
 ${formSelect('pace','Preferred pace',[{value:'slow',label:'Slow and detailed explanations'},{value:'medium',label:'Moderate pace'},{value:'fast',label:'Fast-paced practice'}],prior.pace||'slow')}
 ${formSelect('approach','Preferred teaching approach',[{value:'step',label:'Step-by-step worked examples'},{value:'practice',label:'Practice questions and drills'},{value:'concept',label:'Concept explanations and discussion'}],prior.approach||'step')}
 ${formSelect('interaction','Preferred tutor interaction',[{value:'encouraging',label:'Encouraging and supportive'},{value:'independent',label:'Give me time to try independently'}],prior.interaction||'encouraging')}
 <div class="preference-intro"><h3>9 shared teaching & interaction sliders</h3><p>These 1–5 axes use the exact same meaning as the tutor onboarding sliders. Midpoint 3 means flexible or no strong preference.</p></div>
 ${sliderFields('studentPref',prior.preferences||neutralPreferences())}</div>
 <div class="wizard-page" data-step="2" hidden><div class="form-intro"><h2>Make the match practical.</h2><p>These are essential filters. We only recommend options that fit your budget, schedule and class format.</p></div>
 ${formSelect('format','Class format',[{value:'one',label:'Online 1-on-1'},{value:'group',label:'Online small group (2–5 learners)'}],prior.format||'one')}
 <div class="field"><span>Times you can attend (choose at least one)</span>${choices('schedule',DAYS.map(x=>[x.id,x.name]),prior.schedule||['thu','sat'])}</div>
 ${field('budget','Maximum budget (THB per hour)',prior.budget||500,'number')}
 <div class="policy-note">✧ This prototype uses transparent filtering and weighted scoring. AI-written explanations and worksheet analysis are planned, not connected.</div></div>
 <div class="wizard-actions"><button type="button" class="button outline" id="wizard-back" hidden>← Back</button><button type="button" class="button primary" id="wizard-next">Continue →</button><button type="submit" class="button primary" id="wizard-submit" hidden>Find my Top 3 →</button></div><div id="form-error" class="form-message"></div></form></section>
 <aside class="panel sidebar-tips"><div class="tip-icon">✧</div><h3>How matching works</h3>${item('Step 1 · Eligibility','Subject, grade, format, budget and time must match')}${item('Step 2 · Weighted fit','Topics, pace, approach, schedule, price and evidence')}${item('Step 3 · Your choice','Compare up to 3 options and book only when ready')}<div class="mini-tips">Matching is a recommendation, not a guarantee of grade improvement.</div></aside></div>`;
 workspace('student','request','Tell us about your learning goal','Your answers are matched against the same attributes in tutor profiles.',html);
 bindSliderReadings($('#request-form'));
 let step=0;const pages=$$('.wizard-page');
 function showStep(){pages.forEach((n,i)=>n.hidden=i!==step);$$('[data-step-label]').forEach((n,i)=>n.classList.toggle('on',i<=step));$('#wizard-back').hidden=step===0;$('#wizard-next').hidden=step===2;$('#wizard-submit').hidden=step!==2;feedback('#form-error','');}
 $('#wizard-back').addEventListener('click',()=>{step--;showStep()});
 $('#wizard-next').addEventListener('click',()=>{
  const visible=pages[step];if([...visible.querySelectorAll('textarea[required],input[required],select[required]')].some(el=>!el.checkValidity())){feedback('#form-error','Please complete the required fields.','error');return;}
  if(step===0&&!visible.querySelector('input[name="topics"]:checked')){feedback('#form-error','Choose at least one topic.','error');return;}
  step++;showStep();
 });
 const subject=$('select[name="subject"]');subject.addEventListener('change',()=>{$('#topic-choices').innerHTML=choices('topics',ftopics(subject.value).map(t=>[t,t]),[])});
 $('#request-form').addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget,fd=new FormData(form),data={};
  for(const [k,v] of fd.entries()){if(k.startsWith('studentPref-'))continue; if(k==='topics'||k==='schedule'){(data[k]??=[]).push(v)}else if(k==='worksheet')data.worksheetName=v?.name||'';else data[k]=v;}
  data.budget=Number(data.budget);data.preferences=readSliders(fd,'studentPref');
  if(!data.schedule?.length){feedback('#form-error','Please select at least one available time.','error');return;}
  if(!(data.budget>0)){feedback('#form-error','Please enter a valid budget.','error');return;}
  mutate(s=>{s.student.request=data;s.pendingMatch=true;s.matchResults=[];s.selectedTutorId=null;s.selectedGroupId=null;});location.href='/student/matching.html';
 });
}
function matching(){
 const s=state(),r=s.student.request;
 if(!r)return workspace('student','matching','Your matches','Tell us what you need first.',empty('No learning request yet','Complete your learning profile to see recommendations.',btn('Start matching →','/student/request.html')));
 const summary=`<div class="summary-strip"><div><small>YOUR REQUEST</small><b>${esc(r.grade)} · ${esc(r.subject)}</b></div><div><small>FORMAT</small><b>${r.format==='group'?'Small group':'1-on-1'}</b></div><div><small>BUDGET</small><b>Up to ${money(r.budget)}/hr</b></div>${btn('Edit answers','/student/request.html','outline')}</div>`;
 const loading=`<section class="panel loading-panel" id="matching-loading"><div class="loading-orb">✧</div><h2>Finding your best matches...</h2><p>Checking eligibility and calculating compatibility from your answers.</p><div class="load-track"><div></div></div><div class="loading-steps"><span>✓ Checking subject, grade, format</span><span>✓ Filtering budget and schedule</span><span>◌ Ranking academic and teaching fit</span></div><small>Visual demonstration of a real deterministic calculation, not an external AI request.</small></section>`;
 workspace('student','matching','Your recommended matches','Up to three qualified results, ranked by our weighted matching rules.',summary+`<div id="match-body">${loading}</div>`);
 const compute=()=>{
  const current=state();const results=r.format==='group'?matchGroups(r,current.catalog.groups,current.catalog.tutors):matchTutors(r,current.catalog.tutors);
  mutate(st=>{st.matchResults=results;st.pendingMatch=false});
  displayMatches(results,r);
 };
 if(s.pendingMatch)setTimeout(compute,950);else displayMatches(s.matchResults?.length?s.matchResults:(r.format==='group'?matchGroups(r,s.catalog.groups,s.catalog.tutors):matchTutors(r,s.catalog.tutors)),r);
}
function displayMatches(matches,r){
 const box=$('#match-body');if(!box)return;
 if(!matches.length){box.innerHTML=empty('No eligible matches yet','Our sample catalog has no tutors or classes that meet all hard filters. Adjust your subject, budget, schedule, or class format.',btn('Edit learning request →','/student/request.html'));return;}
 box.innerHTML=`<div class="results-title"><div><h2>${matches.length} recommended ${r.format==='group'?'class':'tutor'}${matches.length>1?'es':''}</h2><p>Scores are calculated from your answers. Sample tutor attributes are illustrative.</p></div>${tag('Rules-based matching','purple')}</div><div class="match-list">${matches.map((m,i)=>{
 const tutor=r.format==='group'?m.tutor:m;
 const why=m.fit.why.map(x=>`<div>✓ ${esc(x)}</div>`).join('');
 return `<article class="match-card"><div class="match-upper"><span class="rank">#${i+1}</span>${avatar(tutor.initials,tutor.color,'large')}<div class="match-info"><h3>${esc(r.format==='group'?m.name:tutor.name)}</h3><p>${esc(tutor.subject)} · ${esc(r.format==='group'?m.grade:tutor.grades.join(' / '))}</p><span class="match-sub">${esc(tutor.university)}</span></div><div class="score"><strong>${m.fit.score}%</strong><small>fit score</small></div></div><div class="match-lower"><div><div class="card-eyebrow">WHY THIS MATCH?</div>${why}<div class="match-preference-note">9-slider teaching fit: ${m.fit.preferenceScore}/100 (example)</div></div><div class="match-cost"><strong>${money(r.format==='group'?m.price:tutor.price)}</strong><small>${r.format==='group'?'per student / package':'per hour'}</small><button class="button primary match-pick" data-pick="${esc(m.id)}">View details →</button></div></div></article>`;
 }).join('')}</div><details class="panel explain"><summary>How were these scores calculated? <span>See weighted breakdown</span></summary><div class="weights-grid">${Object.keys(WEIGHTS).map(k=>`<div><b>${descriptions[k]}</b><strong>${WEIGHTS[k]*100}%</strong></div>`).join('')}</div><p>Each eligible option receives sub-scores from 0–100. The weighted score is a ranking aid, not a scientific prediction of grades. All tutor credentials are mock data.</p></details>`;
 $$('.match-pick').forEach(b=>b.addEventListener('click',()=>{
  mutate(s=>{if(r.format==='group'){s.selectedGroupId=b.dataset.pick;s.selectedTutorId=s.catalog.groups.find(g=>g.id===b.dataset.pick)?.tutorId}else{s.selectedTutorId=b.dataset.pick;s.selectedGroupId=null}});
  location.href='/student/tutor.html';
 }));
}
function profile(){const s=state(),id=s.selectedTutorId,t=id&&getTutor(s,id);
 if(!t)return workspace('student','matching','Tutor profile','Choose a match first.',empty('No tutor selected','Please select a tutor or class from your matches.',btn('View matches →','/student/matching.html')));
 const group=s.selectedGroupId?s.catalog.groups.find(g=>g.id===s.selectedGroupId):null;
 workspace('student','matching','Tutor details','Review the teaching approach before you book.',`<div class="two-col big-left">${panel('Meet your tutor',`<div class="profile-hero">${avatar(t.initials,t.color,'huge')}<div><div class="eyebrow">PROFILE EXAMPLE</div><h2>${esc(t.name)}</h2><p>${esc(t.subject)} · ${esc(t.university)}</p>${tag('Screened (demo)','green')}</div></div><p>${esc(t.about)}</p>${item('Teaching approach',t.approach.map(label).join(', '))}${item('Learning pace',t.pace.map(label).join(', '))}${item('Specialist topics',t.topics.join(', '))}${item('Available schedule',t.schedule.map(id=>DAYS.find(x=>x.id===id)?.name||id).join('; '))}`)}${panel(group?'Group course details':'Book your first lesson',`<div class="big-price">${money(group?group.price:t.price)} <small>${group?'per student / package':'/ hour'}</small></div>${group?`<h3>${esc(group.name)}</h3><p>${esc(group.description)}</p>${item('Available places',`${group.capacity-group.byos-group.platform} open / ${group.capacity} total`)}`:`<p>Choose a time with your tutor, then confirm your course package.</p>`}<div class="row-actions">${btn('Request a lesson →','/student/booking.html')}</div><p class="fine-print">No real money or tutor contact occurs in this prototype.</p>`)}</div>`);
}
function booking(){const s=state(),t=getTutor(s,s.selectedTutorId),group=s.catalog.groups.find(x=>x.id===s.selectedGroupId),r=s.student.request;
 if(!t)return workspace('student','matching','Booking','Select a tutor first.',empty('No match selected','Choose a tutor from your recommendations.',btn('View matches','/student/matching.html')));
 const units=group?.sessions||8,packagePrice=group?.price||units*t.price;
 const body=`<div class="two-col big-left">${panel('Confirm your first lesson',`<div class="course-header">${avatar(t.initials,t.color)}<div><h3>${group?esc(group.name):esc(t.name)}</h3><p>Online ${group?'small group':'1-on-1'} · Google Meet / Zoom</p></div></div><form id="book-form" class="stack-form"><label class="field"><span>Preferred time</span><select name="slot" required>${(group?[group.schedule]:t.schedule.filter(day=>r?.schedule.includes(day))).map(day=>`<option value="${day}">${DAYS.find(d=>d.id===day)?.name||day}</option>`).join('')}</select></label><label class="field"><span>Note to your tutor (optional)</span><textarea name="note" rows="3" placeholder="Please help with my algebra homework"></textarea></label><div class="policy-note">Proposed first-lesson satisfaction guarantee: request a tutor change or eligible first-lesson refund within 24 hours after completion. Conditions still need approval.</div><button type="submit" class="button primary">Confirm demo booking →</button></form>`)}${panel('Course package preview',`<div class="card-eyebrow">PROPOSED LEARNING PACKAGE</div><h3>${esc(group?.name||`${r?.grade||'M.4'} ${t.subject} Foundations`)}</h3>${item('Live online lessons',`${units} sessions`)}${item('Tutor',esc(t.name))}${item('Price',money(packagePrice))}<div class="bill-total"><span>Example course total</span><strong>${money(packagePrice)}</strong></div><p class="fine-print">All pricing is illustrative; no card/PromptPay payment is processed.</p>`)}</div>`;
 workspace('student','matching','First lesson & package','Try the journey from selecting a tutor to becoming an active student.',body);
 $('#book-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget; const booking={tutorId:t.id,groupId:group?.id||null,slot:form.elements.slot.value,price:packagePrice,sessions:units,status:'confirmed-demo',title:group?.name||`${r?.grade||'M.4'} ${t.subject} Foundations`};
  mutate(st=>{st.booking=booking;});renderBookingSuccess(booking,t);
 });
}
function renderBookingSuccess(b,t){const box=$('.page');box.innerHTML=`<div class="success-layout"><div class="success-icon">✓</div><h1>First lesson request confirmed (demo)!</h1><p>In a real product, the tutor would accept the request and a parent would approve/pay for the package before enrollment.</p><div class="panel success-summary">${item('Tutor',esc(t.name))}${item('Online lesson',DAYS.find(x=>x.id===b.slot)?.name||b.slot)}${item('Proposed package',`${b.sessions} sessions · ${money(b.price)}`)}</div><button class="button primary" id="activate-course">Simulate tutor approval + package enrollment →</button><p class="fine-print">Clicking simulates required approval and payment for this demo. It does not charge money.</p></div>`;
 $('#activate-course').addEventListener('click',()=>{
  mutate(s=>{
   const source=s.booking;
   s.student.course={id:'course-'+Date.now(),title:source.title,tutorId:t.id,tutorName:t.name,subject:t.subject,sessions:source.sessions,completed:0,price:source.price,started:true,nextLesson:DAYS.find(x=>x.id===source.slot)?.name||source.slot,source:'TutorPair'};
   s.tutor.roster.push({studentId:s.student.id,name:s.student.name,grade:s.student.request.grade,subject:t.subject,source:'TutorPair'});
   if(source.groupId){let g=s.catalog.groups.find(g=>g.id===source.groupId);if(g&&g.byos+g.platform<g.capacity){g.platform++;s.tutor.groups.push(g.id)}}
   s.booking.status='enrolled-demo';
  });location.href='/student/dashboard.html';
 });
}
function courses(){const s=state(),c=s.student.course;if(!c)return workspace('student','courses','My courses','Your courses appear here after enrollment.',empty('No courses yet','You can enroll after selecting a tutor and confirming your first lesson.',btn('Start matching →','/student/request.html')));
 workspace('student','courses','My courses','Your current course package, schedule and progress.',`<div class="two-col big-left">${panel('Current course',`<div class="course-header">${avatar('MA','lavender','large')}<div><h2>${esc(c.title)}</h2><p>${esc(c.tutorName)} · Online learning</p></div>${tag('Active','green')}</div>${item('Next lesson',esc(c.nextLesson))}${item('Course package',`${c.sessions} lessons · ${money(c.price)}`)}<div class="between"><span>Learning sessions</span><strong>${c.completed}/${c.sessions}</strong></div>${progress(c.completed/c.sessions*100)}<div class="row-actions">${btn('Progress report →','/student/progress.html')}</div>`)}${panel('Lesson resources',`${item('Learning plan','Tutor-approved learning objectives')}${item('Session notes','Appear after lessons are recorded')}${item('Virtual classroom','Google Meet / Zoom link would appear here')}<p class="fine-print">Video meeting links and worksheets are placeholders.</p>`)}</div>`);
}
function studentProgress(){const s=state(),c=s.student.course;if(!c)return workspace('student','progress','Learning progress','No course to track yet.',empty('No progress records yet','Progress tracking begins once the student enrolls in a course.',btn('Find a tutor','/student/request.html')));
 const notes=s.notes.filter(n=>!n.studentId||n.studentId===s.student.id),latest=notes.at(-1);const plan=planFor(s,s.student.id);
 workspace('student','progress','Learning progress','Lesson outcomes, feedback and topic mastery grow throughout the course.',`<div class="stats-grid">${stat('Lessons completed',`${c.completed}/${c.sessions}`,'Course sessions','▤')}${stat('Latest quiz',latest?`${latest.score}/${latest.total}`:'—','From tutor notes','▥')}${stat('Course progress',`${Math.round(c.completed/c.sessions*100)}%`,'Learning sessions','◫')}${stat('Topic notes',`${notes.length}`,'Tutor entries','✎')}</div><div class="two-col">${panel('Latest tutor notes',latest?`${tag('SESSION UPDATE','green')}<h3 class="note-heading">${esc(latest.topic)}</h3>${item('What went well',esc(latest.strength))}${item('Needs more practice',esc(latest.improve))}${item('Next homework',esc(latest.homework))}`:empty('First lesson coming soon','Your tutor will record observations and quiz results after each session.'))}${panel('Course progress',`<div class="between"><span>${esc(c.title)}</span><b>${c.completed}/${c.sessions}</b></div>${progress(c.completed/c.sessions*100)}<div class="mini-tips">The quiz scores shown are tutor-entered records. They are not proof of a guaranteed grade increase.</div>`)}</div>${panel('Learning plan objectives (tutor-entered)',plan.length?`<div class="between"><span>Objectives completed, not mastery</span><b>${planProgress(plan)}%</b></div>${progress(planProgress(plan))}${plan.map(x=>item((x.completed?'✓ ':'○ ')+esc(x.title),x.completed?'Completed by tutor':'Still in progress')).join('')}`:empty('Learning plan not set yet','Your tutor can add objectives once teaching begins.'))}`);
}
