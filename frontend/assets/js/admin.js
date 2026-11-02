import {state,mutate} from './store.js';
import {getFile} from './files.js';
import {notify} from './flow.js';
import {workspace,stat,panel,item,tag,btn,esc,$,$$} from './ui.js';
export function renderAdmin(page='dashboard'){
 if(page==='tutors')return applications();const s=state();
 workspace('admin','dashboard','Marketplace overview','Practice-only sample operations. No real documents or payment information.',
 `<div class="stats-grid">${stat('Example tutors',s.catalog.tutors.length,'Fictional catalog','♙')}${stat('Active group classes',s.catalog.groups.length,'Sample groups','◫')}${stat('Pending subject reviews',(s.tutor.subjectApprovals||[]).filter(x=>x.status==='pending').length,'Does not block approved courses','✓')}${stat('Session reports',s.notes.length,'Local demo records','✎')}</div>
 ${panel('Operations',`${item('Identity & subject approvals','Tutor identity reviewed once; new subjects separately',btn('Review applications →','/admin/tutors.html','outline'))}${item('Payments & refunds','Planned, no payment processor connected')}${item('LINE messaging','Preview only; no notification delivered')}`)}`);
}
const fmtSize=b=>b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round((b||0)/1024))+' KB';
function embedUrl(u){try{const x=new URL(u),h=x.hostname.replace('www.','');if(h==='youtu.be')return 'https://www.youtube.com/embed/'+x.pathname.slice(1);if(h.endsWith('youtube.com')&&x.searchParams.get('v'))return 'https://www.youtube.com/embed/'+x.searchParams.get('v');if(h==='drive.google.com'){const m=x.pathname.match(/\/d\/([^/]+)/);if(m)return 'https://drive.google.com/file/d/'+m[1]+'/preview'}}catch{}return ''}
function evidencePanel(v){
 if(!v)return item('Evidence','Not submitted');
 const files=(v.evidenceFiles||[]).map((f,i)=>`<div class="ev-row"><span><b>${esc(f.name)}</b><small>${fmtSize(f.size)}${f.type?' · '+esc(f.type):''}</small></span>${f.fileId?`<button type="button" class="button outline small" data-view-file="${esc(f.fileId)}" data-name="${esc(f.name)}" data-type="${esc(f.type||'')}">View</button>`:'<small>Name only (submitted before file viewing was added)</small>'}</div>`).join('')||'<small>No documents</small>';
 const vd=v.video||{},link=vd.link,emb=link?embedUrl(link):'';
 const vid=`${vd.fileId?`<div class="ev-row"><span><b>${esc(vd.name)}</b><small>Teaching video${vd.duration?' · '+Math.floor(vd.duration/60)+':'+String(Math.round(vd.duration%60)).padStart(2,'0'):''} · ${fmtSize(vd.size)}</small></span><button type="button" class="button outline small" data-view-file="${esc(vd.fileId)}" data-name="${esc(vd.name)}" data-type="${esc(vd.type||'video/mp4')}">Play</button></div>`:''}${link?`<div class="ev-row"><span><b>Video link</b><small>${esc(link)}</small></span><span class="row-actions">${emb?`<button type="button" class="button outline small" data-embed="${esc(emb)}">Play here</button>`:''}<a class="button outline small" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Open link</a></span></div>`:''}${!vd.fileId&&!link?'<small>Not submitted</small>':''}`;
 return `<div class="ev-block"><div class="card-eyebrow">BOX 1 · SUBJECT KNOWLEDGE EVIDENCE</div>${files}</div><div class="ev-block"><div class="card-eyebrow">BOX 2 · TEACHING ABILITY CHECK</div>${vid}</div><div id="ev-viewer" class="ev-viewer" hidden></div>`;
}
async function bindViewer(){
 const box=$('#ev-viewer');if(!box)return;let url='';
 const show=html=>{box.hidden=false;box.innerHTML=`<div class="between"><strong>Preview</strong><button type="button" class="button outline small" id="ev-close">Close</button></div>${html}`;$('#ev-close').onclick=()=>{box.hidden=true;box.innerHTML='';if(url)URL.revokeObjectURL(url);url=''};box.scrollIntoView({behavior:'smooth',block:'nearest'})};
 $$('[data-view-file]').forEach(b=>b.addEventListener('click',async()=>{
  const blob=await getFile(b.dataset.viewFile);if(!blob){show('<p>This file is no longer stored in this browser.</p>');return}
  if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const type=blob.type||b.dataset.type,n=esc(b.dataset.name);
  if(type.startsWith('video/'))show(`<video src="${url}" controls style="width:100%;max-height:420px;border-radius:12px;background:#000"></video>`);
  else if(type.startsWith('image/'))show(`<img src="${url}" alt="${n}" style="max-width:100%;border-radius:12px">`);
  else if(type==='application/pdf'||/\.pdf$/i.test(b.dataset.name))show(`<iframe src="${url}" title="${n}" style="width:100%;height:480px;border:1px solid #e6e1fb;border-radius:12px"></iframe><a class="button outline small" href="${url}" target="_blank" rel="noopener">Open in new tab</a>`);
  else show(`<p>No inline preview for this file type.</p><a class="button outline small" href="${url}" download="${n}">Download ${n}</a>`);
 }));
 $$('[data-embed]').forEach(b=>b.addEventListener('click',()=>show(`<iframe src="${esc(b.dataset.embed)}" title="Tutor video" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px"></iframe>`)));
}
function applications(){const s=state(),t=s.tutor,status=t.verificationStatus||'not_started';
 const scopes=t.subjectApprovals||[];
 const rows=scopes.map(x=>`<div class="scope-row"><div><strong>${esc(x.subject)} · ${esc(x.grades.join(', '))}</strong><small>Teaching permission for this exact subject and grade range</small></div><div class="scope-actions">${tag(x.status==='approved'?'Approved':x.status==='pending'?'Pending':'Needs correction',x.status==='approved'?'green':'orange')}${x.status==='pending'&&status==='approved'?`<button class="button primary approve-subject" data-id="${esc(x.id)}">Approve subject →</button><button class="button outline reject-subject" data-id="${esc(x.id)}">Request changes</button>`:''}</div></div>`).join('');
 workspace('admin','tutors','Tutor verification & subjects','Approve a new tutor once; review only new subject/grade requests later.',
 `<div class="two-col big-left">${panel('Initial tutor verification',`${item('Applicant',esc(t.name),tag(status==='approved'?'Identity approved':status==='pending'?'Pending':status==='rejected'?'Rejected':'Not submitted',status==='approved'?'green':'orange'))}${item('Education',esc(t.verification?.education||'Not submitted'))}${evidencePanel(t.verification)}${status==='pending'?`<div class="row-actions"><button class="button primary" id="approve-tutor">Approve identity + initial subject →</button><button class="button outline" id="reject-tutor">Reject application</button></div>`:status==='approved'?`<div class="policy-note">Tutor identity and teaching readiness were approved. New courses and price updates do not return here.</div>`:btn('View tutor onboarding →','/tutor/onboarding.html','outline')}<p class="fine-print">All checks are simulated. This page never verifies actual identity or qualifications.</p>`)}
 ${panel('Subject/grade approval queue',rows||'<p>No subject application yet.</p>')}
 </div>${panel('Approval rules',`${item('Initial approval','Verify identity, qualifications and teaching readiness')}${item('New subject / extra grades','Review only that request, without blocking current listings')}${item('Course creation','No repeat approval within already approved subject/grade scope')}${item('Matching gate','Only published offerings in approved scope can appear in Top 3')}`)}`);
 bindViewer();
 $('#approve-tutor')?.addEventListener('click',()=>{mutate(st=>{
  st.tutor.verificationStatus='approved';(st.tutor.subjectApprovals||[]).forEach(a=>{if(a.status==='pending')a.status='approved'});
  const record=st.catalog.tutors.find(x=>x.id==='t-new');if(record){record.verified=true;record.approvedScopes=st.tutor.subjectApprovals;record.quality=70;}
  notify(st,'tutor','Your profile was verified by TutorPair admin. You can now publish courses and receive student requests.','/tutor/verification.html');
 });location.reload()});
 $('#reject-tutor')?.addEventListener('click',()=>{const why=(prompt('Reason for rejection (shown to the tutor):','Please upload a clearer transcript or student card.')||'').trim();if(!why)return;mutate(st=>{st.tutor.verificationStatus='rejected';st.tutor.verification={...(st.tutor.verification||{}),rejectReason:why};notify(st,'tutor','Your verification was rejected: '+why,'/tutor/verification.html');});location.reload()});
 $$('.approve-subject').forEach(b=>b.addEventListener('click',()=>{mutate(st=>{
  const request=st.tutor.subjectApprovals.find(x=>x.id===b.dataset.id);if(request){request.status='approved';notify(st,'tutor',`Your ${request.subject} teaching scope was approved.`,'/tutor/subjects.html')}
  const rec=st.catalog.tutors.find(x=>x.id==='t-new');if(rec)rec.approvedScopes=st.tutor.subjectApprovals;
 });location.reload()}));
 $$('.reject-subject').forEach(b=>b.addEventListener('click',()=>{mutate(st=>{
  const request=st.tutor.subjectApprovals.find(x=>x.id===b.dataset.id);if(request)request.status='rejected';
 });location.reload()}));
}
