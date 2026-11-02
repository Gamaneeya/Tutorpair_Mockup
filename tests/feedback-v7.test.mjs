import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CATALOG} from '../frontend/assets/data/mock-data.js';
import {whyMatchedNarrative,reviewRevealBlock} from '../frontend/assets/js/student.js';
const r=(student=null,tutor=null)=>({student:{reviewDrafts:student?{'course-1':student}:{}},tutor:{reviewDrafts:tutor?{'course-1':tutor}:{}}});
test('demo catalog includes illustrated profile metadata and available video assets for each sample tutor',()=>{
 for(const t of CATALOG.tutors){
  assert.ok(t.faculty&&t.gpaHonors&&t.ratingCount>0&&t.verifiedHours>0);
  assert.ok(t.renewalRate>=0&&t.renewalRate<=100);
  assert.ok(t.demoVideoUrl.startsWith('/assets/demo/'));
  assert.ok(fs.statSync(new URL('../frontend'+t.demoVideoUrl,import.meta.url)).size>5000);
 }
});
test('why matched is a personalized sentence and falls back gracefully when skipped',()=>{
 const a=CATALOG.tutors[0];
 const text=whyMatchedNarrative(a,{pace:'slow',approach:'step',interaction:'encouraging'});
 assert.match(text,/may be a good fit because this tutor/);
 assert.match(text,/slow and detailed/);
 assert.match(text,/step-by-step examples/);
 assert.match(whyMatchedNarrative(a,{pace:'any',approach:'any',interaction:'any'}),/school subject/);
});
test('reviews remain private until both submit or 14 days have passed',()=>{
 const now=new Date().toISOString(),old=new Date(Date.now()-15*864e5).toISOString();
 const student={stars:5,comment:'Great explanations',submittedAt:now};
 const tutor={stars:4,comment:'Consistent practice',submittedAt:now};
 assert.match(reviewRevealBlock(r(student),'course-1'),/Waiting for the other party/);
 assert.match(reviewRevealBlock(r(student,tutor),'course-1'),/Public review preview/);
 assert.match(reviewRevealBlock(r({...student,submittedAt:old}),'course-1'),/Public review preview/);
 assert.doesNotMatch(reviewRevealBlock(r({...student,comment:'<script>alert(1)<\/script>'},tutor),'course-1'),/<script>/);
});
