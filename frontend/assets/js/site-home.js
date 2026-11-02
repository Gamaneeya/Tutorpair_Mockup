import {renderHome} from './home.js';
try {
  renderHome();
} catch(error) {
  console.error('TutorPair landing-page error:', error);
  const target=document.getElementById('app');
  if(target) target.innerHTML='<main class="container section"><h1>We could not load the page</h1><p>Please refresh and try again.</p><a class="button primary" href="/login.html">Go to login</a></main>';
}
