import {state,mutate} from './store.js';
import {workspace,stat,panel,item,tag,btn,esc,$,$$} from './ui.js';
export function renderAdmin(page='dashboard'){
 if(page==='tutors')return applications();const s=state();
 workspace('admin','dashboard','Marketplace overview','Practice-only sample operations. No real documents or payment information.',
 `<div class="stats-grid">${stat('Example tutors',s.catalog.tutors.length,'Fictional catalog','♙')}${stat('Active group classes',s.catalog.groups.length,'Sample groups','◫')}${stat('Pending subject reviews',(s.tutor.subjectApprovals||[]).filter(x=>x.status==='pending').length,'Does not block approved courses','✓')}${stat('Session reports',s.notes.length,'Local demo records','✎')}</div>
 ${panel('Operations',`${item('Identity & subject approvals','Tutor identity reviewed once; new subjects separately',btn('Review applications →','/admin/tutors.html','outline'))}${item('Payments & refunds','Planned, no payment processor connected')}${item('LINE messaging','Preview only; no notification delivered')}`)}`);
}
function applications(){const s=state(),t=s.tutor,status=t.verificationStatus||'not_started';
 const scopes=t.subjectApprovals||[];
 const rows=scopes.map(x=>`<div class="scope-row"><div><strong>${esc(x.subject)} · ${esc(x.grades.join(', '))}</strong><small>Teaching permission for this exact subject and grade range</small></div><div class="scope-actions">${tag(x.status==='approved'?'Approved':x.status==='pending'?'Pending':'Needs correction',x.status==='approved'?'green':'orange')}${x.status==='pending'&&status==='approved'?`<button class="button primary approve-subject" data-id="${esc(x.id)}">Approve subject →</button><button class="button outline reject-subject" data-id="${esc(x.id)}">Request changes</button>`:''}</div></div>`).join('');
 workspace('admin','tutors','Tutor verification & subjects','Approve a new tutor once; review only new subject/grade requests later.',
 `<div class="two-col big-left">${panel('Initial tutor verification',`${item('Applicant',esc(t.name),tag(status==='approved'?'Identity approved':status==='pending'?'Pending':'Not submitted',status==='approved'?'green':'orange'))}${item('Evidence (demo)',esc(t.verification?.education||'Not submitted')+' · '+esc(t.verification?.subjectCheck||''))}${item('Teaching demonstration',esc(t.verification?.teachingDemo||'Not submitted'))}${status==='pending'?`<div class="row-actions"><button class="button primary" id="approve-tutor">Approve identity + initial subject →</button><button class="button outline" id="reject-tutor">Request corrections</button></div>`:status==='approved'?`<div class="policy-note">Tutor identity and teaching readiness were approved. New courses and price updates do not return here.</div>`:btn('View tutor onboarding →','/tutor/onboarding.html','outline')}<p class="fine-print">All checks are simulated. This page never verifies actual identity or qualifications.</p>`)}
 ${panel('Subject/grade approval queue',rows||'<p>No subject application yet.</p>')}
 </div>${panel('Approval rules',`${item('Initial approval','Verify identity, qualifications and teaching readiness')}${item('New subject / extra grades','Review only that request, without blocking current listings')}${item('Course creation','No repeat approval within already approved subject/grade scope')}${item('Matching gate','Only published offerings in approved scope can appear in Top 3')}`)}`);
 $('#approve-tutor')?.addEventListener('click',()=>{mutate(st=>{
  st.tutor.verificationStatus='approved';(st.tutor.subjectApprovals||[]).forEach(a=>{if(a.status==='pending')a.status='approved'});
  const record=st.catalog.tutors.find(x=>x.id==='t-new');if(record){record.verified=true;record.approvedScopes=st.tutor.subjectApprovals;record.quality=70;}
 });location.reload()});
 $('#reject-tutor')?.addEventListener('click',()=>{mutate(st=>{st.tutor.verificationStatus='draft';});location.reload()});
 $$('.approve-subject').forEach(b=>b.addEventListener('click',()=>{mutate(st=>{
  const request=st.tutor.subjectApprovals.find(x=>x.id===b.dataset.id);if(request)request.status='approved';
  const rec=st.catalog.tutors.find(x=>x.id==='t-new');if(rec)rec.approvedScopes=st.tutor.subjectApprovals;
 });location.reload()}));
 $$('.reject-subject').forEach(b=>b.addEventListener('click',()=>{mutate(st=>{
  const request=st.tutor.subjectApprovals.find(x=>x.id===b.dataset.id);if(request)request.status='rejected';
 });location.reload()}));
}
