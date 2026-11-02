import {saveFile} from './files.js';
import {getAuthSession} from './auth.js';
import {state,mutate} from './store.js';
import {$,$$,workspace,esc,money,tag,btn,panel,stat,empty,item,feedback} from './ui.js';
import {refreshEngagements,tutorAccept,tutorDecline,sendPlan,planDiffers,paceLabel,pendingChanges,resolveChange,tutorClasses,nextLesson,lessonsOf,submitTutorEval,tutorQuality,reviewState,submitReview,STATUS_LABEL,ENGAGEMENT,fmtDate} from './flow.js';
import {planList,flexCard,dots,stars,fmtAvail} from './flow-ui.js';
const isDemo=()=>getAuthSession()?.type==='demo';
export const myTutorId=s=>s.scenario==='returning'?'t01':'t-new';
const fmtSize=b=>b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';

/* ---------- Upload boxes (file names only are stored — no backend yet) ---------- */
export const uploadBoxes=()=>`<div class="upload-grid">
 <label class="upload-box" data-upload="evidence"><input type="file" name="evidence" multiple accept=".pdf,.png,.jpg,.jpeg"><span class="ub-icon">↥</span><b>Box 1 · Subject Knowledge Evidence</b><em>Transcript, university student card, or exam certificates (TCAS / A-Level / IELTS)</em><small class="ub-files">Drop files or click to choose · PDF, JPG, PNG</small></label>
 <div class="upload-box" data-upload="video"><span class="ub-icon">▶</span><b>Box 2 · Teaching Ability Check</b><em>A 3-minute video explaining a sample problem or a common student mistake, recorded as an iPad screen recording.</em><label class="ub-pick"><input type="file" name="video" accept="video/*"><span class="button outline small">Choose video file</span></label><small class="ub-files">No file chosen</small><input type="url" name="videoLink" placeholder="…or paste a video link (Google Drive, YouTube unlisted)" aria-label="Video link"></div></div>
 <p class="form-message" id="upload-msg"></p><small class="fine-print">Prototype note: only file names, sizes and the link are saved in this browser. Nothing is uploaded to a server, so do not share real identity documents.</small>`;
export function bindUploads(root=document){
 const state0={videoTooLong:false};
 root.querySelectorAll('[data-upload="evidence"] input').forEach(i=>i.addEventListener('change',()=>{const box=i.closest('.upload-box');box.classList.toggle('has',i.files.length>0);box.querySelector('.ub-files').textContent=i.files.length?[...i.files].map(f=>`${f.name} (${fmtSize(f.size)})`).join(' · '):'Drop files or click to choose · PDF, JPG, PNG'}));
 root.querySelectorAll('[data-upload="video"] input[type=file]').forEach(i=>i.addEventListener('change',()=>{
  const box=i.closest('.upload-box'),out=box.querySelector('.ub-files');state0.videoTooLong=false;box.dataset.duration='';
  const f=i.files[0];box.classList.toggle('has',Boolean(f));if(!f){out.textContent='No file chosen';return}
  out.textContent=`${f.name} (${fmtSize(f.size)})`;
  const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{const d=Math.round(v.duration);URL.revokeObjectURL(v.src);box.dataset.duration=d;
   if(d>210){box.classList.add('bad');out.textContent+=` · ${Math.floor(d/60)}:${String(d%60).padStart(2,'0')} is too long — trim to about 3 minutes`}else{box.classList.remove('bad');out.textContent+=` · ${Math.floor(d/60)}:${String(d%60).padStart(2,'0')}`}};
  v.src=URL.createObjectURL(f);
 }));
}
export async function readUploads(form){
 const evFiles=[...form.querySelector('input[name=evidence]').files];
 const vf=form.querySelector('input[name=video]').files[0],link=form.querySelector('input[name=videoLink]').value.trim(),box=form.querySelector('[data-upload=video]');
 if(!evFiles.length)throw Error('Box 1: add at least one document (transcript, student card or exam certificate).');
 if(!vf&&!link)throw Error('Box 2: add your 3-minute teaching video file or a link.');
 if(link&&!/^https?:\/\//i.test(link))throw Error('Box 2: the video link must start with http:// or https://');
 if(box.classList.contains('bad'))throw Error('Box 2: your video is longer than about 3 minutes. Please trim it.');
 const ev=[];for(const f of evFiles)ev.push({name:f.name,size:f.size,type:f.type,fileId:await saveFile(f)});
 const video={name:vf?.name||'',size:vf?.size||0,type:vf?.type||'',duration:Number(box.dataset.duration)||null,link,fileId:vf?await saveFile(vf):''};
 return {evidenceFiles:ev,video};
}

/* ---------- Inbox: student requests, plan editor, reschedule/cancel ---------- */
const visibleTo=(s,e)=>isDemo()||e.tutorId===myTutorId(s);
export function inboxData(s){
 const eng=(s.engagements||[]).filter(e=>visibleTo(s,e)),chg=pendingChanges(s).filter(r=>isDemo()||tutorClasses(s,false,myTutorId(s)).some(c=>c.id===r.classId));
 const nReq=eng.filter(e=>e.status==='awaiting_tutor').length,nPlan=eng.filter(e=>e.status==='tutor_editing').length;
 return {eng,chg,nReq,nPlan,nChg:chg.length,count:nReq+nPlan+chg.length};
}
const worksheetPreview=r=>r.worksheetPreview?`<img class="ws-preview" src="${r.worksheetPreview}" alt="Student worksheet preview">`:r.worksheetName?`<div class="ws-file">Worksheet file: ${esc(r.worksheetName)}${r.worksheetSize?' · '+fmtSize(r.worksheetSize):''} <small>(preview available for images; PDFs show file name only in this demo)</small></div>`:'';
const PACING=['','Slower — more time on concepts','Steady — balanced explanation and practice','Faster — move quickly to drills','Heavy practice — mostly problem solving'];
export function inboxHtml(s){
 const {eng,chg}=inboxData(s);if(!eng.length&&!chg.length)return '';
 const demoNote=isDemo()?`<div class="policy-note">Demo view: you are acting as the tutor each student chose.</div>`:'';
 const hrs=e=>Math.max(0,Math.ceil((e.expiresAt-Date.now())/3600000));
 const reqCard=e=>{const r=e.request;return `<div class="group-summary"><div class="between"><strong>${esc(e.studentName)} · ${esc(r.grade)} ${esc(r.subject)}</strong>${tag(`Reply in ${hrs(e)} h`,'orange')}</div>${isDemo()?item('Chosen tutor',esc(e.tutorName)):''}${item('Goal',esc(r.goal||'Not specified'))}${item('School worksheet',esc(r.worksheetName||'None uploaded'))}${worksheetPreview(r)}${item('Course',esc(paceLabel(r.courseType,r.sessionLength)))}${item('Student is free',esc(fmtAvail(r.availability)))}${item('You earn',`${money(e.pricing.subtotal)} (${money(e.rate)}/hr × ${e.pricing.hours} hrs)`)}<details class="plan-details"><summary>Draft lesson plan <span>same baseline for every tutor</span></summary>${planList(e.draftPlan)}</details><div class="row-actions"><button class="button primary" data-accept="${e.id}">Accept →</button><button class="button outline" data-decline="${e.id}">Reject</button></div></div>`};
 const editCard=e=>`<form class="group-summary plan-editor" data-plan="${e.id}"><div class="between"><strong>Adjust plan · ${esc(e.studentName)} · ${esc(e.request.subject)}</strong>${tag(STATUS_LABEL[e.status],'purple')}</div>${e.studentFeedback?`<div class="policy-note feedback-note"><b>${esc(e.studentName)} did not approve the last plan. Their comment:</b><br>“${esc(e.studentFeedback)}”${(e.feedbackHistory||[]).length>1?`<br><small>${e.feedbackHistory.length} change requests so far.</small>`:''}</div>`:''}<p class="fine-print">Worksheet: ${esc(e.request.worksheetName||'none')} · ${esc(e.request.goal||'')}</p>${e.plan.map((p,i)=>`<div class="plan-edit-row"><span class="plan-no">${i+1}</span><div><input name="title-${i}" value="${esc(p.title)}" maxlength="80" aria-label="Lesson ${i+1} topic" required><textarea name="focus-${i}" rows="2" maxlength="220" aria-label="Lesson ${i+1} focus">${esc(p.focus)}</textarea><select name="pacing-${i}" aria-label="Lesson ${i+1} pacing">${PACING.map(o=>`<option value="${o}" ${(p.pacing||'')===o?'selected':''}>${o||'Pacing: standard'}</option>`).join('')}${p.pacing&&!PACING.includes(p.pacing)?`<option selected>${esc(p.pacing)}</option>`:''}</select></div></div>`).join('')}<label class="field"><span>Note to student & parent (optional)</span><textarea name="note" rows="2" maxlength="240" placeholder="Why you changed the plan"></textarea></label><button class="button primary" type="submit">Send Plan to Student →</button><p class="form-message plan-msg"></p></form>`;
 const wait=e=>item(`${esc(e.studentName)} · ${esc(e.request.subject)}`,esc(STATUS_LABEL[e.status]),tag(e.status==='active'?'Active':'Waiting',e.status==='active'?'green':'gray'));
 const parts=[];
 const a=eng.filter(e=>e.status==='awaiting_tutor'),b=eng.filter(e=>e.status==='tutor_editing'),c=eng.filter(e=>['plan_review','awaiting_payment','active'].includes(e.status));
 if(a.length)parts.push(panel('New student requests',demoNote+a.map(reqCard).join(''),'Tutors have 24 hours to accept.'));
 if(b.length)parts.push(panel('Plans to adjust',b.map(editCard).join('')));
 if(c.length)parts.push(panel('Sent & active',c.map(wait).join('')));
 if(chg.length)parts.push(panel('Reschedule / cancel requests',chg.map(r=>`<div class="group-summary"><div class="between"><strong>${esc(r.studentName)} · ${esc(r.subject)} · Lesson ${r.lessonN}</strong>${tag(r.type==='cancel'?'Cancel':'Reschedule',r.type==='cancel'?'orange':'purple')}</div><p>${r.type==='reschedule'?`Currently ${esc(fmtDate(r.from))} → requested <b>${esc(fmtDate(r.newStartsAt))}</b>`:`Wants to cancel ${esc(fmtDate(r.from))}`}</p>${r.reason?`<p>Reason: “${esc(r.reason)}”</p>`:''}${r.late?'<p class="warn">Inside the 24-hour advance notice window.</p>':'<p class="fine-print">24 h+ notice given.</p>'}<div class="row-actions"><button class="button primary" data-chg-ok="${r.id}">Accept</button><button class="button outline" data-chg-no="${r.id}">Reject</button></div></div>`).join('')));
 return parts.join('');
}
export function bindInbox(){
 const done=()=>location.reload();
 $$('[data-accept]').forEach(b=>b.addEventListener('click',()=>{try{mutate(s=>tutorAccept(s,b.dataset.accept));done()}catch(e){alert(e.message)}}));
 $$('[data-decline]').forEach(b=>b.addEventListener('click',()=>{try{mutate(s=>tutorDecline(s,b.dataset.decline));done()}catch(e){alert(e.message)}}));
 $$('[data-chg-ok]').forEach(b=>b.addEventListener('click',()=>{try{mutate(s=>resolveChange(s,b.dataset.chgOk,true));done()}catch(e){alert(e.message)}}));
 $$('[data-chg-no]').forEach(b=>b.addEventListener('click',()=>{try{mutate(s=>resolveChange(s,b.dataset.chgNo,false));done()}catch(e){alert(e.message)}}));
 $$('.plan-editor').forEach(f=>f.addEventListener('submit',ev=>{ev.preventDefault();const d=new FormData(f);
  const plan=[0,1,2,3].map(i=>({title:d.get('title-'+i),focus:d.get('focus-'+i),pacing:d.get('pacing-'+i)}));
  try{mutate(s=>sendPlan(s,f.dataset.plan,plan,String(d.get('note')||'').trim()));done()}catch(e){f.querySelector('.plan-msg').textContent=e.message;f.querySelector('.plan-msg').className='form-message error plan-msg'}}));
}
export function prepareInbox(){const s=state();if(refreshEngagements(s))mutate(x=>{refreshEngagements(x)});return state()}

/* ---------- After-session evaluation (tutor → student & parent) ---------- */
export function notesPage(){
 const s=prepareInbox(),t=s.tutor,demo=isDemo(),classes=tutorClasses(s,demo,myTutorId(s));
 if(!classes.length)return workspace('tutor','notes','After-session check-in','You need a student before reporting a lesson.',empty('No classes yet','Accept a student request or invite your own students first.',btn('Student requests →','/tutor/requests.html')));
 const sel=classes.find(c=>c.id===new URLSearchParams(location.search).get('class'))||classes.find(c=>nextLesson(c))||classes[0];
 const L=nextLesson(sel),n=L?.n,prev=n>1?lessonsOf(sel)[n-2]:null;
 const hwItems=prev?.homework?.length?prev.homework:['Pre-lesson worksheet completed'];
 const quality=tutorQuality(classes);
 const rv=reviewState(sel),sent=s.lineMessages?.find(m=>m.id===new URLSearchParams(location.search).get('sent'))||[...(s.lineMessages||[])].reverse().find(m=>m.classId===sel.id);
 const picker=`<div class="tabs">${classes.map(c=>`<a class="${c.id===sel.id?'on':''}" href="/tutor/notes.html?class=${encodeURIComponent(c.id)}">${esc(c.studentName||s.student.name)} · ${esc(c.subject)}</a>`).join('')}</div>`;
 const form=L?`<form id="eval-form" class="stack-form"><div class="between"><strong>${esc(sel.studentName||s.student.name)} · Lesson ${n} of ${lessonsOf(sel).length}: ${esc(L.title)}</strong>${tag('30 seconds','purple')}</div>
 <div class="field"><span>Engagement today</span><div class="faces">${ENGAGEMENT.map(([v,l],i)=>`<label class="face"><input type="radio" name="engagement" value="${v}" ${v===2?'checked':''}><span><i>${v}</i>${l}</span></label>`).join('')}</div></div>
 <div class="field"><span>Homework from last lesson — tick what was done</span><div class="check-options one">${hwItems.map((h,i)=>`<label class="option-check"><input type="checkbox" name="hw" value="${i}" checked><span>${esc(h)}</span></label>`).join('')}</div></div>
 <label class="field"><span>One-sentence note for the family</span><input name="note" maxlength="200" placeholder="e.g. Solved most problems alone; sign mistakes are fading." required></label>
 <label class="field"><span>Annotated GoodNotes PDF (optional)</span><input name="pdf" type="file" accept=".pdf"><small>Saved to the student’s Revision Vault. File name only in this demo.</small></label>
 <button class="button primary" type="submit">Submit Session Report →</button><p id="notes-msg" class="form-message"></p></form>`:`<div class="empty"><div class="empty-art">✓</div><h3>All lessons reported</h3><p>This class is finished. Leave your review below.</p></div>`;
 const review=rv.eligible?panel('Public course review',rv.tutor?`<p>You reviewed ${esc(sel.studentName||s.student.name)}: ${stars(rv.tutor.stars)} — “${esc(rv.tutor.text)}”</p>${rv.visible?`<div class="policy-note">Revealed. ${rv.student?`${esc(sel.studentName||'Student')}’s review of you: ${stars(rv.student.stars)} — “${esc(rv.student.text)}”`:'No review from the student within 14 days.'}</div>`:`<div class="policy-note">Hidden until the student also submits, or in ${rv.daysLeft} days.</div>`}`:`<form id="tutor-review" class="stack-form"><div class="field"><span>Star rating</span><div class="star-input">${[5,4,3,2,1].map(k=>`<label><input type="radio" name="stars" value="${k}" required><span>★</span></label>`).join('')}</div></div><label class="field"><span>Short written review</span><textarea name="text" rows="3" maxlength="400" required></textarea></label><button class="button primary">Submit review</button><small>Revealed only when both submit, or after 14 days.</small><p id="trev-msg" class="form-message"></p></form>`):'';
 workspace('tutor','notes','After-session check-in','A 30-second checklist. It completes the lesson and sends a LINE progress card to the parent and student.',
 `${picker}<div class="two-col form-split"><div>${panel('Tutor → student check-in',form)}${review}</div><div>${panel('LINE Progress Card',sent?`${flexCard(sent)}<p class="fine-print">${sent.id===new URLSearchParams(location.search).get('sent')?'Sent to the parent’s and student’s LINE chat (simulated — no real LINE message).':'Most recent card for this class.'}</p>`:`<p class="muted">After you submit, the card appears here and in the parent’s and student’s LINE (simulated).</p>`)}${panel('Your quality score',quality.score==null?`<p class="muted">Appears after students rate lessons (“How clear was today?” and “Pace?”).</p>`:`<div class="big-price">${quality.score}<small>/100</small></div><p>${quality.count} private student ratings · clarity ${quality.clarity}/3 · pace “just right” ${quality.right}%</p><small class="fine-print">Private to you and TutorPair. Students never see this score.</small>`)}</div></div>`);
 $('#eval-form')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget),picked=d.getAll('hw').map(Number);
  const hw=hwItems.map((h,i)=>({text:h,done:picked.includes(i)}));let id;
  try{mutate(st=>{id=submitTutorEval(st,sel.id,n,{engagement:d.get('engagement'),homework:hw,note:d.get('note'),pdfName:d.get('pdf')?.name||''}).id});location.href=`/tutor/notes.html?class=${encodeURIComponent(sel.id)}&sent=${encodeURIComponent(id)}`}catch(err){feedback('#notes-msg',err.message,'error')}});
 $('#tutor-review')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);try{mutate(st=>submitReview(st,sel.id,'tutor',{stars:Number(d.get('stars')),text:d.get('text')}));location.reload()}catch(err){feedback('#trev-msg',err.message,'error')}});
}
