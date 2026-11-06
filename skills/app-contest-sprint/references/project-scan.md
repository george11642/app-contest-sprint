# Project scan

Work out what exists before you touch anything. The scan is read-only. It ends with a gap table in `CONTEST_STATE.md`.

## Inventory

Use `git ls-files` when it is a repo, and also look at untracked folders. Skip `node_modules`, `build`, `.git`, `Pods`, `DerivedData`.

| Look for | Signals |
|---|---|
| App | `project.yml`, `*.xcodeproj`, `Package.swift`, `package.json` with expo/next/vite/react, `android/`, `build.gradle`, `pubspec.yaml`, `manage.py`, `Dockerfile` |
| Backend | `supabase/`, `firebase.json`, `functions/`, `api/`, `.env.example`, `vercel.json`, `prisma/` |
| Prototype | `figma.com/proto`, `figma.com/design`, `figma.com/file` in any doc |
| Documents | `*.pdf`, `*.docx`, headings matching purpose, audience, security, architecture |
| Screens | `*.png` in `screens/`, `screenshots/`, `design/`, `assets/` |
| Deck | `*.pptx`, `*.key`, Google Slides links |
| Video | `*.mp4`, `*.mov`, a `remotion` dependency |
| Plans | `README`, `SPEC`, `PLAN`, `TODO`, issue trackers |
| Placeholders | `FILL IN`, `TODO`, `TBD`, `lorem`, `[name]`, `example.com` |
| Stale numbers | Test counts, screen counts, prices and dates that disagree between files |
| Public repo risk | `git remote -v`, tracked secrets, private mail, phone numbers |

```sh
git ls-files | wc -l; git log --oneline -15; git status --short | head -30; git remote -v
git grep -nIE 'figma\.com/(proto|design|file)' || true
git grep -nIlE 'FILL IN|TBD|lorem ipsum' || true
```

For a repo with no git, use `find . -maxdepth 3`. Do not run `git init` unless the team agrees.

**Run the app or read its code to confirm it works.** A folder is not evidence. Try the build. If it fails, record the first error and keep going.

## Gap table

| Deliverable | State | Evidence | Next step | Blocks submission? |
|---|---|---|---|---|

States: `none`, `partial`, `done, unverified`, `verified`. Only `verified` needs no further work. A deliverable made in an earlier session stays `done, unverified` until you have checked it.

Rows: registration, eligibility, primary flow in the app, screens captured, prototype built, prototype shared, prototype QA, Purpose PDF, Technical PDF with diagram, Security PDF, Bio PDF, Screenshots PDF, email draft, deck, Q&A prep, video footage, video.

## Continue without clobbering

- Read a file before you change it. Edit in place when the team has a version of something.
- If a document exists in Google Docs, Word or Notion, keep that as the source. Do not fork it into HTML unless the team agrees.
- Put new work in new paths (`submission/`, `presentation/`). Check for an existing folder of that name first.
- Treat uncommitted changes as someone's live work. Do not stash, reset or reformat them. If another session may be active, work on different files.
- Do not upgrade dependencies, rename the app, or change architecture unless it blocks a deadline.
- Where their code and their docs disagree, the code is the truth for technical claims. Tell them.
- Do not rewrite their voice. Fix errors and gaps.

## Questions for the humans

Ask at most three at a time, and only what you cannot find. Prefer these, in order:

1. Are all teammates registered and eligible? Has this app been entered before or published anywhere?
2. What is the one flow a judge must see? Who is the user?
3. Which accounts exist: Figma on Education, Apple Developer, ElevenLabs?

Save the rest for the bio stage: names, schools, years, majors, emails, roles, extra-credit attendance. Keep working while you wait, and mark what depends on the answer.

## No app yet

If the deadline is close, do not build one. Go straight to Figma. The rules score a prototype. Write the proposal as a road map and put the status table in the Technical document.

## Public repo safety

Run [assets/secret-scan.sh](../assets/secret-scan.sh) with `bash` before any push and before sharing a repo link. It exits 1 on findings.

- Scan history as well as the tree, plus untracked files about to be added. A later commit does not remove a secret from history.
- Scan again after every status or notes edit. Agents write real values into prose.
- If a secret reaches a public remote, treat it as exposed. Rotate it first, then rewrite history.
- A phone number or email cannot be rotated. Tell the owner.
- Easy to miss: team and key IDs in build scripts, a provider's sending number in a demo script, a personal email in a toolchain note, absolute paths with a username, private contest mail.
- `.gitignore` should cover `.env*`, `.vercel/`, `build/`, raw footage and any private mail folder.

**[SafetySense example]** Team phone numbers were pushed publicly in a status doc because the scan existed but did not block the push. Private contest email also sat in git history until it was stripped before the first public push.
