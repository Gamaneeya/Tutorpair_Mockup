import assert from 'node:assert/strict';
import {summarize,legacyToSlots,slotsToDays} from '../frontend/assets/js/availability.js';
import * as F from '../frontend/assets/js/flow.js';
import {CATALOG,SAMPLE,SAMPLE_PLANS} from '../frontend/assets/data/mock-data.js';
import {start,state,save,setDemoMode,studentCourses,switchRole} from '../frontend/assets/js/store.js';
import {createGroupInvite,createOneOnOneInvite,invitationUrl,resolveGroupInvite,acceptGroupInvite} from '../frontend/assets/js/byos.js';

function memoryStorage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}}
globalThis.localStorage=memoryStorage();globalThis.sessionStorage=memoryStorage();globalThis.window={dispatchEvent(){}};globalThis.Event=class Event{constructor(t){this.type=t}};
globalThis.location={origin:'http://x.test'};

// availability
assert.equal(summarize(['tue-18','tue-19','tue-20','thu-18','thu-19','thu-20']),'Tue/Thu 18:00–21:00');
assert.deepEqual(slotsToDays(legacyToSlots(['sat','tue'])),['tue','sat']);
// budget calculator and pricing
assert.deepEqual(F.budgetCalc(500,60),{hours:4,max:2000});
assert.equal(F.budgetCalc(500,90).max,3000);
assert.equal(F.budgetCalc(500,120).hours,8);
const p=F.coursePrice(450,60);assert.deepEqual(p,{hours:4,subtotal:1800,fee:0,total:1800});
assert.equal(F.PACES.sprint.weeks*F.PACES.sprint.perWeek,4);assert.equal(F.PACES.cram.weeks*F.PACES.cram.perWeek,4);assert.equal(F.PACES.regular.weeks*F.PACES.regular.perWeek,4);
assert.equal(F.MIN_RATE,100);

// demo toggle
start('student','new');
assert.equal(studentCourses(state()).length,0);
setDemoMode('active');
let s=state();assert.equal(s.demoMode,'active');assert.equal(studentCourses(s).length,3);assert.equal(F.tutorClasses(s,true,'t01').length,5);
assert.equal(s.tutor.roster.length,3);assert.equal(s.role,'student');
setDemoMode('new');assert.equal(studentCourses(state()).length,0);

// engagement workflow
const req={grade:'M.4',subject:'Mathematics',goal:'Pass the midterm',courseType:'sprint',sessionLength:90,availability:['tue-18','thu-18','thu-19'],budget:500,worksheetName:'ws.pdf',goalType:'exam-prep'};
s=state();const tutor={...CATALOG.tutors[0]};
const e=F.createEngagement(s,tutor,req);
assert.equal(e.status,'awaiting_tutor');assert.equal(e.pricing.total,F.coursePrice(450,90).total);assert.equal(e.draftPlan.length,4);
assert.equal(F.createEngagement(s,tutor,req).id,e.id,'no duplicate open request');
assert.throws(()=>F.sendPlan(s,e.id,e.plan),/Accept/);
assert.throws(()=>F.tutorAccept(s,e.id,e.expiresAt+1),/24-hour/);
F.tutorAccept(s,e.id);assert.equal(e.status,'tutor_editing');
const edited=e.plan.map(x=>({...x}));edited[1].title='Quadratics deep dive';
F.sendPlan(s,e.id,edited,'Focus on quadratics');assert.equal(e.status,'plan_review');assert.ok(F.planDiffers(e));
F.requestPlanChanges(s,e.id,'More word problems');assert.equal(e.status,'tutor_editing');
F.sendPlan(s,e.id,edited);F.approvePlan(s,e.id);assert.equal(e.status,'awaiting_payment');
const course=F.payEngagement(s,e.id);
assert.equal(e.status,'active');assert.equal(course.lessons.length,4);assert.equal(course.price,e.pricing.total);
assert.equal(course.lessons[1].title,'Quadratics deep dive');
assert.ok(course.lessons.every((l,i,a)=>i===0||a[i-1].startsAt<=l.startsAt));
assert.equal(s.tutor.roster.at(-1).classId,course.id);
assert.deepEqual(F.lessonStates(course),['in_progress','upcoming','upcoming','upcoming']);
// expiry
const e2=F.createEngagement(s,CATALOG.tutors[1],req,1000);F.refreshEngagements(s,1000+F.H24+1);assert.equal(e2.status,'expired');

// reschedule / cancel
const future=new Date(Date.now()+5*86400000).toISOString();
const r1=F.requestChange(s,course.id,2,'reschedule',future);
assert.throws(()=>F.requestChange(s,course.id,2,'cancel'),/already/);
F.resolveChange(s,r1.id,true);assert.equal(course.lessons[1].startsAt,new Date(future).toISOString());
const r2=F.requestChange(s,course.id,3,'cancel');F.resolveChange(s,r2.id,false);assert.equal(course.lessons[2].status,'upcoming');
const r3=F.requestChange(s,course.id,4,'cancel');F.resolveChange(s,r3.id,true);assert.equal(course.lessons[3].status,'cancelled');

// tutor evaluation → LINE card + vault; student evaluation
assert.throws(()=>F.submitTutorEval(s,course.id,1,{engagement:2,homework:[],note:''}),/note/);
const card=F.submitTutorEval(s,course.id,1,{engagement:3,homework:[{text:'a',done:true},{text:'b',done:false}],note:'Great work.',pdfName:'l1.pdf'});
assert.equal(card.hwDone,1);assert.deepEqual(card.to,['Student','Parent']);assert.equal(s.vault.length,1);assert.equal(course.completed,1);
assert.ok(!('score' in s.notes.at(-1)),'no quiz score');
F.submitStudentEval(s,course.id,1,{clarity:3,pace:'right'});
assert.throws(()=>F.submitStudentEval(s,course.id,2,{clarity:3,pace:'right'}),/finished/);
assert.equal(F.tutorQuality([course]).score,100);
for(const n of [2,3])F.submitTutorEval(s,course.id,n,{engagement:2,homework:[],note:'ok'});
assert.ok(course.completedAt,'course completes when all non-cancelled lessons are done');
const L=F.ledger(course);assert.equal(L.held+L.released+L.refunded,L.total);

// public review reveal rules
assert.equal(F.reviewState(course).visible,false);
F.submitReview(s,course.id,'student',{stars:5,text:'Wonderful tutor'});assert.equal(F.reviewState(course).visible,false);
F.submitReview(s,course.id,'tutor',{stars:4,text:'Diligent student'});assert.equal(F.reviewState(course).visible,true);
assert.throws(()=>F.submitReview(s,course.id,'tutor',{stars:4,text:'again again'}),/already/);
const c2={completedAt:Date.now()-15*86400000,reviews:{student:{stars:5,text:'x'}}};assert.equal(F.reviewState(c2).visible,true,'revealed after 14 days');

// parent monthly
F.submitParentCheck(s,{progress:4,cont:'yes'});assert.throws(()=>F.submitParentCheck(s,{progress:4,cont:'yes'}),/already/);

// BYOS: demo tutor invites, student accepts in the same demo session
setDemoMode('active');switchRole('tutor');
const inv=createGroupInvite('g01');const url=invitationUrl(inv.code);assert.ok(url.includes('&d='));
const one=createOneOnOneInvite({subject:'Mathematics',grade:'M.4',rate:450,length:60,courseType:'regular'});
assert.throws(()=>createOneOnOneInvite({subject:'Mathematics',grade:'M.4',rate:50}),/at least/);
assert.throws(()=>createOneOnOneInvite({subject:'Chemistry',grade:'M.4',rate:450}),/approved/);
assert.equal(resolveGroupInvite(inv.code).seatsLeft,2);
switchRole('student');
const before=studentCourses(state()).length;
const res=acceptGroupInvite(inv.code);assert.equal(res.alreadyJoined,false);assert.equal(studentCourses(state()).length,before+1);
assert.equal(acceptGroupInvite(inv.code).alreadyJoined,true);
const res2=acceptGroupInvite(one.code);assert.equal(res2.course.sessions,4);assert.equal(res2.course.lessons.length,4);
assert.equal(state().tutor.roster.filter(r=>r.source==='BYOS').length,3);
assert.equal(resolveGroupInvite(one.code).seatsLeft,0);
// portable link works in a fresh browser (no local invite record)
const d=new URL(url).searchParams.get('d');localStorage.clear();sessionStorage.clear();
const portable=resolveGroupInvite(inv.code,d);assert.equal(portable.portable,true);assert.equal(portable.group.subject,'Mathematics');
assert.throws(()=>resolveGroupInvite(inv.code),/cannot be found/);assert.throws(()=>resolveGroupInvite('abc','%%%'),/damaged/);
console.log('flow tests ok');
