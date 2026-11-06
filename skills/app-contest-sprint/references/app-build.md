# Building the real app

A coded app is optional under the rules, yet it is the fastest source of honest screens, video and credibility. In Triage with no app, skip this and go to Figma.

Work only on the primary flow until the technical email is sent.

## Common to all platforms

- **Reachable states.** Debug-only launch arguments or deep links open any screen with sample data. This powers screenshots, Figma fills, QA and video.
- **Demo services.** Fake backends behind protocols or interfaces, so demos and tests never touch the network or place real calls.
- **No developer surface in Release.** Debug flags, test PINs and developer rows must not exist in a Release build.
- **Fictional data only** in every capture.
- **Clocks.** Set the device clock in captures to the story's time. Patching it later costs rounds.
- **Capture with a script.** Screens are then cheap to re-shoot when the app changes.

## iOS

See [ios-testflight.md](ios-testflight.md). Simulator first, no paid account needed.

## Web (React, Next, Vite) [not tried on the worked example]

- The Figma prototype is still required. A live site does not replace it.
- State access: `?screen=checkin&demo=1`, honored only in dev or preview builds.
- Capture with Playwright at 1440×900 and 390×844. `page.screenshot({ fullPage: true })` handles long scrolling frames.
- Video: Playwright `recordVideo`, or a screen recorder at 1080p.
- "Unpublished": keep it on a preview URL with `noindex`, and do not market it. If a public site already exists, ask itevents@unm.edu.

## Android and Expo [not tried on the worked example]

- Native: `adb exec-out screencap -p > s.png`, `adb shell screenrecord /sdcard/o.mp4` (3 minute limit per file).
- Open a state: `adb shell am start -a android.intent.action.VIEW -d "myapp://screen/checkin?demo=1"`.
- Expo: use a dev build rather than Expo Go if native modules are involved. Open links with `npx uri-scheme open`. Use an `EXPO_PUBLIC_DEMO=1` flag for demo services and keep it out of release builds.
- Do not publish to Google Play production. Ask before using open or public testing tracks.

## Never cause a real-world side effect by accident

- Default to **dry run.** Every outbound action takes `dry_run`, and test modes never reach a provider.
- A real send needs an explicit switch, on for one take, then off. Release builds cannot turn it on.
- Use sandbox APIs for anything serious. Emergency services are never called: use a sandbox or an honestly labeled simulated path.
- Label all test output as TEST on every surface, including anything a third party sees.
- Only message people who opted in. Do not add teammates' numbers until they agree.
- Check that automated drills cancel on the server too. **[SafetySense example]** A watchdog once escalated a finished drill into a simulated dispatch.
- Add smoke tests that run the full server flow in dry run and clean up after themselves, plus a test for auth and deletion.

## Provider trial limits

Assume trial accounts are limited. Find out on day one, and say so in the Technical document's status table. Show real delivery status in the UI: "Text not delivered" beats a false "sent".

**[SafetySense example]** Twilio trial voice reaches verified numbers only and plays a message until the callee presses a key. Twilio trial SMS to US numbers fails with error 30034 (unregistered A2P 10DLC), and registration takes time, so treat texts as blocked. A dispatch API was sandbox-only and stated as sandbox in every document.

## Secrets

- Never in code, chat, logs or echoed SQL. Read them from the environment inside the command.
- Server secrets go in a vault, read at run time by a function only the service role can call.
- Client "publishable" keys are public by design. They must grant nothing alone.
- Keep a local env file outside the repo, and refer to values by name only.

## Row-level security and abuse (Postgres backends)

- Enable RLS on every table. With no policies and no grants to `anon` or `authenticated`, only the service role reads data, inside the server function.
- The function does its own auth: device ID plus secret, stored as a hash, compared in constant time, returned once.
- Share links use long random per-object tokens with short expiry, on a page that is noindex, no-referrer and no-store.
- Check webhook signatures.
- Rate-limit sign-ups by a salted hash of the IP, not the IP itself. Repeated simulator installs can lock you out.
- Cap abuse: per-user limits, per-hour limits, one country.
- SQL cannot delete Storage objects, so account deletion must call the Storage API too.
- Build retention and "delete everything" for real, then cite them in the Security document. Test with a fresh record, then query to confirm nothing remains.
