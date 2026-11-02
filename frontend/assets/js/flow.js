// Pure logic for the TutorPair booking → plan → payment → learning loop. No DOM access.
// Everything here is a browser-only simulation: no real payments, uploads, video or LINE delivery.
import {TOPICS} from '../data/mock-data.js';
import {legacyToSlots,slotsToDays,overlapSlots,parseSlots} from './availability.js';
/** In-app notification for a role ('student' | 'tutor' | 'parent'). */
export function notify(s,to,text,href='',now=Date.now()){
 s.inbox=[{id:'n'+now.toString(36)+Math.random().toString(36).slice(2,6),to,text,href,at:now,read:false},...(s.inbox||[])].slice(0,50);
}
export const MIN_RATE=100,PLATFORM_FEE=0,SESSIONS=4,H24=24*3600*1000,DAY_MS=24*3600*1000;
export const PACES={
 regular:{id:'regular',name:'Regular Pace',weeks:4,perWeek:1,best:'Best for homework & foundation'},
 sprint:{id:'sprint',name:'Exam Rescue Sprint',weeks:2,perWeek:2,best:'Best for upcoming midterms / finals'},
 cram:{id:'cram',name:'Emergency Cram',weeks:1,perWeek:4,best:'Best for exam-week crunch'}
};
export const LENGTHS=[60,90,120];
export const courseHours=len=>SESSIONS*Number(len||60)/60;
export function budgetCalc(budget,len){const hours=courseHours(len);return {hours,max:Math.round(Number(budget||0)*hours)}}
export function coursePrice(rate,len){const hours=courseHours(len),subtotal=Math.round(Number(rate)*hours),fee=Math.round(subtotal*PLATFORM_FEE);return {hours,subtotal,fee,total:subtotal+fee}}
export const paceLabel=(id,len)=>`${PACES[id]?.name||'Course'} · ${PACES[id]?.weeks||4} wk × ${PACES[id]?.perWeek||1}/wk · ${len||60} min`;
const uid=p=>p+'-'+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
const DOW=['sun','mon','tue','wed','thu','fri','sat'];

/* ---------- Draft lesson plan (rule-based stand-in for AI generation) ---------- */
export function draftPlan(req){
 const topics=TOPICS[req.subject]||['Core concepts','Exam skills'];
 const ws=req.worksheetName?`your worksheet “${req.worksheetName}”`:'your school syllabus';
 const wish=(req.goal||'').trim().slice(0,90);
 const exam=req.goalType==='exam-prep'||req.courseType==='sprint'||req.courseType==='cram';
 const titles=[
  ['Diagnose & foundations',`Review ${ws}, find gaps, set one clear target${wish?` — “${wish}”`:''}.`],
  [topics[0]||'Core topic',`Work through ${topics[0]||'the core topic'} with examples from ${ws}.`],
  [topics[1]||'Practice & application',`Mixed practice on ${topics[1]||'applied questions'}; fix repeated mistakes.`],
  [exam?'Mock test & final review':'Consolidation & next steps',exam?'Timed mock questions, error review and a last-minute checklist.':'Recap, confidence check and a plan to keep improving.']
 ];
 return titles.map(([title,focus],i)=>({n:i+1,title,focus,pacing:'',homework:[`Practice set: ${title}`,'Redo mistakes from class']}));
}

/* ---------- Tutor presentation data for match cards (sample data) ---------- */
// Clearly fictional sample statistics for the demo catalog (not real tutors).
const EXTRAS={
 t01:{faculty:'Faculty of Science · Mathematics',honors:'GPA 3.92 · First-class honours',rating:4.9,reviews:128,hours:412,renew:86,video:'Solving quadratic word problems'},
 t02:{faculty:'Faculty of Engineering',honors:'GPA 3.74 · Dean’s list',rating:4.8,reviews:96,hours:301,renew:81,video:'Fixing a common algebra sign error'},
 t03:{faculty:'Faculty of Science and Technology',honors:'GPA 3.85 · Honours',rating:4.9,reviews:140,hours:520,renew:88,video:'Making functions visual'},
 t04:{faculty:'Faculty of Engineering · KMUTT',honors:'GPA 3.61 · Olympiad medalist',rating:4.7,reviews:58,hours:188,renew:74,video:'Hard-question strategy for M.5'},
 t05:{faculty:'Faculty of Engineering · KMITL',honors:'GPA 3.70 · Honours',rating:4.8,reviews:77,hours:342,renew:83,video:'Newton’s laws in 3 minutes'},
 t06:{faculty:'Faculty of Humanities',honors:'GPA 3.88 · IELTS 8.0',rating:4.9,reviews:164,hours:610,renew:90,video:'Fixing tense mistakes in writing'}
};
export function tutorExtras(t){
 const e=EXTRAS[t.id];if(e)return {...e,sample:false,fictional:true};
 return {faculty:t.university||'University student',honors:'New Tutor',rating:null,reviews:0,hours:0,renew:null,video:'Teaching demo',sample:true};
}

/* ---------- Why matched ---------- */
const CHIP={pace:{fast:'Fast & Concise',medium:'Balanced Pace',slow:'Slow & Detailed'},approach:{step:'Step-by-Step',practice:'Practice & Drills',concept:'Concept Building'},interaction:{encouraging:'Patient & Encouraging',independent:'Let Me Try First',balanced:'Balanced Support'}};
const VERB={pace:{fast:'moves at a faster pace',medium:'keeps a steady, comfortable pace',slow:'explains every step slowly'},approach:{step:'walks through worked examples step by step',practice:'gets you into practice drills early',concept:'builds the idea before the formulas'},interaction:{encouraging:'stays patient and encouraging',independent:'lets you attempt problems on your own, then steps in with clear shortcuts when needed',balanced:'balances guidance with room to think'}};
const PREF={pace:{fast:'a fast pace',medium:'a balanced pace',slow:'a slow, detailed pace'},approach:{step:'step-by-step teaching',practice:'quick practice drills',concept:'building concepts first'},interaction:{encouraging:'an encouraging tutor',independent:'trying problems first',balanced:'balanced support'}};
export function whyMatched(student,tutor){
 const chips=[],verbs=[],prefs=[];
 for(const k of ['pace','approach','interaction']){
  const sup=Array.isArray(tutor[k])?tutor[k]:tutor[k]?[tutor[k]]:[];
  const pick=student?.[k]&&student[k]!=='any'&&sup.includes(student[k])?student[k]:null;
  if(pick){chips.push(CHIP[k][pick]);verbs.push(VERB[k][pick]);prefs.push(PREF[k][pick])}
 }
 if(!chips.length&&tutor.approach?.[0]){const a=tutor.approach[0];chips.push(CHIP.approach[a]);verbs.push(VERB.approach[a]);prefs.push(PREF.approach[a])}
 const first=(tutor.name||'This tutor').replace(/^(P'|P’|Ajarn |Khun )/,'P’').split(' ')[0],j=a=>a.length>1?a.slice(0,-1).join(', ')+' and '+a.at(-1):a[0]||'';
 const sentence=prefs.length?`${first} matches your preference for ${j(prefs)}. This tutor ${j(verbs)}.`:`${first} adapts to your goals and level.`;
 return {chips:chips.filter(Boolean),sentence};
}
export function availabilityOverlap(studentSlots,tutor){return overlapSlots(studentSlots,tutor.availability?.length?tutor.availability:legacyToSlots(tutor.schedule||[]))}

/* ---------- Lessons ---------- */
export function buildLessons(plan,{courseType='regular',length=60,availability=[],days=[],now=Date.now()}){
 const pace=PACES[courseType]||PACES.regular,slots=parseSlots(availability);
 const chosen=(days.length?days:slotsToDays(slots)).slice(0,Math.max(pace.perWeek,1));
 const hourFor=d=>{const h=slots.filter(s=>s.startsWith(d+'-')).map(s=>Number(s.split('-')[1])).sort((a,b)=>a-b)[0];return h??18};
 const out=[];const base=new Date(now);base.setHours(0,0,0,0);
 for(let off=1;off<=pace.weeks*7+7&&out.length<SESSIONS;off++){
  const d=new Date(base.getTime()+off*DAY_MS),id=DOW[d.getDay()];
  if(off>pace.weeks*7)break;
  if(chosen.includes(id)){d.setHours(hourFor(id),0,0,0);out.push(d)}
 }
 // Fallback: not enough matching weekdays → spread evenly so every plan still gets 4 sessions.
 for(let i=0;out.length<SESSIONS;i++){const d=new Date(base.getTime()+(1+i*Math.max(1,Math.floor(pace.weeks*7/SESSIONS)))*DAY_MS);d.setHours(18,0,0,0);out.push(d)}
 out.sort((a,b)=>a-b);
 return plan.slice(0,SESSIONS).map((p,i)=>({n:i+1,title:p.title,focus:p.focus,pacing:p.pacing||'',homework:p.homework||[],startsAt:out[i].toISOString(),length,status:'upcoming'}));
}
export function ensureLessons(c,now=Date.now()){
 if(c.lessons)return c.lessons;
 const n=Math.max(1,Number(c.sessions)||4),done=Number(c.completed)||0;
 c.lessons=Array.from({length:n},(_,i)=>({n:i+1,title:`Lesson ${i+1}`,focus:`${c.subject||'Lesson'} session ${i+1}`,pacing:'',homework:[`Practice set ${i+1}`],startsAt:new Date(now+(i-done+1)*7*DAY_MS).toISOString(),length:c.sessionLength||60,status:i<done?'done':'upcoming'}));
 return c.lessons;
}
export const lessonsOf=c=>c.lessons||ensureLessons({...c,lessons:null},Date.now());
/** Visible state: done | cancelled | in_progress (first open lesson) | upcoming */
export function lessonStates(c){const ls=lessonsOf(c);let found=false;return ls.map(l=>{if(l.status==='done'||l.status==='cancelled')return l.status;if(!found){found=true;return 'in_progress'}return 'upcoming'})}
export const nextLesson=c=>{const st=lessonStates(c);const i=st.indexOf('in_progress');return i<0?null:lessonsOf(c)[i]};
export const fmtDate=iso=>new Date(iso).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

/* ---------- Engagement: select tutor → accept → edit plan → approve → pay → active ---------- */
export const STATUS_LABEL={awaiting_tutor:'Waiting for tutor',tutor_editing:'Tutor is adjusting the plan',plan_review:'Plan ready for your approval',awaiting_payment:'Awaiting PromptPay payment',active:'Active',declined:'Declined',expired:'Expired — no reply in 24 h'};
const OPEN=['awaiting_tutor','tutor_editing','plan_review','awaiting_payment'];
export const isOpen=e=>OPEN.includes(e.status);
export function refreshEngagements(s,now=Date.now()){
 let changed=false;(s.engagements||[]).forEach(e=>{if(e.status==='awaiting_tutor'&&now>e.expiresAt){e.status='expired';e.log.push({t:now,text:'No tutor reply within 24 hours — request expired.'});changed=true}});
 return changed;
}
export function createEngagement(s,tutor,req,now=Date.now()){
 s.engagements??=[];
 const dup=s.engagements.find(e=>isOpen(e)&&e.tutorId===tutor.id&&e.request.subject===req.subject);
 if(dup)return dup;
 const len=Number(req.sessionLength||60),price=coursePrice(tutor.price,len);
 const plan=req.draftPlan?.length?req.draftPlan:draftPlan(req);
 const e={id:uid('eng'),tutorId:tutor.id,tutorName:tutor.name,tutorInitials:tutor.initials,studentId:s.student.id,studentName:s.student.name,
  request:{grade:req.grade,subject:req.subject,goal:req.goal||'',goalType:req.goalType,worksheetName:req.worksheetName||'',courseType:req.courseType||'regular',sessionLength:len,availability:parseSlots(req.availability),budget:Number(req.budget),pace:req.pace,approach:req.approach,interaction:req.interaction},
  rate:Number(tutor.price),pricing:price,draftPlan:plan,plan:JSON.parse(JSON.stringify(plan)),status:'awaiting_tutor',createdAt:now,expiresAt:now+H24,
  log:[{t:now,text:`Request sent to ${tutor.name}. Tutor has 24 hours to accept.`}]};
 s.engagements.push(e);
 notify(s,'tutor',`New student request from ${e.studentName} (${e.request.subject}). Reply within 24 hours.`,'/tutor/requests.html',now);
 return e;
}
export const findEngagement=(s,id)=>(s.engagements||[]).find(e=>e.id===id);
function guard(e,from){if(!e)throw Error('Request not found.');if(e.status!==from)throw Error(`This request is no longer ${STATUS_LABEL[from]?.toLowerCase()||from}.`)}
export function tutorAccept(s,id,now=Date.now()){const e=findEngagement(s,id);guard(e,'awaiting_tutor');if(now>e.expiresAt)throw Error('The 24-hour reply window has passed.');e.status='tutor_editing';e.log.push({t:now,text:`${e.tutorName} accepted and is reviewing the worksheet and draft plan.`});notify(s,'student',`${e.tutorName} accepted your request. They are adjusting your lesson plan now.`,'/student/engagement.html?id='+encodeURIComponent(e.id),now);return e}
export function tutorDecline(s,id,now=Date.now()){const e=findEngagement(s,id);guard(e,'awaiting_tutor');e.status='declined';e.log.push({t:now,text:`${e.tutorName} declined. You can choose another tutor from your matches.`});notify(s,'student',`${e.tutorName} declined your request. Choose another tutor from your matches.`,'/student/matching.html',now);return e}
export function sendPlan(s,id,plan,note='',now=Date.now()){
 const e=findEngagement(s,id);if(!e)throw Error('Request not found.');if(!['tutor_editing','plan_review'].includes(e.status))throw Error('Accept the request before sending a plan.');
 if(!plan.length||plan.some(p=>!String(p.title||'').trim()))throw Error('Every lesson needs a topic.');
 e.plan=plan.map((p,i)=>({n:i+1,title:p.title.trim(),focus:String(p.focus||'').trim(),pacing:String(p.pacing||'').trim(),homework:p.homework||e.draftPlan[i]?.homework||[]}));
 e.tutorNote=note;e.status='plan_review';e.log.push({t:now,text:`${e.tutorName} sent an adjusted plan for your review.`});notify(s,'student',`${e.tutorName} sent your adjusted lesson plan. Review and approve it.`,'/student/engagement.html?id='+encodeURIComponent(e.id),now);notify(s,'parent',`${e.tutorName} sent ${e.studentName}'s lesson plan for approval.`,'',now);return e;
}
export function requestPlanChanges(s,id,msg,now=Date.now()){
 const e=findEngagement(s,id);guard(e,'plan_review');
 const why=String(msg||'').trim();if(why.length<5)throw Error('Please tell the tutor what you would like changed (at least a few words).');
 e.status='tutor_editing';e.studentFeedback=why;(e.feedbackHistory??=[]).push({t:now,text:why});
 e.log.push({t:now,text:`You asked for changes: ${why}`});
 notify(s,'tutor',`${e.studentName} asked for changes to the plan: “${why.slice(0,90)}${why.length>90?'…':''}”`,'/tutor/requests.html',now);
 return e;
}
export function approvePlan(s,id,now=Date.now()){const e=findEngagement(s,id);guard(e,'plan_review');e.status='awaiting_payment';e.log.push({t:now,text:'Plan approved. PromptPay escrow checkout opened.'});return e}
export const planDiffers=e=>JSON.stringify(e.plan.map(p=>[p.title,p.focus,p.pacing]))!==JSON.stringify(e.draftPlan.map(p=>[p.title,p.focus,p.pacing||'']));
export function payEngagement(s,id,now=Date.now()){
 const e=findEngagement(s,id);guard(e,'awaiting_payment');
 const r=e.request,courseId=uid('course');
 const lessons=buildLessons(e.plan,{courseType:r.courseType,length:r.sessionLength,availability:r.availability,now});
 const course={id:courseId,engagementId:e.id,title:`${r.grade} ${r.subject} · ${PACES[r.courseType]?.name||'Course'}`,tutorId:e.tutorId,tutorName:e.tutorName,subject:r.subject,grade:r.grade,source:'TutorPair',started:true,
  sessions:SESSIONS,completed:0,price:e.pricing.total,rate:e.rate,fee:e.pricing.fee,courseType:r.courseType,sessionLength:r.sessionLength,lessons,nextLesson:fmtDate(lessons[0].startsAt),
  escrow:{paidAt:now,amount:e.pricing.total,method:'PromptPay (simulated)'}};
 s.student.courses??=(s.student.course?[s.student.course]:[]);s.student.courses.push(course);s.student.course=course;
 if(!s.tutor.roster.some(x=>x.classId===courseId))s.tutor.roster.push({studentId:s.student.id,name:s.student.name,grade:r.grade,subject:r.subject,source:'TutorPair',classId:courseId});
 e.status='active';e.courseId=courseId;e.log.push({t:now,text:'Payment held in escrow. Your 4 lessons are scheduled.'});notify(s,'tutor',`${e.studentName} paid into escrow. ${r.subject} course is now active.`,'/tutor/students.html',now);notify(s,'student','Payment received in escrow. Your 4 lessons are scheduled.','/student/progress.html',now);
 return course;
}

/* ---------- Class access (student courses + extra classes taught by the demo tutor) ---------- */
export const allClasses=s=>[...(s.student.courses||(s.student.course?[s.student.course]:[])),...(s.otherClasses||[])];
export const findClass=(s,id)=>allClasses(s).find(c=>c.id===id);
export function tutorClasses(s,demo,tutorId){return allClasses(s).filter(c=>c.started!==false&&(demo||c.tutorId===tutorId||c.byosTutorAccountId===tutorId)).map(c=>({...c,_ref:c}))}

/* ---------- Reschedule / cancel ---------- */
export function requestChange(s,classId,n,type,newStartsAt='',now=Date.now(),reason=''){
 const c=findClass(s,classId);if(!c)throw Error('Class not found.');
 const ls=ensureLessons(c,now),l=ls[n-1];if(!l||l.status!=='upcoming')throw Error('Only upcoming lessons can be changed.');
 s.changeRequests??=[];
 if(s.changeRequests.some(r=>r.classId===classId&&r.lessonN===n&&r.status==='pending'))throw Error('A request for this lesson is already waiting for the tutor.');
 if(type==='reschedule'){if(!newStartsAt||Number.isNaN(Date.parse(newStartsAt)))throw Error('Choose a new date and time.');if(Date.parse(newStartsAt)<now)throw Error('Choose a future time.')}
 const late=Date.parse(l.startsAt)-now<H24;
 const r={id:uid('chg'),classId,lessonN:n,type,from:l.startsAt,newStartsAt:type==='reschedule'?new Date(newStartsAt).toISOString():'',status:'pending',late,reason:String(reason||'').trim(),createdAt:now,studentName:c.studentName||s.student.name,subject:c.subject,tutorName:c.tutorName};
 s.changeRequests.push(r);notify(s,'tutor',`${r.studentName} asked to ${type} Lesson ${n}${late?' (inside 24 h notice)':''}.`,'/tutor/requests.html',now);return r;
}
export function resolveChange(s,id,accept,now=Date.now()){
 const r=(s.changeRequests||[]).find(x=>x.id===id);if(!r||r.status!=='pending')throw Error('Request already handled.');
 const c=findClass(s,r.classId),l=c&&ensureLessons(c,now)[r.lessonN-1];
 r.status=accept?'accepted':'rejected';r.resolvedAt=now;
 if(accept&&l){if(r.type==='reschedule'){l.startsAt=r.newStartsAt;l.rescheduled=true}else{l.status='cancelled';l.cancelledEarly=!r.late}}
 notify(s,'student',`${r.tutorName||'Your tutor'} ${accept?'accepted':'rejected'} your ${r.type} request for Lesson ${r.lessonN}.`,'/student/progress.html',now);
 return r;
}
export const pendingChanges=s=>(s.changeRequests||[]).filter(r=>r.status==='pending');

/* ---------- Evaluations ---------- */
export const CLARITY=[[1,'Confusing'],[2,'Okay'],[3,'Very clear']];
export const PACE_OPTS=[['slow','Too slow'],['right','Just right'],['fast','Too fast']];
export const ENGAGEMENT=[[1,'Distracted'],[2,'Engaged'],[3,'Very engaged']];
export function submitStudentEval(s,classId,n,{clarity,pace},now=Date.now()){
 const c=findClass(s,classId),l=c&&lessonsOf(c)[n-1];if(!c)throw Error('Class not found.');ensureLessons(c,now);const L=c.lessons[n-1];
 if(L.status!=='done')throw Error('You can rate a lesson after it has finished.');
 if(![1,2,3].includes(Number(clarity))||!PACE_OPTS.some(p=>p[0]===pace))throw Error('Pick a face and a pace.');
 L.studentEval={clarity:Number(clarity),pace,at:now};return L.studentEval;
}
/** Aggregated tutor quality score (0–100) from private student evaluations. */
export function tutorQuality(classes){
 const evals=classes.flatMap(c=>lessonsOf(c).map(l=>l.studentEval).filter(Boolean));
 if(!evals.length)return {score:null,count:0};
 const pts=evals.map(e=>(e.clarity-1)/2*70+(e.pace==='right'?30:e.pace?12:0));
 return {score:Math.round(pts.reduce((a,b)=>a+b,0)/pts.length),count:evals.length,clarity:+(evals.reduce((a,e)=>a+e.clarity,0)/evals.length).toFixed(1),right:Math.round(100*evals.filter(e=>e.pace==='right').length/evals.length)};
}
/** Tutor → student checklist. Completes the lesson and creates the LINE card + Vault entry. */
export function submitTutorEval(s,classId,n,{engagement,homework=[],note,pdfName=''},now=Date.now()){
 const c=findClass(s,classId);if(!c)throw Error('Class not found.');
 const ls=ensureLessons(c,now),L=ls[n-1];
 if(!L||L.status==='done')throw Error('This lesson has already been reported.');
 if(![1,2,3].includes(Number(engagement)))throw Error('Rate engagement from 1 to 3.');
 const text=String(note||'').trim();if(!text)throw Error('Add a one-sentence note.');
 if(text.length>200)throw Error('Keep the note to one short sentence (200 characters max).');
 L.status='done';L.tutorEval={engagement:Number(engagement),homework,note:text,pdf:pdfName||'',at:now};
 c.completed=ls.filter(x=>x.status==='done').length;
 const last=ls.filter(x=>x.status!=='cancelled').every(x=>x.status==='done');
 if(last&&!c.completedAt)c.completedAt=now;
 const next=ls.find(x=>x.status==='upcoming');c.nextLesson=next?fmtDate(next.startsAt):'Course complete';
 if(pdfName){s.vault??=[];s.vault.push({id:uid('pdf'),classId:c.id,lessonN:n,title:L.title,subject:c.subject,tutorName:c.tutorName,name:pdfName,at:now})}
 const hwDone=homework.filter(h=>h.done).length;
 const card={id:uid('line'),classId:c.id,studentName:c.studentName||s.student.name,subject:c.subject,lessonN:n,total:ls.length,topic:L.title,engagement:Number(engagement),hwDone,hwTotal:homework.length,note:text,pdf:pdfName||'',at:now,to:['Student','Parent']};
 s.lineMessages??=[];s.lineMessages.push(card);
 s.notes??=[];s.notes.push({id:'note-'+now,studentId:s.student.id,classId:c.id,topic:L.title,strength:text,improve:`Engagement ${engagement}/3 · homework ${hwDone}/${homework.length}`,homework:L.homework?.join(' · ')||'',date:'Just now'});
 notify(s,'student',`Lesson ${n} report from your tutor: ${L.title}`,'/student/progress.html',now);notify(s,'parent',`${card.studentName}: Lesson ${n} progress card sent to LINE.`,'/parent/progress.html',now);
 return card;
}
export function submitParentCheck(s,{progress,cont},now=Date.now()){
 const month=new Date(now).toISOString().slice(0,7);s.parentChecks??=[];
 if(s.parentChecks.some(x=>x.month===month))throw Error('You already answered this month’s check-in.');
 if(!(progress>=1&&progress<=5)||!['yes','maybe','no'].includes(cont))throw Error('Answer both questions.');
 const r={month,progress:Number(progress),cont,at:now,churnRisk:cont==='no'||(cont==='maybe'&&progress<=2)};s.parentChecks.push(r);return r;
}
/** Public two-sided review after the final session; hidden until both submit or 14 days pass. */
export function reviewState(c,now=Date.now()){
 const r=c.reviews||{},both=Boolean(r.student&&r.tutor),due=c.completedAt?c.completedAt+14*DAY_MS:null,expired=Boolean(due&&now>=due);
 return {student:r.student||null,tutor:r.tutor||null,eligible:Boolean(c.completedAt),visible:Boolean(c.completedAt&&(both||expired)),both,expired,daysLeft:due?Math.max(0,Math.ceil((due-now)/DAY_MS)):14};
}
export function submitReview(s,classId,side,{stars,text},now=Date.now()){
 const c=findClass(s,classId);if(!c)throw Error('Class not found.');
 if(!c.completedAt)throw Error('Reviews open after the 4th session.');
 if(!(stars>=1&&stars<=5))throw Error('Choose 1–5 stars.');
 const t=String(text||'').trim();if(t.length<5)throw Error('Add a short written review.');if(t.length>400)throw Error('Keep it under 400 characters.');
 c.reviews??={};if(c.reviews[side])throw Error('You already submitted a review.');
 c.reviews[side]={stars:Number(stars),text:t,at:now};return c.reviews[side];
}

/* ---------- Ledger (punch card + escrow) ---------- */
export function ledger(c){
 const ls=lessonsOf(c),n=ls.length,total=Number(c.escrow?.amount??c.price)||0,per=n?total/n:0;
 const rows=[];if(total)rows.push({kind:'in',label:'PromptPay escrow deposit',amount:total,at:c.escrow?.paidAt||null});
 ls.forEach(l=>{if(l.status==='done')rows.push({kind:'out',label:`Released to tutor · Lesson ${l.n}`,amount:-per,at:l.tutorEval?.at||null});if(l.status==='cancelled')rows.push({kind:'refund',label:`Refund to student · Lesson ${l.n} cancelled${l.cancelledEarly?'':' (late: policy applies)'}`,amount:l.cancelledEarly?-per:0,at:null})});
 const released=ls.filter(l=>l.status==='done').length*per,refunded=ls.filter(l=>l.status==='cancelled'&&l.cancelledEarly).length*per;
 return {rows,total,per,released:Math.round(released),refunded:Math.round(refunded),held:Math.round(total-released-refunded),punches:ls.map(l=>l.status)};
}

/* ---------- Demo seeding ---------- */
function seedClass(base,done,types,{now,tutorEvals=true}){
 const plan=draftPlan({subject:base.subject,goalType:'school-grade',courseType:base.courseType,goal:'Improve my next school grade'});
 const lessons=buildLessons(plan,{courseType:base.courseType,length:base.sessionLength,availability:base.availability,now});
 const gap=base.courseType==='cram'?DAY_MS:base.courseType==='sprint'?3.5*DAY_MS:7*DAY_MS;
 lessons.forEach((l,i)=>{if(i<done){l.status='done';l.startsAt=new Date(now-(done-i)*gap+0).toISOString();
  l.tutorEval={engagement:i%2?3:2,homework:l.homework.map((h,j)=>({text:h,done:!(i===1&&j===1)})),note:['Great start — solved most questions without hints.','Careful with signs; improving fast.','Confident on the new topic today.'][i%3],pdf:`${base.subject}-lesson-${i+1}-annotated.pdf`,at:now-(done-i)*gap};
  if(i<done-1)l.studentEval={clarity:3,pace:'right',at:now-(done-i)*gap}}});
 const total=Math.round(base.rate*courseHours(base.sessionLength)*(1+PLATFORM_FEE));
 return {...base,sessions:SESSIONS,completed:done,price:total,fee:total-Math.round(base.rate*courseHours(base.sessionLength)),started:true,lessons,nextLesson:lessons[done]?fmtDate(lessons[done].startsAt):'Course complete',escrow:{paidAt:now-(done+1)*gap,amount:total,method:'PromptPay (simulated)'}};
}
/** Active Student / Active Tutor (3 ongoing classes) / linked Parent. Mutates a fresh state object. */
export function seedActiveDemo(s,SAMPLE,SAMPLE_PLANS,clone,now=Date.now()){
 const av=legacyToSlots(['thu','sat']);
 const mk=(o,d)=>seedClass({source:'TutorPair',studentId:'s-demo',studentName:'Nicha',grade:'M.4',availability:av,...o},d,null,{now});
 const math=mk({id:'c-math',title:'M.4 Mathematics · Regular Pace',tutorId:'t01',tutorName:'P’Mew Anong',subject:'Mathematics',courseType:'regular',sessionLength:60,rate:450},1);
 const phys=mk({id:'c-phys',title:'M.4 Physics · Exam Rescue Sprint',tutorId:'t05',tutorName:'P’Fern Nalinee',subject:'Physics',courseType:'sprint',sessionLength:90,rate:460},2);
 const eng=mk({id:'c-eng',title:'M.4 English · Emergency Cram',tutorId:'t06',tutorName:'P’Jane Akarin',subject:'English',courseType:'cram',sessionLength:60,rate:420},3);
 s.student=clone(SAMPLE.students.returning);s.student.courses=[math,phys,eng];s.student.course=math;
 s.tutor=clone(SAMPLE.tutors.returning);
 s.otherClasses=[
  seedClass({id:'c-mint',title:'M.4 Mathematics · Small Group',tutorId:'t01',tutorName:'P’Mew Anong',studentId:'byos-01',studentName:'Mint',subject:'Mathematics',grade:'M.4',source:'BYOS',courseType:'regular',sessionLength:60,rate:400,availability:legacyToSlots(['sat'])},2,null,{now}),
  seedClass({id:'c-pran',title:'M.5 Mathematics · Exam Rescue Sprint',tutorId:'t01',tutorName:'P’Mew Anong',studentId:'s-pran',studentName:'Pran',subject:'Mathematics',grade:'M.5',source:'TutorPair',courseType:'sprint',sessionLength:90,rate:450,availability:legacyToSlots(['tue','thu'])},1,null,{now})
 ];
 s.tutor.roster=[{studentId:'s-demo',name:'Nicha',grade:'M.4',subject:'Mathematics',source:'TutorPair',classId:'c-math'},{studentId:'byos-01',name:'Mint',grade:'M.4',subject:'Mathematics',source:'BYOS',classId:'c-mint'},{studentId:'s-pran',name:'Pran',grade:'M.5',subject:'Mathematics',source:'TutorPair',classId:'c-pran'}];
 s.parent=clone(SAMPLE.parents.returning);
 s.learningPlans=clone(SAMPLE_PLANS);
 s.vault=[];s.lineMessages=[];s.notes=[];
 [...s.student.courses,...s.otherClasses].forEach(c=>c.lessons.forEach(l=>{if(l.status==='done'&&l.tutorEval){
  if(c.id==='c-mint'||c.id==='c-pran')return;
  s.vault.push({id:'pdf-'+c.id+l.n,classId:c.id,lessonN:l.n,title:l.title,subject:c.subject,tutorName:c.tutorName,name:l.tutorEval.pdf,at:l.tutorEval.at});
  const hw=l.tutorEval.homework;s.lineMessages.push({id:'line-'+c.id+l.n,classId:c.id,studentName:'Nicha',subject:c.subject,lessonN:l.n,total:4,topic:l.title,engagement:l.tutorEval.engagement,hwDone:hw.filter(h=>h.done).length,hwTotal:hw.length,note:l.tutorEval.note,pdf:l.tutorEval.pdf,at:l.tutorEval.at,to:['Student','Parent']});
  s.notes.push({id:'n-'+c.id+l.n,studentId:'s-demo',classId:c.id,topic:l.title,strength:l.tutorEval.note,improve:`Engagement ${l.tutorEval.engagement}/3 · homework ${hw.filter(h=>h.done).length}/${hw.length}`,homework:'',date:'Example'});
 }}));
 s.lineMessages.sort((a,b)=>a.at-b.at);
 s.engagements=[];s.changeRequests=[];s.parentChecks=[];
 s.demoMode='active';
 s.notification=[{text:'Lesson 3 of English is the last — review opens after it',time:'Example · Today',type:'lesson'}];
 return s;
}
