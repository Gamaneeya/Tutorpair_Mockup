// Browser-only BYOS invitation demo. NOT an authorization or payment system.
// Registered accounts can exchange class invitations only in the same browser/origin.
import {getAuthSession} from './auth.js';
import {state,save,accountWorkspaceKey,studentCourses} from './store.js';
const INVITES_KEY='tp_byos_invites_v1';
const parse=(key,defaultValue)=>{try{return JSON.parse(localStorage.getItem(key))??defaultValue}catch{return defaultValue}};
const invites=()=>parse(INVITES_KEY,{});
const setInvites=x=>localStorage.setItem(INVITES_KEY,JSON.stringify(x));
export function inviteInfo(code){return invites()[String(code||'').trim()]||null;}
export function invitationUrl(code){return `${location.origin}/join.html?code=${encodeURIComponent(code)}`;}
export function createGroupInvite(groupId){
 const auth=getAuthSession();const s=state();
 if(auth?.type!=='account'||auth.role!=='tutor'||s.tutor.verificationStatus!=='approved')throw Error('Sign in as an approved Tutor account to invite students.');
 const g=s.catalog.groups.find(x=>x.id===groupId&&s.tutor.groups.includes(x.id));
 if(!g)throw Error('Choose one of your published group classes.');
 if(!(s.tutor.subjectApprovals||[]).some(a=>a.status==='approved'&&a.subject===g.subject&&a.grades.includes(g.grade)))throw Error('The subject and grade must be approved.');
 const code=crypto.randomUUID().replace(/-/g,'');
 const invite={code,tutorAccountId:auth.accountId,tutorName:s.tutor.name,groupId:g.id,createdAt:new Date().toISOString()};
 const all=invites();all[code]=invite;setInvites(all);
 return invite;
}
export function myGroupInvites(groupId){const auth=getAuthSession();if(auth?.type!=='account')return [];return Object.values(invites()).filter(i=>i.tutorAccountId===auth.accountId&&i.groupId===groupId);}
export function resolveGroupInvite(code){
 const invite=inviteInfo(code);
 if(!invite)throw Error('This invitation cannot be found in this browser. Ask the tutor for a new link.');
 const t=parse(accountWorkspaceKey(invite.tutorAccountId),null);
 if(!t||t.role!=='tutor'||t.tutor.verificationStatus!=='approved')throw Error('Tutor account is unavailable or not approved.');
 const g=t.catalog.groups.find(x=>x.id===invite.groupId&&t.tutor.groups.includes(x.id));
 if(!g)throw Error('The invited class no longer exists.');
 if(!(t.tutor.subjectApprovals||[]).some(a=>a.status==='approved'&&a.subject===g.subject&&a.grades.includes(g.grade)))throw Error('This class is not within an approved teaching scope.');
 return {invite,tutorState:t,group:g,seatsLeft:g.capacity-g.byos-g.platform};
}
export function acceptGroupInvite(code){
 const auth=getAuthSession();
 if(auth?.type!=='account'||auth.role!=='student')throw Error('Log in with a Student account to join this class.');
 const {invite,tutorState:t,group:g,seatsLeft}=resolveGroupInvite(code);
 const s=state();
 const studentId=s.student.id; // original s-new reused; use unique registered account id below
 const uniqueId=auth.accountId;
 const already=studentCourses(s).find(c=>c.byosGroupId===g.id&&c.byosTutorAccountId===invite.tutorAccountId);
 if(already)return {course:already,alreadyJoined:true};
 if(seatsLeft<=0)throw Error('Sorry, this class is full. Ask the tutor for another class.');
 const enrollmentId=`enroll-${crypto.randomUUID()}`;
 const course={id:enrollmentId,title:g.name,tutorId:invite.tutorAccountId,tutorName:invite.tutorName,subject:g.subject,grade:g.grade,format:'group',sessions:g.sessions,completed:0,price:g.price,started:true,nextLesson:g.schedule,source:'BYOS',byosGroupId:g.id,byosTutorAccountId:invite.tutorAccountId};
 s.student.courses??=studentCourses(s);
 s.student.courses.push(course);
 s.student.grade=g.grade;
 const rosterEntry={studentId:uniqueId,name:s.student.name,grade:g.grade,subject:g.subject,source:'BYOS',groupId:g.id,enrollmentId};
 if(!t.tutor.roster.some(r=>r.enrollmentId===enrollmentId))t.tutor.roster.push(rosterEntry);
 g.byos+=1;
 // This is a single-browser demo: localStorage has no cross-record transaction isolation.
 localStorage.setItem(accountWorkspaceKey(invite.tutorAccountId),JSON.stringify(t));
 save(s);
 return {course,alreadyJoined:false};
}
