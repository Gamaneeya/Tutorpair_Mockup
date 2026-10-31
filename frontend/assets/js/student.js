import {state,mutate,activeCourse,studentCourses,addStudentCourse,seedBYOSStudentPreview} from './store.js';
import {DAYS,SUBJECTS,GRADES,GOALS} from '../data/mock-data.js';
import {QUESTIONS} from './preferences.js';
import {planFor,planProgress} from './plans.js';
import {matchTutors,matchGroups,WEIGHTS,descriptions} from './matching.js';
import {$,$$,workspace,esc,money,tag,btn,avatar,progress,panel,stat,empty,item,formSelect,field,choices,feedback} from './ui.js';
const q=(k)=>new URLSearchParams(location.search).get(k);
const getTutor=(s,id)=>s.catalog.tutors.find(x=>x.id===id);
const label=(key)=>({step:'Step-by-step explanations',practice:'Practice drills',concept:'Concept building',encouraging:'Encouraging guidance',independent:'Let me try independently',slow:'Slow & detailed',medium:'Moderate pace',fast:'Fast-paced'})[key]||key;
export function renderStudent(page){
 if(page==='dashboard')return dashboard();
 if(page==='request')return request();
 if(page==='matching')return matching();
 if(page==='tutor')return profile();
 if(page==='booking')return booking();
 if(page==='courses')return courses();
 if(page==='progress')return studentProgress();
}
function courseCard(c){
 const pct=c.sessions>0?100*c.completed/c.sessions:0;
 return `<article class="byos-course"><div class="between"><div><div class="eyebrow">${esc(c.grade||'M.4')} · ${esc(c.subject)}</div><h3>${esc(c.title)}</h3></div>${tag('Active','green')}</div><p>${esc(c.tutorName)} · ${esc(c.nextLesson||'Weekly online lesson')}</p><div class="byos-card-foot">${tag(c.source==='BYOS'?'Joined by tutor invitation':'TutorPair Matching',c.source==='BYOS'?'purple':'green')}<span>${Number(c.completed||0)}/${Number(c.sessions||8)} lessons</span></div>${progress(pct)}<div class="row-actions"><a href="/student/progress.html?course=${encodeURIComponent(c.id)}" class="byos-progress-link">See progress →</a></div></article>`;
}
function dashboard(){
 const s=state(),stud=s.student,cs=studentCourses(s).filter(c=>c.started);
 if(!cs.length){
  workspace('student','dashboard',`Welcome to TutorPair${stud.name==='New Student'?'':', '+esc(stud.name)}!`,'One Student account for both tutor invitations and matching.',
   `<section class="welcome new"><div><div class="welcome-kicker">✦ LEARN YOUR WAY</div><h2>Join an invited class or find your first tutor.</h2><p>Already learning with a tutor? Use the invitation link they sent. Or search for a tutor here — no separate BYOS account needed.</p><div class="actions">${btn('Find a tutor →','/student/request.html','white')}${btn('Join a class →','/join.html','soft-white')}</div></div><div class="empty-illustration">✧<span>0 active classes</span></div></section>
   <div class="stats-grid">${stat('Active classes',0,'Across all tutors','▤')}${stat('Courses via invitation',0,'Existing teachers','♧')}${stat('TutorPair matches',0,'New subject tutors','◎')}${stat('Learning profile',stud.request?'Saved':'Optional','Filled when you need a match','✎')}</div>
   ${panel('Show the BYOS journey to your team',`<p class="muted">For a fast preview, load one <b>sample Math class</b> into this Student dashboard. Then choose Find Another Tutor and request Physics. This action is demo-only and does not contact a real tutor.</p><button class="button primary" id="load-byos-sample">Load sample BYOS Mathematics class →</button><div class="policy-note">For the fully interactive invite-link journey, use two registered accounts in the same browser (Tutor creates invitation → Student accepts).</div>`)}`);
  $('#load-byos-sample')?.addEventListener('click',()=>{seedBYOSStudentPreview();location.reload()});
  return;
 }
 const last=s.notes.at(-1);
 workspace('student','dashboard',`Welcome back, ${esc(stud.name)}!`,'Your invited classes and TutorPair tutors are all in one place.',
 `<section class="welcome"><div><div class="welcome-kicker">✦ ONE STUDENT ACCOUNT</div><h2>Learn with your tutor. Explore other subjects anytime.</h2><p>${cs.length} active class${cs.length===1?'':'es'} · No need to register again when you find another tutor.</p><div class="actions">${btn('Find Another Tutor →','/student/request.html','white')}${btn('My classes →','/student/courses.html','soft-white')}</div></div><div class="empty-illustration">✧<span>One student account</span></div></section>
 <div class="stats-grid">${stat('Active classes',cs.length,'Invited + marketplace courses','▤')}${stat('My tutors',new Set(cs.map(c=>c.tutorId||c.tutorName)).size,'Across all subjects','♧')}${stat('Invited courses',cs.filter(c=>c.source==='BYOS').length,'Joined from a tutor link','✉')}${stat('TutorPair courses',cs.filter(c=>c.source!=='BYOS').length,'Found through matching','◎')}</div>
 ${panel('My classes',`<div class="byos-course-grid">${cs.map(courseCard).join('')}</div><div class="row-actions">${btn('Find Another Tutor →','/student/request.html')}${btn('See all courses →','/student/courses.html','outline')}</div>`)}
 ${panel('Your next step',`${item('Find another subject','Want Physics, English or something else? We reuse your Student account and saved preferences.',btn('Start matching →','/student/request.html','outline'))}${item('Join by invitation','If another tutor sends you a class link, join it from this account.',btn('Enter invite →','/join.html','outline'))}`)}
 `);
}
function request(){
 const s=state(),prior=s.student.request||{},enrolled=studentCourses(s);
 if(!prior.grade&&enrolled.length)prior.grade=enrolled.at(-1).grade||s.student.grade;
 if(!prior.subject&&enrolled.length)prior.subject=enrolled.at(-1).subject==='Physics'?'Mathematics':'Physics';
 const prefSelect=(q)=>formSelect(q.key,q.label,[{value:'any',label:'No strong preference (skip)'},...q.options.map(([value,label])=>({value,label}))],prior[q.key]||'any');
 const html=`<div class="wizard-top"><div class="wizard-tabs"><span class="on" data-step-label="0">1. School goals</span><span data-step-label="1">2. Three quick preferences</span><span data-step-label="2">3. Schedule & budget</span></div><div class="small">3 short steps · no personality test</div></div>
 <div class="two-col form-split"><section class="panel"><form id="request-form" novalidate>
 <div class="wizard-page" data-step="0"><div class="form-intro"><h2>What would you like to improve?</h2><p>We only need your subject, school grade and academic goal to begin.</p></div>
 <div class="form-grid">${formSelect('grade','Your school year',GRADES,prior.grade||s.student.grade||'M.4')}${formSelect('subject','Subject',SUBJECTS,prior.subject||'Mathematics')}</div>
 ${formSelect('goalType','Main learning goal',GOALS,prior.goalType||'school-grade')}
 <div class="form-grid">${formSelect('currentGrade','Current school grade (optional)', ['Not sure','1.0','1.5','2.0','2.5','3.0','3.5','4.0'],prior.currentGrade||'Not sure')}${formSelect('targetGrade','Target school grade (optional)',['Not sure','2.0','2.5','3.0','3.5','4.0'],prior.targetGrade||'Not sure')}</div>
 ${formSelect('currentLevel','Current understanding',[{value:'foundation',label:'Need to build foundations'},{value:'intermediate',label:'Understand most topics with some help'},{value:'advanced',label:'Ready for challenging questions'}],prior.currentLevel||'foundation')}
 <label class="field"><span>Anything your tutor should know? (optional)</span><textarea name="goal" rows="2" placeholder="For example: I want to feel more confident for school exams">${esc(prior.goal||'')}</textarea></label>
 <label class="field"><span>School worksheet / syllabus (optional)</span><input name="worksheet" type="file" accept=".pdf,.png,.jpg,.jpeg"><small>File name only in this demo. No upload or AI analysis is performed.</small></label></div>
 <div class="wizard-page" data-step="1" hidden><div class="form-intro"><h2>How do you like to learn?</h2><p>Just three quick questions. Tutors describe the same three attributes, so we can compare both sides.</p></div>
 <div class="simple-preferences">${QUESTIONS.map((q,i)=>`<div class="preference-choice"><span class="preference-index">0${i+1}</span>${prefSelect(q)}</div>`).join('')}</div>
 <div class="policy-note">These are preferences, not fixed learning-style labels. You can change them later.</div></div>
 <div class="wizard-page" data-step="2" hidden><div class="form-intro"><h2>Find a class you can actually attend.</h2><p>Budget, class type and available times are required filters — no unsuitable tutors in the results.</p></div>
 ${formSelect('format','Class format',[{value:'one',label:'Online 1-on-1'},{value:'group',label:'Online small group (2–5 learners)'}],prior.format||'one')}
 <div class="field"><span>When can you learn? (choose at least one)</span>${choices('schedule',DAYS.map(x=>[x.id,x.name]),prior.schedule||['thu','sat'])}</div>
 ${field('budget','Maximum budget (THB per hour)',prior.budget||500,'number')}
 <div class="policy-note">✧ Subject, grade, format, budget and schedule are hard filters. Weighted scoring ranks only eligible options. AI-generated wording is planned; this demo uses rules and sample data.</div></div>
 <div class="wizard-actions"><button type="button" class="button outline" id="wizard-back" hidden>← Back</button><button type="button" class="button primary" id="wizard-next">Continue →</button><button type="submit" class="button primary" id="wizard-submit" hidden>Find my Top 3 →</button></div><div id="form-error" class="form-message"></div></form></section>
 <aside class="panel sidebar-tips"><div class="tip-icon">✧</div><h3>How matching works</h3>${item('01 · Filter','Subject, grade, format, budget and time must work')}${item('02 · Compare','Goal, level, pace and 3 quick preferences')}${item('03 · Choose','Compare up to three eligible tutors or classes')}<div class="mini-tips">We never require specific topics or a 9-question personality questionnaire to find a tutor.</div></aside></div>`;
 workspace('student','request','Find your tutor','A shorter request form — only the answers needed for our MVP matching.',html);
 let step=0;const pages=$$('.wizard-page');
 function showStep(){pages.forEach((n,i)=>n.hidden=i!==step);$$('[data-step-label]').forEach((n,i)=>n.classList.toggle('on',i<=step));$('#wizard-back').hidden=step===0;$('#wizard-next').hidden=step===2;$('#wizard-submit').hidden=step!==2;feedback('#form-error','');}
 $('#wizard-back').addEventListener('click',()=>{step--;showStep()});
 $('#wizard-next').addEventListener('click',()=>{
  const visible=pages[step];if([...visible.querySelectorAll('textarea[required],input[required],select[required]')].some(el=>!el.checkValidity())){feedback('#form-error','Complete the required fields.','error');return;}
  step++;showStep();
 });
 $('#request-form').addEventListener('submit',e=>{
  e.preventDefault();const form=e.currentTarget,fd=new FormData(form),data={};
  for(const [k,v] of fd.entries()){if(k==='schedule')(data[k]??=[]).push(v);else if(k==='worksheet')data.worksheetName=v?.name||'';else data[k]=v;}
  data.budget=Number(data.budget);if(!data.schedule?.length){feedback('#form-error','Choose at least one available day.','error');return;}
  if(!(data.budget>0)){feedback('#form-error','Enter a valid maximum budget.','error');return;}
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
 return `<article class="match-card"><div class="match-upper"><span class="rank">#${i+1}</span>${avatar(tutor.initials,tutor.color,'large')}<div class="match-info"><h3>${esc(r.format==='group'?m.name:tutor.name)}</h3><p>${esc(tutor.subject)} · ${esc(r.format==='group'?m.grade:tutor.grades.join(' / '))}</p><span class="match-sub">${esc(tutor.university)}</span></div><div class="score"><strong>${m.fit.score}%</strong><small>fit score</small></div></div><div class="match-lower"><div><div class="card-eyebrow">WHY THIS MATCH?</div>${why}<div class="match-preference-note">3-question preference fit: ${m.fit.preferenceScore}/100 (example)</div></div><div class="match-cost"><strong>${money(r.format==='group'?m.price:tutor.price)}</strong><small>${r.format==='group'?'per student / package':'per hour'}</small><button class="button primary match-pick" data-pick="${esc(m.id)}">View details →</button></div></div></article>`;
 }).join('')}</div><details class="panel explain"><summary>How were these scores calculated? <span>See weighted breakdown</span></summary><div class="weights-grid">${Object.keys(WEIGHTS).map(k=>`<div><b>${descriptions[k]}</b><strong>${WEIGHTS[k]*100}%</strong></div>`).join('')}</div><p>Each eligible option receives sub-scores from 0–100. The weighted score is a ranking aid, not a scientific prediction of grades. All tutor credentials are mock data.</p></details>`;
 $$('.match-pick').forEach(b=>b.addEventListener('click',()=>{
  mutate(s=>{if(r.format==='group'){s.selectedGroupId=b.dataset.pick;s.selectedTutorId=s.catalog.groups.find(g=>g.id===b.dataset.pick)?.tutorId}else{s.selectedTutorId=b.dataset.pick;s.selectedGroupId=null}});
  location.href='/student/tutor.html';
 }));
}
function profile(){const s=state(),id=s.selectedTutorId,t=id&&getTutor(s,id);
 if(!t)return workspace('student','matching','Tutor profile','Choose a match first.',empty('No tutor selected','Please select a tutor or class from your matches.',btn('View matches →','/student/matching.html')));
 const group=s.selectedGroupId?s.catalog.groups.find(g=>g.id===s.selectedGroupId):null;
 workspace('student','matching','Tutor details','Review the teaching approach before you book.',`<div class="two-col big-left">${panel('Meet your tutor',`<div class="profile-hero">${avatar(t.initials,t.color,'huge')}<div><div class="eyebrow">PROFILE EXAMPLE</div><h2>${esc(t.name)}</h2><p>${esc(t.subject)} · ${esc(t.university)}</p>${tag('Screened (demo)','green')}</div></div><p>${esc(t.about)}</p>${item('Teaching approach',t.approach.map(label).join(', '))}${item('Learning pace',t.pace.map(label).join(', '))}${item('Available schedule',t.schedule.map(id=>DAYS.find(x=>x.id===id)?.name||id).join('; '))}`)}${panel(group?'Group course details':'Book your first lesson',`<div class="big-price">${money(group?group.price:t.price)} <small>${group?'per student / package':'/ hour'}</small></div>${group?`<h3>${esc(group.name)}</h3><p>${esc(group.description)}</p>${item('Available places',`${group.capacity-group.byos-group.platform} open / ${group.capacity} total`)}`:`<p>Choose a time with your tutor, then confirm your course package.</p>`}<div class="row-actions">${btn('Request a lesson →','/student/booking.html')}</div><p class="fine-print">No real money or tutor contact occurs in this prototype.</p>`)}</div>`);
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
   addStudentCourse(s,{id:'course-'+crypto.randomUUID(),title:source.title,tutorId:t.id,tutorName:t.name,subject:t.subject,grade:s.student.request?.grade||s.student.grade||'M.4',sessions:source.sessions,completed:0,price:source.price,started:true,nextLesson:DAYS.find(x=>x.id===source.slot)?.name||source.slot,source:'TutorPair'});
   s.tutor.roster.push({studentId:s.student.id,name:s.student.name,grade:s.student.request.grade,subject:t.subject,source:'TutorPair'});
   if(source.groupId){let g=s.catalog.groups.find(g=>g.id===source.groupId);if(g&&g.byos+g.platform<g.capacity){g.platform++;s.tutor.groups.push(g.id)}}
   s.booking.status='enrolled-demo';
  });location.href='/student/dashboard.html';
 });
}
function courses(){
 const s=state(),cs=studentCourses(s).filter(c=>c.started);
 if(!cs.length)return workspace('student','courses','My classes','All your classes appear here after you enroll.',empty('No classes yet','Join a class from your tutor invitation or use matching to find one.',btn('Find a tutor →','/student/request.html')));
 workspace('student','courses','My classes','Your invited classes and marketplace classes are all together.',
 `<div class="stats-grid">${stat('All classes',cs.length,'One Student account','▤')}${stat('BYOS classes',cs.filter(c=>c.source==='BYOS').length,'From your existing tutors','✉')}${stat('TutorPair classes',cs.filter(c=>c.source!=='BYOS').length,'From new tutor matches','◎')}${stat('Subjects',new Set(cs.map(c=>c.subject)).size,'Across your timetable','◫')}</div>
 ${panel('Enrolled classes',`<div class="byos-course-grid">${cs.map(courseCard).join('')}</div><div class="row-actions">${btn('Find Another Tutor →','/student/request.html')}${btn('Join another invite →','/join.html','outline')}</div>`)}<div class="policy-note">BYOS and TutorPair are enrollment sources, not different student account types. Parent progress linking and payments require a real backend.</div>`);
}
function studentProgress(){const s=state(),cs=studentCourses(s),c=cs.find(x=>x.id===q('course'))||cs.at(-1);if(!c)return workspace('student','progress','Learning progress','No course to track yet.',empty('No progress records yet','Progress tracking begins once the student enrolls in a course.',btn('Find a tutor','/student/request.html')));
 const notes=s.notes.filter(n=>!n.studentId||n.studentId===s.student.id),latest=notes.at(-1);const plan=planFor(s,s.student.id);
 workspace('student','progress','Learning progress','Session history and learning progress are examples for the selected course. Real tutor-to-student reports need a shared backend.',`<div class="stats-grid">${stat('Lessons completed',`${c.completed}/${c.sessions}`,'Course sessions','▤')}${stat('Latest quiz',latest?`${latest.score}/${latest.total}`:'—','From tutor notes','▥')}${stat('Course progress',`${Math.round(c.completed/c.sessions*100)}%`,'Learning sessions','◫')}${stat('Topic notes',`${notes.length}`,'Tutor entries','✎')}</div><div class="two-col">${panel('Latest tutor notes',latest?`${tag('SESSION UPDATE','green')}<h3 class="note-heading">${esc(latest.topic)}</h3>${item('What went well',esc(latest.strength))}${item('Needs more practice',esc(latest.improve))}${item('Next homework',esc(latest.homework))}`:empty('First lesson coming soon','Your tutor will record observations and quiz results after each session.'))}${panel('Course progress',`<div class="between"><span>${esc(c.title)}</span><b>${c.completed}/${c.sessions}</b></div>${progress(c.completed/c.sessions*100)}<div class="mini-tips">The quiz scores shown are tutor-entered records. They are not proof of a guaranteed grade increase.</div>`)}</div>${panel('Learning plan objectives (tutor-entered)',plan.length?`<div class="between"><span>Objectives completed, not mastery</span><b>${planProgress(plan)}%</b></div>${progress(planProgress(plan))}${plan.map(x=>item((x.completed?'✓ ':'○ ')+esc(x.title),x.completed?'Completed by tutor':'Still in progress')).join('')}`:empty('Learning plan not set yet','Your tutor can add objectives once teaching begins.'))}`);
}
