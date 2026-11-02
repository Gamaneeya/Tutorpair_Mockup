import {CATALOG,SAMPLE,SAMPLE_PLANS} from '../data/mock-data.js';
import {getAuthSession,beginDemoSession} from './auth.js';
const DEMO_KEY='tp_story_demo_v1';
export const accountWorkspaceKey=id=>'tp_account_workspace_v1_'+id;
const accountKey=accountWorkspaceKey;
const storageKey=()=>{const auth=getAuthSession();return auth?.type==='account'?accountKey(auth.accountId):DEMO_KEY;};
const clone=x=>JSON.parse(JSON.stringify(x));
export function studentCourses(s){return Array.isArray(s.student?.courses)?s.student.courses:(s.student?.course?[s.student.course]:[])}
export function addStudentCourse(s,c){s.student.courses??=studentCourses(s);s.student.courses.push(c);s.student.course=c;return c}
export function initialState(){return {role:null,scenario:null,student:clone(SAMPLE.students.new),tutor:clone(SAMPLE.tutors.new),parent:clone(SAMPLE.parents.new),catalog:clone(CATALOG),pendingMatch:false,matchResults:[],selectedTutorId:null,selectedGroupId:null,booking:null,notes:[],notification:[],lessonPlan:null,learningPlans:{}};}
export function state(){try{const d=JSON.parse(localStorage.getItem(storageKey()));return d&&d.catalog?d:initialState()}catch{return initialState()}}
export function save(s){localStorage.setItem(storageKey(),JSON.stringify(s));window.dispatchEvent(new Event('tp:changed'));return s}
export function mutate(fn){const s=state();fn(s);return save(s)}
export function start(role,scenario){beginDemoSession();const s=initialState();s.role=role;s.scenario=scenario;
 if(scenario==='returning'){
  s.student=clone(SAMPLE.students.returning);
  // Three illustrative active classes for quick demo testing (not real enrollments).
  const math={...s.student.course,sessions:4,completed:1,packageKey:'regular',durationMinutes:60,lessonPlan:[{title:'Check understanding'},{title:'Algebra practice'},{title:'School exam exercises'},{title:'Review & next steps'}]};
  const physics={id:'sample-physics',title:'M.4 Physics · Exam Rescue',tutorId:'t05',tutorName:'P’Fern Nalinee',subject:'Physics',grade:'M.4',source:'TutorPair',sessions:4,completed:2,price:1840,started:true,packageKey:'sprint',durationMinutes:60,nextLesson:'Tuesday · 18:00',lessonPlan:[{title:'Review concepts'},{title:'Mechanics'},{title:'Practice exam problems'},{title:'Consolidation'}]};
  const english={id:'sample-english',title:'M.4 English · Tutor Invitation',tutorId:'t06',tutorName:'P’Jane Akarin',subject:'English',grade:'M.4',source:'BYOS',sessions:4,completed:0,price:1680,started:true,packageKey:'regular',durationMinutes:60,nextLesson:'Sunday · 13:00'};
  s.student.courses=[math,physics,english];s.student.course=math;
  s.tutor=clone(SAMPLE.tutors.returning);
  s.parent=clone(SAMPLE.parents.returning);
  for(const [id,title,grade,day] of [['g03','M.5 Math Revision','M.5','thu'],['g04','M.6 Math Exam Prep','M.6','sat']]){
   if(!s.catalog.groups.some(g=>g.id===id))s.catalog.groups.push({id,tutorId:'t01',name:title,subject:'Mathematics',grade,schedule:day,capacity:4,byos:1,platform:0,price:1800,sessions:4,durationMinutes:60,description:'Sample active class for pitch preview.'});
   if(!s.tutor.groups.includes(id))s.tutor.groups.push(id);
  }
  s.selectedTutorId='t01';
  s.notes=clone(s.student.lessonNotes);s.learningPlans=clone(SAMPLE_PLANS);
  s.notification=[{text:'New Mathematics progress report available',time:'Example · Today',type:'lesson'}];
 }
 return save(s);
}
export function switchRole(role){if(getAuthSession()?.type!=='demo')return state();return mutate(s=>{s.role=role})}
export function prepareRegisteredWorkspace(account){const key=accountKey(account.id);let prior=null;try{prior=JSON.parse(localStorage.getItem(key))}catch{}
 if(prior&&prior.catalog)return prior;
 const s=initialState();s.role=account.role;s.scenario='new';s.account={id:account.id,name:account.name,email:account.email,role:account.role};
 s[account.role].name=account.name;
 localStorage.setItem(key,JSON.stringify(s));return s;
}
export function reset(){if(getAuthSession()?.type!=='demo')return;localStorage.removeItem(DEMO_KEY);location.href='/login.html';}
export function seedBYOSStudentPreview(){
 return mutate(s=>{
  if(s.role!=='student')return;
  const existing=studentCourses(s);
  if(existing.some(c=>c.id==='sample-byos-math'))return;
  s.student.name=s.student.name==='New Student'?'N’Annie':s.student.name;
  s.student.grade='M.4';
  addStudentCourse(s,{id:'sample-byos-math',title:'M.4 Mathematics · Small Group',tutorId:'sample-pmew',tutorName:'P’Mew',subject:'Mathematics',grade:'M.4',source:'BYOS',sessions:4,completed:2,price:1600,started:true,nextLesson:'Saturday · 09:00–12:00',format:'group'});
 });
}
export function activeCourse(s){return studentCourses(s).some(c=>c.started)}
export function linkedParent(s){return Boolean(s.parent.linkedStudentId)}
export function tutorIsActive(s){return Boolean(s.tutor.roster.length)}
