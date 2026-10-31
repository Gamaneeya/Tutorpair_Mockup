import {renderPublic} from './public.js';
import {renderStudent} from './student.js';
import {renderTutor} from './tutor.js';
import {renderParent} from './parent.js';
import {renderAdmin} from './admin.js';
const role=document.body.dataset.role;
const page=document.body.dataset.page;
try{
 if(!role)renderPublic(page);
 else if(role==='student')renderStudent(page);
 else if(role==='tutor')renderTutor(page);
 else if(role==='parent')renderParent(page);
 else if(role==='admin')renderAdmin(page);
 else document.getElementById('app').textContent='Unknown page';
}catch(error){console.error('TutorPair demo error:',error);document.getElementById('app').innerHTML=`<main style="max-width:650px;margin:10vh auto;padding:35px;background:white;border:1px solid #ddd;border-radius:15px;font:15px sans-serif"><h1>Could not load this demo page</h1><p>Check the browser console for a JavaScript error.</p><a href="/">Return to landing page</a></main>`;}
