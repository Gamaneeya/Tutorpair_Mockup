// Weekly availability picker (Mon–Sun × hourly slots). Slot id = "<day>-<startHour>", e.g. "tue-18" = Tue 18:00–19:00.
export const WEEK=[['mon','Mon','Monday'],['tue','Tue','Tuesday'],['wed','Wed','Wednesday'],['thu','Thu','Thursday'],['fri','Fri','Friday'],['sat','Sat','Saturday'],['sun','Sun','Sunday']];
export const HOURS=Array.from({length:14},(_,i)=>i+8); // 08:00 … 21:00 start times
const LEGACY={tue:[18,20],thu:[17,20],sat:[9,12],sun:[13,17],mon:[18,20],wed:[18,20],fri:[18,20]};
const pad=h=>String(h).padStart(2,'0')+':00';
const order=id=>WEEK.findIndex(w=>w[0]===id);
export const parseSlots=v=>Array.isArray(v)?v:String(v||'').split(',').map(x=>x.trim()).filter(x=>/^[a-z]{3}-\d{1,2}$/.test(x));
export function legacyToSlots(days=[]){return days.flatMap(d=>{const [a,b]=LEGACY[d]||[18,20];return Array.from({length:b-a},(_,i)=>`${d}-${a+i}`)})}
export const slotsToDays=slots=>[...new Set(parseSlots(slots).map(s=>s.split('-')[0]))].sort((a,b)=>order(a)-order(b));
export const overlapSlots=(a,b)=>{const B=new Set(parseSlots(b));return parseSlots(a).filter(x=>B.has(x))};
function rangesByDay(slots){
 const by={};parseSlots(slots).forEach(s=>{const [d,h]=s.split('-');(by[d]??=[]).push(Number(h))});
 return Object.keys(by).sort((a,b)=>order(a)-order(b)).map(d=>{
  const hs=by[d].sort((a,b)=>a-b),out=[];let start=hs[0],prev=hs[0];
  for(const h of hs.slice(1)){if(h===prev+1){prev=h;continue}out.push([start,prev+1]);start=prev=h}
  out.push([start,prev+1]);
  return {day:d,key:out.map(([a,b])=>`${pad(a)}–${pad(b)}`).join(', ')};
 });
}
/** "Tue/Thu 18:00–21:00; Sat 09:00–12:00" */
export function summarize(slots){
 const groups=[];rangesByDay(slots).forEach(r=>{const g=groups.find(x=>x.key===r.key);g?g.days.push(r.day):groups.push({key:r.key,days:[r.day]})});
 return groups.map(g=>`${g.days.map(d=>WEEK[order(d)][1]).join('/')} ${g.key}`).join('; ')||'No times selected';
}
const DEFAULT_WIN={mon:[17,21],tue:[18,21],wed:[17,21],thu:[17,21],fri:[17,21],sat:[9,13],sun:[13,18]};
const START=Array.from({length:14},(_,i)=>i+8),END=Array.from({length:14},(_,i)=>i+9);
// Convert slots to one window per day (earliest start → latest end).
function windows(slots){
 const by={};parseSlots(slots).forEach(x=>{const [d,h]=x.split('-');(by[d]??=[]).push(Number(h))});
 const out={};Object.keys(by).forEach(d=>{out[d]=[Math.min(...by[d]),Math.max(...by[d])+1]});return out;
}
export function availabilityPicker(name,selected=[]){
 const win=windows(selected),opts=(list,v)=>list.map(h=>`<option value="${h}" ${h===v?'selected':''}>${pad(h)}</option>`).join('');
 return `<div class="avail" data-avail><input type="hidden" name="${name}" value="${parseSlots(selected).join(',')}">
 <div class="avail-card"><div class="avail-head"><b>Choose recurring days and available time windows</b><small>Monday–Sunday · local time (Thailand)</small></div>
 ${WEEK.map(([id,s,l])=>{const w=win[id],on=Boolean(w),[a,z]=w||DEFAULT_WIN[id];
  return `<div class="avail-row ${on?'on':''}" data-day="${id}"><label class="avail-check"><input type="checkbox" ${on?'checked':''} aria-label="${l}"><span>${s}</span></label><div class="avail-times"><select class="avail-from" ${on?'':'disabled'} aria-label="${l} start time">${opts(START,a)}</select><em>to</em><select class="avail-to" ${on?'':'disabled'} aria-label="${l} end time">${opts(END,z)}</select></div></div>`}).join('')}
 </div><small class="avail-hint avail-summary" aria-live="polite"></small></div>`;
}
export function bindAvailability(root=document,onChange){
 root.querySelectorAll('[data-avail]').forEach(box=>{
  const input=box.querySelector('input[type=hidden]');
  const collect=()=>{const out=[];box.querySelectorAll('.avail-row').forEach(r=>{
   if(!r.querySelector('input[type=checkbox]').checked)return;
   const a=Number(r.querySelector('.avail-from').value),z=Number(r.querySelector('.avail-to').value);
   for(let h=a;h<z;h++)out.push(`${r.dataset.day}-${h}`)});return out};
  const commit=()=>{const slots=collect();input.value=slots.join(',');
   box.querySelector('.avail-summary').textContent=slots.length?`${summarize(slots)} · ${slots.length} hr/week open`:'No days selected yet.';
   input.dispatchEvent(new Event('change',{bubbles:true}));onChange?.(slots)};
  box.querySelectorAll('.avail-row').forEach(r=>{
   const cb=r.querySelector('input[type=checkbox]'),from=r.querySelector('.avail-from'),to=r.querySelector('.avail-to');
   cb.addEventListener('change',()=>{r.classList.toggle('on',cb.checked);from.disabled=to.disabled=!cb.checked;commit()});
   from.addEventListener('change',()=>{if(Number(to.value)<=Number(from.value))to.value=Math.min(22,Number(from.value)+1);commit()});
   to.addEventListener('change',()=>{if(Number(to.value)<=Number(from.value))from.value=Math.max(8,Number(to.value)-1);commit()});
  });
  box.addEventListener('avail-set',e=>{const w=windows(e.detail);box.querySelectorAll('.avail-row').forEach(r=>{
   const d=r.dataset.day,cb=r.querySelector('input[type=checkbox]'),[a,z]=w[d]||DEFAULT_WIN[d];
   cb.checked=Boolean(w[d]);r.classList.toggle('on',cb.checked);r.querySelector('.avail-from').value=a;r.querySelector('.avail-to').value=z;r.querySelector('.avail-from').disabled=r.querySelector('.avail-to').disabled=!cb.checked});commit()});
  commit();
 });
}
export const setAvailability=(root,slots)=>root.querySelector('[data-avail]')?.dispatchEvent(new CustomEvent('avail-set',{detail:parseSlots(slots)}));
