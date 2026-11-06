// Data-driven 3D vignette. For a scene this format cannot express, write a component and add a case to Render in Hybrid.tsx.
import React from "react";
import * as THREE from "three";
import { useCurrentFrame, Easing, interpolate } from "remotion";
import { Scene3D } from "../kit3d/sets/common";
import { CampusNight } from "../kit3d/sets/Campus";
import { DormRoom } from "../kit3d/sets/Dorm";
import { PartyKitchen } from "../kit3d/sets/Party";
import { CityMap, MapPin, Route } from "../kit3d/sets/CityMap";
import { Studio } from "../kit3d/sets/Studio";
import { StreetNight } from "../kit3d/sets/Car";
import { CameraRig } from "../kit3d/camera";
import { Actor } from "../kit3d/gltf/Actor";
import { lerp3, type V3 } from "../kit3d/math";
import { P } from "../kit3d/palette";
import { FPS } from "./timing";
import type { ActorSpec, Vignette } from "./types";

const Rim: React.FC<{ target: V3; from: V3; color?: string; intensity?: number }> = ({ target, from, color = "#9fb2ff", intensity = 1.5 }) => {
  const light = React.useMemo(() => new THREE.DirectionalLight(color, intensity), [color, intensity]);
  light.position.set(...from);
  light.target.position.set(...target);
  return <><primitive object={light} /><primitive object={light.target} /></>;
};

const place = (a: ActorSpec, k: number): V3 => {
  const to = a.to ?? a.at;
  return [a.at[0] + (to[0] - a.at[0]) * k, a.y ?? 0, a.at[1] + (to[1] - a.at[1]) * k];
};

const SetPiece: React.FC<{ v: Vignette; dur: number }> = ({ v, dur }) => {
  const frame = useCurrentFrame();
  switch (v.set) {
    case "campus": return <CampusNight dim={v.dim ?? 0.12} />;
    case "dorm": return <DormRoom lampOn fairyLights />;
    case "party": return <PartyKitchen />;
    case "street": return <StreetNight />;
    case "studio": return <Studio bokeh />;
    case "city": {
      const m = v.map ?? {};
      return (
        <>
          <CityMap reveal={1} />
          {(m.routes ?? []).map((r, i) => (
            <Route key={i} points={r.points} color={r.color ?? P.accent}
              progress={interpolate(frame, [(r.start ?? 0) * FPS, ((r.start ?? 0) + (r.dur ?? dur / FPS)) * FPS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          ))}
          {(m.pins ?? []).map((p, i) => <MapPin key={i} position={p.at} color={p.color ?? P.accent} start={(p.start ?? 0) * FPS} label={p.label} />)}
        </>
      );
    }
  }
};

export const Vignette3D: React.FC<{ v: Vignette; dur: number }> = ({ v, dur }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const linear = interpolate(frame, [0, Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lead = v.actors?.[0] ? place(v.actors[0], linear) : ([0, 0, 0] as V3);
  const a = v.cam.from, b = v.cam.to ?? v.cam.from;
  const fov = (a.fov ?? 35) + ((b.fov ?? a.fov ?? 35) - (a.fov ?? 35)) * k;
  const key = v.faceKey ?? [lead[0] + 0.5, lead[1] + 1.75, lead[2] + 1.4, 1.5];
  return (
    <Scene3D fog={v.set === "campus" ? { color: "#120f26", near: 6, far: 46 } : v.set === "city" || v.set === "studio" ? null : undefined} background={v.set === "campus" ? "#120f26" : undefined}>
      <SetPiece v={v} dur={dur} />
      {(v.actors ?? []).map((act, i) => (
        <Actor key={i} look={{ cast: act.cast }} position={place(act, linear)} rotationY={act.rotY ?? 0} seed={i + 1} holdR={act.hold}
          phoneGlow={act.phoneGlow} phoneScreen={undefined} face={act.face}
          clips={(act.clips ?? [{ anim: "idle" as const }]).map((c) => ({ anim: c.anim, start: (c.start ?? 0) * FPS, fade: c.fade, speed: c.speed, mask: c.mask }))} />
      ))}
      {v.actors?.length ? <Rim target={[lead[0], 1.3, lead[2]]} from={[lead[0] - 1.5, 3, lead[2] - 4]} /> : null}
      {v.actors?.length ? <pointLight position={[key[0], key[1], key[2]]} color="#ffd9b8" intensity={key[3]} distance={2.8} decay={1.4} /> : null}
      <CameraRig handheld={v.cam.handheld ?? 0.005} rig={() => ({ pos: lerp3(a.pos, b.pos, k), look: lerp3(a.look, b.look, k), fov })} />
    </Scene3D>
  );
};

