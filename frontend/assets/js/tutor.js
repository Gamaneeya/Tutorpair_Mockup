import {state,mutate,tutorIsActive} from './store.js';
import {DAYS,SUBJECTS,GRADES,TOPICS,GOALS,COURSE_FOCUS} from '../data/mock-data.js';
import {sliderFields,bindSliderReadings,readSliders,neutralPreferences} from './preferences.js';
import {planFor,planProgress,ensurePlan} from './plans.js';
import {tutorOfferings} from './matching.js';
import {$,$$,workspace,esc,money,tag,btn,avatar,progress,panel,stat,empty,item,formSelect,field,choices,feedback} from './ui.js';
const listToLabel=(a)=>a.map(x=>DAYS.find(d=>d.id===x)?.name||x).join('; ');
export function renderTutor(page){if(page==='dashboard')return dashboard();if(page==='onboarding')return onboarding();if(page==='verification')return verification();if(page==='requests')return requests();if(page==='groups')return groups();if(page==='notes')return notes();if(page==='subjects')return subjects();if(page==='students')return students();}
function dashboard(){const s=state(),t=s.tutor;
 if(!tutorIsActive(s)){
  const status=t.verificationStatus||'not_started',hasProfile=Boolean(t.profile);
  const approved=status==='approved', pending=status==='pending';
  const activeGroup=t.groups.length;
  const primary=!hasProfile?btn('Complete tutor profile →','/tutor/onboarding.html','white'):
   !approved?btn(pending?'View verification status →':'Submit for verification →','/tutor/verification.html','white'):
   btn('Open your first group →','/tutor/groups.html','white');
  workspace('tutor','dashboard',`Welcome, ${esc(t.name)}!`,approved?'Your tutor account is approved. Open a class or review a student request.':pending?'Your tutor application is awaiting demo admin approval.':'Build your teaching profile and verify your eligibility.',
  `<section class="welcome tutor-welcome"><div><div class="welcome-kicker">✦ YOUR TEACHING JOURNEY</div><h2>${!hasProfile?'Start by telling us what you teach.':pending?'Your application is under review.':approved?'Ready to welcome your first student?':'One final step before you teach.'}</h2><p>${approved?'Your dashboard fills up as you add BYOS learners or accept new TutorPair students.':pending?'Admin review is simulated for this pitch; no real documents or verification are processed.':'Tell us about your teaching expertise, then complete the screening steps.'}</p><div class="actions">${primary}${approved?btn('View student requests','/tutor/requests.html','soft-white'):''}</div></div><div class="empty-illustration">✎<span>${activeGroup?`${activeGroup} class${activeGroup===1?'':'es'} open`:'0 active students'}</span></div></section>
  <div class="stats-grid">${stat('Active students','0','No confirmed learners yet','♧')}${stat('Upcoming lessons','0','Not booked yet','▦')}${stat('Group classes',activeGroup,'Open or scheduled','◫')}${stat('Earnings','฿0','No paid lessons recorded','฿')}</div>
  <div class="two-col">${panel('Tutor onboarding checklist',`${item('01 · Teaching profile',hasProfile?'Subject, teaching approach and availability completed':'Complete your teaching details',tag(hasProfile?'Complete':'To do',hasProfile?'green':'orange'))}${item('02 · Tutor verification',approved?'Approved in demo':pending?'Awaiting simulated review':'Identity, academic check and teaching demo',tag(approved?'Approved':pending?'Pending':'To do',approved?'green':pending?'purple':'orange'))}${item('03 · Open for students',approved?(activeGroup?'Small group published':'Create a small group or accept requests'):'Available after approval',tag(activeGroup?'Published':approved?'Ready':'Locked',activeGroup?'green':'purple'))}`)}${panel('Choose how to get students',`${item('1-on-1 matching','Open availability, receive compatible student requests')}${item('Small group','Create a class and let TutorPair fill empty seats')}${item('Bring Your Own Students','Invite existing students with 0% marketplace commission')}`)}</div>`);
  return;
 }
 const roster=t.roster.length,gcount=t.groups.length;
 workspace('tutor','dashboard',`Welcome back, ${esc(t.name)}!`,'Your teaching activity, students and upcoming work in one place.',
 `<section class="welcome tutor-welcome"><div><div class="welcome-kicker">✦ YOUR TEACHING SPACE</div><h2>Keep your classes running smoothly.</h2><p>View your roster, add small-group seats, and share learning updates with families.</p><div class="actions">${btn('Write a session note →','/tutor/notes.html','white')}${btn('My students & plans','/tutor/students.html','soft-white')}</div></div><div class="empty-illustration">✎<span>${roster} learners</span></div></section>
 <div class="stats-grid">${stat('Active students',roster,'TutorPair and BYOS students','♧')}${stat('Upcoming lessons',Math.max(1,roster),'Example upcoming sessions','▦')}${stat('Group classes',gcount,'Open or scheduled groups','◫')}${stat('Reported sessions',s.notes.length,'Session notes saved in demo','✎')}</div>
 <div class="two-col">${panel('Your students',roster?t.roster.map(r=>item(esc(r.name),`${esc(r.grade)} ${esc(r.subject)}`,tag(r.source,r.source==='BYOS'?'purple':'green'))).join(''):empty('No students yet','Open a class to begin.'))}${panel('Next actions',`${item('Learning plans','Track goal completion for each learner',btn('Open plans →','/tutor/students.html','outline'))}${item('Lesson notes','Capture progress and next steps',btn('Write notes →','/tutor/notes.html','outline'))}${item('Small-group seats','Invite your own students or add capacity',btn('Manage groups →','/tutor/groups.html','outline'))}${item('New student requests','Review a potential learner',btn('See requests →','/tutor/requests.html','outline'))}`)}</div>`);
}
function onboarding(){
 const s=state(),p=s.tutor.profile||{},cred=p.credentials||{},off=s.tutor.offerings?.[0];
 const teaching=`<div class="wizard-page" data-step="1" hidden><div class="form-intro"><h2>What can you teach?</h2><p>Subjects, school levels and times are hard filters for Student Matching.</p></div>
 ${formSelect('subject','Primary subject',SUBJECTS,p.subjects?.[0]||'Mathematics')}
 <div class="field"><span>Grades you teach</span>${choices('grades',GRADES.map(g=>[g,g]),p.grades||['M.4','M.5','M.6'])}</div>
 <div class="field"><span>Specific topics you cover</span><div id="tutor-topic-list">${choices('topics',(TOPICS[p.subjects?.[0]||'Mathematics']||[]).map(x=>[x,x]),p.topics||['Algebra','Functions','Word Problems'])}</div></div>
 ${formSelect('goalType','Primary student goal',GOALS,off?.goalType||'school-grade')}
 ${formSelect('courseFocus','Course focus',COURSE_FOCUS,off?.courseFocus||'Midterm exam')}
 <div class="field"><span>Student levels you support</span>${choices('levels',[['foundation','Building foundations'],['intermediate','Intermediate'],['advanced','Advanced']],p.levels||['foundation','intermediate'])}</div>
 <div class="field"><span>Teaching pace options</span>${choices('pace',[['slow','Slow & detailed'],['medium','Moderate'],['fast','Fast paced']],p.pace||['slow','medium'])}</div>
 <div class="field"><span>Teaching approach</span>${choices('approach',[['step','Step-by-step'],['practice','Practice / exam drills'],['concept','Concept discussion']],p.approach||['step','practice'])}</div>
 <div class="field"><span>Interaction approach</span>${choices('interaction',[['encouraging','Encouraging and supportive'],['independent','Let students try independently']],p.interaction||['encouraging'])}</div>
 <div class="field"><span>Available slots</span>${choices('schedule',DAYS.map(x=>[x.id,x.name]),p.schedule||['thu','sat'])}</div>
 <div class="form-grid">${field('price','Hourly rate (THB)',p.price||450,'number')}${formSelect('format','Formats',[{value:'one',label:'Online 1-on-1'},{value:'both',label:'1-on-1 and small group'}],p.formats?.includes('group')?'both':'one')}</div>
 </div>`;
 const html=`<div class="wizard-top"><div class="wizard-tabs"><span class="on" data-step-label="0">1. About you</span><span data-step-label="1">2. Subjects & availability</span><span data-step-label="2">3. Teaching sliders</span></div><div class="small">First-time tutor onboarding</div></div>
 <div class="two-col form-split">${panel('Create your teaching profile',`<form id="tutor-profile" novalidate>
 <div class="wizard-page" data-step="0"><div class="form-intro"><h2>Introduce yourself</h2><p>Only a display name and example professional background are used in this demo. Do not enter actual identity numbers.</p></div>
 ${field('name','Public tutor name',s.tutor.name==='New Tutor'?'P’New Tutor':s.tutor.name)}
 ${field('institution','Institution / education (demo)',cred.institution||'Example university')}
 ${field('experienceYears','Years of tutoring experience',cred.experienceYears||'1','number')}
 <label class="field"><span>Teaching introduction</span><textarea name="intro" required rows="4">${esc(cred.intro||'I explain school topics patiently and guide students through practice.')}</textarea></label>
 </div>${teaching}
 <div class="wizard-page" data-step="2" hidden><div class="form-intro"><h2>Your teaching and interaction preferences</h2><p>From the legacy Tutor Form: 5 teaching axes + 4 interaction/personality axes, measured on the exact same 1–5 scale as Student.</p></div>${sliderFields('tutorPref',p.preferences||neutralPreferences())}<div class="policy-note">Your answers help describe teaching preferences. They do not prove a particular learning style causes higher grades.</div></div>
 <div class="wizard-actions"><button type="button" class="button outline" id="tutor-back" hidden>← Back</button><button type="button" class="button primary" id="tutor-next">Continue →</button><button type="submit" class="button primary" id="tutor-save" hidden>Save profile → Teaching subjects</button></div><p id="profile-msg" class="form-message"></p></form>`)}
 ${panel('Profile checklist',`${item('01 · About you','Display name and educational background')}${item('02 · Teaching details','Subjects, grades, goal, price and schedule')}${item('03 · 9 shared sliders','Student–Tutor comparable teaching attributes')}${item('04 · Teaching catalog','Add more subjects and courses on the next page')}${item('05 · Verification','Only approved tutors enter the public match list')}<div class="policy-note">Changing an approved profile returns it to the demo review queue.</div>`)}</div>`;
 workspace('tutor','onboarding','Tutor profile & onboarding','Create a tutor profile that the matching engine can actually compare.',html);
 const form=$('#tutor-profile');bindSliderReadings(form);let index=0;const pages=$$('.wizard-page',form);
 const show=()=>{pages.forEach((el,i)=>el.hidden=i!==index);$$('[data-step-label]').forEach((el,i)=>el.classList.toggle('on',i<=index));$('#tutor-back').hidden=index===0;$('#tutor-next').hidden=index===2;$('#tutor-save').hidden=index!==2;feedback('#profile-msg','');};
 $('#tutor-back').addEventListener('click',()=>{index--;show()});
 $('#tutor-next').addEventListener('click',()=>{
  if([...pages[index].querySelectorAll('[required]')].some(el=>!el.checkValidity())){feedback('#profile-msg','Complete the required fields.','error');return;}
  if(index===1&&['grades','topics','levels','pace','approach','interaction','schedule'].some(name=>!pages[index].querySelector(`input[name="${name}"]:checked`))){feedback('#profile-msg','Choose at least one option for each teaching requirement.','error');return;}
  index++;show();
 });
 $('select[name="subject"]',form).addEventListener('change',e=>{$('#tutor-topic-list').innerHTML=choices('topics',(TOPICS[e.target.value]||[]).map(x=>[x,x]),[])});
 form.addEventListener('submit',e=>{
  e.preventDefault();if(index!==2)return;
  const fd=new FormData(form),data={};
  for(const [k,v] of fd){if(k.startsWith('tutorPref-'))continue;if(['grades','topics','levels','pace','approach','interaction','schedule'].includes(k))(data[k]??=[]).push(v);else data[k]=v;}
  if(['grades','topics','levels','pace','approach','interaction','schedule'].some(k=>!data[k]?.length)){feedback('#profile-msg','Please complete all teaching requirements.','error');return;}
  data.price=Number(data.price);if(!(data.price>0)||Number(data.experienceYears)<0){feedback('#profile-msg','Please enter valid price and experience values.','error');return;}
  data.credentials={institution:data.institution,experienceYears:data.experienceYears,intro:data.intro};
  data.preferences=readSliders(fd,'tutorPref');data.subjects=[data.subject];data.formats=data.format==='both'?['one','group']:['one'];
  const first={id:'primary-'+Date.now(),subject:data.subject,grades:data.grades,topics:data.topics,goalType:data.goalType,courseFocus:data.courseFocus,price:data.price,formats:data.formats,schedule:data.schedule};
  mutate(st=>{
   st.tutor.name=data.name;
   st.tutor.profile=data;
   st.tutor.offerings=[first,...(st.tutor.offerings||[]).filter(o=>o.subject!==first.subject)];
   st.tutor.verificationStatus='draft';st.tutor.verification=null;
   const prior=st.catalog.tutors.find(t=>t.id==='t-new');
   const model={id:'t-new',name:data.name,initials:data.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),color:'mint',subject:first.subject,grades:first.grades,topics:first.topics,price:first.price,goals:[data.goalType],levels:data.levels,pace:data.pace,approach:data.approach,interaction:data.interaction,schedule:data.schedule,formats:data.formats,preferences:data.preferences,offerings:st.tutor.offerings,quality:70,university:data.institution,experience:data.experienceYears+' years tutoring',about:data.intro,verified:false};
   if(prior)Object.assign(prior,model);else st.catalog.tutors.push(model);
  });location.href='/tutor/subjects.html';
 });
}
function subjects(){
 const s=state(),t=s.tutor;if(!t.profile)return workspace('tutor','subjects','Teaching subjects','Complete your main tutor profile first.',empty('Tutor profile required','Add your professional background and initial teaching details.',btn('Start onboarding →','/tutor/onboarding.html')));
 const offeringRows=(t.offerings||[]).map(o=>`<div class="offer-card"><div class="between"><strong>${esc(o.subject)} · ${esc(o.grades.join(', '))}</strong>${tag(o.formats.includes('group')?'1-on-1 + Group':'1-on-1','purple')}</div><p>Goal: ${esc(GOALS.find(g=>g.value===o.goalType)?.label||'School support')} · ${esc(o.courseFocus)}</p><p>Topics: ${esc(o.topics.join(' · '))}</p><div class="between"><span>${money(o.price)}/hour · ${esc(o.schedule.map(x=>DAYS.find(d=>d.id===x)?.name||x).join(' · '))}</span><button class="button outline remove-offering" data-offer="${esc(o.id)}">Remove</button></div></div>`).join('');
 const html=`<div class="two-col big-left">${panel('Your teaching catalog',`${offeringRows||empty('No subjects added yet','Your first tutor profile should create a subject listing.')}<p class="fine-print">Only verified tutors with eligible subject, grade, slot, price and format appear in Student Matching.</p><div class="row-actions">${btn('Continue to verification →','/tutor/verification.html','primary')}</div>`)}${panel('Add another subject or course',`<div class="wizard-tabs offering-tabs"><span data-offering-step="0" class="on">1. Category</span><span data-offering-step="1">2. Subject</span><span data-offering-step="2">3. Goal</span><span data-offering-step="3">4. Course focus</span><span data-offering-step="4">5. Details</span></div>
 <form id="offer-form" novalidate><div class="wizard-page" data-offer-page="0">${formSelect('category','Subject category',[{value:'Math',label:'Mathematics'},{value:'Science',label:'Science'},{value:'Languages',label:'Languages'},{value:'Social',label:'Social Studies'}],'Math')}</div>
 <div class="wizard-page" data-offer-page="1" hidden>${formSelect('subject','Specific subject',[{value:'Mathematics',label:'Mathematics'}],'Mathematics')}</div>
 <div class="wizard-page" data-offer-page="2" hidden>${formSelect('goalType','Learning goal',GOALS,'school-grade')}</div>
 <div class="wizard-page" data-offer-page="3" hidden>${formSelect('courseFocus','Specific course / school assessment',COURSE_FOCUS,'Midterm exam')}</div>
 <div class="wizard-page" data-offer-page="4" hidden><div class="field"><span>Eligible grades</span>${choices('grades',GRADES.map(g=>[g,g]),['M.4'])}</div><div class="field"><span>Topics taught</span><div id="offer-topic-options">${choices('topics',TOPICS.Mathematics.map(x=>[x,x]),['Algebra'])}</div></div><div class="field"><span>Available class times</span>${choices('schedule',DAYS.map(x=>[x.id,x.name]),['thu'])}</div><div class="form-grid">${field('price','Hourly price (THB)',450,'number')}${formSelect('format','Class formats',[{value:'one',label:'1-on-1 only'},{value:'both',label:'1-on-1 and group'}],'one')}</div></div>
 <div class="wizard-actions"><button type="button" id="offer-back" class="button outline" hidden>← Back</button><button type="button" id="offer-next" class="button primary">Continue →</button><button type="submit" id="offer-save" class="button primary" hidden>Add teaching course →</button></div><p class="form-message" id="offer-msg"></p></form><div class="policy-note">Inspired by the legacy AddSubjectDialog flow: Subject → Goal → Specific course → Teaching details. Extra subjects require simulated admin reapproval.</div>`)}</div>`;
 workspace('tutor','subjects','Teaching subjects & courses','Set the academic offerings that students can actually match with.',html);
 $$('.remove-offering').forEach(b=>b.addEventListener('click',()=>{
  if((state().tutor.offerings||[]).length<=1){alert('Keep at least one subject offering. You can edit your main profile instead.');return;}
  mutate(s=>{s.tutor.offerings=s.tutor.offerings.filter(o=>o.id!==b.dataset.offer);const rec=s.catalog.tutors.find(x=>x.id==='t-new');if(rec){rec.offerings=s.tutor.offerings;rec.verified=false;}s.tutor.verificationStatus='draft';});location.reload();
 }));
 const subjectByCategory={Math:['Mathematics'],Science:['Science','Physics','Chemistry','Biology'],Languages:['English','Thai'],Social:['Social Studies']};
 const form=$('#offer-form');let stage=0;const pages=$$('[data-offer-page]');
 const show=()=>{pages.forEach((el,i)=>el.hidden=i!==stage);$$('[data-offering-step]').forEach((el,i)=>el.classList.toggle('on',i<=stage));$('#offer-back').hidden=stage===0;$('#offer-next').hidden=stage===4;$('#offer-save').hidden=stage!==4;feedback('#offer-msg','');};
 form.querySelector('[name="category"]').addEventListener('change',e=>{
  const opts=subjectByCategory[e.target.value]||['Mathematics'];
  const sel=form.querySelector('[name="subject"]');sel.innerHTML=opts.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('');sel.dispatchEvent(new Event('change'));
 });
 form.querySelector('[name="subject"]').addEventListener('change',e=>{$('#offer-topic-options').innerHTML=choices('topics',(TOPICS[e.target.value]||[]).map(x=>[x,x]),[])});
 $('#offer-next').addEventListener('click',()=>{if([...pages[stage].querySelectorAll('[required]')].some(el=>!el.checkValidity())){feedback('#offer-msg','Complete the required field.','error');return;}stage++;show()});
 $('#offer-back').addEventListener('click',()=>{stage--;show()});
 form.addEventListener('submit',e=>{e.preventDefault();if(stage!==4)return;const fd=new FormData(form),off={};for(const [k,v] of fd){if(['grades','topics','schedule'].includes(k))(off[k]??=[]).push(v);else off[k]=v;}
  if(['grades','topics','schedule'].some(k=>!off[k]?.length)||Number(off.price)<=0){feedback('#offer-msg','Select grades, topics and available times, and enter a valid hourly price.','error');return;}
  off.id='offer-'+Date.now();off.price=Number(off.price);off.formats=off.format==='both'?['one','group']:['one'];delete off.format;
  mutate(s=>{s.tutor.offerings??=[];s.tutor.offerings.push(off);s.tutor.profile.subjects=[...new Set(s.tutor.offerings.map(x=>x.subject))];s.tutor.verificationStatus='draft';s.tutor.verification=null;const t=s.catalog.tutors.find(x=>x.id==='t-new');if(t){t.offerings=s.tutor.offerings;t.verified=false;t.goals=[...new Set(s.tutor.offerings.map(x=>x.goalType))]}});location.reload();
 });
}
function students(){
 const s=state(),t=s.tutor;
 if(!t.roster.length)return workspace('tutor','students','My students & learning plans','Keep a clear plan for each active learner.',empty('No students yet','After verification, accept a compatible student request or bring students into a small group.',btn('Find student requests →','/tutor/requests.html')));
 const selectedId=new URLSearchParams(location.search).get('student')||t.roster[0].studentId;
 const selected=t.roster.find(x=>x.studentId===selectedId)||t.roster[0];
 const plan=planFor(s,selected.studentId);
 const studentRows=t.roster.map(r=>`<a class="student-row ${r.studentId===selected.studentId?'current':''}" href="/tutor/students.html?student=${encodeURIComponent(r.studentId)}">${avatar(r.name.slice(0,2).toUpperCase(),'lavender','small')}<span><strong>${esc(r.name)}</strong><small>${esc(r.grade)} · ${esc(r.subject)} · ${esc(r.source)}</small></span><b>→</b></a>`).join('');
 const tasks=plan.map(g=>`<div class="objective-row"><label><input type="checkbox" class="goal-toggle" data-goal="${esc(g.id)}" ${g.completed?'checked':''}><span class="${g.completed?'completed':''}">${esc(g.title)}</span></label><button class="goal-remove" data-remove="${esc(g.id)}" aria-label="Remove ${esc(g.title)}">×</button></div>`).join('');
 workspace('tutor','students','My students & learning plans','Track objectives and share course progress with families.',`<div class="two-col big-left">${panel('Your student list',studentRows)}${panel('Learning plan — '+esc(selected.name),`<div class="between"><span>Objectives completed · not mastery</span><strong>${planProgress(plan)}%</strong></div>${progress(planProgress(plan))}<div class="goal-list">${tasks||empty('No objectives yet','Add the first objective below.')}</div><form id="add-objective" class="goal-add"><input type="text" name="title" minlength="2" maxlength="110" placeholder="e.g. Solve quadratic equations" required><button class="button primary">Add objective</button></form><p class="form-message" id="objective-msg"></p><div class="policy-note">The same objective list appears in Student and linked Parent Progress screens for the demo student. Completion is tutor-entered, not an automatic assessment of student ability.</div>${btn('Write session note →','/tutor/notes.html','outline')}`)}</div>`);
 function change(fn){mutate(s=>{s.learningPlans??={};s.learningPlans[selected.studentId]??=[];fn(s.learningPlans[selected.studentId])});location.reload()}
 $$('.goal-toggle').forEach(b=>b.addEventListener('change',()=>change(goals=>{const g=goals.find(x=>x.id===b.dataset.goal);if(g)g.completed=b.checked})));
 $$('.goal-remove').forEach(b=>b.addEventListener('click',()=>change(goals=>{const i=goals.findIndex(x=>x.id===b.dataset.remove);if(i>=0)goals.splice(i,1)})));
 $('#add-objective').addEventListener('submit',e=>{e.preventDefault();const title=new FormData(e.currentTarget).get('title')?.trim();if(!title){feedback('#objective-msg','Add an objective name.','error');return;}change(goals=>goals.push({id:'goal-'+Date.now(),title,completed:false}))});
}

function verification(){const s=state(),t=s.tutor;
 if(!t.profile)return workspace('tutor','verification','Tutor verification','Complete your teaching profile first.',empty('Teaching profile required','We need matching attributes before checking eligibility.',btn('Complete profile →','/tutor/onboarding.html')));
 const status=t.verificationStatus||'draft';
 const submitted=status==='pending'||status==='approved';
 const info=`<div class="two-col big-left">${panel('Screening requirements',`
 <div class="form-intro"><div class="eyebrow">STEP 2 OF 3 · TUTOR ONBOARDING</div><h2>${status==='approved'?'You are approved!':status==='pending'?'Application submitted':'Verify before going public'}</h2><p>${status==='approved'?'Your profile can now be considered by the matching engine.':status==='pending'?'Your application is waiting for a demo administrator to approve it.':'Real tutors would provide identity, relevant academic evidence, and a short teaching demonstration.'}</p></div>
 ${item('Identity screening','Verify that the tutor is a real person',tag(status==='approved'?'Approved':status==='pending'?'Submitted':'Required',status==='approved'?'green':'purple'))}
 ${item('Subject knowledge','Academic documents or a grade-level subject assessment',tag(status==='approved'?'Approved':'Review required',status==='approved'?'green':'orange'))}
 ${item('Teaching demonstration','A 5-minute problem explanation and safety checks',tag(status==='approved'?'Approved':'Review required',status==='approved'?'green':'orange'))}
 ${status==='approved'?`<div class="policy-note">In this demo, Admin has approved the sample application. You can now open for student requests and create groups.</div><div class="row-actions">${btn('Open student requests →','/tutor/requests.html')}${btn('Create small group →','/tutor/groups.html','outline')}</div>`:
 status==='pending'?`<div class="policy-note">Application pending. For the classroom demo, switch to Admin → Tutor applications and click Approve; then switch back to Tutor.</div>${btn('Return to tutor dashboard →','/tutor/dashboard.html','outline')}`:
 `<form id="verification-form" class="stack-form"><label class="field"><span>Education / qualification (example only)</span><select name="education" required><option value="Current university student">Current university student</option><option value="Bachelor degree">Bachelor degree</option><option value="Teaching credential">Teaching credential</option></select></label>
 <label class="field"><span>Academic evidence (demo option)</span><select name="subjectCheck" required><option value="Transcript or degree">Transcript or degree</option><option value="Subject quiz">Grade-level subject quiz</option><option value="Exam score">Relevant exam result</option></select></label>
 <label class="field"><span>Teaching demo (demo option)</span><select name="teachingDemo" required><option value="Five-minute video">Five-minute recorded explanation</option><option value="Live demonstration">Live teaching demonstration</option></select></label>
 <label class="option-check"><input type="checkbox" name="ready" required><span>I can provide the required evidence for real verification. This prototype does not collect ID cards, videos, or private documents.</span></label>
 <button type="submit" class="button primary">Submit for review →</button><p class="form-message" id="verification-msg"></p></form>`}`)}
 ${panel('What happens next',`${item('01 · Submit application','You provide your evidence through a secure future workflow')}${item('02 · TutorPair reviews','Admin confirms identity, subject expertise and teaching demo')}${item('03 · Approval','Only approved tutors are visible for Top-3 matching')}${item('04 · Start teaching','Open 1-on-1 availability or a small group')}<div class="policy-note">Current verification is simulated. Do not submit real ID cards or academic documents here.</div>`)}</div>`;
 workspace('tutor','verification','Tutor verification','Know what is required before accepting students.',info);
 $('#verification-form')?.addEventListener('submit',e=>{e.preventDefault();const info=Object.fromEntries(new FormData(e.currentTarget));mutate(s=>{s.tutor.verificationStatus='pending';s.tutor.verification={education:info.education,subjectCheck:info.subjectCheck,teachingDemo:info.teachingDemo,submitted:'Demo application'};});location.reload()});
}
function requests(){const s=state(),t=s.tutor;
 if(!t.profile)return workspace('tutor','requests','Student requests','Complete your tutor profile first.',empty('Your expertise is not set yet','Add subjects and availability so TutorPair can send relevant requests.',btn('Complete profile →','/tutor/onboarding.html')));
 if(t.verificationStatus!=='approved')return workspace('tutor','requests','Student requests','Tutor verification must be approved first.',empty('Your profile is not approved yet','Students cannot be matched to unverified tutors. Complete the simulated verification flow first.',btn('Open verification →','/tutor/verification.html')));
 const examples=[
  {studentId:'s-kanya',name:'Kanya',grade:'M.4',subject:'Mathematics',goal:'Improve Algebra for next midterm',budget:500,schedule:['thu'],topics:['Algebra']},
  {studentId:'s-napat',name:'Napat',grade:'M.4',subject:'Mathematics',goal:'Build confidence in Functions',budget:550,schedule:['sat'],topics:['Functions']},
  {studentId:'s-mook',name:'Mook',grade:'M.5',subject:'Physics',goal:'Improve Physics school grades',budget:550,schedule:['tue'],topics:['Mechanics']},
  {studentId:'s-nam',name:'Nam',grade:'M.2',subject:'English',goal:'Improve grammar and reading',budget:450,schedule:['thu'],topics:['Grammar']}
 ];
 const actual=s.student.request;
 if(actual)examples.unshift({studentId:s.student.id,name:s.student.name,grade:actual.grade,subject:actual.subject,goal:actual.goal,budget:Number(actual.budget),schedule:actual.schedule,topics:actual.topics});
 const offers=t.offerings?.length?t.offerings:[{subject:t.profile.subjects[0],grades:t.profile.grades,price:t.profile.price,schedule:t.profile.schedule}];
 const eligible=examples.filter(r=>offers.some(o=>o.subject===r.subject&&o.grades.includes(r.grade)&&o.price<=r.budget&&r.schedule.some(day=>o.schedule.includes(day))));
 const available=eligible.filter(r=>!t.roster.some(x=>x.studentId===r.studentId));
 const content=available.length?available.map(r=>`<div class="group-summary"><div class="between"><strong>${esc(r.name)} · ${esc(r.grade)} ${esc(r.subject)}</strong>${tag('Qualified request','green')}</div>${item('Goal',esc(r.goal))}${item('Schedule',listToLabel(r.schedule))}${item('Budget',money(r.budget)+'/hour')}<div class="row-actions"><button class="button primary accept-request" data-student="${esc(r.studentId)}">Simulate confirmed enrollment →</button></div></div>`).join(''):empty('No eligible requests right now','Only students matching your subject, grade, schedule and price appear here. Try extending availability after verification.');
 workspace('tutor','requests','Student requests','Qualified requests are filtered using the same attributes you entered in the tutor profile.',`${panel('Potential students · Mock marketplace',content)}<div class="policy-note">These are sample requests. A real enrollment requires tutor acceptance, parent approval, course selection and payment. This button simulates that completed process.</div>`);
 $$('.accept-request').forEach(b=>b.addEventListener('click',()=>{const r=available.find(x=>x.studentId===b.dataset.student);if(!r)return;mutate(s=>{if(!s.tutor.roster.some(x=>x.studentId===r.studentId))s.tutor.roster.push({studentId:r.studentId,name:r.name,grade:r.grade,subject:r.subject,source:'TutorPair'});ensurePlan(s,r.studentId,r.topics||[]);});location.href='/tutor/dashboard.html'}));
}
function groups(){const s=state(),t=s.tutor;
 if(!t.profile)return workspace('tutor','groups','Small-group courses','Set up a tutor profile before opening your first group.',empty('You need a tutor profile first','Tell us what you teach, your class formats and availability.',btn('Create tutor profile →','/tutor/onboarding.html')));
 if(t.verificationStatus!=='approved')return workspace('tutor','groups','Small-group courses','Complete tutor verification before publishing.',empty('Complete verification first','You can prepare your teaching profile now, then publish groups after approval.',btn('View verification →','/tutor/verification.html')));
 if(!(t.offerings?.some(o=>o.formats.includes('group'))||t.profile.formats?.includes('group')))return workspace('tutor','groups','Small-group courses','This account currently offers only 1-on-1.',empty('Enable small group format first','Open your tutor profile, enable Both 1-on-1 and small group, and resubmit for verification.',btn('Edit tutor profile →','/tutor/onboarding.html')));
 const groupOffers=(t.offerings||[]).filter(o=>o.formats.includes('group'));const allowed=groupOffers.length?groupOffers:[{subject:t.profile.subjects[0],grades:t.profile.grades,schedule:t.profile.schedule,topics:t.profile.topics,formats:t.profile.formats}];const rows=s.catalog.groups.filter(g=>t.groups.includes(g.id));
 const content=`<div class="two-col form-split">${panel('Create a small group',`<form id="group-create" class="stack-form">${field('title','Course title','M.4 Mathematics Grade Booster')}
 ${formSelect('subject','Subject',[...new Set(allowed.map(o=>o.subject))],allowed[0].subject)}${formSelect('grade','Grade',[...new Set(allowed.flatMap(o=>o.grades))],allowed[0].grades[0])}
 ${formSelect('schedule','Weekly schedule',DAYS.map(x=>({value:x.id,label:x.name})),allowed[0].schedule[0]||'thu')}
 <div class="form-grid">${formSelect('capacity','Maximum learners',[2,3,4,5].map(x=>String(x)),'4')}${field('byos','Your existing students (BYOS)','2','number')}</div>
 ${field('price','Price per student / 8-lesson package (THB)','1600','number')}
 <label class="field"><span>Topics and learning goal</span><textarea name="description" rows="3" required>Algebra and Functions — school exam practice</textarea></label>
 <button class="button primary" type="submit">Publish demo group →</button><p class="form-message" id="group-msg"></p></form>`)}${panel('Your small groups',rows.length?rows.map(g=>`<div class="group-summary"><div class="between"><strong>${esc(g.name)}</strong>${tag(g.capacity-g.byos-g.platform>0?'Accepting students':'Full','green')}</div><p>${esc(g.grade)} · ${esc(g.subject)} · ${listToLabel([g.schedule])}</p><div class="between"><span>${g.byos} BYOS · ${g.platform} TutorPair</span><b>${g.byos+g.platform}/${g.capacity} seats</b></div>${progress((g.byos+g.platform)/g.capacity*100)}<div class="row-actions"><button class="button outline fill-seat" data-group="${g.id}" ${g.byos+g.platform>=g.capacity?'disabled':''}>Simulate filling 1 seat →</button></div></div>`).join(''):empty('No classes yet','Create a group, bring your own learners, and offer the remaining seats on TutorPair.'))}</div>`;
 workspace('tutor','groups','Small-group management','Bring your own students at 0% marketplace commission and fill open seats.',content);
 $('#group-create').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget)),capacity=Number(data.capacity),byos=Number(data.byos),price=Number(data.price);
  if(byos>capacity||byos<0||price<=0||!allowed.some(o=>o.subject===data.subject&&o.grades.includes(data.grade)&&o.schedule.includes(data.schedule))){feedback('#group-msg','Check the existing-student count and package price.','error');return;}
  mutate(s=>{const id='newgroup-'+Date.now();s.catalog.groups.push({id,tutorId:s.scenario==='returning'?'t01':'t-new',name:data.title,subject:data.subject,grade:data.grade,topics:(allowed.find(o=>o.subject===data.subject&&o.grades.includes(data.grade)&&o.schedule.includes(data.schedule))||allowed[0]).topics,schedule:data.schedule,capacity,byos,platform:0,price,sessions:8,durationMinutes:60,description:data.description});s.tutor.groups.push(id);if(byos){for(let i=0;i<byos;i++){s.tutor.roster.push({studentId:id+'-'+i,name:`Existing student ${i+1}`,grade:data.grade,subject:data.subject,source:'BYOS'});ensurePlan(s,id+'-'+i,s.tutor.profile.topics||[])}}});location.reload();
 });
 $$('.fill-seat').forEach(b=>b.addEventListener('click',()=>{mutate(s=>{const g=s.catalog.groups.find(x=>x.id===b.dataset.group);if(g&&g.byos+g.platform<g.capacity){g.platform++;const studentId='seat-'+Date.now();s.tutor.roster.push({studentId,name:'New matched student',grade:g.grade,subject:g.subject,source:'TutorPair'});ensurePlan(s,studentId,g.topics||[])}});location.reload()}));
}
function notes(){const s=state(),t=s.tutor;
 if(!t.roster.length)return workspace('tutor','notes','Session notes','You need a student before recording lesson progress.',empty('No students to report on','Accept a learner or create a group with students before writing a session note.',btn('Open student requests →','/tutor/requests.html')));
 const options=t.roster.map(st=>({value:st.studentId,label:`${st.name} · ${st.grade} ${st.subject}`}));
 workspace('tutor','notes','Session notes','One report updates the student’s progress and the parent’s linked view.',`<div class="two-col form-split">${panel('After-lesson report',`<form id="note-form" class="stack-form">${formSelect('studentId','Student',options,options[0].value)}
 ${field('topic','Topic covered','Quadratic equations')}
 <div class="form-grid">${field('score','Quiz score','7','number')}${field('total','Out of','10','number')}</div>
 <label class="field"><span>What went well?</span><textarea name="strength" rows="3" required>Can factor simple expressions independently.</textarea></label>
 <label class="field"><span>Needs improvement</span><textarea name="improve" rows="3" required>Practice applied word problems.</textarea></label>
 <label class="field"><span>Next task / homework</span><textarea name="homework" rows="3" required>Complete five practice questions.</textarea></label>
 <button type="submit" class="button primary">Save session report →</button><p id="notes-msg" class="form-message"></p></form>`)}${panel('Parent report preview',`<div class="report-preview" id="report-preview"><div class="card-eyebrow">LEARNING UPDATE · DEMO</div><h3>Quadratic equations</h3><div class="report-score"><strong>7 / 10</strong><span>Latest quiz</span></div><p>Can factor simple expressions independently.</p></div><div class="mini-tips">This report is generated from tutor-entered information. No AI assessment or real LINE push is performed.</div>`)}</div>`);
 const form=$('#note-form');function preview(){const d=Object.fromEntries(new FormData(form));$('#report-preview').innerHTML=`<div class="card-eyebrow">TUTORPAIR LEARNING UPDATE</div><h3>${esc(d.topic)}</h3><div class="report-score"><strong>${esc(d.score)} / ${esc(d.total)}</strong><span>Latest quiz</span></div>${item('Strength',esc(d.strength))}${item('To improve',esc(d.improve))}${item('Next task',esc(d.homework))}`;}
 form.addEventListener('input',preview);
 form.addEventListener('submit',e=>{e.preventDefault();const obj=Object.fromEntries(new FormData(form));let score=Number(obj.score),total=Number(obj.total);
  if(score<0||total<=0||score>total){feedback('#notes-msg','Score must be between 0 and the quiz maximum.','error');return;}
  const selected=t.roster.find(x=>x.studentId===obj.studentId);
  const note={...obj,score,total,id:'note-'+Date.now(),studentName:selected?.name||'Student',date:'Just now (demo)'};
  mutate(s=>{s.notes.push(note);s.tutor.sessionNotes.push(note);
   if(note.studentId===s.student.id&&s.student.course){s.student.course.completed=Math.min(s.student.course.sessions,s.student.course.completed+1);s.student.lessonNotes.push(note)}
   s.notification.unshift({text:`${note.studentName}: ${note.topic} report ready`,time:'Just now (demo)',type:'lesson'});
  });feedback('#notes-msg','Saved locally. Switch to Student or Parent demo view to inspect the updated report.');
 });
}
