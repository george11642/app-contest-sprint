# kit3d: code-only 3D kit

Stack: Remotion 4.0.538, @remotion/three, @react-three/fiber 9.3, three 0.178. Everything is driven by the frame number. Do not use `Math.random` or the clock; use `hash()` and `noise1()` from `math.ts`.

Import from `src/kit3d`. Open the `GltfLab` composition to see the cast and motions.

## Scene and camera
- `<Scene3D fog? background? exposure?>` is a ThreeCanvas sized to the composition.
- `<CameraRig rig handheld? shakes? />`: `rig` is a `CamKey[]` (`{f, pos, look, fov?, ease?, cut?}`) or a `CamFn`. Helpers: `dolly`, `pushIn`, `orbit`, `follow`, `cuts`.

## Characters
`<Actor look={{ cast: "lead" }} clips={[{ anim: "walk", start: 0 }]} position={[0, 0, 0]} rotationY={0} seed={1} />`

- Cast slots live in `gltf/cast.ts`: `lead`, `contact`, `friend`, `operator`, `peer`, `peer2`, `adult`, `hoodie`, `silhouette`, `hooded`, `officer`, `crowd`.
- `clips` is `Clip[]`: `{anim, start, end?, fade?, speed?, offset?, mask?}`. `AnimName` values are in `pose.ts`: `walk`, `run`, `idle`, `talk`, `phoneUp`, `phoneRing`, `sit`, `lookBack`, `startle`, `freeze`, `hug`, and more.
- `holdR` and `holdL` are `"phone" | "cup" | "none"`. `phoneScreen` takes a staticFile URL or texture.
- `face` overrides expression channels: `smile`, `worry`, `brow`, `eyesWide`, `mouth`, `blink`, `eyeX`, `eyeY`.
- Frame heroes at medium distance. The pack's faces do not survive close-ups.

## Sets
`Studio`, `CampusNight`, `PartyKitchen`, `CarInterior` + `Sedan` + `StreetNight`, `DormRoom`, `CityMap` + `Route` + `MapPin` + `MapMover`. Each was built for one story, so expect to dress or add one per scenario.

## Props and effects
`Phone`, `PhoneInsert`, `Cup`, `Glass`, `SoftShadow`, `Glow`, `LightPool`, `LightCone`, `Motes`, `Bokeh`, `Stars`, `SkyDome`.

## Overlays
`overlay/` has `Captions`, `StickerTitle`, `NotificationToast`, `PhoneFrame2D`, `Grade`, `Flash`, `Fade`, `Chip`, `Counter`. The hybrid film uses `src/hybrid/ui.tsx` for captions and device frames.
