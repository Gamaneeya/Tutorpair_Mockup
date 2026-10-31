import assert from 'node:assert/strict';
import {CATALOG,SAMPLE,GOALS} from '../frontend/assets/data/mock-data.js';
import {PREFERENCE_AXES,neutralPreferences,preferenceFit} from '../frontend/assets/js/preferences.js';
import {matchTutors,matchGroups,WEIGHTS} from '../frontend/assets/js/matching.js';
import {defaultPlan,planProgress,ensurePlan} from '../frontend/assets/js/plans.js';

const student=structuredClone(SAMPLE.students.returning.request);
const tutors=structuredClone(CATALOG.tutors);
assert.equal(PREFERENCE_AXES.length,9);
assert.equal(GOALS.length,4);
assert.equal(Object.values(WEIGHTS).reduce((a,b)=>a+b,0),1);
assert.equal(preferenceFit(neutralPreferences(),neutralPreferences()),100);
assert.equal(preferenceFit({detail:1},{detail:5}),0);
assert.equal(preferenceFit({detail:1},{detail:1}),100);
let ranked=matchTutors(student,tutors);
assert.ok(ranked.length>0&&ranked.length<=3);
assert.ok(ranked.every(t=>t.verified&&t.price<=student.budget&&t.matchedOffering.grades.includes(student.grade)));
assert.ok(ranked.every((t,i)=>i===0||ranked[i-1].fit.score>=t.fit.score));
assert.ok(ranked.every(t=>t.fit.preferenceScore>=0&&t.fit.preferenceScore<=100));
const baselineFit=matchTutors(student,[tutors[0]])[0].fit.score;
const oppositePreferences=Object.fromEntries(Object.entries(student.preferences).map(([key,v])=>[key,6-v]));
const changedFit=matchTutors({...student,preferences:oppositePreferences},[tutors[0]])[0].fit.score;
assert.notEqual(baselineFit,changedFit,'Changing matched student sliders must affect actual ranking score');
assert.equal(matchTutors({...student,budget:100},tutors).length,0);
assert.equal(matchTutors({...student,subject:'Thai'},tutors).length,0);
assert.equal(matchTutors({...student,grade:'M.1'},tutors).some(t=>t.name.includes('Mew')),false);
// an unapproved tutor must be invisible, even when their parameters are ideal
const draft={...structuredClone(tutors[0]),id:'new-tutor',verified:false,quality:100,price:100};
assert.ok(!matchTutors(student,[draft]).length);
// a tutor with multiple offerings must appear once and use the correct eligible offer
const two={...structuredClone(tutors[0]),id:'multi',offerings:[
  {id:'wrong',subject:'English',grades:['M.4'],topics:['Grammar'],price:300,formats:['one'],schedule:['thu']},
  {id:'correct',subject:'Mathematics',grades:['M.4'],topics:['Algebra'],goalType:'school-grade',courseFocus:'Midterm exam',price:420,formats:['one'],schedule:['thu']}
]};
const multi=matchTutors(student,[two]);
assert.equal(multi.length,1);
assert.equal(multi[0].matchedOffering.id,'correct');
assert.equal(multi[0].price,420);
let groups=matchGroups({...student,format:'group'},CATALOG.groups,tutors);
assert.ok(groups.length>0);
assert.ok(groups.every(g=>g.capacity>g.byos+g.platform));
const plan=defaultPlan(['Quadratics','Functions']);
assert.equal(planProgress(plan),0);
plan[0].completed=true;
assert.equal(planProgress(plan),50);
let state={learningPlans:{}};
ensurePlan(state,'student-demo',['Algebra']);
assert.equal(state.learningPlans['student-demo'].length,1);
console.log('PASS: 9 common axes, score weights, eligibility, ordering, approval gate, offerings, groups, and learning plans');
