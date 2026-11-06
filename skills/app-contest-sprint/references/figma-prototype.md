# Figma prototype

25 points, and the slowest item. The rules want high fidelity, clear user flows and primary use case functionality, viewable by anyone with the link.

## Account gate: do this first

Three separate problems were hit on the worked example. Check all three before design work.

1. **Which account is connected.** The Figma MCP must be signed in as the verified student account, on each tool separately (Claude Code and Codex have their own logins). Run `whoami`. A personal unverified account will not have Education benefits.
2. **Call limits go by seat.** Figma's docs give View and Collab seats 20 calls a month, and Full seats on Professional, Education or Organization plans 200 a day and 10 a minute. Students get Education free at https://www.figma.com/education/.
3. **Sharing needs a Full seat.** Clicking Share may show "You're about to get a Full seat". Until accepted, a signed-out browser shows "Prototype not found". This is an account change, so stop and hand it to the human: confirm it is free on the Education plan, accept, then set **Anyone with the link: can view**. Never accept anything with a charge.

If no Figma MCP is available, see [agent-routing.md](agent-routing.md).

## Build method

Real app screenshots as frame fills, with real Figma layers on top. No app? Design the frames directly in Figma or from `send_code_to_figma` mockups, and use the same structure.

1. Capture every screen and state from the running app. Script it. See [app-build.md](app-build.md).
2. Write a one-page **story bible** before wiring: names, the clock time on each screen, the numbers each screen shows. In a one-day sprint keep one path and one clock.
3. Write the **flow spec** to a repo file and update it each round. It is the test oracle: QA compares behavior to it.
4. Pages: Cover, Flow overview (all screens as thumbnails with arrows), Prototype, Components.
5. Build a **Start screen**: "Start the prototype" plus chips that jump to each flow, so a judge reaches any feature in one tap.
6. Long screens: stitch scroll screenshots into a vertically scrolling frame, with status bar and tab bar as fixed children.
7. Add real layers for buttons, docks and toasts, using a component set. Add transparent hotspots for everything else.
8. Label invented interactions honestly, such as a "Prototype · Simulate a check-in" pill.
9. Name flow starting points and delete stray ones.

**Screens first, wiring second.** Screens are cheap to replace if capture is scripted. Screenshots with baked-in defects are expensive to patch, so fix the app first when you can.

**Fonts.** SF Pro did not render through the MCP (text measured 0 width). Use Inter or the app's Google fonts for added layers.

## Variable-driven state

When one screen serves several modes, the screen forgets where it came from. This was the worst bug family. Declare the state model before wiring.

- A "Prototype state" variable collection: which flow you are in, where a shared screen was entered from, clocks and labels bound to the story, settings that must reflect what the user did.
- One reset action list on every Start chip and restart control, with NAVIGATE last. When a variable is added, update every reset site. Script this.
- Prefer a variable over duplicating a screen. Duplicate only when the layout really changes.
- Use fictional names and places, and label fake data.

## Rules that came from real bugs

| Rule | Why |
|---|---|
| Set variables **before** NAVIGATE in an action list | A reset list with SETs after the navigate had to be rebuilt |
| If a variable changes what the outgoing screen shows, set it on the way **back** | A clock was seen changing while the screen slid away |
| Turn on **Reset component state** (`resetInteractiveComponents=true`) on every navigation into a screen with a ticking component, including Start chips | Countdowns reopened at their last value |
| Use guarded sequential conditionals, never else or else-if | The Plugin API dropped an else-if condition and rejected a nested conditional. Use N separate `IF x == value` blocks that cannot overlap |
| Check an else branch cannot fire on an already-done state | A confirmed response could be tapped again |
| Visibility cannot bind to NOT a variable | Keep an inverse boolean and set it wherever the original is set |
| There is no on-load trigger | Set the variable on every tap leaving the previous screen, and make defaults sensible |
| Back does nothing with no history | A flow-start screen needs explicit Navigate |
| Fixed children do not scroll, and order matters | A hotspot inside the first `numberOfFixedChildren` layers stays pinned |
| A hotspot under a fixed dock catches taps through its gaps | End it above the dock, or add a blocker |
| Leftover reactions on parent frames fight hotspots | Two overlapping targets opened two overlays |
| Keep hotspots aligned to the visible control, full width | Half-dead keypad keys were found |
| Keypad hotspots exclude backspace | Otherwise backspace "enters" a digit |
| No `tel:` links | A judge's phone could dial for real. Use a "this prototype never places calls" overlay |
| Use Instant, not Smart Animate, between near-identical screens | A 0.35 s blend looked like nothing happened, and the owner reported working flows as broken |
| Delete scratch frames | 21 unused frames slowed the first load, and taps before images loaded looked dead |
| Auto-advance must leave reading time | 8 s pushed testers past text they had not read. 15 to 20 s worked |
| Patch text must match baseline and size. Overlap patches by 4 px | Otherwise it looks like a superscript or a seam shows |
| Check for text baked into strips | A fixed tab-bar image held the top of a footer line |

## QA: two independent methods

Each misses what the other finds.

**1. Reaction audit, scripted through `use_figma`.** Dump every frame, node and reaction, then assert:

- Every NAVIGATE or OVERLAY destination exists and is a top-level frame
- Every frame is reachable from Start, has an exit, and every overlay closes
- No reaction is empty, no hotspot lacks a reaction
- No hotspot is hidden or outside its frame, unless inside a scroller
- Every variable in a condition or SET exists
- Every navigation into a ticking screen resets component state
- Every flow starting point is named and intended
- Each AFTER_TIMEOUT has the right destination

```js
// sketch, run inside use_figma and adapt it [not tried verbatim]. Conditional blocks hold nested action lists, so recurse into them.
const frames = figma.currentPage.children.filter(n => n.type === "FRAME");
const ids = new Set(frames.map(f => f.id));
const walk = (n, f) => { f(n); if ("children" in n) n.children.forEach(c => walk(c, f)); };
const bad = [];
for (const fr of frames) walk(fr, n => {
  for (const r of n.reactions ?? []) {
    for (const a of r.actions ?? (r.action ? [r.action] : [])) {
      if (a.type === "NODE" && a.destinationId && !ids.has(a.destinationId))
        bad.push([fr.name, n.name, "missing destination", a.destinationId]);
    }
  }
});
bad;
```

Also overlay every hotspot rectangle on a frame render and look at it. That catches misalignment a graph cannot.

**2. Adversarial click-through, by agents that did not build it.**

- Run two agents on the **public link**, signed out, each told to assume it is buggy. Give each its own browser context. On a shared pane, run them one at a time.
- One starts at the full-demo flow, depth-first. The other starts at the other flows and chips, then covers the rest.
- Click every tappable-looking element on every screen, including things that are not hotspots. Clicks on non-hotspots flash Figma's hint, which is a useful signal.
- Check text too: times, names, modes, totals.
- Return `{approved, bugs[], tested_count}` with repro steps and node IDs.
- The fixer gets the merged list, and QA re-runs fresh in a new context. Never let the fixer certify its own work.

Traps:

- A hidden browser pane throttles timers, so auto-advance checks fail. Check timers in a visible window.
- Agents hit usage limits mid-round. Keep fixes idempotent, and re-read file state on start.
- Re-run only touched areas after a small fix. Do a full pass at the end. End each round by checking the link still opens on Start.
- A reported bug may not reproduce. Find out why the person thought it was broken; it may be a usability defect.

## Signed-out test (required before the email)

- Open the proto link in a fresh signed-out profile or incognito window. It must load without a login.
- **Default headless Chrome hits a login wall even when sharing is correct.** That is Figma's bot handling. Use a normal browser user agent or headed mode before you conclude sharing is broken.
- Being signed in as the owner proves nothing.
- Include `starting-point-node-id` in the link, so it opens on Start.

## Bug classes, in order of value

Use this as the QA checklist.

1. Lost context: shared screens forget mode or reason
2. State contradictions: data does not follow from what the user did
3. Dead tappables: looks like a button, does nothing
4. Timeline errors: clocks backward, wrong math, future timestamps
5. Wrong destination or cause and effect
6. Traps and dead ends: no way home, overlay that does not close
7. Sticky component state: timers not resetting
8. Hotspot geometry
9. Skipped logic: copy says required, Skip bypasses it
10. Layout: content under the Dynamic Island, clipped text, overlap
11. Developer residue: demo banners, stray flows, scratch frames
12. Wrong overlay copy
13. Hidden features: signpost anything a judge should find
14. Promise and capability conflicts: copy that contradicts how the system works
15. Missing safety paths

## Stop rule

Bug reports do not reach zero on a large file. Each round adds states, and each state adds paths. Set the stop rule up front.

1. Stop when a full round finds no functional bug: dead button, wrong destination, wrong mode, dead end, false data on the main flows.
2. Cap at 2 rounds in Triage, 4 in Compressed.
3. Rank by severity. Fix cosmetic issues only if a judge would hit them on the primary flow.
4. Commit a dated note of what was left.

**[SafetySense example]** 22 frames and 39 hotspots grew to 56 screens and 8 overlays over 52 agent runs and 29 hours. Of 34 QA verdicts, 2 approved. Two QA agents never approved in the same round, and the last bugs were one-time-unit clock differences on rare paths. That hardening was a multi-day luxury. In a one-day sprint, do one loop and stop.

## Keep the app and the prototype in step

Keep one flow spec. Re-shoot from the app whenever you can, rather than patching layers. If documents mention timers that the prototype shortens for demo purposes, say so.
