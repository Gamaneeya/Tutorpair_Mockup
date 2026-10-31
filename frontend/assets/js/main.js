import { initializeData } from './data-source.js';

try {
  await initializeData();
  await import('./app.js');
} catch (error) {
  console.error('TutorPair could not load its data source:', error);
  const site = document.querySelector('#site');
  if (site) {
    site.innerHTML = `<section style="max-width:540px;margin:12vh auto;padding:26px;font:16px system-ui;line-height:1.6"><h1>TutorPair data unavailable</h1><p>The demo data adapter could not initialize. Check the browser console and the API settings in assets/js/data-source.js.</p><a href="/">Back to home</a></section>`;
  }
}
