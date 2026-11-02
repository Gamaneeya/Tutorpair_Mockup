# TutorPair attachment import

The supplied TutorPair V5 prototype is served by the existing Vite app.
The React entry renders its original landing page; the supplied role-specific
HTML pages and shared JavaScript remain in `public/` so the original navigation,
matching, local account workspaces, and invitation flows are preserved.

Use **Log in → Explore sample accounts without registering** for the sample
student, tutor, and parent journeys. The BYOS demo instructions are in
`docs/BYOS_DEMO_HANDOFF.md`.

This is a browser-only prototype, not secure authentication or production
enrollment. Use fictional credentials and personal details. Data and invitation
links work only within the same browser and origin. Payments, identity checks,
LINE delivery, and external services are simulated, not connected.

The supplied logic tests retain their original assertions, with import paths
adjusted from `frontend/assets/` to `public/assets/`:

```sh
node tests/byos.test.mjs
node tests/auth.test.mjs
node tests/matching.test.mjs
```
