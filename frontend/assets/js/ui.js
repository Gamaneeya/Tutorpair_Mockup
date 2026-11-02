import {state,reset,switchRole,start,activeCourse,tutorIsActive,linkedParent} from './store.js';
import {getAuthSession,logout} from './auth.js';
export const $=(q,r=document)=>r.querySelector(q);
export const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=n=>'฿'+Number(n).toLocaleString('en-US');
export const tag=(text,type='purple')=>`<span class="tag ${type}">${esc(text)}</span>`;
export const avatar=(name,color='lavender',size='')=>`<span class="avatar ${color} ${size}">${esc(name)}</span>`;
export const btn=(text,href,type='primary')=>`<a class="button ${type}" href="${href}">${text}</a>`;
export const progress=n=>`<div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,Math.max(0,Number(n)))}%"></div></div>`;
export const panel=(title,body,detail='')=>`<section class="panel"><div class="panel-title"><div><h3>${title}</h3>${detail?`<p>${detail}</p>`:''}</div></div>${body}</section>`;
export const empty=(heading,body,action='')=>`<div class="empty"><div class="empty-art">✧</div><h3>${heading}</h3><p>${body}</p>${action}</div>`;
export const item=(title,subtitle,right='')=>`<div class="list-item"><span class="list-dot"></span><div class="list-label"><strong>${title}</strong><small>${subtitle}</small></div>${right?`<div class="list-right">${right}</div>`:''}</div>`;
export const stat=(label,value,detail,icon='◈')=>`<article class="stat"><div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div><p>${detail}</p></article>`;
export const logo=()=>`<span class="logomark">T<span>✦</span></span><span class="logotype">TutorPair</span>`;
export const DEMO_MARK='<span class="demo-badge">DEMO / SAMPLE DATA</span>';
export const routes={
 student:[['Overview','dashboard','▦'],['Learning request','request','✎'],['Join invited class','/join.html','✉'],['Your matches','matching','◎'],['My courses','courses','▤'],['Progress','progress','▥']],
 tutor:[['Overview','dashboard','▦'],['Tutor profile','onboarding','♙'],['Verification','verification','✓'],['Student requests','requests','♧'],['Teaching subjects','subjects','▤'],['My students & learning plans','students','▥'],['Small groups','groups','◫'],['Invite students (BYOS)','invite','✉'],['Session notes','notes','✎']],
 parent:[['Overview','dashboard','▦'],['Link student','link','♧'],['Progress report','progress','▥'],['LINE preferences','line','▤']],
 admin:[['Overview','dashboard','▦'],['Tutor applications','tutors','✓']]
};
export function publicLayout(content){
 $('#app').innerHTML=`<div class="public-shell"><header class="nav"><div class="container nav-inner"><a class="brand" href="/">${logo()}</a><nav class="nav-links"><a href="/#how">How it works</a><a href="/#features">Features</a><a href="/register.html?role=tutor">For tutors</a></nav><div class="nav-actions">${btn('Log in','/login.html','quiet')}${btn('Sign up →','/register.html')}</div><button class="nav-menu" id="nav-menu" aria-label="Open menu">☰</button></div></header>${content}<footer class="footer"><div class="container footer-inner"><div><a class="brand" href="/">${logo()}</a><p>Find your fit. Learn with confidence.<br>Online tutoring for Thai M.1–M.6.</p></div><div><b>Product</b><a href="/#how">How it works</a><a href="/register.html">Create an account</a></div><div><b>For tutors</b><a href="/register.html?role=tutor">Become a tutor</a><a href="/login.html">Log in / explore demo</a></div></div><div class="container footnote">TutorPair · Practice Pitch Prototype · All people, prices, scores and outcomes are simulated.</div></footer></div>`;
 $('#nav-menu')?.addEventListener('click',()=>$('.nav-links').classList.toggle('expanded'));
}
export function workspace(role,page,title,subtitle,body,action=''){
 const session=getAuthSession();
 if(!session){location.replace('/login.html');return;}
 const isDemo=session.type==='demo';
 const s=state();
 if(!s.scenario){location.replace('/login.html');return;}
 if(s.role!==role){location.replace(`/${s.role}/dashboard.html`);return;}
 const stateText=role==='student'?(activeCourse(s)?'Active learner':'Getting started'):
 role==='tutor'?(tutorIsActive(s)?'Active tutor':s.tutor.verificationStatus==='approved'?'Approved · ready to teach':s.tutor.verificationStatus==='pending'?'Verification pending':s.tutor.profile?'Profile created':'Getting started'):
 role==='parent'?(linkedParent(s)?'Linked parent':'Getting started'):'Admin demo';
 const name=role==='student'?s.student.name:role==='tutor'?s.tutor.name:role==='parent'?s.parent.name:'Admin';
 const nav=routes[role].map(([label,slug,ic])=>`<a class="side-link ${page===slug?'active':''}" href="${slug.startsWith('/')?slug:`/${role}/${slug}.html`}"><span class="side-icon">${ic}</span>${label}</a>`).join('');
 $('#app').innerHTML=`<div class="shell"><aside class="sidebar" id="sidebar"><a class="brand side-brand" href="/">${logo()}</a><div class="side-kicker">${role.toUpperCase()} WORKSPACE</div><nav class="side-links">${nav}</nav><div class="side-footer"><div class="sidebar-note">${isDemo?DEMO_MARK:'<span class="demo-badge">LOCAL ACCOUNT DEMO</span>'}<p>${isDemo?'Use the demo switcher to show other roles.':'Your demo login is limited to '+esc(role)+'. Data is stored in this browser only.'}</p></div><div class="sidebar-user">${avatar(name.slice(0,2).toUpperCase(),'lavender','small')}<div><strong>${esc(name)}</strong><small>${esc(stateText)}</small></div></div></div></aside><main class="main"><header class="app-header"><button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation">☰</button><div class="crumb">TutorPair <b>/</b> ${role[0].toUpperCase()+role.slice(1)} <b>/</b> ${esc(title)}</div><div class="header-right">${isDemo?DEMO_MARK:'<span class="demo-badge">BROWSER DEMO</span>'}${isDemo?`<div class="dropdown"><label for="scenario-pick">Sample mode</label><select id="scenario-pick"><option value="">Jump to...</option><option value="student:new">New Student</option><option value="student:returning">Active Student</option><option value="tutor:new">New Tutor</option><option value="tutor:returning">Active Tutor</option></select></div>`:''}${isDemo?`<div class="dropdown"><label for="role-select">Demo view</label><select id="role-select"><option value="student" ${role==='student'?'selected':''}>Student</option><option value="tutor" ${role==='tutor'?'selected':''}>Tutor</option><option value="parent" ${role==='parent'?'selected':''}>Parent</option><option value="admin" ${role==='admin'?'selected':''}>Admin</option></select></div><button class="reset-small" id="reset-story" title="Restart demo story">Reset</button>`:`<span class="signed-in-label">${esc(session.email||'')}</span>`}<button class="reset-small" id="log-out">Log out</button></div></header><div class="page"><div class="heading-row"><div><div class="eyebrow">${esc(stateText)}</div><h1>${title}</h1><p>${subtitle}</p></div>${action?`<div class="heading-actions">${action}</div>`:''}</div>${body}</div></main></div><div class="overlay" id="overlay"></div>`;
 $('#scenario-pick')?.addEventListener('change',e=>{if(!isDemo||!e.target.value)return;if(!confirm('Switch sample scenario? This resets the temporary demo story (not registered accounts).')){e.target.value='';return;}const [r,mode]=e.target.value.split(':');start(r,mode);location.href=`/${r}/dashboard.html`;});
 $('#role-select')?.addEventListener('change',e=>{if(!isDemo)return;switchRole(e.target.value);location.href=`/${e.target.value}/dashboard.html`});
 $('#log-out')?.addEventListener('click',()=>{logout();location.href='/login.html'});
 $('#reset-story')?.addEventListener('click',()=>{if(confirm('Clear the local demo and restart?'))reset()});
 $('#menu-toggle')?.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
 $('#overlay')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
}
export const formSelect=(name,label,options,value)=>`<label class="field"><span>${label}</span><select name="${name}" required>${options.map(o=>{const v=typeof o==='string'?o:o.value,t=typeof o==='string'?o:o.label;return `<option value="${esc(v)}" ${v==value?'selected':''}>${esc(t)}</option>`}).join('')}</select></label>`;
export const field=(name,label,value='',type='text',min=null)=>`<label class="field"><span>${label}</span><input type="${type}" name="${name}" value="${esc(value)}" ${min===null?'':`min="${Number(min)}"`} required></label>`;
export const choices=(name,options,selected=[])=>`<div class="check-options">${options.map(([id,label])=>`<label class="option-check"><input type="checkbox" name="${name}" value="${esc(id)}" ${selected.includes(id)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div>`;
export function feedback(selector,text,kind='success'){let el=$(selector);if(el){el.textContent=text;el.className='form-message '+kind;}}
