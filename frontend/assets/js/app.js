/** Page router — page content lives in assets/js/pages; shared layout in core/ui.js. */
import {role, page} from './core/ui.js';
import {renderPublic} from './pages/public.js';
import {renderDashboard} from './pages/dashboard.js';
import {renderStudent} from './pages/student.js';
import {renderTutor} from './pages/tutor.js';
import {renderParent} from './pages/parent.js';
import {renderAdmin} from './pages/admin.js';
import {bindControls} from './core/events.js';

function renderPage() {
  if (!role) return renderPublic();
  if (page === 'dashboard') return renderDashboard();
  if (role === 'student') return renderStudent();
  if (role === 'tutor') return renderTutor();
  if (role === 'parent') return renderParent();
  if (role === 'admin') return renderAdmin();
}

renderPage();
bindControls();
