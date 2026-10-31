/** Shared learning objective records. Completion tracks planned objectives, NOT assessed mastery. */
export function defaultPlan(topics=[]){
 const names=topics.length?topics:['Review foundations','Practice lesson questions','Apply to school exercises'];
 return names.map((title,index)=>({id:'obj-'+Date.now()+'-'+index,title,completed:false}));
}
export function planFor(s,studentId){return s.learningPlans?.[studentId]||[]}
export function planProgress(goals){return goals.length?Math.round(goals.filter(g=>g.completed).length/goals.length*100):0}
export function ensurePlan(s,studentId,topics=[]){s.learningPlans??={};s.learningPlans[studentId]??=defaultPlan(topics);}
