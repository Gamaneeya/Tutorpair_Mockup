# Code organization

This project keeps **actual `.html` route files**, but avoids duplicating layout, navigation, and card markup across 45 pages.

## When to edit what

| Goal | Edit |
|---|---|
| Change tutor names, rates, quiz scores, course data | `frontend/assets/data/mock-data.js` |
| Switch to backend data | `frontend/assets/js/data-source.js` and server API |
| Change landing page content | `frontend/assets/js/pages/public.js` |
| Change student pages | `frontend/assets/js/pages/student.js` |
| Change tutor pages | `frontend/assets/js/pages/tutor.js` |
| Change parent pages | `frontend/assets/js/pages/parent.js` |
| Change admin pages | `frontend/assets/js/pages/admin.js` |
| Change dashboard content | `frontend/assets/js/pages/dashboard.js` |
| Change sidebar/navigation and reusable cards | `frontend/assets/js/core/ui.js` |
| Change form actions and mock data persistence | `frontend/assets/js/core/events.js` |
| Change parent note formatting | `frontend/assets/js/core/notes.js` |
| Change brand color and typography | `frontend/assets/css/base.css` |
| Change landing visual layout | `frontend/assets/css/public.css` |
| Change dashboard layout | `frontend/assets/css/workspace.css` |
| Change card/form styling | `frontend/assets/css/components.css` |
| Change mobile/tablet breakpoints | `frontend/assets/css/responsive.css` |
| Add a new physical HTML route | Create new `.html` shell + update role NAV in `core/ui.js` + page render routing |

## Why these pages have small HTML files

The HTML file exposes a real route such as `/parent/progress.html`, with clear `data-role="parent" data-page="progress"`. The shared ES Module router reads these attributes and renders the correct view. This lets the design stay consistent and prevents modifying the same sidebar in 45 different HTML files. The `<div id="site">` element is intentionally filled by JavaScript.

To require separate hand-written body markup in every HTML file would be possible, but much more duplication-prone for a role-heavy web application. This structure is the compromise between actual HTML pages and maintainable shared components without TypeScript/JSX.
