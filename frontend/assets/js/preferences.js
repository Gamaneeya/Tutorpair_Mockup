/** Shared 1–5 slider definitions. Left = 1, right = 5 on BOTH student and tutor forms.
 * Preference fit is an interface heuristic, not a proven learning-style predictor. */
export const PREFERENCE_AXES = [
  {id:'detail',section:'Teaching preferences',title:'Explanation depth',left:'Step-by-step detail',right:'Key points & quick summaries'},
  {id:'practice',section:'Teaching preferences',title:'Learning activities',left:'Practice exercises first',right:'Concepts and theory first'},
  {id:'dialogue',section:'Teaching preferences',title:'Class interaction',left:'Questions & discussion',right:'Mostly quiet listening'},
  {id:'guidance',section:'Teaching preferences',title:'Support and independence',left:'Tutor guides each step',right:'Learner explores independently'},
  {id:'atmosphere',section:'Teaching preferences',title:'Class atmosphere',left:'Fun & relaxed',right:'Calm & focused'},
  {id:'formality',section:'Interaction preferences',title:'Communication tone',left:'Formal & polite',right:'Friendly & casual'},
  {id:'flexibility',section:'Interaction preferences',title:'Time management',left:'Punctual & structured',right:'Flexible & adaptable'},
  {id:'energy',section:'Interaction preferences',title:'Tutor energy',left:'Calm & composed',right:'Energetic & expressive'},
  {id:'motivation',section:'Interaction preferences',title:'Motivation',left:'Clear structure & challenges',right:'Encouragement & support'}
];
export const neutralPreferences = () => Object.fromEntries(PREFERENCE_AXES.map(x=>[x.id,3]));
export function sliderFields(prefix,values={}) {
 let prevSection='';
 return PREFERENCE_AXES.map(axis=>{
   const header=prevSection!==axis.section?`<div class="slider-section-heading">${axis.section}</div>`:'';
   prevSection=axis.section;
   const value=Number(values[axis.id]??3);
   return `${header}<div class="slider-control"><div class="slider-title"><strong>${axis.title}</strong><span class="slider-reading" data-reading="${prefix}-${axis.id}">${value}/5</span></div><div class="slider-labels"><span>${axis.left}</span><span>${axis.right}</span></div><input type="range" class="preference-slider" min="1" max="5" step="1" value="${value}" name="${prefix}-${axis.id}" aria-label="${axis.title}" data-slider-reading="${prefix}-${axis.id}"><div class="slider-scale"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></div>`;
 }).join('');
}
export function bindSliderReadings(root=document){
 root.querySelectorAll('[data-slider-reading]').forEach(input=>{
  const label=root.querySelector(`[data-reading="${input.dataset.sliderReading}"]`);
  input.addEventListener('input',()=>{if(label)label.textContent=input.value+'/5';});
 });
}
export function readSliders(fd,prefix){
 return Object.fromEntries(PREFERENCE_AXES.map(a=>[a.id,Math.max(1,Math.min(5,Number(fd.get(prefix+'-'+a.id))||3))]));
}
export function preferenceFit(student,tutor){
 // Do not treat a missing assessment as a perfect match.
 const usable=PREFERENCE_AXES.filter(a=>Number.isFinite(Number(student?.[a.id]))&&Number.isFinite(Number(tutor?.[a.id])));
 if(!usable.length)return 50;
 const total=usable.reduce((sum,a)=>sum+(1-Math.abs(student[a.id]-tutor[a.id])/4)*100,0);
 return Math.round(total/usable.length);
}
