import {getAuthSession} from './auth.js';
import {state,switchRole} from './store.js';
import {resolveGroupInvite,acceptGroupInvite} from './byos.js';
import {publicLayout,btn,esc,tag,item,feedback} from './ui.js';
const params=new URLSearchParams(location.search);
const code=params.get('code')||'';
const snap=params.get('d')||'';
const safeNext=encodeURIComponent(`/join.html?code=${encodeURIComponent(code)}${snap?'&d='+encodeURIComponent(snap):''}`);
export function renderJoin(){
 const session=getAuthSession();
 let detail=null,error='';
 if(code){try{detail=resolveGroupInvite(code,snap)}catch(e){error=e.message}}
 const group=detail?.group;
 let action='';
 if(!code)action=`<form id="enter-invite" class="stack-form"><label class="field"><span>Invitation code or URL</span><input name="code" placeholder="Paste your invitation code or link" required></label><button type="submit" class="button primary">Find invited class →</button></form>`;
 else if(error)action=`<div class="policy-note">${esc(error)}</div>${btn('Back to invitations →','/join.html','outline')}`;
 else if(!session)action=`<div class="byos-action-box"><h3>Ready to join?</h3><p>Sign in as a Student or create your Student account. Afterward you'll return to this invitation automatically.</p><div class="row-actions">${btn('Log in as Student →',`/login.html?next=${safeNext}`)}${btn('Create Student account →',`/register.html?role=student&next=${safeNext}`,'outline')}</div></div>`;
 else if(session.type==='demo'&&state().role!=='student')action=`<div class="policy-note">You are in the demo as a <b>${esc(state().role)}</b>. Switch the demo view to Student to accept this invitation.</div><button class="button primary" id="demo-student">Switch to Student view & continue →</button>`;
 else if(session.type!=='demo'&&(session.type!=='account'||session.role!=='student'))action=`<div class="policy-note">Please use a registered <b>Student account</b> to accept an invitation. ${session.type==='demo'?'':''}</div><div class="row-actions">${btn('Use Student login →',`/login.html?next=${safeNext}`,'outline')}</div><p class="fine-print">Log out of the current account using its Dashboard first, if necessary.</p>`;
 else if(detail.seatsLeft<=0)action=`<div class="policy-note">This class is full. Ask the tutor to open another group.</div>${btn('My classes →','/student/courses.html','outline')}`;
 else action=`<div class="byos-action-box"><h3>Join this class</h3><p>No matching form needed. Your tutor has already invited you. This class will appear alongside future tutors in your Student account.${detail.portable?'<br><small>Opened from a shared link: the class details come from the link itself.</small>':''}</p><button class="button primary" id="accept-invite">Accept invitation & join →</button><p id="join-result" class="form-message" role="status"></p></div>`;
 publicLayout(`<section class="auth-bg auth-modern"><div class="auth-card byos-join-card"><div class="eyebrow">TUTORPAIR · BRING YOUR OWN STUDENTS</div><h1>Join your tutor's class</h1><p>Existing students and TutorPair students share one Student Dashboard.</p>${group?`<div class="byos-invite-summary"><div class="between"><strong>${esc(group.name)}</strong>${tag('Invited by tutor','purple')}</div>${item('Tutor',esc(detail.invite.tutorName))}${item('Subject & grade',`${esc(group.subject)} · ${esc(group.grade)}`)}${item(group.kind==='one'?'Format':'Weekly lesson',group.kind==='one'?'Private 1-on-1 online':esc(group.schedule||'Schedule set with tutor'))}${group.kind==='one'?'':item('Places remaining',String(Math.max(0,detail.seatsLeft)))}<p class="fine-print">${esc(group.sessions)} sessions${group.kind==='one'?` · ${esc(group.durationMinutes)} min each`:''} · ${esc(group.price)} THB per student (sample price; no payment)</p></div>`:''}${action}<p class="auth-caveat">${tag('BROWSER DEMO','purple')} The link carries the class details, so it opens on any device, but accounts and the tutor roster are stored in this browser only (no live backend, identity check, payment or authorization). Use fictional accounts.</p></div></section>`);
 document.getElementById('enter-invite')?.addEventListener('submit',e=>{
  e.preventDefault();let raw=e.currentTarget.elements.code.value.trim(),d='';
  try{if(raw.includes('://')){const u=new URL(raw);raw=u.searchParams.get('code')||'';d=u.searchParams.get('d')||''}}catch{}
  location.href='/join.html?code='+encodeURIComponent(raw)+(d?'&d='+encodeURIComponent(d):'');
 });
 document.getElementById('demo-student')?.addEventListener('click',()=>{switchRole('student');location.reload()});
 document.getElementById('accept-invite')?.addEventListener('click',()=>{
  try{const result=acceptGroupInvite(code,snap);location.href=`/student/courses.html?joined=${encodeURIComponent(result.course.id)}`}
  catch(err){feedback('#join-result',err.message,'error')}
 });
}
