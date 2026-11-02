import {getAuthSession} from './auth.js';
import {createGroupInvite,createOneOnOneInvite,myInvites,invitationUrl} from './byos.js';
import {state,mutate,tutorIsActive,switchRole} from './store.js';
import {DAYS,SUBJECTS,GRADES,GOALS,COURSE_FOCUS} from '../data/mock-data.js';
import {QUESTIONS} from './preferences.js';
import {planFor,planProgress,ensurePlan} from './plans.js';
import {approvedToTeach} from './matching.js';
import {availabilityPicker,bindAvailability,setAvailability,overlapSlots,parseSlots,slotsToDays,legacyToSlots,summarize} from './availability.js';
import {notify,MIN_RATE,PACES,tutorQuality,tutorClasses,pendingChanges} from './flow.js';
import {uploadBoxes,bindUploads,readUploads,inboxHtml,bindInbox,prepareInbox,inboxData,notesPage,myTutorId} from './tutor-flow.js';
import {compactStepper} from './flow-ui.js';
import {$,$$,workspace,esc,money,tag,btn,avatar,progress,panel,stat,empty,item,formSelect,field,choices,feedback} from './ui.js';
const listToLabel=(a)=>a.map(x=>DAYS.find(d=>d.id===x)?.name||x).join('; ');
const isDemoSession=()=>getAuthSession()?.type==='demo';
function inboxBanner(s){
 const {count,nReq,nPlan,nChg}=inboxData(s);if(!count)return '';
 const n=(k,one,many)=>k?`${k} ${k>1?many:one}`:'';
 const parts=[n(nReq,'new student request','new student requests'),n(nPlan,'plan to adjust','plans to adjust'),n(nChg,'reschedule/cancel request','reschedule/cancel requests')].filter(Boolean);
 return `<div class="inbox-banner"><div><b>You have ${parts.join(' · ')}</b><span>Open Student requests to accept, reject, edit a plan or respond.</span></div>${btn('Go to Student requests →','/tutor/requests.html')}</div>`;
}
function classesPanel(s){const cs=tutorClasses(s,isDemoSession(),myTutorId(s)),q=tutorQuality(cs);if(!cs.length)return '';
 return panel('Ongoing classes',`<div class="class-rows">${cs.map(c=>`<a class="class-row" href="/tutor/notes.html?class=${encodeURIComponent(c.id)}"><span><strong>${esc(c.studentName||s.student.name)}</strong><small>${esc(c.grade)} · ${esc(c.subject)} · ${esc(c.source)}</small></span>${compactStepper(c)}<b>→</b></a>`).join('')}</div><p class="fine-print">${q.score==null?'Quality score appears after students rate lessons.':`Your private quality score: <b>${q.score}/100</b> from ${q.count} student ratings.`}</p>`)}
export function renderTutor(page){if(page==='dashboard')return dashboard();if(page==='onboarding')return onboarding();if(page==='verification')return verification();if(page==='requests')return requests();if(page==='groups')return groups();if(page==='notes')return notesPage();if(page==='subjects')return subjects();if(page==='students')return students();if(page==='invite')return inviteStudents();}
function dashboard(){const s=state(),t=s.tutor;
 if(!tutorIsActive(s)){
  const status=t.verificationStatus||'not_started',hasProfile=Boolean(t.profile);
  const approved=status==='approved', pending=status==='pending';
  const activeGroup=t.groups.length;
  const primary=!hasProfile?btn('Complete tutor profile →','/tutor/onboarding.html','white'):
   !approved?btn(pending?'View verification status →':'Submit for verification →','/tutor/verification.html','white'):
   btn('Publish or manage your courses →','/tutor/subjects.html','white');
  workspace('tutor','dashboard',`Welcome, ${esc(t.name)}!`,approved?'Your tutor account is approved. Open a class or review a student request.':pending?'Your tutor application is awaiting demo admin approval.':'Build your teaching profile and verify your eligibility.',
  `${inboxBanner(s)}<section class="welcome tutor-welcome"><div><div class="welcome-kicker">✦ YOUR TEACHING JOURNEY</div><h2>${!hasProfile?'Start by telling us what you teach.':pending?'Your application is under review.':approved?'Ready to welcome your first student?':'One final step before you teach.'}</h2><p>${approved?'Your dashboard fills up as you publish courses, welcome BYOS learners or accept new TutorPair students.':pending?'Admin review is simulated for this pitch; no real documents or verification are processed.':'Tell us about your teaching expertise, then complete the screening steps.'}</p><div class="actions">${primary}${approved?btn('Invite my students →','/tutor/invite.html','soft-white'):''}</div></div><div class="empty-illustration">✎<span>${activeGroup?`${activeGroup} class${activeGroup===1?'':'es'} open`:'0 active students'}</span></div></section>
  <div class="stats-grid">${stat('Active students','0','No confirmed learners yet','♧')}${stat('Upcoming lessons','0','Not booked yet','▦')}${stat('Group classes',activeGroup,'Open or scheduled','◫')}${stat('Earnings','฿0','No paid lessons recorded','฿')}</div>
  <div class="two-col">${panel('Tutor onboarding checklist',`${item('01 · Teaching profile',hasProfile?'Subject, teaching approach and availability completed':'Complete your teaching details',tag(hasProfile?'Complete':'To do',hasProfile?'green':'orange'))}${item('02 · Tutor verification',approved?'Approved in demo':pending?'Awaiting simulated review':'Identity, academic check and teaching demo',tag(approved?'Approved':pending?'Pending':'To do',approved?'green':pending?'purple':'orange'))}${item('03 · Open for students',approved?(activeGroup?'Small group published':'Publish a class within your approved subject or accept requests'):'Available after approval',tag(activeGroup||t.offerings?.length?'Published':approved?'Ready':'Locked',activeGroup||t.offerings?.length?'green':'purple'))}`)}${panel('Choose how to get students',`${item('1-on-1 matching','Open availability, receive compatible student requests')}${item('Small group','Create a class and let TutorPair fill empty seats')}${item('Bring Your Own Students','Invite existing students with a class link; do not register twice',btn('Invite students →','/tutor/invite.html','outline'))}`)}</div>`);
  return;
 }
 const roster=t.roster.length,gcount=t.groups.length;
 workspace('tutor','dashboard',`Welcome back, ${esc(t.name)}!`,'Your teaching activity, students and upcoming work in one place.',
 `${inboxBanner(s)}<section class="welcome tutor-welcome"><div><div class="welcome-kicker">✦ YOUR TEACHING SPACE</div><h2>Keep your classes running smoothly.</h2><p>View your roster, add small-group seats, and share learning updates with families.</p><div class="actions">${btn('Write a session note →','/tutor/notes.html','white')}${btn('Invite my students →','/tutor/invite.html','soft-white')}</div></div><div class="empty-illustration">✎<span>${roster} learners</span></div></section>
 <div class="stats-grid">${stat('Active students',roster,'TutorPair and BYOS students','♧')}${stat('Upcoming lessons',Math.max(1,roster),'Example upcoming sessions','▦')}${stat('Group classes',gcount,'Open or scheduled groups','◫')}${stat('Reported sessions',s.notes.length,'Session notes saved in demo','✎')}</div>
 ${classesPanel(s)}
 <div class="two-col">${panel('Your students',roster?t.roster.map(r=>item(esc(r.name),`${esc(r.grade)} ${esc(r.subject)}`,tag(r.source,r.source==='BYOS'?'purple':'green'))).join(''):empty('No students yet','Open a class to begin.'))}${panel('Next actions',`${item('Learning plans','Track goal completion for each learner',btn('Open plans →','/tutor/students.html','outline'))}${item('Lesson notes','Capture progress and next steps',btn('Write notes →','/tutor/notes.html','outline'))}${item('Small-group seats','Invite your own students or add capacity',btn('Invite students →','/tutor/invite.html','outline'))}${item('New student requests','Review a potential learner',btn('See requests →','/tutor/requests.html','outline'))}`)}</div>`);
}
function onboarding(){
 const s=state(),t=s.tutor,p=t.profile||{},cred=p.credentials||{},approved=t.verificationStatus==='approved';
 const main=t.subjectApprovals?.find(x=>x.status==='approved')||t.subjectApprovals?.[0];
 const prefQuestions=QUESTIONS.map((q,i)=>`<div class="preference-choice"><span class="preference-index">0${i+1}</span><div class="field"><span>${esc(q.label)} (choose all you can support)</span>${choices(q.key,q.options,p[q.key]||[q.options[0][0]])}</div></div>`).join('');
 const teaching=`<div class="wizard-page" data-step="1" hidden><div class="form-intro"><h2>Subjects and teaching availability</h2><p>Your first subject and grade scope is reviewed once. After approval, you can publish new courses in that scope without more reviews.</p></div>
 ${approved?`<div class="policy-note"><strong>Approved teaching scope (locked):</strong> ${esc(main?.subject||'—')} · ${esc((main?.grades||[]).join(', '))}. Request additional subjects/grades from Teaching Subjects, not by resubmitting this profile.</div>`:
 `${formSelect('subject','Subject you want approval for',SUBJECTS,p.subjects?.[0]||'Mathematics')}
 <div class="field"><span>Grades you want approval for</span>${choices('grades',GRADES.map(x=>[x,x]),p.grades||['M.4'])}</div>`}
 <div class="field"><span>Student levels you can support</span>${choices('levels',[['foundation','Building foundations'],['intermediate','Intermediate'],['advanced','Advanced']],p.levels||['foundation','intermediate'])}</div>
 <div class="field"><span>Recurring teaching availability</span>${availabilityPicker('availability',p.availability?.length?p.availability:legacyToSlots(p.schedule||['thu','sat']))}</div>
 <div class="form-grid"><label class="field"><span>Starting hourly rate (THB, minimum ${MIN_RATE})</span><input type="number" name="price" min="${MIN_RATE}" step="10" value="${esc(p.price||450)}" required><small class="field-error" id="rate-error" role="alert" hidden>Please enter at least 100 THB/hr.</small></label>${formSelect('format','Lesson formats',[{value:'one',label:'Online 1-on-1'},{value:'both',label:'1-on-1 and small group'}],p.formats?.includes('group')?'both':'one')}</div></div>`;
 const html=`<div class="wizard-top"><div class="wizard-tabs"><span class="on" data-step-label="0">1. About you</span><span data-step-label="1">2. Subject & schedule</span><span data-step-label="2">3. Three teaching preferences</span></div><div class="small">One-time verification for subjects and grade levels</div></div>
 <div class="two-col form-split">${panel('Teaching profile',`<form id="tutor-profile" novalidate>
 <div class="wizard-page" data-step="0"><div class="form-intro"><h2>${approved?'Update your teaching introduction':'Introduce yourself'}</h2><p>${approved?'Identity and educational evidence stays verified. You can update your bio, teaching availability and preferences without resubmitting verification.':'This is demo information only; do not enter actual identity numbers or upload private documents.'}</p></div>
 ${approved?`<div class="policy-note">Verified profile: <b>${esc(t.name)}</b> · ${esc(cred.institution||'Education reviewed')}. To change identity or qualification evidence in production, request a separate review.</div>`:
 `${field('name','Public tutor display name',t.name==='New Tutor'?'P’New Tutor':t.name)}${field('institution','University / qualification (example)',cred.institution||'Example university')}`}
 ${field('experienceYears','Years of tutoring experience',cred.experienceYears||'1','number')}
 <label class="field"><span>How do you teach?</span><textarea name="intro" rows="3" required>${esc(cred.intro||'I explain school concepts patiently and guide students through practice.')}</textarea></label></div>
 ${teaching}
 <div class="wizard-page" data-step="2" hidden><div class="form-intro"><h2>Three teaching preferences</h2><p>Students answer the same three questions. You can choose several approaches you genuinely support.</p></div><div class="simple-preferences">${prefQuestions}</div><div class="policy-note">Teaching fit describes compatibility preferences, not scientifically established learning styles.</div></div>
 <div class="wizard-actions"><button type="button" id="tutor-back" class="button outline" hidden>← Back</button><button type="button" id="tutor-next" class="button primary">Continue →</button><button type="submit" id="tutor-save" class="button primary" hidden>${approved?'Update profile without re-verification →':'Save profile → Verification'}</button></div><p class="form-message" id="profile-msg"></p></form>`)}
 ${panel('What happens after approval?',`${item('1 · Identity reviewed once','The TutorPair team checks basic identity and teaching readiness')}${item('2 · Subject/grade scope approved','Students only see tutors approved for their requested grade')}${item('3 · Publish courses freely','Change price or schedule and create new classes within approved scope')}${item('4 · New subject?','Only the new subject/grade request needs review')}<div class="policy-note">Creating a new course in an approved subject never pauses existing courses.</div>`)}</div>`;
 workspace('tutor','onboarding','Tutor profile','A faster onboarding process, with meaningful verification only when needed.',html);
 const form=$('#tutor-profile');let index=0;const pages=$$('.wizard-page',form);
 function show(){pages.forEach((el,i)=>el.hidden=i!==index);$$('[data-step-label]').forEach((el,i)=>el.classList.toggle('on',i<=index));$('#tutor-back').hidden=index===0;$('#tutor-next').hidden=index===2;$('#tutor-save').hidden=index!==2;feedback('#profile-msg','');}
 $('#tutor-back').addEventListener('click',()=>{index--;show()});
 $('#tutor-next').addEventListener('click',()=>{
  const rateEl=pages[index].querySelector('input[name="price"]');
  if(rateEl&&!(Number(rateEl.value)>=MIN_RATE)){$('#rate-error').hidden=false;rateEl.focus();return;}
  if([...pages[index].querySelectorAll('[required]')].some(el=>!el.checkValidity())){feedback('#profile-msg','Complete all required fields.','error');return;}
  if(index===1&&(!approved&&!form.querySelector('input[name="grades"]:checked')||!form.querySelector('input[name="levels"]:checked')||!parseSlots(form.elements.availability?.value).length)){feedback('#profile-msg','Select at least one grade, student level and time slot.','error');return;}
  index++;show();
 });
 bindAvailability(form);
 form.elements.price?.addEventListener('input',e=>{$('#rate-error').hidden=Number(e.target.value)>=MIN_RATE});
 form.addEventListener('submit',e=>{
  e.preventDefault();if(index!==2)return;
  const fd=new FormData(form),data={};for(const [k,v] of fd){if(k==='availability'){data.availability=parseSlots(v);data.schedule=slotsToDays(data.availability);continue}if(['grades','levels','schedule','pace','approach','interaction'].includes(k))(data[k]??=[]).push(v);else data[k]=v;}
  if(['pace','approach','interaction','levels','schedule'].some(k=>!data[k]?.length)||!approved&&!data.grades?.length){feedback('#profile-msg','Choose at least one answer for each required attribute.','error');return;}
  data.price=Number(data.price);if(!(data.price>=MIN_RATE)){index=1;show();$('#rate-error').hidden=false;return;}if(Number(data.experienceYears)<0){feedback('#profile-msg','Price and years of experience must be valid.','error');return;}
  const identity=approved?{name:t.name,institution:cred.institution}:{name:data.name,institution:data.institution};
  const profile={credentials:{institution:identity.institution,experienceYears:data.experienceYears,intro:data.intro},subjects:approved?p.subjects:[data.subject],grades:approved?p.grades:data.grades,levels:data.levels,schedule:data.schedule,availability:data.availability,price:data.price,formats:data.format==='both'?['one','group']:['one'],pace:data.pace,approach:data.approach,interaction:data.interaction};
  mutate(st=>{
   st.tutor.name=identity.name;st.tutor.profile=profile;
   if(!approved){st.tutor.subjectApprovals=[{id:'scope-'+Date.now(),subject:data.subject,grades:data.grades,status:'pending'}];st.tutor.verificationStatus='draft';st.tutor.verification=null;st.tutor.offerings=[];}
   const record=st.catalog.tutors.find(x=>x.id===(st.scenario==='returning'?'t01':'t-new'));
   const patch={id:st.scenario==='returning'?'t01':'t-new',name:identity.name,initials:identity.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),color:'mint',subject:profile.subjects?.[0]||'',grades:profile.grades||[],price:profile.price,goals:GOALS.map(g=>g.value),levels:profile.levels,pace:profile.pace,approach:profile.approach,interaction:profile.interaction,schedule:profile.schedule,availability:profile.availability,formats:profile.formats,offerings:st.tutor.offerings,approvedScopes:st.tutor.subjectApprovals,quality:70,university:identity.institution,experience:profile.credentials.experienceYears+' years tutoring',about:profile.credentials.intro,verified:approved};
   if(record)Object.assign(record,patch);else st.catalog.tutors.push(patch);
  });location.href=approved?'/tutor/dashboard.html':'/tutor/verification.html';
 });
}
function subjects(){
 const s=state(),t=s.tutor;if(!t.profile)return workspace('tutor','subjects','My Courses & Classes','Create a profile before listing courses.',empty('Tutor profile required','Fill out your teaching profile to request approval for a subject.',btn('Start tutor profile →','/tutor/onboarding.html')));
 const scopes=t.subjectApprovals||[];
 const approved=scopes.filter(x=>x.status==='approved'),pending=scopes.filter(x=>x.status==='pending');
 const allowedSubjects=[...new Set(approved.map(x=>x.subject))];
 const allGrades=subject=>[...new Set(approved.filter(a=>a.subject===subject).flatMap(x=>x.grades))];
 const published=t.offerings||[];const offerSlots=o=>o.availability?.length?o.availability:legacyToSlots(o.schedule||[]);
 const scopeHtml=scopes.map(x=>`<div class="scope-row"><div><strong>${esc(x.subject)}</strong><small>${esc(x.grades.join(', '))}</small></div>${tag(x.status==='approved'?'Approved subject':x.status==='pending'?'Pending · Not bookable':'Needs corrections',x.status==='approved'?'green':'orange')}</div>`).join('');
 const offers=published.map(o=>`<div class="offer-card"><div class="between"><strong>${esc(o.title||o.subject+' private lessons')}</strong>${tag(o.published!==false?'Published':'Draft',o.published!==false?'green':'orange')}</div><p>${esc(o.subject)} · ${esc(o.grades.join(', '))} · ${esc(GOALS.find(x=>x.value===o.goalType)?.label||'School support')}</p><p>${esc(summarize(offerSlots(o)))}</p><div class="between"><strong>${money(o.price)} / hour</strong><button class="button outline edit-course" data-offer="${esc(o.id)}">Edit listing</button></div></div>`).join('');
 const formArea=approved.length?`${panel('Publish a course in an approved subject',`<p class="small">No admin review needed for new courses, new prices or updated schedules within an approved subject and grade.</p><form id="course-form" class="stack-form">
 <label class="field"><span>Course title</span><input name="title" value="M.4 Mathematics School Support" required maxlength="95"></label>
 ${formSelect('subject','Approved subject',allowedSubjects,allowedSubjects[0])}
 ${formSelect('grade','Approved grade',allGrades(allowedSubjects[0]),allGrades(allowedSubjects[0]).includes('M.4')?'M.4':allGrades(allowedSubjects[0])[0])}
 ${formSelect('goalType','Learning goal',GOALS,'school-grade')}
 <div class="field"><span>Weekly teaching times — pick days and hours for this course (students see and match against these)</span>${availabilityPicker('availability',t.profile.availability?.length?t.profile.availability:legacyToSlots(t.profile.schedule||['thu']))}</div>
 <label class="field"><span>Starting hourly rate (THB, minimum ${MIN_RATE})</span><input type="number" name="price" step="10" value="${esc(t.profile.price||450)}" required><small class="field-error" id="course-rate-error" role="alert" hidden>Please enter at least 100 THB/hr.</small></label>
 <div class="wizard-actions"><button class="button primary" id="publish-course">Publish course now →</button><button class="button outline" id="clear-course" type="button" hidden>Cancel edit</button></div><p id="course-msg" class="form-message"></p></form>`)}
 ${panel('Published 1-on-1 listings',offers||empty('No courses published','Publish your first course now; your approved subjects stay verified.'))}`:
 `${panel('Your first teaching scope is awaiting approval',empty('No approved subjects yet','After the demo Admin approves your initial verification and teaching scope, you can publish your first course here.',btn('View verification →','/tutor/verification.html')))}${panel('Next steps',item('Course creation is unlocked by approval','You will not need another review to create each new course.'))}`;
 const requestForm=t.verificationStatus==='approved'?`${panel('Request another subject or grade',`<p class="small">Only newly requested subject/grade combinations go to Admin. All existing approved courses remain published.</p><form id="scope-form" class="stack-form">${formSelect('newSubject','Subject',SUBJECTS,'Physics')}
 <div class="field"><span>Grades to add</span>${choices('newGrades',GRADES.map(g=>[g,g]),['M.4'])}</div>
 ${formSelect('evidence','Example academic evidence',[{value:'degree',label:'Degree / transcript (demo)'},{value:'quiz',label:'Grade-level subject quiz (demo)'},{value:'exam',label:'Subject exam record (demo)'}],'degree')}
 <button class="button outline" type="submit">Submit subject request →</button><p id="scope-msg" class="form-message"></p></form>`)}
 ${panel('Why this is simpler',`${item('Identity & teaching readiness','Screened once at onboarding')}${item('New subject / extra grades','Review only the new subject/grade scope')}${item('New course, rate or time','Immediately publish or edit within an approved scope')}${item('Existing courses','Never paused because a new subject is pending')}`)}`:'';
 workspace('tutor','subjects','My Courses & Classes','Manage courses and class times within your approved teaching scope.',
 `${panel('Your subject/grade approvals',scopeHtml||empty('No applications','Complete your profile to submit a subject for review.'))}${pending.length?`<div class="policy-note">${pending.length} subject request(s) awaiting a simulated Admin review. These do not affect existing approved subjects.</div>${getAuthSession()?.type==='account'?'<button type="button" class="button outline" id="simulate-subject-approval">Simulate additional subject approval (demo only) →</button>':''}`:''}<div class="two-col big-left">${formArea}</div>${requestForm?`<div class="two-col big-left section-gap">${requestForm}</div>`:''}`);
 const form=$('#course-form');
 if(form){
  bindAvailability(form);
  const subject=$('select[name="subject"]',form),grade=$('select[name="grade"]',form);
  function setGrades(want){grade.innerHTML=allGrades(subject.value).map(g=>`<option value="${esc(g)}" ${g===want?'selected':''}>${esc(g)}</option>`).join('')}
  subject.addEventListener('change',()=>setGrades());
  let editingId=null;
  $$('.edit-course').forEach(b=>b.addEventListener('click',()=>{
   const o=published.find(x=>x.id===b.dataset.offer);if(!o)return;
   editingId=o.id;form.elements.title.value=o.title||o.subject+' private lessons';subject.value=o.subject;setGrades(o.grades[0]);form.elements.goalType.value=o.goalType||'school-grade';form.elements.price.value=o.price;
   setAvailability(form,offerSlots(o));
   $('#publish-course').textContent='Save course changes →';$('#clear-course').hidden=false;form.scrollIntoView({behavior:'smooth',block:'center'});
  }));
  form.elements.price.addEventListener('input',e=>{$('#course-rate-error').hidden=Number(e.target.value)>=MIN_RATE});
  $('#clear-course').addEventListener('click',()=>location.reload());
  form.addEventListener('submit',e=>{
   e.preventDefault();const fd=new FormData(form),data=Object.fromEntries(fd);
   const availability=parseSlots(fd.get('availability')),schedule=slotsToDays(availability);const price=Number(data.price);
   const rateErr=$('#course-rate-error');rateErr.hidden=price>=MIN_RATE;if(!(price>=MIN_RATE)){feedback('#course-msg','');form.elements.price.focus();return;}
   if(!schedule.length||!approved.some(x=>x.subject===data.subject&&x.grades.includes(data.grade))){feedback('#course-msg','Select an approved grade, and at least one weekly time slot.','error');return;}
   const key=x=>[...new Set(parseSlots(x))].sort().join(',');
   const mine=(state().tutor.offerings||[]).filter(o=>o.id!==editingId&&o.published!==false);
   const sameScope=mine.find(o=>o.subject===data.subject&&(o.grades||[]).includes(data.grade)&&overlapSlots(offerSlots(o),availability).length>0);
   const sameTime=mine.find(o=>key(offerSlots(o))===key(availability));
   const dup=sameScope||sameTime;
   if(dup){feedback('#course-msg',sameScope?`Duplicate course: "${dup.title||dup.subject}" already covers ${data.subject} ${data.grade} at an overlapping time (${summarize(overlapSlots(offerSlots(dup),availability))}). Change the time or edit that listing.`:`Duplicate time: "${dup.title||dup.subject}" already uses exactly these weekly time slots. Pick different times.`,'error');return;}
   mutate(st=>{
    st.tutor.offerings??=[];
    const details={title:String(data.title).trim(),subject:data.subject,grades:[data.grade],goalType:data.goalType,price,availability,schedule,formats:['one'],published:true};
    const existing=st.tutor.offerings.find(o=>o.id===editingId);
    if(existing)Object.assign(existing,details);else st.tutor.offerings.push({id:'course-'+Date.now(),...details});
    const record=st.catalog.tutors.find(x=>x.id===(st.scenario==='returning'?'t01':'t-new'));if(record){record.offerings=st.tutor.offerings;record.availability=[...new Set(st.tutor.offerings.flatMap(o=>offerSlots(o)))];record.goals=[...new Set(st.tutor.offerings.map(o=>o.goalType))];record.approvedScopes=st.tutor.subjectApprovals;}
   });location.reload();
  });
 }
 $('#simulate-subject-approval')?.addEventListener('click',()=>{if(getAuthSession()?.type!=='account')return;mutate(st=>{(st.tutor.subjectApprovals||[]).forEach(x=>{if(x.status==='pending')x.status='approved'});const record=st.catalog.tutors.find(x=>x.id==='t-new');if(record)record.approvedScopes=st.tutor.subjectApprovals;});location.reload()});
 $('#scope-form')?.addEventListener('submit',e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget),subject=fd.get('newSubject'),grades=fd.getAll('newGrades');
  const already=new Set(scopes.filter(x=>x.subject===subject&&x.status!=='rejected').flatMap(x=>x.grades));const missing=grades.filter(g=>!already.has(g));
  if(!missing.length){feedback('#scope-msg','Choose at least one grade not already approved or pending for this subject.','error');return;}
  mutate(st=>{st.tutor.subjectApprovals.push({id:'scope-'+Date.now(),subject,grades:missing,status:'pending',evidence:fd.get('evidence')});notify(st,'admin',`${st.tutor.name} requested approval for ${subject}.`,'/admin/tutors.html');const rec=st.catalog.tutors.find(x=>x.id===(st.scenario==='returning'?'t01':'t-new'));if(rec)rec.approvedScopes=st.tutor.subjectApprovals;});location.reload();
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
 if(!t.profile)return workspace('tutor','verification','Tutor verification','Complete your tutor profile first.',empty('Create a teaching profile','Enter your initial subject, grade, and teaching details before requesting verification.',btn('Start onboarding →','/tutor/onboarding.html')));
 const status=t.verificationStatus||'draft',initial=(t.subjectApprovals||[])[0];
 const scopes=(t.subjectApprovals||[]).map(x=>item(x.subject,`Grades: ${x.grades.join(', ')}`,tag(x.status==='approved'?'Approved':x.status==='pending'?'Pending review':'Not approved',x.status==='approved'?'green':'orange'))).join('');
 const html=`<div class="two-col big-left">${panel('Identity & teaching readiness',`<div class="form-intro"><h2>${status==='approved'?'Your tutor account is approved':status==='pending'?'Your initial review is pending':'Verify once before teaching'}</h2><p>${status==='approved'?'Creating or editing courses in your approved subjects requires no new verification.':status==='pending'?'The demo admin can review your initial application and first subject.':'To protect students and families, we review identity, qualifications and teaching readiness before publishing.'}</p></div>
 ${status==='rejected'?`<div class="policy-note warn"><strong>Rejected:</strong> ${esc(t.verification?.rejectReason||'Please correct your documents and resubmit.')} Update the uploads below and submit again.</div>`:''}
 ${item('Tutor identity','Identity/age confirmation (simulated)',tag(status==='approved'?'Approved':status==='pending'?'Under review':status==='rejected'?'Rejected':'Required',status==='approved'?'green':'orange'))}
 ${item('Teaching readiness','Academic evidence and short explanation demo',tag(status==='approved'?'Approved':status==='pending'?'Under review':status==='rejected'?'Rejected':'Required',status==='approved'?'green':'orange'))}
 ${status==='approved'?`<div class="policy-note">✓ Approved once. Your existing courses continue normally even while a new subject request is under review.</div><div class="row-actions">${btn('Teaching subjects & courses →','/tutor/subjects.html')}${btn('Small-group courses →','/tutor/groups.html','outline')}</div>`:
 status==='pending'?`<div class="policy-note">${getAuthSession()?.type==='account'?'Your application is pending. For this browser-only demo, you can simulate the Admin approval below. No identity checks are performed.':'Review pending. Switch the Demo view to Admin → Tutor applications to approve the simulated submission.'}</div>${getAuthSession()?.type==='account'?'<button class="button primary" type="button" id="simulate-approval">Simulate Admin approval (demo only) →</button>':''}${btn('Return to dashboard →','/tutor/dashboard.html','outline')}`:
 `<form id="verification-form" class="stack-form">
 ${formSelect('education','Education / qualifications (demo)',[{value:'University student',label:'Current university student'},{value:'Bachelor degree',label:'Bachelor degree'},{value:'Teaching credential',label:'Teaching credential'}],'University student')}
 ${uploadBoxes()}
 <label class="option-check"><input type="checkbox" required name="ready"><span>I understand this is a simulated review and I should not upload real identity documents here.</span></label><button class="button primary" type="submit">Submit initial verification →</button></form>`}`)}
 ${panel('Approved / pending subjects',`${scopes}${item('First requested subject',initial?`${initial.subject} · ${initial.grades.join(', ')}`:'No subject submitted')}${item('Add a new subject later','Only new subject/grade eligibility is reviewed',btn('Manage subjects →','/tutor/subjects.html','outline'))}<div class="policy-note">Pending subject checks never disable the subjects you have already been approved to teach.</div>`)}</div>`;
 workspace('tutor','verification','Tutor verification','One-time identity review plus independent subject/grade approvals.',html);
 $('#verification-form')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,f=Object.fromEntries(new FormData(form));let up;try{up=await readUploads(form)}catch(err){feedback('#upload-msg',err.message,'error');return}mutate(st=>{st.tutor.verificationStatus='pending';st.tutor.verification={education:f.education,subjectCheck:`${up.evidenceFiles.length} file(s): ${up.evidenceFiles.map(x=>x.name).join(', ')}`,teachingDemo:up.video.name?`Video: ${up.video.name}${up.video.duration?` (${Math.round(up.video.duration)} s)`:''}`:`Video link: ${up.video.link}`,evidenceFiles:up.evidenceFiles,video:up.video,submitted:'Demo application'};notify(st,'admin',`${st.tutor.name} submitted verification documents for review.`,'/admin/tutors.html');const rec=st.catalog.tutors.find(x=>x.id==='t-new');if(rec&&up.video.link)rec.demoLink=up.video.link;});location.reload()});
 bindUploads($('#verification-form')||document);
 $('#simulate-approval')?.addEventListener('click',()=>{if(getAuthSession()?.type!=='account')return;mutate(st=>{st.tutor.verificationStatus='approved';(st.tutor.subjectApprovals||[]).forEach(x=>{if(x.status==='pending')x.status='approved'});const record=st.catalog.tutors.find(x=>x.id==='t-new');if(record){record.verified=true;record.approvedScopes=st.tutor.subjectApprovals;record.quality=70;}});location.reload()});
}
function requests(){
 const s=prepareInbox(),inbox=inboxHtml(s);
 queueMicrotask(bindInbox);
 const note=s.tutor.profile?(s.tutor.verificationStatus==='approved'?'':`<div class="policy-note">Your profile is not approved yet, so new students cannot be matched to you. ${btn('Open verification →','/tutor/verification.html','outline')}</div>`):`<div class="policy-note">Complete your tutor profile so students can find you. ${btn('Complete profile →','/tutor/onboarding.html','outline')}</div>`;
 workspace('tutor','requests','Student requests','Requests from students who chose you, plans to adjust, and reschedule / cancel decisions.',
  inbox+note+(inbox?'':empty('No student requests yet','When a student chooses you, their request, worksheet and draft plan appear here. You will get a notification.',btn('Back to dashboard →','/tutor/dashboard.html','outline'))));
}
function groups(){const s=state(),t=s.tutor;
 if(!t.profile)return workspace('tutor','groups','Small-group courses','Set up a tutor profile before opening your first group.',empty('You need a tutor profile first','Tell us what you teach, your class formats and availability.',btn('Create tutor profile →','/tutor/onboarding.html')));
 if(t.verificationStatus!=='approved')return workspace('tutor','groups','Small-group courses','Complete tutor verification before publishing.',empty('Complete verification first','You can prepare your teaching profile now, then publish groups after approval.',btn('View verification →','/tutor/verification.html')));
 if(!t.profile.formats?.includes('group'))return workspace('tutor','groups','Small-group courses','Enable small group teaching in your profile.',empty('Group format is not enabled','Edit your teaching formats without re-verification (your existing approved scopes will stay active).',btn('Edit tutor profile →','/tutor/onboarding.html')));
 const allowed=(t.subjectApprovals||[]).filter(a=>a.status==='approved').map(a=>({subject:a.subject,grades:a.grades,schedule:t.profile.schedule||[]}));if(!allowed.length)return workspace('tutor','groups','Small-group courses','Subject approval required',empty('No approved subjects','Admin must approve your initial subject and grade before you can publish a group.',btn('Open verification →','/tutor/verification.html')));const rows=s.catalog.groups.filter(g=>t.groups.includes(g.id));
 const content=`<div class="two-col form-split">${panel('Create a small group',`<form id="group-create" class="stack-form">${field('title','Course title','M.4 Mathematics Grade Booster')}
 ${formSelect('subject','Subject',[...new Set(allowed.map(o=>o.subject))],allowed[0].subject)}${formSelect('grade','Grade',[...new Set(allowed.flatMap(o=>o.grades))],allowed[0].grades[0])}
 ${formSelect('schedule','Weekly schedule',DAYS.map(x=>({value:x.id,label:x.name})),allowed[0].schedule[0]||'thu')}
 ${formSelect('capacity','Maximum learners',[2,3,4,5].map(x=>String(x)),'4')}<p class="mini-tips">Seats start at 0. Invite your own learners using a class link after publishing; the roster only grows when a student accepts.</p>
 ${field('price','Price per student / 8-lesson package (THB)','1600','number')}
 <label class="field"><span>Group description (optional)</span><textarea name="description" rows="3">School exam practice and guided lessons</textarea></label>
 <button class="button primary" type="submit">Publish demo group →</button><p class="form-message" id="group-msg"></p></form>`)}${panel('Your small groups',rows.length?rows.map(g=>`<div class="group-summary"><div class="between"><strong>${esc(g.name)}</strong>${tag(g.capacity-g.byos-g.platform>0?'Accepting students':'Full','green')}</div><p>${esc(g.grade)} · ${esc(g.subject)} · ${listToLabel([g.schedule])}</p><div class="between"><span>${g.byos} BYOS · ${g.platform} TutorPair</span><b>${g.byos+g.platform}/${g.capacity} seats</b></div>${progress((g.byos+g.platform)/g.capacity*100)}<div class="row-actions">${btn('Invite existing students →','/tutor/invite.html','outline')}<button class="button outline fill-seat" data-group="${g.id}" ${g.byos+g.platform>=g.capacity?'disabled':''}>Simulate filling TutorPair seat →</button></div></div>`).join(''):empty('No classes yet','Create a group, bring your own learners, and offer the remaining seats on TutorPair.'))}</div>`;
 workspace('tutor','groups','Small-group management','Publish a small group, invite your own students, then fill remaining seats via TutorPair (commission is a proposed policy).',content);
 const groupSubject=$('#group-create select[name="subject"]');
 const groupGrade=$('#group-create select[name="grade"]');
 groupSubject?.addEventListener('change',()=>{const grades=[...new Set(allowed.filter(a=>a.subject===groupSubject.value).flatMap(a=>a.grades))];groupGrade.innerHTML=grades.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');});
 $('#group-create').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget)),capacity=Number(data.capacity),byos=0,price=Number(data.price);
  if(byos>capacity||byos<0||price<=0||!allowed.some(o=>o.subject===data.subject&&o.grades.includes(data.grade)&&o.schedule.includes(data.schedule))){feedback('#group-msg','Check the existing-student count and package price.','error');return;}
  mutate(s=>{const id='newgroup-'+Date.now();s.catalog.groups.push({id,tutorId:s.scenario==='returning'?'t01':'t-new',name:data.title,subject:data.subject,grade:data.grade,schedule:data.schedule,capacity,byos,platform:0,price,sessions:8,durationMinutes:60,description:data.description});s.tutor.groups.push(id);});location.reload();
 });
 $$('.fill-seat').forEach(b=>b.addEventListener('click',()=>{mutate(s=>{const g=s.catalog.groups.find(x=>x.id===b.dataset.group);if(g&&g.byos+g.platform<g.capacity){g.platform++;const studentId='seat-'+Date.now();s.tutor.roster.push({studentId,name:'New matched student',grade:g.grade,subject:g.subject,source:'TutorPair'});ensurePlan(s,studentId,[])}});location.reload()}));
}
function inviteStudents(){
 const s=state(),auth=getAuthSession();
 const eligible=s.catalog.groups.filter(g=>s.tutor.groups.includes(g.id));
 const active=s.tutor.verificationStatus==='approved';
 const scopes=(s.tutor.subjectApprovals||[]).filter(a=>a.status==='approved');
 const mine=myInvites();
 const options=[...eligible.map(g=>({value:g.id,label:`Small group · ${g.name} · ${g.byos+g.platform}/${g.capacity} seats`})),{value:'__one',label:'Private 1-on-1 course (4 sessions)'}];
 const oneFields=`<div id="one-fields" class="stack-form" hidden>${formSelect('oneSubject','Subject',[...new Set(scopes.map(a=>a.subject))],scopes[0]?.subject)}${formSelect('oneGrade','Grade',[...new Set(scopes.flatMap(a=>a.grades))],scopes[0]?.grades[0])}<div class="form-grid"><label class="field"><span>Your hourly rate (THB, min ${MIN_RATE})</span><input type="number" name="oneRate" min="${MIN_RATE}" step="10" value="${esc(s.tutor.profile?.price||450)}"></label>${formSelect('oneLength','Session length',[{value:'60',label:'60 min'},{value:'90',label:'90 min'},{value:'120',label:'120 min'}],'60')}</div>${formSelect('oneType','Course pace',Object.values(PACES).map(p=>({value:p.id,label:`${p.name} · ${p.weeks} wk × ${p.perWeek}/wk`})),'regular')}</div>`;
 const content=`<div class="byos-intro"><div class="eyebrow">BRING YOUR OWN STUDENTS</div><h2>Your students, one TutorPair workspace.</h2><p>Invite an existing learner into a class you already teach. They join with a normal Student account and can later find another tutor for a different subject. Invite links open on any device.</p><div class="actions">${btn('Manage small groups →','/tutor/groups.html','outline')}${btn('View my students →','/tutor/students.html','outline')}</div></div>
 <div class="two-col big-left">${panel('Invite a student',!active?empty('Verification required','Publish invitations after your tutor identity and subject/grade have been approved.',btn('Tutor verification →','/tutor/verification.html'))+(auth?.type==='demo'?'<div class="policy-note">Demo tip: switch Demo mode (top bar) to <b>Active · 3 classes</b> to try invitations right away.</div>':''):
 `<form id="byos-invite-form" class="stack-form">${formSelect('groupId','What are you inviting them to?',options)}${oneFields}<div class="policy-note">No extra tutor verification is needed for a class in your approved subject/grade. A learner is added only after they open the link and accept.</div><button type="submit" class="button primary">Generate invitation link →</button><p class="form-message" id="byos-invite-msg"></p></form><div id="byos-invite-result"></div>`)}
 ${panel('Invitations & classes',(eligible.length?eligible.map(g=>`<div class="group-summary"><div class="between"><strong>${esc(g.name)}</strong>${tag(g.capacity-g.byos-g.platform>0?'Open seats':'Full',g.capacity-g.byos-g.platform>0?'green':'orange')}</div><p>${esc(g.grade)} · ${esc(g.subject)} · ${esc(DAYS.find(x=>x.id===g.schedule)?.name||g.schedule)}</p><div class="between"><span>${g.byos} BYOS · ${g.platform} TutorPair</span><b>${g.byos+g.platform}/${g.capacity} seats</b></div>${progress(100*(g.byos+g.platform)/g.capacity)}</div>`).join(''):'')+(mine.length?`<h4 class="sub-h">Links you created</h4>${mine.map(i=>`<div class="invite-row"><div><strong>${esc(i.snapshot?.name||'Class invite')}</strong><small>${esc(new Date(i.createdAt).toLocaleDateString('en-GB'))} · ${i.snapshot?.kind==='one'?'1-on-1':'group'}</small></div><button type="button" class="button outline small" data-copy-code="${esc(i.code)}">Copy link</button></div>`).join('')}<p id="byos-list-msg" class="form-message"></p>`:'')||empty('No invitations yet','Generate a link and send it to your student by LINE or email.'))}</div><div class="policy-note section-gap">Demo limitation: accounts, rosters and invitation records live in this browser only. The link itself carries the class details so a student can open it elsewhere, but the roster here updates only when the student joins in the same browser or demo session. The 0% BYOS commission is an unapproved business-model proposal.</div>`;
 workspace('tutor','invite','Invite my students (BYOS)','Same Tutor account, same class management — only enrollment source differs.',content);
 const sel=$('#byos-invite-form select[name="groupId"]');
 const toggleOne=()=>{const f=$('#one-fields');if(f)f.hidden=sel.value!=='__one'};
 sel?.addEventListener('change',toggleOne);toggleOne();
 $('#byos-invite-form')?.addEventListener('submit',e=>{
  e.preventDefault();const f=e.currentTarget.elements;
  try{
   const invite=f.groupId.value==='__one'?createOneOnOneInvite({subject:f.oneSubject.value,grade:f.oneGrade.value,rate:f.oneRate.value,length:f.oneLength.value,courseType:f.oneType.value}):createGroupInvite(f.groupId.value);
   const link=invitationUrl(invite.code);
   $('#byos-invite-result').innerHTML=`<div class="byos-link-card"><strong>Invitation created</strong><p>Share this link with your student. They create a Student account (or log in), accept the class, and can later use Find Another Tutor.</p><input id="byos-link" value="${esc(link)}" readonly aria-label="Invitation link"><div class="row-actions"><button class="button primary" id="copy-byos-link" type="button">Copy link</button><a class="button outline" href="${esc(link)}">Preview join page</a>${auth?.type==='demo'?'<button class="button outline" id="demo-join" type="button">Join as the student (demo) →</button>':''}</div><p id="byos-copy-msg" class="form-message"></p></div>`;
   $('#copy-byos-link').addEventListener('click',()=>copyBYOS(link,'#byos-copy-msg'));
   $('#demo-join')?.addEventListener('click',()=>{switchRole('student');location.href=link});
   feedback('#byos-invite-msg','Invitation generated. No student has joined yet.');
  }catch(err){feedback('#byos-invite-msg',err.message,'error')}
 });
 $$('[data-copy-code]').forEach(b=>b.addEventListener('click',()=>copyBYOS(invitationUrl(b.dataset.copyCode),'#byos-list-msg')));
}
async function copyBYOS(link,msg){try{await navigator.clipboard.writeText(link);feedback(msg,'Link copied. Send it to your student.')}catch{feedback(msg,'Copy unavailable. Select the link text and copy it manually.','error')}}
