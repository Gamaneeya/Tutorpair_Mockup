import { renderHome } from './home.js';

document.addEventListener('tutorpair:render', () => {
  try {
    renderHome();
  } catch (error) {
    console.error('Could not render TutorPair:', error);
    document.dispatchEvent(new Event('tutorpair:error'));
  }
});

document.dispatchEvent(new Event('tutorpair:ready'));
