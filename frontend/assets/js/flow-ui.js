import {esc,money,tag,avatar,item} from './ui.js';
import {DAYS} from '../data/mock-data.js';
import {summarize} from './availability.js';
import {coursePrice,budgetCalc,tutorExtras,whyMatched,availabilityOverlap,paceLabel,lessonsOf,lessonStates,fmtDate,PLATFORM_FEE,STATUS_LABEL} from './flow.js';

export const stars=n=>n==null?'—':`<span class="stars" aria-label="${n} out of 5">★ ${Number(n).toFixed(1)}</span>`;
export const dots=(n,max=3)=>`<span class="dots" aria-label="${n} of ${max}">${'●'.repeat(n)}<i>${'●'.repeat(max-n)}</i></span>`;
const mmss=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;

/* Simulated 3-minute audition player (no real video exists in this prototype). */
export function demoPlayer(title,link=''){
 return `<div class="demo-player" data-player data-len="180"><div class="dp-screen"><div class="dp-top"><span>iPad screen recording</span><b>3:00</b></div><div class="dp-board">${[78,92,60,85,48,70].map((w,i)=>`<span class="dp-line" data-w="${w}" style="--i:${i}"></span>`).join('')}</div><div class="dp-title">${esc(title)}</div><button type="button" class="dp-play" aria-label="Play audition preview"><span class="dp-icon"></span></button></div><div class="dp-bar"><input type="range" min="0" max="180" value="0" aria-label="Seek audition"><span class="dp-time">0:00 / 3:00</span></div><small class="dp-note">Fictional sample video, not a real tutor submission. Simulated playback.${link?` <a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Open tutor’s video link</a>`:''}</small></div>`;
}
export function bindPlayers(root=document){
 root.querySelectorAll('[data-player]').forEach(p=>{
  if(p.dataset.bound)return;p.dataset.bound='1';
  const btn=p.querySelector('.dp-play'),range=p.querySelector('input'),time=p.querySelector('.dp-time'),lines=[...p.querySelectorAll('.dp-line')];
  let t=0,timer=null;
  const draw=()=>{range.value=t;time.textContent=`${mmss(t)} / 3:00`;lines.forEach((l,i)=>{const seg=180/lines.length,f=Math.max(0,Math.min(1,(t-i*seg)/seg));l.style.width=(f*Number(l.dataset.w))+'%'});};
  const stop=()=>{clearInterval(timer);timer=null;p.classList.remove('playing');btn.setAttribute('aria-label','Play audition preview')};
  btn.addEventListener('click',()=>{
   if(timer){stop();return}
   if(t>=180)t=0;p.classList.add('playing');btn.setAttribute('aria-label','Pause audition preview');
   timer=setInterval(()=>{if(!p.isConnected){stop();return}t+=1;if(t>=180){t=180;stop()}draw()},1000);
  });
  range.addEventListener('input',()=>{t=Number(range.value);draw()});
 });
}

export function planList(plan,{diff=null}={}){
 return `<ol class="plan-list">${plan.map((p,i)=>{const changed=diff&&(diff[i]?.title!==p.title||diff[i]?.focus!==p.focus||(diff[i]?.pacing||'')!==(p.pacing||''));
  return `<li><span class="plan-no">${p.n||i+1}</span><div><strong>${esc(p.title)}</strong>${changed?' '+tag('Adjusted by tutor','orange'):''}<p>${esc(p.focus)}</p>${p.pacing?`<small>Pacing: ${esc(p.pacing)}</small>`:''}</div></li>`}).join('')}</ol>`;
}

export function matchCard(m,i,r,student){
 const t=m,x=tutorExtras(t),len=Number(r.sessionLength||60),price=coursePrice(t.price,len),ceil=budgetCalc(r.budget,len),why=whyMatched(r,t);
 const overlap=availabilityOverlap(r.availability,t);
 const over=price.total>ceil.max;
 return `<article class="match-card rich"><div class="match-upper"><span class="rank">#${i+1}</span>${avatar(t.initials,t.color,'large')}<div class="match-info"><h3>${esc(t.name)}</h3><p>${esc(t.subject)} · ${esc(t.grades.join(' / '))}</p><span class="match-sub">${esc(t.university)} · ${esc(x.faculty)}</span></div><div class="score"><strong>${m.fit.score}%</strong><small>fit score</small></div></div>
 <div class="profile-stats"><div><small>Honors</small><b>${esc(x.honors)}</b></div><div><small>Rating</small><b>${x.rating!=null?stars(x.rating):'New Tutor'}</b>${x.reviews?`<em>${x.reviews} reviews</em>`:'<em>Not enough data</em>'}</div><div title="Cumulative completed, verified lesson hours this tutor has delivered on TutorPair"><small>Hours taught</small><b>${x.hours?x.hours+' h':'Not enough data'}</b><em>verified, completed</em></div><div><small>Course renewal</small><b>${x.renew!=null?x.renew+'%':'Not enough data'}</b><em>students who re-book</em></div></div>
 ${x.fictional?'<small class="fine-print">Fictional sample tutor data for this demo.</small>':''}<blockquote class="tutor-intro"><small>HOW I TEACH</small>“${esc(t.about)}”</blockquote>
 <div class="why-box"><div class="card-eyebrow">WHY MATCHED</div><div class="chip-row">${why.chips.map(c=>`<span class="why-chip">${esc(c)}</span>`).join('')}</div><blockquote class="why-text">“${esc(why.sentence)}”</blockquote>${overlap.length?`<small>Open time you share: <b>${esc(summarize(overlap))}</b></small>`:''}</div>
 <div class="match-grid"><details class="demo-details"><summary>▶ Watch 3-minute Teaching Demo</summary>${demoPlayer(x.video,t.demoLink)}</details><div class="price-box"><div class="card-eyebrow">TOTAL COURSE PRICE</div><div class="price-line"><span>${money(t.price)}/hr × ${price.hours} hrs</span><b>${money(price.subtotal)}</b></div><div class="price-total"><span>Total</span><strong>${money(price.total)}</strong></div><small>${esc(paceLabel(r.courseType,len))}</small>${over?`<small class="over">${money(price.total-ceil.max)} above your ${money(ceil.max)} ceiling.</small>`:`<small>Within your ${money(ceil.max)} ceiling.</small>`}<button class="button primary match-pick" data-pick="${esc(t.id)}">Choose ${esc(t.name.split(' ')[0])} →</button><small>Tutor replies within 24 h. You pay only after approving the plan.</small></div></div>
 <details class="plan-details"><summary>Draft lesson plan <span>${(student.draftPlan||[]).length} lessons · same for every tutor</span></summary>${planList(student.draftPlan||[])}<small>Generated from your worksheet and request (rule-based demo, not live AI). The tutor you choose can adjust it.</small></details></article>`;
}

export const engagementSteps=[['awaiting_tutor','Tutor accepts','within 24 h'],['tutor_editing','Plan adjusted','by tutor'],['plan_review','You approve','plan'],['awaiting_payment','PromptPay','escrow'],['active','Lessons start','']];
export function engagementStepper(e){
 const idx=engagementSteps.findIndex(s=>s[0]===e.status),dead=['declined','expired'].includes(e.status);
 return `<ol class="stepper">${engagementSteps.map(([id,l,sub],i)=>{const st=dead?(i===0?'bad':''):i<idx?'done':i===idx?'now':'';return `<li class="${st}"><span>${st==='done'?'✓':st==='bad'?'!':i+1}</span><b>${l}</b><small>${sub}</small></li>`}).join('')}</ol>`;
}

/** Roadmap stepper of a class. `extra(lesson,state,i)` supplies action HTML per lesson. */
export function roadmap(c,extra=()=>'' ){
 const ls=lessonsOf(c),st=lessonStates(c);
 const label={done:['Done','green'],in_progress:['In progress · this week','purple'],upcoming:['Upcoming','gray'],cancelled:['Cancelled','orange']};
 return `<ol class="roadmap">${ls.map((l,i)=>`<li class="road ${st[i]}"><span class="road-dot">${st[i]==='done'?'✓':l.n}</span><div class="road-body"><div class="between"><strong>Lesson ${l.n}: ${esc(l.title)}</strong>${tag(label[st[i]][0],label[st[i]][1])}</div><p>${esc(l.focus)}</p><small>${esc(fmtDate(l.startsAt))} · ${l.length} min${l.rescheduled?' · rescheduled':''}</small>${l.pacing?`<small>Pacing: ${esc(l.pacing)}</small>`:''}${extra(l,st[i],i)}</div></li>`).join('')}</ol>`;
}
export function compactStepper(c){
 const ls=lessonsOf(c),st=lessonStates(c);
 return `<div class="mini-stepper">${ls.map((l,i)=>`<span class="ms ${st[i]}" title="${esc(l.title)}">${st[i]==='done'?'✓':l.n}</span>`).join('<i></i>')}</div>`;
}

export function flexCard(m,{cta='Open Revision Vault'}={}){
 return `<div class="flex-sample"><div class="flex-header"><span class="line-icon">LINE</span><div><strong>TutorPair Progress Card</strong><small>${esc(m.subject)} · ${esc(m.studentName)} · to ${m.to.join(' & ')}</small></div></div><div class="flex-content"><div class="eyebrow">LESSON ${m.lessonN} OF ${m.total}</div><h3>${esc(m.topic)}</h3><div class="flex-row"><span>Engagement</span>${dots(m.engagement)}</div><div class="flex-row"><span>Homework</span><b>${m.hwDone}/${m.hwTotal} done</b></div><p>“${esc(m.note)}”</p>${m.pdf?`<div class="pdf-chip">PDF · ${esc(m.pdf)}</div>`:''}<div class="flex-cta">${esc(cta)}</div></div></div>`;
}
export const statusTag=e=>tag(STATUS_LABEL[e.status]||e.status,e.status==='active'?'green':['declined','expired'].includes(e.status)?'orange':'purple');
export const fmtAvail=slots=>summarize(slots);
export const dayName=id=>DAYS.find(d=>d.id===id)?.name||id;
