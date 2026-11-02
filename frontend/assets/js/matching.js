/** Transparent deterministic matching for the demo; AI explanations are NOT being generated. */
import {preferenceFit} from './preferences.js';
export const WEIGHTS={goal:0.30,levelPace:0.20,schedule:0.15,price:0.15,teaching:0.15,quality:0.05};
const clamp=x=>Math.max(0,Math.min(100,x));
const overlap=(wanted,available)=>{
 const want=Array.isArray(wanted)?wanted:[];
 const have=Array.isArray(available)?available:[];
 return want.length?100*want.filter(x=>have.includes(x)).length/want.length:50;
};
export function approvedToTeach(tutor,subject,grade){
 if(tutor?.verified!==true)return false;
 // approvedScopes is the recorded subject/grade credential decision, NOT a course approval.
 return (tutor.approvedScopes||[]).some(s=>s.subject===subject&&s.grades?.includes(grade)&&s.status==='approved');
}
export function tutorOfferings(tutor){return tutor.offerings||[];}
function fit(student,tutor,offering){
 const target=offering.goalType||null;
 const goals=tutor.goals||[];
 const goal=target===student.goalType?100:goals.includes(student.goalType)?90:target===null?60:35;
 const level=tutor.levels?.includes(student.currentLevel)?100:50;
 const pace=tutor.pace?.includes(student.pace)?100:tutor.pace?.includes('medium')?70:40;
 const levelPace=Math.round(level*.55+pace*.45);
 const schedule=clamp(60+10*Math.min(4,(student.schedule||[]).filter(x=>offering.schedule.includes(x)).length));
 const price=clamp(60+40*(Number(student.budget)-offering.price)/Math.max(1,Number(student.budget)));
 const teaching=preferenceFit(student,tutor);
 const quality=clamp(Number(tutor.quality)||50);
 const breakdown={goal,levelPace,schedule,price,teaching,quality};
 const score=Math.round(Object.entries(WEIGHTS).reduce((a,[k,v])=>a+breakdown[k]*v,0));
 const why=[];
 if(goal>=85)why.push('Supports your school learning goal');
 if(tutor.pace?.includes(student.pace))why.push('Teaches at your preferred pace');
 if(tutor.approach?.includes(student.approach))why.push('Matches your preferred teaching approach');
 if(tutor.interaction?.includes(student.interaction))why.push('Matches your preferred interaction style');
 if((student.schedule||[]).some(x=>offering.schedule.includes(x)))why.push('Available at a time you chose');
 return {score,breakdown,preferenceScore:preferenceFit(student,tutor),why:why.slice(0,3)};
}
function validOffer(student,tutor,offering){
 return offering.subject===student.subject&&approvedToTeach(tutor,offering.subject,student.grade)&&offering.published!==false&&
 offering.grades?.includes(student.grade)&&offering.formats?.includes('one')&&
 Number(offering.price)<=Number(student.budget)&&(student.schedule||[]).some(day=>offering.schedule?.includes(day));
}
export function matchTutors(student,tutors){
 return tutors.map(t=>{
   const offers=tutorOfferings(t).filter(o=>validOffer(student,t,o));
   if(!offers.length)return null;
   const [best]=offers.map(o=>({...o,fit:fit(student,t,o)})).sort((a,b)=>b.fit.score-a.fit.score||a.price-b.price);
   return {...t,subject:best.subject,price:best.price,fit:best.fit,matchedOffering:best};
 }).filter(Boolean).sort((a,b)=>b.fit.score-a.fit.score||a.price-b.price||a.id.localeCompare(b.id)).slice(0,3);
}
export function matchGroups(student,groups,tutors){
 return groups.filter(g=>{
   const t=tutors.find(x=>x.id===g.tutorId);
   return approvedToTeach(t,g.subject,g.grade)&&g.byos+g.platform<g.capacity&&g.subject===student.subject&&g.grade===student.grade&&
   (student.schedule||[]).includes(g.schedule)&&g.sessions>0&&g.durationMinutes>0&&
   (g.price/g.sessions/(g.durationMinutes/60))<=Number(student.budget);
 }).map(g=>{
   const tutor=tutors.find(t=>t.id===g.tutorId);
   const offering={subject:g.subject,grades:[g.grade],formats:['group'],schedule:[g.schedule],price:g.price/g.sessions/(g.durationMinutes/60),goalType:g.goalType||null};
   return {...g,tutor,fit:fit(student,tutor,offering)};
 }).sort((a,b)=>b.fit.score-a.fit.score||a.id.localeCompare(b.id)).slice(0,3);
}
export const descriptions={goal:'Academic Goal Fit',levelPace:'Student Level & Lesson Pace',schedule:'Schedule Overlap',price:'Price Fit',teaching:'3 Teaching & Interaction Preferences',quality:'Tutor Quality Evidence (Demo)'};
