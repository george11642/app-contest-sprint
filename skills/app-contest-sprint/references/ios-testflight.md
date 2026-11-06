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
