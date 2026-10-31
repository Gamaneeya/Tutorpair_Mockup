import {d, role, page, $, $$, esc, thb, badge, photo, action, progress, ico, layout, stat, card, notice, row, empty, headingTitle, wrapTitle, quickNote} from '../core/ui.js';

function renderAdmin(){
 const details={
 'tutor-verification':{heading:'Tutor applications',rows:[['Nalin S. · Mathematics','Identity + education review','Pending'],['Thanakorn P. · Physics','Subject assessment','Pending'],['Beam T. · English','Demo teaching assessment','Review']]},
 'trial-monitoring':{heading:'First lesson monitoring',rows:[['Kanya S. · P’Mew','Request awaiting approval','New'],['Nicha P. · P’Mew','First lesson completed','Completed']]},
 'payments':{heading:'Marketplace transactions',rows:[['Math Foundations','Sample course payment','Example'],['BYOS group','No marketplace commission','Example']]},
 'refunds':{heading:'Refund requests',rows:[['TP-4821','First lesson change request','Review'],['TP-4817','Package cancellation','Review']]},
 'analytics':{heading:'Marketplace analytics',rows:[['Learners','384 illustrative active accounts','Example'],['Tutor applications','12 waiting for screening','Example'],['Group filling','BYOS + marketplace sourcing','Example']]}
 };
 const x=details[page]||{heading:headingTitle(),rows:[]};
 layout(`${card(x.heading,x.rows.map(([t,s,status])=>row(esc(t),esc(s),badge(status,status==='Review'?'orange':'gray'))).join('')+`<p class="micro-note">Admin information is example data only, not connected to a real database.</p>`)}`,{title:headingTitle(),description:'Marketplace administration prototype.'});
}

export {renderAdmin};
