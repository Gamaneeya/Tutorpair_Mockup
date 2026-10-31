# TutorPair MVP — Registration and Login Handoff

## What changed

The landing page now links to a **registration form** (role, display name, email, password, password confirmation) and a **login form** (email + password). Users cannot directly visit Student, Tutor or Parent pages until they have an active demo session. The account's chosen role determines its permitted dashboard; a signed-in Student cannot use the role switcher to access Tutor or Parent pages.

The former fast demo access is still available on the login screen under **Explore sample accounts without registering**. It is intentionally separate from the local account flow. Demo scenarios still permit switching between roles, so presenters can show Tutor session notes and Parent progress in one simulated workspace.

## Behavior

1. Navigate to `/register.html`, select Student / Tutor / Parent, and register using *fictional* details.
2. A new user is sent to their **empty** role-specific dashboard. Tutors can begin onboarding from there.
3. Click **Log out**; it clears the current-tab session but preserves the account and its mock workspace in this browser.
4. In a registered **Tutor** account, initial verification and additional subject approvals may be simulated with clearly labeled demo-only buttons, without using an Admin account.
5. Navigate to `/login.html` and enter the same email / demo password. The user's previous workspace is restored.
6. Register another email and role. Each local account has its own separately stored mock state.
7. Try a wrong password: login is rejected. Try reusing an email: registration is rejected.
8. In the login panel, expand **Explore sample accounts without registering** to run an active-Tutor or linked-Parent scenario without losing registered account data.

## Files

- `frontend/assets/js/auth.js`: browser-only email/password demo simulation, register, sign-in, sign-out, account sessions. Derives a password verifier with Web Crypto (PBKDF2), but **this is not secure account authentication** because all data and client code are under the browser user's control.
- `frontend/assets/js/store.js`: separate localStorage workspaces per account; keeps the existing scenario state for sample demo users.
- `frontend/assets/js/public.js`: new Register and Login forms plus demo access.
- `frontend/assets/js/ui.js`, `main.js`: route access gating, role-specific menu, session info, Log out.
- `frontend/assets/css/styles.css`: form layout and responsive styles.
- `tests/auth.test.mjs`: Node tests for account isolation, wrong password, login/session, demo access.

## Important limitations

- Data and accounts live in one browser profile only and **do not synchronize across devices**.
- No real emails, password reset, verification mail, identity checks, OAuth or payment authentication.
- This login is **not** a security boundary. Do not register with genuine passwords, real minors' data, or tutor identity documents.
- Separately logged-in real Student / Tutor / Parent accounts **do not share records** in this prototype; the existing cross-role reporting view is still a simulated demo scenario.
- Do not deploy this as a production service with sensitive data.

## What the backend team must implement for real accounts

For production, replace `auth.js` with an authenticated API and DB-backed per-user data:

- `POST /api/auth/register`: create user; hash password on the server (e.g., Argon2id), validate role, email confirmation as needed.
- `POST /api/auth/login`: verify credentials server-side, establish secure session with HttpOnly, Secure, SameSite cookies.
- `GET /api/auth/me`: return authenticated `userId`, role and profile.
- `POST /api/auth/logout`: invalidate the server session.
- Protect all student, tutor, parent, verification and LINE APIs with server-enforced authorization and guardian-student relationship checks.
- Store Tutor session notes once in the DB, then notify the linked, verified Parent via LINE Messaging API from the server (see `PARENT_LINE_INTEGRATION_HANDOFF.md`).

**Never** implement production authorization by trusting `localStorage`, UI role selectors, or query strings. Backend controls which account can access which data.

## Quick tests

```powershell
node tests/auth.test.mjs
node tests/matching.test.mjs
node integrations/line/line-service.test.mjs
```

Run website with:

```powershell
cd frontend
py -m http.server 5500
```

Open http://localhost:5500 in Chrome/Edge. Modules and Web Crypto are supported on localhost or HTTPS.
