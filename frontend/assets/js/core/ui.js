import {getData, updateData, getAccount, enterDemo, logoutDemo, resetData} from '../data-source.js';

const d = getData();
const role = document.body.dataset.role || '';
const page = document.body.dataset.page || 'landing';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const thb = number => '฿'+Number(number).toLocaleString('en-US');
const badge = (s,cls='blue')=>`<span class="pill ${cls}">${esc(s)}</span>`;
const photo = (initials, accent='violet',size='')=>`<span class="avatar ${accent} ${size}">${esc(initials)}</span>`;
const action = (href,text,cls='primary')=>`<a class="btn ${cls}" href="${href}">${text}</a>`;
const progress = (value)=>`<div class="progress-track"><span style="width:${Math.max(0,Math.min(100,Number(value)))}%"></span></div>`;
const iconPaths = {
  home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  books:'<path d="M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2V5z"/><path d="M4 18a2 2 0 0 1 2-2h14"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  chart:'<path d="M3 3v18h18M7 15l4-4 3 2 6-7"/>',
  message:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5z"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  money:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  shield:'<path d="m12 22 7-4V6l-7-4-7 4v12z"/><path d="m9 12 2 2 4-4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/>',
  sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  logout:'<path d="M10 17l5-5-5-5m5 5H3m10-9h7v18h-7"/>',
  spark:'<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8zM19 18l.7 2.3L22 21l-2.3.7L19 24l-.7-2.3L16 21l2.3-.7z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>'
};
function ico(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.grid}</svg>`}
const NAV={
 student:[['Overview','dashboard','home'],['Learning request','learning-request','edit'],['Tutor matching','matching','search'],['Tutor profile','tutor-profile','users'],['Booking','booking','calendar'],['My courses','courses','books'],['Learning workspace','learning-workspace','grid'],['Progress tracking','progress','chart'],['Lesson feedback','lesson-feedback','message'],['Chat','chat','message'],['Course proposal','course-proposal','file'],['Checkout','checkout','money']],
 tutor:[['Overview','dashboard','home'],['Student requests','student-requests','users'],['My students','my-students','users'],['Create small group','create-group','plus'],['Group seats','group-seats','grid'],['Calendar','calendar','calendar'],['Session notes','session-notes','edit'],['Progress reports','progress-reports','chart'],['Earnings','earnings','money'],['Invite students','invite-students','link'],['Tutor profile','profile','shield'],['Packages','package-builder','books'],['First lesson','lesson-approval','calendar'],['Student feedback','student-feedback','message']],
 parent:[['Overview','dashboard','home'],['Child progress','progress','chart'],['Linked students','linked-students','users'],['LINE settings','line-settings','message'],['Notifications','notifications','bell'],['Course approval','course-approval','file'],['Payments','payments','money']],
 admin:[['Overview','dashboard','home'],['Tutor verification','tutor-verification','shield'],['Trials','trial-monitoring','calendar'],['Payments','payments','money'],['Refunds','refunds','file'],['Analytics','analytics','chart']]
};
function linksFor(r){return NAV[r]||[];}
function pageLabel(r,p){return linksFor(r).find(x=>x[1]===p)?.[0] || 'Dashboard';}
function layout(content,{title,description='',eyebrow='',actions=''}={}){
  if (!role) { $('#site').innerHTML=publicNav()+content+footer(); return; }
  const a=getAccount();
  if(!a || a.role!==role){window.location.replace('/login.html');return;}
  const person=d.people[role];
  const grouped=linksFor(role).map(([label,slug,name])=>`<a class="side-link ${page===slug?'selected':''}" href="/${role}/${slug}.html">${ico(name)}<span>${esc(label)}</span>${page===slug?'<span class="nav-current"></span>':''}</a>`).join('');
  $('#site').innerHTML=`<div class="app-shell"><aside class="sidebar" id="sidebar"><a class="brand sidebar-brand" href="/">${brandLogo()}<span>TutorPair</span></a><div class="sidebar-overline">${role.toUpperCase()} SPACE</div><div class="sidebar-nav">${grouped}</div><div class="sidebar-foot"><span class="hint-label">PREVIEW MODE</span><div class="sidebar-profile">${photo(person.name.slice(0,2).toUpperCase(),'violet','small')}<div><strong>${esc(person.fullName)}</strong><small>${role[0].toUpperCase()+role.slice(1)} · Demo account</small></div></div><button class="side-logout" id="logout">${ico('logout')} Log out</button></div></aside><div class="app-main"><header class="topbar"><div class="topbar-left"><button id="mobile-menu" class="mobile-menu" aria-label="Open navigation">☰</button><div class="breadcrumb">Workspace <span>/</span> ${esc(pageLabel(role,page))}</div></div><div class="topbar-right"><span class="mode-badge">● DEMO DATA</span><button id="reset-demo" title="Reset sample data" class="reset-button">Reset sample data</button>${photo(person.name.slice(0,2).toUpperCase(),'violet','tiny')}</div></header><main class="content"><div class="heading-row"><div><div class="eyebrow">${esc(eyebrow||role.toUpperCase()+' WORKSPACE')}</div><h1>${esc(title||pageLabel(role,page))}</h1><p>${esc(description)}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>${content}</main></div></div><div class="mobile-overlay" id="mobile-overlay"></div>`;
  $('#logout').addEventListener('click',logoutDemo);
  $('#reset-demo').addEventListener('click',()=>{if(confirm('Reset all demo changes and return to landing page?'))resetData()});
  $('#mobile-menu').addEventListener('click',()=>document.body.classList.toggle('nav-open'));
  $('#mobile-overlay').addEventListener('click',()=>document.body.classList.remove('nav-open'));
}
function brandLogo(){return `<span class="logo-mark">t<span>✦</span></span>`;}
function publicNav(){return `<header class="public-nav"><div class="public-nav-inner"><a class="brand" href="/">${brandLogo()}<span>TutorPair</span></a><nav class="public-links"><a href="/#how-it-works">How it works</a><a href="/find-tutors.html">Find tutors</a><a href="/for-tutors.html">For tutors</a></nav><div class="public-actions"><a class="btn subtle" href="/login.html">Log in</a><a class="btn primary" href="/register.html">Get started ${ico('arrow')}</a></div><button class="public-menu" aria-label="Toggle menu" id="public-menu">☰</button></div></header>`;}
function footer(){return `<footer class="footer"><div class="footer-inner"><div><a class="brand" href="/">${brandLogo()} TutorPair</a><p>Better matches. Better learning journeys.<br>Online tutoring for Thai M.1–M.6 students.</p></div><div><strong>Explore</strong><a href="/find-tutors.html">Find tutors</a><a href="/for-tutors.html">Teach with TutorPair</a></div><div><strong>Get started</strong><a href="/register.html">Create account</a><a href="/login.html">Explore demo</a></div></div><div class="footer-bottom">© 2026 TutorPair · Student project · All figures and people shown are illustrative demo data.</div></footer>`;}
function stat(icon,title,value,detail,color='blue'){return `<div class="stat-card"><span class="stat-icon ${color}">${ico(icon)}</span><div class="stat-value">${value}</div><div class="stat-title">${esc(title)}</div><div class="stat-detail">${esc(detail)}</div></div>`;}
function card(title,content,extra=''){return `<section class="panel ${extra}"><div class="panel-head"><h3>${title}</h3></div>${content}</section>`;}
function notice(text,type='info'){return `<div class="notice ${type}">${ico(type==='success'?'check':'spark')}<span>${text}</span></div>`;}
function row(title,desc='',right=''){return `<div class="info-row"><span class="row-bullet"></span><div class="row-text"><strong>${title}</strong><small>${desc}</small></div>${right?`<div class="row-right">${right}</div>`:''}</div>`;}
function empty(title='Nothing to show yet',description='Your data will appear here once it is available.'){return `<div class="empty">${ico('books')}<h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;}
function headingTitle(){return pageLabel(role,page);}
function wrapTitle(section='YOUR LEARNING'){return `<div class="section-caption">${esc(section)}</div>`;}
function quickNote(){return d.latestNote;}

export { d, role, page, $, $$, esc, thb, badge, photo, action, progress, ico, layout, stat, card, notice, row, empty, headingTitle, wrapTitle, quickNote };
