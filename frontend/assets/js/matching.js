/** Rule-based TutorPair prototype ranking. Only verified, eligible offers can be recommended.
 * AI explanations are planned. Current scores are transparent heuristics (not grade predictions).
 */
import {preferenceFit} from './preferences.js';
export const WEIGHTS={goalTopic:0.30,levelPace:0.20,teaching:0.15,schedule:0.15,price:0.15,quality:0.05};
const avg=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
const clamp=n=>Math.max(0,Math.min(100,n));
const overlap=(wants,has)=>{
 const w=Array.isArray(wants)?wants:[wants],h=Array.isArray(has)?has:[has];
 return w.length?100*w.filter(x=>h.includes(x)).length/w.length:50;
};
export function tutorOfferings(t){
 if(t.offerings?.length)return t.offerings;
 return [{id:t.id+'-default',subject:t.subject,grades:t.grades||[],topics:t.topics||[],goalType:null,courseFocus:null,price:t.price,formats:t.formats||[],schedule:t.schedule||[]}];
}
function fit(student,tutor,offering){
 const topic=overlap(student.topics,offering.topics);
 const goalMatch=offering.goalType ? (offering.goalType===student.goalType?100:35) : ((tutor.goals||[]).includes(student.goalType)?100:45);
 const focusMatch=offering.courseFocus ? (offering.courseFocus===student.courseFocus?100:60) : 65;
 const goalTopic=clamp(0.70*topic+0.22*goalMatch+0.08*focusMatch);
 const levelPace=avg([tutor.levels?.includes(student.currentLevel)?100:40,overlap([student.pace],tutor.pace||[])]);
 const vectorScore=preferenceFit(student.preferences,tutor.preferences);
 const approachScore=overlap([student.approach],tutor.approach||[]);
 const interactionScore=overlap([student.interaction],tutor.interaction||[]);
 const teaching=clamp(vectorScore*0.70+approachScore*0.15+interactionScore*0.15);
 const common=(student.schedule||[]).filter(x=>(offering.schedule||[]).includes(x));
 const schedule=clamp(60+10*Math.min(4,common.length));
 const price=clamp(60+40*(student.budget-offering.price)/Math.max(student.budget,1));
 const quality=clamp(Number(tutor.quality)||0);
 const breakdown={goalTopic,levelPace,teaching,schedule,price,quality};
 const score=Math.round(Object.entries(WEIGHTS).reduce((total,[key,w])=>total+breakdown[key]*w,0));
 const why=[];
 if(topic>=65)why.push('Covers your requested school topics');
 if(goalMatch>=85)why.push('Supports your selected academic goal');
 if(vectorScore>=75)why.push('Teaching preferences align with your 9-slider profile');
 if(tutor.pace?.includes(student.pace))why.push('Supports your preferred lesson pace');
 if(common.length)why.push('Available at a time you selected');
 if(!why.length)why.push('Meets your essential subject, grade, timetable and budget');
 return {score,breakdown,preferenceScore:vectorScore,why:why.slice(0,3)};
}
const validOffer=(student,tutor,offering)=>tutor.verified===true && offering.subject===student.subject && offering.grades.includes(student.grade) && offering.formats.includes('one') && offering.price<=Number(student.budget) && (student.schedule||[]).some(day=>offering.schedule.includes(day));
export function matchTutors(student,tutors){
 return tutors.map(t=>{
  const candidates=tutorOfferings(t).filter(o=>validOffer(student,t,o));
  if(!candidates.length)return null;
  const ranked=candidates.map(o=>({...o,fit:fit(student,t,o)})).sort((a,b)=>b.fit.score-a.fit.score||a.price-b.price);
  const best=ranked[0];
  return {...t,subject:best.subject,price:best.price,fit:best.fit,matchedOffering:best};
 }).filter(Boolean).sort((a,b)=>b.fit.score-a.fit.score||a.price-b.price||a.id.localeCompare(b.id)).slice(0,3);
}
export function matchGroups(student,groups,tutors){
 const eligible=groups.filter(g=>tutors.some(t=>t.id===g.tutorId&&t.verified===true)&&g.subject===student.subject&&g.grade===student.grade&&g.byos+g.platform<g.capacity&&(student.schedule||[]).includes(g.schedule)&&g.price/g.sessions/(g.durationMinutes/60)<=Number(student.budget));
 return eligible.map(g=>{const tutor=tutors.find(t=>t.id===g.tutorId);if(!tutor)return null;
 const offering={...g,grades:[g.grade],formats:['group'],schedule:[g.schedule],price:g.price/g.sessions/(g.durationMinutes/60)};
 return {...g,tutor,fit:fit(student,tutor,offering)};
 }).filter(Boolean).sort((a,b)=>b.fit.score-a.fit.score||a.id.localeCompare(b.id)).slice(0,3);
}
export const descriptions={goalTopic:'Topics & Academic Goal',levelPace:'Student Level & Pace',teaching:'9-axis Preferences + Approach',schedule:'Time Compatibility',price:'Price Fit',quality:'Quality Evidence (Demo)'};
