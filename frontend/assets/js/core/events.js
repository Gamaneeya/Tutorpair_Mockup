import {d, $, $$, esc, thb} from './ui.js';
import {paintNote} from './notes.js';
import {updateData, enterDemo} from '../data-source.js';

function bindControls(){
 $('#public-menu')?.addEventListener('click',()=>$('.public-links')?.classList.toggle('open'));
 $$('[data-demo]').forEach(b=>b.addEventListener('click',()=>enterDemo(b.dataset.demo)));
 const roleSelect=$('#register-role');
 if(roleSelect){let requested=new URLSearchParams(location.search).get('role');if(['student','tutor','parent'].includes(requested))roleSelect.value=requested;}
 $('#register-form')?.addEventListener('submit',e=>{
  e.preventDefault(); const form=e.currentTarget; if(!form.reportValidity())return;
  const chosen=new FormData(form).get('role'); enterDemo(chosen);
 });
 $('#login-form')?.addEventListener('submit',e=>{
  e.preventDefault();$('#login-error').textContent='No real authentication is enabled. Please choose one of the demo roles below.';
 });
 $('#forgot-form')?.addEventListener('submit',e=>{e.preventDefault();$('#forgot-message').textContent='Demo only: please return to Log in and select a sample role.'});
 $('#learning-form')?.addEventListener('submit',e=>{
  e.preventDefault();let fd=new FormData(e.currentTarget),value=Object.fromEntries([...fd].filter(([k,v])=>k!=='worksheet'));
  value.worksheetName=e.currentTarget.querySelector('[name="worksheet"]').files[0]?.name||'';
  localStorage.setItem('tp_learning_request',JSON.stringify(value));location.href='/student/matching.html';
 });
 $('#booking-form')?.addEventListener('submit',e=>{e.preventDefault();$('#booking-message').textContent='✓ Booking request preview saved. No real tutor is contacted.';});
 $('#feedback-form')?.addEventListener('submit',e=>{e.preventDefault();localStorage.setItem('tp_student_feedback',JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));$('#feedback-message').textContent='✓ Feedback saved in this browser demo.';});
 $('#chat-form')?.addEventListener('submit',e=>{
  e.preventDefault();let input=e.currentTarget.querySelector('input');let txt=input.value.trim();if(!txt)return;
  const bubble=document.createElement('div');bubble.className='bubble mine';bubble.textContent=txt;$('#chat-bubbles').append(bubble);input.value='';
 });
 $('#meeting-button')?.addEventListener('click',()=>{$('#meeting-message').textContent='No real Google Meet link is connected in this prototype.';});
 $('#checkout-form')?.addEventListener('submit',e=>{e.preventDefault();$('#checkout-message').textContent='✓ Enrollment simulated. No charge made.';});
 const noteForm=$('#note-form');
 if(noteForm){
   const preview=$('#parent-note-preview'); preview.innerHTML=paintNote(d.latestNote);
   noteForm.addEventListener('input',()=>{
     const fields=Object.fromEntries(new FormData(noteForm));
     preview.innerHTML=paintNote({...d.latestNote,...fields});
   });
   noteForm.addEventListener('submit',e=>{
     e.preventDefault();const fields=Object.fromEntries(new FormData(noteForm));
     const score=Number(fields.score),total=Number(fields.total);
     if(!Number.isFinite(score)||!Number.isFinite(total)||score<0||total<=0||score>total){$('#note-saved').textContent='Score must be between 0 and the maximum.';return;}
     updateData(data=>{
       data.latestNote={...data.latestNote,...fields,score,total,session:Number(fields.session),updated:'Just now · Demo'};
       data.lessonNotes.push({...data.latestNote,id:'n'+(Date.now())});
       data.student.latestQuiz=score;data.student.quizTotal=total;
       data.notifications.unshift({id:'note'+Date.now(),type:'Lesson summary',subject:'Mathematics',title:'New lesson report: '+fields.topic,date:'Just now · Demo',status:'Preview'});
       return data;
     });
     $('#note-saved').textContent='✓ Saved! Switch to the Parent role to see this same updated record.';
   });
 }
 $('#group-form')?.addEventListener('submit',e=>{
   e.preventDefault();let f=Object.fromEntries(new FormData(e.currentTarget));
   if(Number(f.byos)>Number(f.capacity)){$('#group-message').textContent='Existing students cannot exceed capacity.';return;}
   updateData(data=>{data.groupClasses.unshift({id:'g'+Date.now(),title:f.title,subject:f.subject,grade:f.grade,schedule:f.schedule,duration:'4 weeks · 8 lessons',capacity:Number(f.capacity),byos:Number(f.byos),platform:0,price:Number(f.price),tutorId:'t01',summary:f.summary||''});return data});
   location.href='/tutor/group-seats.html';
 });
 $$('[data-fill-seat]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.fillSeat;
  updateData(data=>{let g=data.groupClasses.find(g=>g.id===id);if(g&&g.byos+g.platform<g.capacity)g.platform++;return data;});
  location.reload();
 }));
 $$('[data-request]').forEach(b=>b.addEventListener('click',()=>{$('#request-message').textContent='Selected demo student request '+b.dataset.request+'. Real approval requires a backend workflow.';}));
 $('#invite-copy')?.addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText('https://tutorpair.example/invite/DEMO-T01');$('#invite-status').textContent='✓ Demo invitation URL copied.';}catch{$('#invite-status').textContent='Demo URL: https://tutorpair.example/invite/DEMO-T01';}
 });
 $('#package-form')?.addEventListener('submit',e=>{
  e.preventDefault(); const f=Object.fromEntries(new FormData(e.currentTarget));
  $('#package-preview').innerHTML=`<h3>${esc(f.name)}</h3><p>${esc(f.sessions)} sessions × ${thb(f.rate)}/session</p><div class="price-big">${thb(Number(f.sessions)*Number(f.rate))}</div><p class="preline">${esc(f.summary)}</p>${notice('Preview only. No proposal has been sent.')}`;
 });
 $('#approve-demo')?.addEventListener('click',()=>{$('#approve-message').textContent='✓ Request approved in this UI preview only.';});
 $('#parent-approve')?.addEventListener('click',()=>{$('#parent-approve-message').textContent='✓ Approval simulated; no payment or booking was created.';});
 $('#line-connect-button')?.addEventListener('click',()=>{updateData(data=>{data.line.connected=!data.line.connected;return data});location.reload();});
 $$('[data-line-pref]').forEach(el=>el.addEventListener('change',()=>{updateData(data=>{data.line[el.dataset.linePref]=el.checked;return data});if($('#line-message'))$('#line-message').textContent='✓ Demo notification preference saved.';}));
 $('#preview-line')?.addEventListener('click',()=>{
  $('#line-preview-holder').innerHTML=`<div class="line-mock"><div class="line-mock-top"><span class="line-logo">LINE</span> TutorPair Official · Example</div>${paintNote(d.latestNote)}<div class="phone-action">View full report (demo)</div></div>`;
 });
}

export { bindControls };
