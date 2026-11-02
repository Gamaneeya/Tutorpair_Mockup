# TutorPair V7 → GitHub (Windows CMD)

1. Extract `TutorPair_Feedback_V7.zip` into `C:\Users\Aim\Downloads\TutorPair_Feedback_V7`.
2. Use the **existing git clone**, not the extracted ZIP folder:

```cmd
cd /d C:\Users\Aim\Downloads\TutorPair_Latest
git status
git pull --rebase origin main
```

If the working tree is dirty, resolve or save your work first. If the pull reports CONFLICT, stop and resolve with your team; do not force-push.

3. **Safer option if GitHub already contains V6:** Extract `TutorPair_V7_Changed_Files.zip` and copy its contents into `TutorPair_Latest`. This minimizes unnecessary overwrite of teammates' files.

**If GitHub is missing V6:** Copy the contents of the **full V7 ZIP** into your clone instead. Either way, preserve `.git` and do not copy unrelated local secrets or `.env`.

Example when you choose the V7 patch ZIP:

```cmd
robocopy "C:\Users\Aim\Downloads\TutorPair_V7_Changed_Files" "C:\Users\Aim\Downloads\TutorPair_Latest" /E /XD .git node_modules
cd /d C:\Users\Aim\Downloads\TutorPair_Latest
git status --short
git diff --stat
```

4. Check changes carefully; inspect any modified files that teammates may have changed simultaneously. Then:

```cmd
git add frontend docs tests README.md
git -c core.pager=cat diff --cached --stat
git commit -m "Refine V7 tutor matching and post-match feedback flows"
git push origin main
```

5. Re-run unit tests and smoke-test manually:

```cmd
node --test tests/*.test.mjs integrations/line/line-service.test.mjs
cd frontend
py -m http.server 5500
```

Open http://localhost:5500/login.html. Invite links still **cannot** be opened from a different device until Backend + Database exist. GitHub Pages hosting (if used) must account for the prototype's root-absolute `/student/...` links; deploy from a domain root or configure path rewriting.
