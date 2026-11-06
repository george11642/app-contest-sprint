# iOS: simulator, then TestFlight

Everything here came from one SwiftUI app (iOS 26, Swift 6 strict concurrency) built with XcodeGen. Treat paths as a pattern. TestFlight is optional and is cut first in Triage. Never submit for App Review, and never release.

## Project

```sh
cd app && xcodegen generate   # project.yml is the source of truth; keep .xcodeproj gitignored
```

Simulator builds sign ad hoc and need no Apple team:

```yaml
settings:
  base:
    "CODE_SIGN_IDENTITY[sdk=iphonesimulator*]": "-"
```

## xcodebuild hangs from an agent shell

Plain `xcodebuild` can deadlock at `ExecuteExternalTool clang -v -E -dM`, and a simulator MCP build tool can hang the same way. Stripping the environment avoids it. This came from Claude Code sessions. On Codex, try plain `xcodebuild` first and use this if it stalls [not tried]. In a sandboxed shell it may also need the sandbox disabled.

```sh
#!/bin/sh
# Tools/xcb.sh build|test [extra args]
set -e; cd "$(dirname "$0")/.."
ACTION="${1:-build}"; shift 2>/dev/null || true
DEST="${DEST:-platform=iOS Simulator,name=iPhone 17 Pro}"
exec env -i HOME="$HOME" USER="$USER" TMPDIR="${TMPDIR:-/tmp}" \
  PATH=/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin \
  /usr/bin/xcodebuild -project App.xcodeproj -scheme App \
  -destination "$DEST" -derivedDataPath build/DerivedData "$ACTION" "$@" < /dev/null
```

## Screen launch arguments

Parse these in Debug only. Route to a screen and use an isolated in-memory store.

```sh
xcrun simctl launch booted <bundle-id> -appScreen checkin -appMode ride
xcrun simctl status_bar booted override --time "9:41"            # set the story's time before capture
xcrun simctl io booted screenshot design/screens/15-check-in.png
xcrun simctl io booted recordVideo out.mov                       # footage
```

## What a simulator cannot prove

Microphone, on-device speech, hardware buttons, Lock Screen behavior, real calls, background behavior, biometrics. List those as "needs a real device" in the docs, and test them on hardware before you claim them.

## TestFlight

- A paid developer team is needed. A teammate's mentor or employer team works if they grant you a role and agree to it. Keep that team's IDs out of public files.
- Internal testers need no review. External testing needs Beta App Review, so it may not fit a tight deadline, and it counts as wider distribution. Stay internal.
- Build numbers must increase. Use a timestamp: `date +%y%m%d.%H%M`.
- Set `ITSAppUsesNonExemptEncryption` honestly. If all encryption is the platform's (TLS, Keychain, CryptoKit) it is `false`; have the team confirm.
- Add a privacy manifest (`PrivacyInfo.xcprivacy`) if the app touches required-reason APIs or collects data.
- Set usage-description strings for every permission, in plain language.

Upload flow with an App Store Connect API key. Read the key ID and issuer from the environment. Never commit them.

```sh
BUILD="$(date +%y%m%d.%H%M)"
xcodegen generate
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination generic/platform=iOS \
  -derivedDataPath build/DerivedData -archivePath build/App.xcarchive archive CURRENT_PROJECT_VERSION="$BUILD"
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/export -exportOptionsPlist Tools/ExportOptions.plist
xcrun altool --upload-package build/export/App.ipa --type ios --apple-id "$ASC_APP_ID" --bundle-id "$BUNDLE_ID" \
  --bundle-short-version-string "$VERSION" --bundle-version "$BUILD" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER"
```

`ExportOptions.plist` needs `method` = `app-store-connect`, `teamID`, `signingStyle`, and `provisioningProfiles` when signing manually. Use the same clean-environment wrapper around `xcodebuild`.

## Release entitlements

`xcodegen` writes the target's entitlements into every configuration. App Groups and time-sensitive notifications can be enabled only in the developer portal, so a Release build may be rejected or silently lose them.

- Keep a separate `TestFlight.entitlements` per target, and patch the Release config to use it after `xcodegen generate`. Adding an entitlement to `project.yml` alone does nothing if a patch replaces those paths.
- Assume capabilities may be missing and degrade at run time. **[SafetySense example]** Time-sensitive notifications fell back to active ones, and onboarding wording changed to match.

## Release traps from the worked example

Commit "System integration for TestFlight" fixed all of these. **[SafetySense example]**

- **No App Group means the app and widget share nothing.** Check `containerURL(forSecurityApplicationGroupIdentifier:)` for non-nil. Never use `UserDefaults(suiteName:)` as an availability test. Fall back to a Keychain access group for what the extension must see, and only that.
- **Keychain group order matters.** The first `keychain-access-groups` entry is the default for every add. Keep the app's private group first, so secrets never land in a shared group. Pin this with a test.
- **One atomic item per queued command,** so two processes cannot overwrite each other. Commands should expire, so an old request does not fire when the app next opens.
- **Intents and background tasks can launch the app with no scene.** Run launch logic from the `App` initializer, not a view's `.task`.
- **Migrate storage on launch,** so users do not return to onboarding on the day a capability is enabled.
- **Swift 6 isolation traps.** A permission callback that arrives off the main actor can crash if the closure inherits main-actor isolation. Audit speech and location authorization calls.
- **Prepare slow models ahead of time.** Sessions should never wait on a model download.
- **Say when a background feature stops,** and resume it on foreground. Do not claim a recording is running unless data is really arriving.
- **Do not trust a simulator result for system surfaces.** Lock Screen controls, Live Activities and widgets need a device.

## Field notes

From a real run. No build had finished processing when these were written, so steps after upload are planned, not proven.

### Accounts and access (sort out on day one)
- You need a paid Apple Developer membership or access to someone's team, an App Store Connect API key (`.p8` in `~/.appstoreconnect/private_keys`, plus key ID and issuer ID), and an Apple Distribution certificate with its private key in the local keychain.
- App Store Connect Admin does not include portal access. On a shared team, only the Account Holder may be able to reach Certificates, Identifiers & Profiles. Get their written OK and ask for portal steps before the build, not after.
- Confirm a certificate is usable by comparing the SHA-1 of its `certificateContent` with `security find-certificate -Z`. Team certificates may have no local private key.

### What the API can and cannot do
- Can: register bundle IDs (`POST /v1/bundleIds`), enable capabilities (`POST /v1/bundleIdCapabilities`), create `IOS_APP_STORE` profiles (`POST /v1/profiles`; write the base64 `profileContent` to `~/Library/MobileDevice/Provisioning Profiles/<uuid>.mobileprovision`), list builds, manage beta groups.
- Cannot: create the app record (`POST /v1/apps` returns 403; use the App Store Connect website), create App Groups (`/v1/appGroups` returns 404), assign groups to App IDs, or enable Time Sensitive Notifications.
- Each extension needs its own bundle ID and profile. A bundle ID registered by API shows up in the website's New App dropdown right away.

### Archive, export, upload
- Signing: Release is Manual, `CODE_SIGN_IDENTITY` "Apple Distribution", `PROVISIONING_PROFILE_SPECIFIER` per target. Debug stays Automatic.
- Archive: `xcodebuild -project X -scheme X -configuration Release -destination generic/platform=iOS -archivePath build/X.xcarchive archive CURRENT_PROJECT_VERSION=<n>`
- Export: `xcodebuild -exportArchive -archivePath build/X.xcarchive -exportPath build/export -exportOptionsPlist ExportOptions.plist`. Plist: `destination` export, `method` app-store-connect, `signingStyle` manual, `teamID`, `uploadSymbols` true, `manageAppVersionAndBuildNumber` false, and a `provisioningProfiles` map of bundle ID to profile name, one per target.
- Upload: `xcrun altool --upload-package X.ipa --type ios --apple-id <numeric app id> --bundle-id <id> --bundle-short-version-string <v> --bundle-version <n> --apiKey <key id> --apiIssuer <issuer id>`
- Set `ITSAppUsesNonExemptEncryption` to false in Info.plist only if that is true for the app.
- Never reuse a build number for the same version.
- Internal testers (up to 100 App Store Connect users) need no Beta App Review. External testers and public links do, commonly 24-48 hours, so start early. Do not submit for App Store review: contest entries must stay unpublished.

### Failures and fixes
- Plain `xcodebuild` can hang in an agent shell at `clang -v -E -dM`. Run it under a stripped environment in a wrapper script: `env -i HOME="$HOME" USER="$USER" TMPDIR="$TMPDIR" PATH=/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin xcodebuild ... </dev/null`
- Parallel builds sharing `-derivedDataPath` give "build.db disk I/O error" and linker failures. Run one at a time and delete ArchiveIntermediates between archives.
- Automatic signing with `-allowProvisioningUpdates` and an API key failed with "Authentication failed: bearer token" even though the key worked against the REST API. Cause unknown, so do not count on it. With no Xcode account, automatic signing fails with "No Accounts".
- Signing into Xcode as an Admin without portal access gives "No Account for Team". Setting `provisioningAllowed` by API returned 409.
- If a profile lacks App Groups or Time Sensitive, the archive errors with "doesn't support the group...". The workaround used was reduced Release entitlements. XcodeGen writes target entitlements into every config, so a config-level `CODE_SIGN_ENTITLEMENTS` is ignored; patch `project.pbxproj` after generating, inside the release script.
- Without App Groups, widgets and the app cannot share UserDefaults. Handle `containerURL(forSecurityApplicationGroupIdentifier:)` returning nil. A shared Keychain access group was planned as the fallback but is unproven on device.
- Altool error 90474 (iPad orientations required): XcodeGen presets overrode `TARGETED_DEVICE_FAMILY` to "1,2" at target level. Set "1" in each target's settings. The fix was applied but not yet re-uploaded when these notes were written.
- Website form automation: synthetic input did not stick on framework selects; focusing the field and typing the option text worked.

### App and prototype drift
The prototype was built from app screenshots, then only the prototype was extended, so the two drifted. Pick one source of truth, or sync after every prototype change. To catch drift, audit every prototype frame against the code and simulator screenshots, fix the gaps, then have a separate reviewer click the flows against the frames.

### Human-only steps
Paying for membership, Account Holder portal steps, accepting agreements, Apple ID password and 2FA (never give these to an agent; a password pasted in chat stays in transcripts, so rotate it), real-device testing, and sending the submission email.
