import { publicLayout, btn, esc, avatar, money } from './ui.js';
import { CATALOG } from '../data/mock-data.js';

const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  book: '<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
  spark: '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7Z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  chart: '<path d="M4 3v17h17M8 15l4-4 4 2 5-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play: '<path d="m9 5 11 7-11 7Z"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;

function tutorCard(tutor) {
  return `<article class="tp-tutor">
    <div class="tp-tutor-top">${avatar(tutor.initials, tutor.color, 'large')}<span class="tp-verified">${icon('shield')} Demo verified</span></div>
    <div class="tp-tutor-subject">${esc(tutor.subject)} <span>· ${esc(tutor.grades[0])}–${esc(tutor.grades.at(-1))}</span></div>
    <h3>${esc(tutor.name)}</h3><p class="tp-university">${esc(tutor.university)}</p>
    <p class="tp-tutor-about">${esc(tutor.about)}</p>
    <div class="tp-tutor-tags"><span>${esc(tutor.experience)}</span><span>${tutor.formats.includes('group') ? '1-on-1 & small group' : '1-on-1 lessons'}</span></div>
    <div class="tp-tutor-bottom"><div><strong>${money(tutor.price)}</strong><span> / hour</span></div>${btn(`Find my match ${icon('arrow')}`, '/register.html?role=student', 'quiet')}</div>
  </article>`;
}

export function renderHome() {
  publicLayout(`<main class="tp-home">
    <section class="hero tp-reference-hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="hero-eyebrow">✦ YOUR SCHOOL GOALS, YOUR BEST MATCH</div>
          <h1>Find a tutor who gets <em>your goals.</em></h1>
          <p>Personalized online tutoring for Thai M.1–M.6 students. Meet tutors who fit, learn with a clear plan, and keep your family updated.</p>
          <div class="hero-cta">${btn('Find my tutor →','/register.html?role=student')}${btn('Become a tutor','/register.html?role=tutor','outline')}</div>
          <div class="hero-points"><span>✓ Goal-based Top 3</span><span>✓ 1-on-1 & small groups</span><span>✓ Parent progress</span></div>
        </div>
        <div class="hero-visual" aria-label="Example TutorPair match and progress preview">
          <div class="visual-glow"></div>
          <div class="mock-window">
            <div class="mock-top"><span>● ● ●</span> TUTORPAIR / MATCH RESULTS</div>
            <div class="mock-small">YOUR RECOMMENDED MATCH</div>
            <div class="mock-tutor">${avatar('MA','lavender','large')}<div><strong>P’Mew Anong</strong><small>M.4 Mathematics · Example profile</small></div><strong class="mock-number">Example</strong></div>
            <div class="mini-line"></div>
            <div class="mock-detail"><span class="mini-icon">✎</span><div><b>Goals first</b><small>Support for your school subject</small></div>✓</div>
            <div class="mock-detail"><span class="mini-icon orange">◫</span><div><b>Progress you can see</b><small>Tutor notes, homework and progress</small></div>✓</div>
            <div class="mock-progress">Session progress <b>2/4</b><div class="progress-track"><div class="progress-fill tp-half-progress"></div></div></div>
          </div>
          <div class="float-card">✦ <b>Top-3 Matching</b><small>Clear reasons, not random profiles</small></div>
          <div class="float-card line"><span class="line-icon">LINE</span><div><b>Parent updates</b><small>Lesson summary available</small></div></div>
        </div>
      </div>
    </section>
    <section class="tp-trust" aria-label="Why learn with TutorPair"><div class="container tp-trust-grid">
      <div>${icon('shield')}<span>Thoughtfully matched tutors</span></div><div>${icon('book')}<span>Built for M.1–M.6</span></div><div>${icon('clock')}<span>Learning that fits your life</span></div><div>${icon('chart')}<span>Progress the whole family can see</span></div>
    </div></section>
    <section class="tp-section tp-how" id="how"><div class="container">
      <div class="tp-section-heading"><div><div class="tp-eyebrow">LESS SEARCHING. MORE LEARNING.</div><h2>Your next chapter, in <span>three steps.</span></h2></div><p>No endless scrolling. No guesswork.<br>Just a clear path to your kind of learning.</p></div>
      <div class="tp-step-grid">
        ${[
          ['01','spark','Tell us what you’re aiming for.','A better grade? A tricky subject? Share your goals, schedule, and how you like to learn.','lilac'],
          ['02','shield','Meet your kind of tutor.','Get up to three thoughtful matches, with clear reasons why each tutor could be right for you.','peach'],
          ['03','chart','Make progress, together.','Start learning with a plan. See your progress, build momentum, and keep your family in the loop.','mint'],
        ].map(([number, symbol, title, body, color])=>`<article class="tp-step ${color}"><div class="tp-step-top"><span class="tp-step-icon">${icon(symbol)}</span><span class="tp-step-number">${number}</span></div><h3>${title}</h3><p>${body}</p></article>`).join('')}
      </div>
    </div></section>
    <section class="tp-section tp-tutors-section" id="tutors"><div class="container">
      <div class="tp-section-heading"><div><div class="tp-eyebrow">GOOD TEACHERS. GREAT CONNECTIONS.</div><h2>Meet a few of your <span>possibilities.</span></h2></div>${btn(`Find your match ${icon('arrow')}`, '/register.html?role=student', 'outline')}</div>
      <div class="tp-subject-tabs" role="group" aria-label="Filter sample tutors by subject">${['All subjects','Mathematics','Physics','English'].map((subject,i)=>`<button class="tp-subject-tab ${i===0?'is-active':''}" data-subject="${subject}" aria-pressed="${i===0}">${subject}</button>`).join('')}<span>Sample tutor profiles · Illustrative data</span></div>
      <div class="tp-tutor-grid" id="tp-tutor-results" aria-live="polite">${[CATALOG.tutors[0],CATALOG.tutors[4],CATALOG.tutors[5]].map(tutorCard).join('')}</div>
    </div></section>
    <section class="tp-section tp-features" id="features"><div class="container tp-family-grid">
      <div class="tp-progress-preview"><div class="tp-preview-heading">${icon('book')} YOUR LEARNING, AT A GLANCE <span>Sample</span></div><div class="tp-preview-body"><span class="tp-preview-tag">M.4 Mathematics</span><h3>Look how far you’ve come.</h3><p>Every small win adds up.</p><div class="tp-progress-chart"><span class="tp-bar tp-bar-1"></span><span class="tp-bar tp-bar-2"></span><span class="tp-bar tp-bar-3"></span><span class="tp-bar tp-bar-4"></span><span class="tp-bar tp-bar-5"></span><span class="tp-bar tp-bar-6"></span><span class="tp-bar tp-bar-7"></span><span class="tp-bar tp-bar-8"></span></div><div class="tp-chart-labels"><span>Where you started</span><span>Where you’re heading ${icon('arrow')}</span></div><div class="tp-progress-foot">${icon('check')} 6 of 8 sessions completed <strong>Keep going!</strong></div></div></div>
      <div class="tp-family-copy"><div class="tp-eyebrow">A LITTLE CLARITY FOR EVERYONE.</div><h2>More confidence.<br>Less “how’s it going?”</h2><p>Learning is a team effort. With a clear plan, lesson notes, and shared progress, students know what’s next—and parents don’t have to guess.</p><ul><li>${icon('check')} Personal goals and a step-by-step learning plan</li><li>${icon('check')} Helpful notes after every lesson</li><li>${icon('check')} Progress updates for linked parents</li></ul>${btn(`See how it comes together ${icon('arrow')}`, '/login.html', 'outline')}</div>
    </div></section>
    <section class="tp-bottom-cta"><div class="container tp-bottom-cta-inner"><span class="tp-cta-spark">${icon('spark')}</span><div class="tp-eyebrow">YOUR NEXT CHAPTER STARTS WITH A CONNECTION.</div><h2>There’s a tutor for <em>your kind of potential.</em></h2><p>Let’s find them, together.</p>${btn(`Find my perfect tutor ${icon('arrow')}`, '/register.html?role=student')}<small>Want to share what you know? <a href="/register.html?role=tutor">Become a tutor ${icon('arrow')}</a></small></div></section>
    <div class="tp-demo-disclaimer">An interactive TutorPair prototype. Profiles, verification, and learning records are simulated. Use fictional account details.</div>
  </main>`);
  document.querySelector('.public-shell').classList.add('tp-site');
  document.querySelector('.nav-links').innerHTML = '<a href="/#how">How it works</a><a href="/#features">Features</a><a href="/register.html?role=tutor">For tutors</a>';
  const menu = document.querySelector('#nav-menu');
  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', document.querySelector('.nav-links').classList.contains('expanded')));
  document.querySelectorAll('[data-subject]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-subject]').forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      const subject = button.dataset.subject;
      const tutors = subject === 'All subjects' ? [CATALOG.tutors[0],CATALOG.tutors[4],CATALOG.tutors[5]] : CATALOG.tutors.filter(tutor => tutor.subject === subject).slice(0,3);
      document.querySelector('#tp-tutor-results').innerHTML = tutors.map(tutorCard).join('');
    });
  });
}
