/** Three questions in Student Form; Tutor can select one or more options per question. */
export const QUESTIONS = [
 {key:'pace',label:'Preferred lesson pace',options:[['slow','Slow & detailed'],['medium','Balanced pace'],['fast','Fast & concise']]},
 {key:'approach',label:'Teaching approach',options:[['step','Step-by-step examples'],['practice','Practice & exercises'],['concept','Concepts & discussion']]},
 {key:'interaction',label:'Classroom interaction',options:[['encouraging','Patient & encouraging'],['independent','Let me try independently'],['balanced','A balance of both']]}
];
export const preferenceLabels=Object.fromEntries(QUESTIONS.flatMap(q=>q.options));
/** Missing answers receive a neutral 50 instead of a perfect score. */
export function preferenceFit(student,tutor) {
 const values=QUESTIONS.map(({key})=>{
   const choice=student?.[key];
   const supported=Array.isArray(tutor?.[key])?tutor[key]:tutor?.[key]?[tutor[key]]:[];
   if(!choice||choice==='any'||!supported.length)return 50;
   return supported.includes(choice)?100:(supported.includes('balanced')||choice==='balanced')?75:25;
 });
 return Math.round(values.reduce((a,b)=>a+b,0)/values.length);
}
