import {esc} from './ui.js';

function paintNote(n){
 return `<div class="report-preview"><span class="report-overline">TUTORPAIR SESSION UPDATE</span><h3>${esc(n.topic)}</h3><p>${esc(n.student)} · ${esc(n.subject)} · Session ${esc(n.session)}</p><div class="report-score"><div><small>QUIZ SCORE</small><strong>${esc(n.score)}/${esc(n.total)}</strong></div><div><small>UNDERSTANDING</small><strong>${esc(n.level)}</strong></div></div><div class="report-section"><strong>What went well</strong><p>${esc(n.strength)}</p></div><div class="report-section"><strong>Needs more practice</strong><p>${esc(n.improve)}</p></div><div class="report-section"><strong>Next step</strong><p>${esc(n.next)}</p></div></div>`;
}

export {paintNote};
