// Browser-only BYOS invitation demo. NOT an authorization or payment system.
// Invite links carry a small snapshot of the class (param "d"), so a student on ANOTHER browser or device can still
// open the link, see the class and join. The tutor's roster only updates when the tutor workspace is in the same browser
// (registered accounts) or the same demo session. A real backend is needed for true cross-device sync.
import {getAuthSession} from './auth.js';
import {state,save,accountWorkspaceKey,studentCourses,DEMO_KEY} from './store.js';
import {ensureLessons,coursePrice,MIN_RATE,PACES,fmtDate} from './flow.js';
const INVITES_KEY='tp_byos_invites_v1';
const parse=(key,defaultValue)=>{try{return JSON.parse(localStorage.getItem(key))??defaultValue}catch{return defaultValue}};
const invites=()=>parse(INVITES_KEY,{});
const setInvites=x=>localStorage.setItem(INVITES_KEY,JSON.stringify(x));
const b64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=s=>JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/-/g,'+').replace(/_/g,'/')))));
const str=(v,n=80)=>String(v??'').slice(0,n);
const owner=auth=>auth?.type==='account'?auth.accountId:'demo';
export function inviteInfo(code){return invites()[String(code||'').trim()]||null;}
export function invitationUrl(code){
 const inv=inviteInfo(code);
 return `${location.origin}/join.html?code=${encodeURIComponent(code)}${inv?.snapshot?'&d='+b64(inv.snapshot):''}`;
}
const approvedScope=(s,subject,grade)=>(s.tutor.subjectApprovals||[]).some(a=>a.status==='approved'&&a.subject===subject&&a.grades.includes(grade));
function requireTutor(s){
 const auth=getAuthSession();
 const ok=(auth?.type==='account'&&auth.role==='tutor')||(auth?.type==='demo'&&s.role==='tutor');
 if(!ok||s.tutor.verificationStatus!=='approved')throw Error('Sign in as an approved Tutor account to invite students.');
 return auth;
}
function store(auth,s,snapshot,groupId){
 const code=crypto.randomUUID().replace(/-/g,'');
 const invite={code,tutorAccountId:owner(auth),tutorName:s.tutor.name,groupId,snapshot,createdAt:new Date().toISOString()};
 const all=invites();all[code]=invite;setInvites(all);return invite;
}
export function createGroupInvite(groupId){
 const s=state(),auth=requireTutor(s);
 const g=s.catalog.groups.find(x=>x.id===groupId&&s.tutor.groups.includes(x.id));
 if(!g)throw Error('Choose one of your published group classes.');
 if(!approvedScope(s,g.subject,g.grade))throw Error('The subject and grade must be approved.');
 return store(auth,s,{kind:'group',tutorName:s.tutor.name,name:g.name,subject:g.subject,grade:g.grade,schedule:g.schedule,sessions:g.sessions,price:g.price,capacity:g.capacity,durationMinutes:g.durationMinutes||60},groupId);
}
/** Invite one existing student into a private 1-on-1 course (standard 4-session block, 0% fee is a proposed BYOS policy). */
export function createOneOnOneInvite({subject,grade,rate,length=60,courseType='regular'}){
 const s=state(),auth=requireTutor(s);
 if(!approvedScope(s,subject,grade))throw Error('Choose a subject and grade you are approved to teach.');
 rate=Number(rate);if(!(rate>=MIN_RATE))throw Error(`Hourly rate must be at least ฿${MIN_RATE}.`);
 length=Number(length);if(![60,90,120].includes(length))throw Error('Choose a session length.');
 if(!PACES[courseType])throw Error('Choose a course pace.');
 const price=coursePrice(rate,length).subtotal;
 return store(auth,s,{kind:'one',tutorName:s.tutor.name,name:`${grade} ${subject} · 1-on-1 (${PACES[courseType].name})`,subject,grade,schedule:'',sessions:4,price,capacity:1,durationMinutes:length,courseType},`one-${Date.now()}`);
}
export function myGroupInvites(groupId){const auth=getAuthSession();if(!auth)return [];return Object.values(invites()).filter(i=>i.tutorAccountId===owner(auth)&&i.groupId===groupId);}
export function myInvites(){const auth=getAuthSession();if(!auth)return [];return Object.values(invites()).filter(i=>i.tutorAccountId===owner(auth)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
function fromSnapshot(code,d){
 let snap;try{snap=unb64(d)}catch{throw Error('This invitation link is damaged. Ask the tutor for a new link.')}
 if(!snap||typeof snap!=='object'||!snap.name||!snap.subject)throw Error('This invitation link is damaged. Ask the tutor for a new link.');
 const group={id:str(snap.kind==='one'?'one-'+code.slice(0,8):'snap-'+code.slice(0,8)),name:str(snap.name),subject:str(snap.subject,40),grade:str(snap.grade,10),schedule:str(snap.schedule,30),sessions:Math.max(1,Math.min(40,Number(snap.sessions)||4)),price:Math.max(0,Number(snap.price)||0),capacity:Math.max(1,Number(snap.capacity)||1),byos:0,platform:0,durationMinutes:Number(snap.durationMinutes)||60,kind:snap.kind==='one'?'one':'group',courseType:snap.courseType};
 return {invite:{code,tutorAccountId:null,tutorName:str(snap.tutorName,60)||'Your tutor',snapshot:snap},tutorState:null,group,seatsLeft:group.capacity,portable:true};
}
export function resolveGroupInvite(code,d=''){
 const invite=inviteInfo(code);
 if(!invite){
  if(d)return fromSnapshot(String(code||'').trim(),d);
  throw Error('This invitation cannot be found in this browser. Ask the tutor to send the full invitation link again.');
 }
 const demoOwner=invite.tutorAccountId==='demo';
 const t=demoOwner?parse(DEMO_KEY,null):parse(accountWorkspaceKey(invite.tutorAccountId),null);
 if(!t||t.role!=='tutor'&&!(demoOwner&&t.tutor)||t.tutor.verificationStatus!=='approved'){
  if(invite.snapshot)return {...fromSnapshot(code,b64(invite.snapshot)),invite};
  throw Error('Tutor account is unavailable or not approved.');
 }
 if(invite.snapshot?.kind==='one'){
  const g=fromSnapshot(code,b64(invite.snapshot)).group;
  const taken=(t.tutor.roster||[]).some(r=>r.inviteCode===code);
  return {invite,tutorState:t,group:g,seatsLeft:taken?0:1};
 }
 const g=t.catalog.groups.find(x=>x.id===invite.groupId&&t.tutor.groups.includes(x.id));
 if(!g)throw Error('The invited class no longer exists.');
 if(!approvedScope(t,g.subject,g.grade))throw Error('This class is not within an approved teaching scope.');
 return {invite,tutorState:t,group:g,seatsLeft:g.capacity-g.byos-g.platform};
}
export function acceptGroupInvite(code,d=''){
 const auth=getAuthSession();
 const s=state();
 const okStudent=(auth?.type==='account'&&auth.role==='student')||(auth?.type==='demo'&&s.role==='student');
 if(!okStudent)throw Error('Log in with a Student account to join this class.');
 const {invite,tutorState:t0,group:g,seatsLeft,portable}=resolveGroupInvite(code,d);
 const inviteKey=invite.code;
 const already=studentCourses(s).find(c=>c.inviteCode===inviteKey||(g.kind!=='one'&&c.byosGroupId===g.id&&c.byosTutorAccountId===invite.tutorAccountId));
 if(already)return {course:already,alreadyJoined:true};
 if(seatsLeft<=0)throw Error('Sorry, this class is full. Ask the tutor for another class.');
 const demoSame=auth.type==='demo'&&invite.tutorAccountId==='demo';
 const t=demoSame?s:t0;
 const uniqueId=auth.type==='account'?auth.accountId:s.student.id;
 const enrollmentId=`enroll-${crypto.randomUUID()}`;
 const course={id:enrollmentId,title:g.name,tutorId:invite.tutorAccountId||('invited-'+code.slice(0,8)),tutorName:invite.tutorName,subject:g.subject,grade:g.grade,format:g.kind==='one'?'one':'group',sessions:g.sessions,completed:0,price:g.price,started:true,nextLesson:g.schedule||'To be scheduled with your tutor',source:'BYOS',inviteCode:inviteKey,byosGroupId:g.id,byosTutorAccountId:invite.tutorAccountId,sessionLength:g.durationMinutes,courseType:g.courseType||'regular',studentName:s.student.name};
 ensureLessons(course);
 course.nextLesson=fmtDate(course.lessons[0].startsAt);
 s.student.courses??=studentCourses(s);
 s.student.courses.push(course);s.student.course=course;
 s.student.grade=g.grade;
 if(t){
  const rosterEntry={studentId:uniqueId,name:s.student.name,grade:g.grade,subject:g.subject,source:'BYOS',groupId:g.id,enrollmentId,classId:enrollmentId,inviteCode:inviteKey};
  if(!t.tutor.roster.some(r=>r.enrollmentId===enrollmentId))t.tutor.roster.push(rosterEntry);
  if(g.kind!=='one'){const live=t.catalog.groups.find(x=>x.id===g.id);if(live)live.byos+=1}
  // single-browser demo: localStorage has no cross-record transaction isolation
  if(!demoSame)localStorage.setItem(accountWorkspaceKey(invite.tutorAccountId),JSON.stringify(t));
 }
 save(s);
 return {course,alreadyJoined:false,tutorSynced:Boolean(t),portable:Boolean(portable)};
}
