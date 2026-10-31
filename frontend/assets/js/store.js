import {CATALOG,SAMPLE,SAMPLE_PLANS} from '../data/mock-data.js';
const KEY='tp_story_demo_v1';
const clone=x=>JSON.parse(JSON.stringify(x));
export function initialState(){return {role:null,scenario:null,student:clone(SAMPLE.students.new),tutor:clone(SAMPLE.tutors.new),parent:clone(SAMPLE.parents.new),catalog:clone(CATALOG),pendingMatch:false,matchResults:[],selectedTutorId:null,selectedGroupId:null,booking:null,notes:[],notification:[],lessonPlan:null,learningPlans:{}};}
export function state(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&d.catalog?d:initialState()}catch{return initialState()}}
export function save(s){localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new Event('tp:changed'));return s}
export function mutate(fn){const s=state();fn(s);return save(s)}
export function start(role,scenario){const s=initialState();s.role=role;s.scenario=scenario;
 if(scenario==='returning'){
  s.student=clone(SAMPLE.students.returning);
  s.tutor=clone(SAMPLE.tutors.returning);
  s.parent=clone(SAMPLE.parents.returning);
  s.selectedTutorId='t01';
  s.notes=clone(s.student.lessonNotes);s.learningPlans=clone(SAMPLE_PLANS);
  s.notification=[{text:'New Mathematics progress report available',time:'Example · Today',type:'lesson'}];
 }
 return save(s);
}
export function switchRole(role){return mutate(s=>{s.role=role})}
export function reset(){localStorage.removeItem(KEY);location.href='/';}
export function activeCourse(s){return Boolean(s.student.course && s.student.course.started)}
export function linkedParent(s){return Boolean(s.parent.linkedStudentId)}
export function tutorIsActive(s){return Boolean(s.tutor.roster.length)}
