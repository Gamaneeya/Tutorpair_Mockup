import {getAuthSession} from './auth.js';
import {state,mutate,studentCourses} from './store.js';
import {planProgress,planFor} from './plans.js';
import {$,$$,workspace,esc,money,tag,btn,progress,panel,stat,empty,item,feedback} from './ui.js';
import {refreshEngagements,findEngagement,approvePlan,requestPlanChanges,payEngagement,isOpen,planDiffers,paceLabel,lessonsOf,lessonStates,requestChange,submitStudentEval,submitReview,reviewState,ledger,fmtDate,H24,CLARITY,PACE_OPTS,STATUS_LABEL} from './flow.js';
import {planList,engagementStepper,roadmap,compactStepper,statusTag,fmtAvail,stars,dots} from './flow-ui.js';
const q=k=>new URLSearchParams(location.search).get(k);
const isDemo=()=>getAuthSession()?.type==='demo';
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
const run=(fn,msg,after)=>{try{mutate(fn);after?.()}catch(e){feedback(msg,e.message,'error')}};

/* ---------- Tutor request status → plan approval → PromptPay escrow ---------- */
export function engagementPage(){
 const s0=state();if(refreshEngagements(s0))mutate(s=>{refreshEngagements(s)});
 const s=state(),list=s.engagements||[];
 if(!list.length)return workspace('student','engagement','My tutor request','Choose a tutor from your Top 3 to start.',empty('No tutor request yet','Tell us what you need, compare your Top 3, then choose one tutor.',btn('Find a tutor →','/student/request.html')));
 const e=list.find(x=>x.id===q('id'))||[...list].reverse().find(isOpen)||list.at(-1);
 const r=e.request,hrsLeft=Math.max(0,Math.ceil((e.expiresAt-Date.now())/3600000));
 let main='';
 if(e.status==='awaiting_tutor')main=panel('Waiting for '+esc(e.tutorName),`<div class="countdown"><strong>${hrsLeft}</strong><span>hours left for the tutor to accept</span></div><p>${esc(e.tutorName)} has your worksheet name, request and the draft plan. You won’t be charged until you approve the final plan.</p>${isDemo()?`<div class="policy-note">Demo: switch <b>Demo view → Tutor</b> and open <b>Student requests</b> to accept as the tutor.</div><div class="row-actions"><button class="button outline" id="skip-24">Simulate 24 hours passing</button></div>`:''}`);
 else if(e.status==='tutor_editing')main=panel('Tutor is adjusting your plan',`<p>${esc(e.tutorName)} accepted and is editing topics and pacing. You’ll get the plan to review here.</p>${e.studentFeedback?`<div class="policy-note">Your requested changes: ${esc(e.studentFeedback)}</div>`:''}${isDemo()?'<div class="policy-note">Demo: switch to Tutor view → Student requests to edit and send the plan.</div>':''}`);
 else if(e.status==='plan_review')main=panel('Review the adjusted plan',`${e.tutorNote?`<div class="policy-note"><b>Note from ${esc(e.tutorName)}:</b> ${esc(e.tutorNote)}</div>`:''}${planList(e.plan,{diff:e.draftPlan})}<p class="fine-print">${planDiffers(e)?'Items marked “Adjusted by tutor” differ from the draft.':'The tutor kept the draft plan unchanged.'} Student or parent can approve.</p><div class="row-actions"><button class="button primary" id="approve-plan">Approve plan & go to payment →</button></div><form id="changes-form" class="stack-form section-gap"><label class="field"><span>Not happy with the plan? Tell the tutor what to change (required)</span><textarea name="msg" rows="3" required minlength="5" maxlength="300" placeholder="e.g. Please spend more time on word problems in Lesson 2"></textarea></label><button class="button outline" type="submit">Send back to tutor with this comment</button></form><p id="eng-msg" class="form-message"></p>`);
 else if(e.status==='awaiting_payment'){
  const seed=[...e.id].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);let x=seed;const cell=()=>{x=(x*1664525+1013904223)>>>0;return x>>>29>2};
  const grid=Array.from({length:225},(_,i)=>{const r0=Math.floor(i/15),c0=i%15,fin=(r0<5&&c0<5)||(r0<5&&c0>9)||(r0>9&&c0<5);return fin?(r0%4===2&&c0%4===2||r0===0||r0===4||c0===0||c0===4||(r0>9&&(r0===10||r0===14))||(c0>9&&(c0===10||c0===14))?1:(r0%4===2?1:0)):cell()?1:0});
  main=panel('PromptPay escrow checkout',`<div class="pay-grid"><div class="qr" aria-label="Simulated PromptPay QR code">${grid.map(v=>`<i class="${v?'on':''}"></i>`).join('')}</div><div><div class="card-eyebrow">AMOUNT TO HOLD IN ESCROW</div><div class="big-price">${money(e.pricing.total)}</div><p>Your money is held by TutorPair and released to the tutor lesson by lesson after each lesson is reported (proposed policy). Late cancellations follow the 24-hour rule.</p><small class="fine-print">Simulated QR — not scannable. No real payment occurs.</small></div></div><div class="row-actions"><button class="button primary" id="pay-now">Simulate PromptPay payment received →</button></div><p id="eng-msg" class="form-message"></p>`);
 }else if(e.status==='active')main=panel('You’re all set',`<div class="success-icon sm">✓</div><p>Payment is held in escrow and your 4 lessons are scheduled with ${esc(e.tutorName)}.</p><div class="row-actions">${btn('Open learning progress →',`/student/progress.html?course=${encodeURIComponent(e.courseId)}`)}${btn('Punch card & payments →','/student/ledger.html','outline')}</div>`);
 else main=panel(STATUS_LABEL[e.status],`<p>${e.status==='declined'?'The tutor can’t take this request right now.':'The tutor did not reply within 24 hours, so nothing was charged.'} Pick another tutor from your Top 3.</p>${btn('Back to my matches →','/student/matching.html')}`);
 const side=panel('Your request',`${item('Tutor',`${esc(e.tutorName)}`,statusTag(e))}${item('Subject & grade',`${esc(r.subject)} · ${esc(r.grade)}`)}${item('Course',esc(paceLabel(r.courseType,r.sessionLength)))}${item('Learning times',esc(fmtAvail(r.availability)))}${item('Worksheet',esc(r.worksheetName||'None uploaded'))}<div class="price-box flat"><div class="price-line"><span>${money(e.rate)}/hr × ${e.pricing.hours} hrs</span><b>${money(e.pricing.subtotal)}</b></div><div class="price-total"><span>Total</span><strong>${money(e.pricing.total)}</strong></div></div>`)+
 panel('Activity',`<ul class="log">${[...e.log].reverse().map(l=>`<li><span>${ago(l.t)}</span>${esc(l.text)}</li>`).join('')}</ul>`);
 const others=list.filter(x=>x.id!==e.id).length?panel('Other requests',list.filter(x=>x.id!==e.id).map(x=>item(`${esc(x.tutorName)} · ${esc(x.request.subject)}`,esc(STATUS_LABEL[x.status]),btn('Open','/student/engagement.html?id='+x.id,'outline'))).join('')):'';
 workspace('student','engagement','My tutor request','From choosing a tutor to your first lesson.',`<div class="panel stepper-panel">${engagementStepper(e)}</div><div class="two-col big-left"><div>${main}</div><div>${side}${others}</div></div>`);
 $('#skip-24')?.addEventListener('click',()=>{mutate(st=>{const x=findEngagement(st,e.id);x.expiresAt=Date.now()-1;refreshEngagements(st)});location.reload()});
 $('#approve-plan')?.addEventListener('click',()=>run(st=>approvePlan(st,e.id),'#eng-msg',()=>location.reload()));
 $('#changes-form')?.addEventListener('submit',ev=>{ev.preventDefault();const msg=new FormData(ev.currentTarget).get('msg').trim();run(st=>requestPlanChanges(st,e.id,msg),'#eng-msg',()=>location.reload())});
 $('#pay-now')?.addEventListener('click',()=>{let id;run(st=>{id=payEngagement(st,e.id).id},'#eng-msg',()=>{location.href='/student/progress.html?course='+encodeURIComponent(id)})});
}

/* ---------- Learning progress: roadmap, reschedule/cancel, evaluations, review ---------- */
export function progressPage(){
 const s=state(),cs=studentCourses(s).filter(c=>c.started!==false);
 if(!cs.length)return workspace('student','progress','Learning progress','No course to track yet.',empty('No progress yet','Progress tracking starts once your first course is active.',btn('Find a tutor','/student/request.html')));
 const c=cs.find(x=>x.id===q('course'))||cs[0],ls=lessonsOf(c),st=lessonStates(c);
 const done=ls.filter(l=>l.status==='done'),evals=done.map(l=>l.tutorEval).filter(Boolean);
 const hw=evals.flatMap(e=>e.homework||[]),hwPct=hw.length?Math.round(100*hw.filter(h=>h.done).length/hw.length):null;
 const avgEng=evals.length?(evals.reduce((a,e)=>a+e.engagement,0)/evals.length).toFixed(1):null;
 const pend=(s.changeRequests||[]).filter(r=>r.classId===c.id);
 const now=Date.now();
 const extra=(l,state)=>{
  if(state==='done'){
   const te=l.tutorEval?`<div class="road-note">Tutor report: engagement ${dots(l.tutorEval.engagement)} · homework ${l.tutorEval.homework.filter(h=>h.done).length}/${l.tutorEval.homework.length} · “${esc(l.tutorEval.note)}”${l.tutorEval.pdf?` · <a href="/student/vault.html">PDF in Vault</a>`:''}</div>`:'';
   const ev=l.studentEval?`<div class="road-note ok">You rated: ${CLARITY.find(x=>x[0]===l.studentEval.clarity)[1]} · ${PACE_OPTS.find(x=>x[0]===l.studentEval.pace)[1]}</div>`:`<form class="eval-form" data-eval="${l.n}"><b>How clear was today?</b><div class="faces">${CLARITY.map(([v,t],i)=>`<label class="face"><input type="radio" name="clarity" value="${v}" required><span><i>${['☹','◔','☺'][i]}</i>${t}</span></label>`).join('')}</div><b>Pace?</b><div class="seg-toggle small">${PACE_OPTS.map(([v,t])=>`<label><input type="radio" name="pace" value="${v}" required><span>${t}</span></label>`).join('')}</div><button class="button primary small">Send</button><small>Private. Feeds the tutor’s quality score.</small></form>`;
   return te+ev;
  }
  if(state==='cancelled')return `<div class="road-note">Cancelled${l.cancelledEarly?' with 24 h+ notice — refunded from escrow':' (inside 24 h)'}.</div>`;
  const p=pend.find(r=>r.lessonN===l.n&&r.status==='pending'),last=pend.filter(r=>r.lessonN===l.n&&r.status!=='pending').at(-1);
  const late=Date.parse(l.startsAt)-now<H24;
  if(p)return `<div class="road-note wait">${p.type==='reschedule'?'Reschedule':'Cancel'} request sent — waiting for tutor to accept or reject.${p.late?' (inside 24 h notice)':''}</div>`;
  return `${last?`<div class="road-note ${last.status==='accepted'?'ok':'bad'}">Your ${last.type} request was ${last.status}.</div>`:''}<div class="road-actions"><button class="button outline small" data-chg="reschedule" data-n="${l.n}">Request reschedule</button><button class="button outline small danger" data-chg="cancel" data-n="${l.n}">Cancel class</button></div>${late?'<small class="warn">Less than 24 h away: the tutor decides, and the 24-hour notice policy may apply.</small>':''}<form class="chg-form" data-form="${l.n}" hidden><input type="hidden" name="type" value="reschedule"><label class="field when-field"><span>New date & time</span><input type="datetime-local" name="when"></label><label class="field"><span>Reason (required)</span><textarea name="reason" rows="2" maxlength="200" required placeholder="e.g. School activity that day"></textarea></label><button class="button primary small">Send to tutor</button></form>`;
 };
 const rv=reviewState(c);
 const review=rv.eligible?panel('Course review (public)',rv.student?`<p>You reviewed ${esc(c.tutorName)}: ${stars(rv.student.stars)} — “${esc(rv.student.text)}”</p>${rv.visible?`<div class="policy-note">Revealed. ${rv.tutor?`${esc(c.tutorName)}’s review of you: ${stars(rv.tutor.stars)} — “${esc(rv.tutor.text)}”`:'The tutor did not submit within 14 days.'}</div>`:`<div class="policy-note">Hidden until the tutor also submits, or in ${rv.daysLeft} days.</div>${isDemo()?'<button class="button outline" id="skip-14">Simulate 14 days passing</button>':''}`}`:`<form id="review-form" class="stack-form"><div class="field"><span>Star rating</span><div class="star-input">${[5,4,3,2,1].map(n=>`<label><input type="radio" name="stars" value="${n}" required><span>★</span></label>`).join('')}</div></div><label class="field"><span>Short written review (1 min)</span><textarea name="text" rows="3" maxlength="400" required placeholder="What worked well? What could be better?"></textarea></label><button class="button primary">Submit review</button><small>Revealed only when both of you submit, or after 14 days.</small></form><p id="rev-msg" class="form-message"></p>`):'';
 const latest=done.at(-1);
 const plan=planFor(s,s.student.id);
 workspace('student','progress','Learning progress','Your lesson roadmap, status and quick feedback for each class.',
 `${cs.length>1?`<div class="tabs">${cs.map(x=>`<a class="${x.id===c.id?'on':''}" href="/student/progress.html?course=${encodeURIComponent(x.id)}">${esc(x.subject)}</a>`).join('')}</div>`:''}
 <div class="stats-grid">${stat('Lessons done',`${done.length}/${ls.length}`,esc(c.title),'▤')}${stat('Next lesson',nextLabel(c,st),'Online class','▦')}${stat('Engagement',avgEng?`${avgEng}/3`:'—','Tutor’s average rating','◎')}${stat('Homework done',hwPct==null?'—':hwPct+'%','Tutor checklist','✎')}</div>
 <div class="two-col big-left"><div>${panel('4-session lesson roadmap',`<div class="between road-head"><span>${esc(paceLabel(c.courseType,c.sessionLength))} · ${esc(c.tutorName)}</span>${compactStepper(c)}</div><p id="road-msg" class="form-message"></p>${roadmap(c,extra)}`)}</div><div>${panel('Latest tutor report',latest?.tutorEval?`${tag('LESSON '+latest.n+' REPORT','green')}<h3 class="note-heading">${esc(latest.title)}</h3>${item('Engagement',dots(latest.tutorEval.engagement)+` ${latest.tutorEval.engagement}/3`)}${item('Homework',`${latest.tutorEval.homework.filter(h=>h.done).length}/${latest.tutorEval.homework.length} done`)}${item('Tutor note',esc(latest.tutorEval.note))}<div class="row-actions">${btn('Revision Vault →','/student/vault.html','outline')}</div>`:empty('First report coming','After each lesson your tutor sends engagement, homework and a note.'))}${review}${plan.length&&c.id==='c-math'?panel('Learning objectives (tutor-entered)',`<div class="between"><span>Completed, not mastery</span><b>${planProgress(plan)}%</b></div>${progress(planProgress(plan))}${plan.map(x=>item((x.completed?'✓ ':'○ ')+esc(x.title),x.completed?'Completed by tutor':'In progress')).join('')}`):''}</div></div>`);
 $$('[data-chg]').forEach(b=>b.addEventListener('click',()=>{
  const n=Number(b.dataset.n);
  const f=$(`[data-form="${n}"]`),type=b.dataset.chg;f.hidden=!(f.hidden||f.elements.type.value!==type);f.elements.type.value=type;
  const w=f.querySelector('.when-field');w.hidden=type==='cancel';f.elements.when.required=type==='reschedule';f.querySelector('button').textContent=type==='cancel'?'Send cancel request':'Send reschedule request';
 }));
 $$('.chg-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();run(st=>{const d=new FormData(f),ty=d.get('type');requestChange(st,c.id,Number(f.dataset.form),ty,ty==='reschedule'?d.get('when'):'',Date.now(),d.get('reason'))},'#road-msg',()=>location.reload())}));
 $$('.eval-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f);run(st=>submitStudentEval(st,c.id,Number(f.dataset.eval),{clarity:d.get('clarity'),pace:d.get('pace')}),'#road-msg',()=>location.reload())}));
 $('#review-form')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);run(st=>submitReview(st,c.id,'student',{stars:Number(d.get('stars')),text:d.get('text')}),'#rev-msg',()=>location.reload())});
 $('#skip-14')?.addEventListener('click',()=>{mutate(st=>{const x=studentCourses(st).find(k=>k.id===c.id);x.completedAt=Date.now()-14*86400000});location.reload()});
}
const nextLabel=(c,st)=>{const i=st.indexOf('in_progress');return i<0?'Complete':new Date(lessonsOf(c)[i].startsAt).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})};

/* ---------- Revision Vault ---------- */
export function vaultPage(){
 const s=state(),items=[...(s.vault||[])].sort((a,b)=>b.at-a.at);
 workspace('student','vault','Revision Vault','Annotated GoodNotes PDFs from every lesson, in one place.',
 items.length?`<div class="vault-grid">${items.map(v=>`<article class="vault-card"><div class="pdf-icon">PDF</div><div><strong>${esc(v.name)}</strong><small>${esc(v.subject)} · Lesson ${v.lessonN}: ${esc(v.title)}</small><small>From ${esc(v.tutorName)} · ${ago(v.at)}</small></div></article>`).join('')}</div><div class="policy-note">Demo: only the file name is stored — no file is uploaded or downloadable until a backend is connected.</div>`:empty('Your vault is empty','After each lesson your tutor can upload the annotated GoodNotes PDF. It lands here.',btn('Learning progress →','/student/progress.html','outline')));
}

/* ---------- Punch-card ledger ---------- */
export function ledgerPage(){
 const s=state(),cs=studentCourses(s).filter(c=>c.started!==false);
 if(!cs.length)return workspace('student','ledger','Punch card & payments','Every lesson stamps your card as escrow is released.',empty('No paid classes yet','Your punch card appears after your first PromptPay escrow payment.',btn('Find a tutor','/student/request.html')));
 workspace('student','ledger','Punch card & payments','Every finished lesson stamps your card and releases that lesson’s share from escrow.',
 cs.map(c=>{const L=ledger(c);return panel(esc(c.title),`<div class="between"><span>${esc(c.tutorName)}</span><b>${money(L.total)} total</b></div><div class="punch-card">${L.punches.map((p,i)=>`<span class="punch ${p}"><b>${p==='done'?'✓':p==='cancelled'?'×':i+1}</b><small>${p==='done'?'Stamped':p==='cancelled'?'Cancelled':'Open'}</small></span>`).join('')}</div><div class="ledger-stats"><div><small>Held in escrow</small><b>${money(L.held)}</b></div><div><small>Released to tutor</small><b>${money(L.released)}</b></div><div><small>Refunded</small><b>${money(L.refunded)}</b></div></div>${L.rows.map(r=>item(esc(r.label),r.at?new Date(r.at).toLocaleDateString('en-GB'):'—',`<b class="${r.kind==='in'?'pos':'neg'}">${r.amount>0?'+':r.amount<0?'−':''}${money(Math.abs(Math.round(r.amount)))}</b>`)).join('')||empty('No payments','')}<p class="fine-print">Simulated ledger. Platform fee is included in the total; the 24-hour cancellation rule is a proposed policy.</p>`)}).join(''));
}
