import {getAuthSession} from './auth.js';
import {resolveGroupInvite,acceptGroupInvite} from './byos.js';
import {publicLayout,btn,esc,tag,item,feedback} from './ui.js';
const params=new URLSearchParams(location.search);
const code=params.get('code')||'';
const safeNext=encodeURIComponent(`/join.html?code=${encodeURIComponent(code)}`);
export function renderJoin(){
 const session=getAuthSession();
 let detail=null,error='';
 if(code){try{detail=resolveGroupInvite(code)}catch(e){error=e.message}}
 const group=detail?.group;
 let action='';
 if(!code)action=`<form id="enter-invite" class="stack-form"><label class="field"><span>Invitation code or URL</span><input name="code" placeholder="Paste your invitation code or link" required></label><button type="submit" class="button primary">Find invited class →</button></form>`;
 else if(error)action=`<div class="policy-note">${esc(error)}</div>${btn('Back to invitations →','/join.html','outline')}`;
 else if(!session)action=`<div class="byos-action-box"><h3>Ready to join?</h3><p>Sign in as a Student or create your Student account. Afterward you'll return to this invitation automatically.</p><div class="row-actions">${btn('Log in as Student →',`/login.html?next=${safeNext}`)}${btn('Create Student account →',`/register.html?role=student&next=${safeNext}`,'outline')}</div></div>`;
 else if(session.type!=='account'||session.role!=='student')action=`<div class="policy-note">Please use a registered <b>Student account</b> to accept an invitation. ${session.type==='demo'?'The quick sample switcher cannot share data across accounts.':''}</div><div class="row-actions">${btn('Use Student login →',`/login.html?next=${safeNext}`,'outline')}</div><p class="fine-print">Log out of the current account using its Dashboard first, if necessary.</p>`;
 else if(detail.seatsLeft<=0)action=`<div class="policy-note">This class is full. Ask the tutor to open another group.</div>${btn('My classes →','/student/courses.html','outline')}`;
 else action=`<div class="byos-action-box"><h3>Join this class</h3><p>No matching form needed. Your tutor has already invited you. This class will appear alongside future tutors in your Student account.</p><button class="button primary" id="accept-invite">Accept invitation & join →</button><p id="join-result" class="form-message" role="status"></p></div>`;
 publicLayout(`<section class="auth-bg auth-modern"><div class="auth-card byos-join-card"><div class="eyebrow">TUTORPAIR · BRING YOUR OWN STUDENTS</div><h1>Join your tutor's class</h1><p>Existing students and TutorPair students share one Student Dashboard.</p>${group?`<div class="byos-invite-summary"><div class="between"><strong>${esc(group.name)}</strong>${tag('Invited by tutor','purple')}</div>${item('Tutor',esc(detail.invite.tutorName))}${item('Subject & grade',`${esc(group.subject)} · ${esc(group.grade)}`)}${item('Weekly lesson',esc(group.schedule))}${item('Places remaining',String(Math.max(0,detail.seatsLeft)))}<p class="fine-print">${esc(group.sessions)} sessions · ${esc(group.price)} THB per student (sample price; no payment)</p></div>`:''}${action}<p class="auth-caveat">${tag('BROWSER DEMO','purple')} Invitations work only between registered accounts stored in the <b>same browser and localhost origin</b>. There is no live backend, identity validation, payment, or authorization. Use fictional accounts.</p></div></section>`);
 document.getElementById('enter-invite')?.addEventListener('submit',e=>{
  e.preventDefault();let raw=e.currentTarget.elements.code.value.trim();
  try{if(raw.includes('://'))raw=new URL(raw).searchParams.get('code')||'';}catch{}
  location.href='/join.html?code='+encodeURIComponent(raw);
 });
 document.getElementById('accept-invite')?.addEventListener('click',()=>{
  try{const result=acceptGroupInvite(code);location.href=`/student/courses.html?joined=${encodeURIComponent(result.course.id)}`}
  catch(err){feedback('#join-result',err.message,'error')}
 });
}
