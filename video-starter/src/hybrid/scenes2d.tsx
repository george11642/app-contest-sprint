// 2D scene templates. Each takes its data from beats.json and keeps moving: slow pushes, staggered reveals, no static holds.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";
import { Chapter, Device, Headline, Icon, Kicker, Stage, Tag, deviceH, ez, useSpring } from "./ui";
import { FILM, at } from "./timing";
import type { ArchShot, BrandShot, ClaimsShot, EndShot, Screen, ScreenShot, StatShot, TeamShot, TimeRef } from "./types";

type Base = { from: number; beat: string; dur: number };
const useA = (from: number) => useCurrentFrame() + from;

/** The credit the model license requires. Keep it on the end card. */
export const MODEL_CREDIT = "3D CHARACTERS: QUATERNIUS (CC0 / CC-BY 3.0, VIA POLY.PIZZA)";

const AppName: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", color: C.ink }}>{FILM.brand.app}</div>
);

/** Placeholder screen. Replace it with `src` or `video` from the real app. */
export const SampleScreen: React.FC<NonNullable<Screen["sample"]>> = ({ title, rows, status }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#191729,#100f1b)", padding: "96px 26px 30px", gap: 16, display: "flex", flexDirection: "column" }}>
    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 38, color: C.ink, letterSpacing: "-0.02em" }}>{title}</div>
    {status && <div style={{ fontFamily: F.mono, fontSize: 18, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.calm }}>{status}</div>}
    {rows.map((r, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 18px", borderRadius: 18, background: C.card, border: `1px solid ${C.line}` }}>
        <div style={{ width: 14, height: 14, borderRadius: 99, background: i === 0 ? C.calm : C.muted, boxShadow: i === 0 ? `0 0 14px ${C.calm}` : undefined }} />
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.ink }}>{r}</div>
      </div>
    ))}
  </AbsoluteFill>
);

const ScreenInDevice: React.FC<{ screen: Screen; w: number; rotY?: number; rotX?: number; reflect?: boolean }> = ({ screen, w, rotY = 0, rotX = 0, reflect = false }) => (
  <Device w={w} rotY={rotY} rotX={rotX} reflect={reflect}
    src={screen.src ? staticFile(screen.src) : undefined}
    video={screen.video ? { ...screen.video, src: staticFile(screen.video.src) } : undefined}>
    {screen.sample && <SampleScreen {...screen.sample} />}
  </Device>
);

export const BrandSting: React.FC<Base & { s: BrandShot }> = ({ from }) => {
  const A = useA(from);
  const sp = useSpring(0, { damping: 13, stiffness: 190 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Stage grid={false} />
      <div style={{ transform: `scale(${1.5 - 0.5 * sp}) rotate(${(1 - sp) * -3}deg)`, opacity: sp, textAlign: "center", filter: `drop-shadow(0 0 40px ${C.accent}66)` }}>
        <AppName size={190} />
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 48, color: C.muted, opacity: ez(A, from + 8, from + 16), marginTop: 6 }}>{FILM.brand.tagline}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Claims: React.FC<Base & { s: ClaimsShot }> = ({ from, beat, s }) => {
  const A = useA(from);
  return (
    <AbsoluteFill>
      <Stage />
      {s.chapter && <Chapter n="" title={s.chapter} from={from} />}
      <div style={{ position: "absolute", left: 150, right: 150, top: 200, display: "flex", flexDirection: "column", gap: 34 }}>
        <Headline size={92}>{s.title}</Headline>
        {s.items.map((it, i) => {
          const t = it.at === undefined ? from + 16 + i * 26 : at(it.at, beat);
          const p = ez(A, t - 2, t + 10);
          return (
            <div key={i} style={{ display: "flex", gap: 24, alignItems: "center", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
              <div style={{ width: 16, height: 66, borderRadius: 8, background: C.accent }} />
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 62, color: C.ink, letterSpacing: "-0.02em" }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Stat: React.FC<Base & { s: StatShot }> = ({ from, beat, s, dur }) => {
  const A = useA(from);
  const t = s.countAt === undefined ? from + 24 : at(s.countAt, beat);
  const n = Math.round(interpolate(A, [Math.min(t - 14, from + 4), t + 2], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const push = interpolate(A - from, [0, Math.max(1, dur)], [1, 1.07], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill>
      <Stage />
      {s.chapter && <Chapter n="" title={s.chapter} from={from} />}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "720px 500px" }}>
        <div style={{ position: "absolute", left: 150, top: 170, width: 1500 }}>
          {s.kicker && <Kicker color="#c9c6da" size={34}>{s.kicker}</Kicker>}
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 320, lineHeight: 0.95, letterSpacing: "-0.05em", color: C.accent, marginTop: 10, textShadow: `0 0 80px ${C.accent}44`, fontVariantNumeric: "tabular-nums" }}>
            {n}<span style={{ fontSize: 180 }}>{s.suffix ?? ""}</span>
          </div>
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 52, lineHeight: 1.22, color: C.ink, marginTop: 18, maxWidth: 1400, opacity: ez(A, t + 4, t + 20) }}>{s.label}</div>
          <div style={{ fontFamily: F.mono, fontSize: 34, color: "#e0dded", marginTop: 26, opacity: ez(A, t + 14, t + 30) }}>{s.citation}</div>
          {s.doi && <div style={{ fontFamily: F.mono, fontSize: 30, color: "#c9c6da", marginTop: 8, opacity: ez(A, t + 20, t + 36) }}>{s.doi}</div>}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const DeviceShot: React.FC<Base & { s: ScreenShot }> = ({ from, s, dur }) => {
  const A = useA(from);
  const sp = useSpring(0, { damping: 16, stiffness: 120 });
  const W = 400;
  const H = deviceH(W);
  const right = s.side !== "left";
  const rot = interpolate(A - from, [0, Math.max(1, dur)], [right ? -9 : 9, right ? -3 : 3]);
  const hasText = s.headline || s.kicker || s.body;
  return (
    <AbsoluteFill>
      <Stage />
      <div style={{ position: "absolute", top: (1080 - H) / 2 - 26, left: hasText ? (right ? 1180 : 240) : (1920 - W) / 2, opacity: sp, transform: `translateY(${(1 - sp) * 70}px)` }}>
        <ScreenInDevice screen={s.screen} w={W} rotY={rot} rotX={1.5} />
      </div>
      {hasText && (
        <div style={{ position: "absolute", top: 270, left: right ? 150 : 800, width: 930 }}>
          {s.kicker && <div style={{ opacity: ez(A, from + 2, from + 12) }}><Kicker size={34}>{s.kicker}</Kicker></div>}
          {s.headline && <div style={{ marginTop: 18, opacity: ez(A, from + 6, from + 16), transform: `translateY(${(1 - ez(A, from + 6, from + 16)) * 22}px)` }}><Headline size={94}>{s.headline}</Headline></div>}
          {s.body && <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 46, lineHeight: 1.25, color: C.muted, marginTop: 24, opacity: ez(A, from + 14, from + 26) }}>{s.body}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

const PK = 18;
export const Architecture: React.FC<Base & { s: ArchShot }> = ({ from, beat, s }) => {
  const A = useA(from);
  const NH = 124;
  const when = (ref: TimeRef | undefined, i: number) => (ref === undefined ? from + 10 + i * 12 : at(ref, beat));
  const nodes = s.nodes.map((n, i) => ({ ...n, t: when(n.at, i), c: n.color ?? C.accent }));
  const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = s.edges.map((e, i) => {
    const a = by[e.from], b = by[e.to];
    if (!a || !b) throw new Error(`architecture edge ${e.from} -> ${e.to} names a missing node`);
    return { a, b, t: e.at === undefined ? Math.max(a.t, b.t) + i * 2 : at(e.at, beat) };
  });
  return (
    <AbsoluteFill>
      <Stage />
      {s.chapter && <Chapter n="" title={s.chapter} from={from} />}
      {s.zones.map((z, i) => {
        const col = z.color ?? C.accent;
        const p = ez(A, from + i * 8, from + 16 + i * 8);
        return (
          <div key={i} style={{ position: "absolute", left: z.x, top: 170, width: z.w, height: 650, borderRadius: 34, border: `2px solid ${col}77`, background: `${col}0d`, opacity: 0.25 + 0.75 * p }}>
            <div style={{ position: "absolute", top: 22, left: 30 }}><Kicker color={col} size={32}>{z.label}</Kicker></div>
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {edges.map(({ a, b, t }, i) => {
          const x0 = a.x + a.w, y0 = a.y + NH / 2, x1 = b.x, y1 = b.y + NH / 2;
          const p = ez(A, t, t + 12);
          // packets keep traveling, so the diagram never stops moving
          const loop = (A - t) % 42;
          const q = loop >= 0 && A >= t && loop < PK ? loop / PK : -1;
          return (
            <g key={i} opacity={p}>
              <line x1={x0} y1={y0} x2={x0 + (x1 - x0) * p} y2={y0 + (y1 - y0) * p} stroke={b.c} strokeWidth={4} strokeOpacity={0.7} />
              {q >= 0 && <circle cx={x0 + (x1 - x0) * q} cy={y0 + (y1 - y0) * q} r={11} fill={b.c} style={{ filter: `drop-shadow(0 0 10px ${b.c})` }} />}
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const p = ez(A, n.t - 2, n.t + 9);
        return (
          <div key={i} style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: NH, borderRadius: 22, background: C.card, border: `2px solid ${n.c}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 0.12 + 0.88 * p, transform: `scale(${0.96 + 0.04 * p})`, boxShadow: p > 0.5 ? `0 0 26px ${n.c}44` : undefined }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 42, color: C.ink, letterSpacing: "-0.01em" }}>{n.label}</div>
            {n.sub && <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 24, color: C.muted, marginTop: 2 }}>{n.sub}</div>}
          </div>
        );
      })}
      {s.banner && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 840, display: "flex", justifyContent: "center", opacity: ez(A, from + 40, from + 54) }}>
          <Tag color={C.calm} size={34} bg="rgba(13,12,22,.85)">{s.banner}</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Team: React.FC<Base & { s: TeamShot }> = ({ from, beat, s, dur }) => {
  const A = useA(from);
  const push = interpolate(A - from, [0, Math.max(1, dur)], [1, 1.07], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill>
      <Stage />
      {s.chapter && <Chapter n="" title={s.chapter} from={from} />}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1200px 500px" }}>
        {s.screen && (
          <div style={{ position: "absolute", left: 210, top: 130 }}><ScreenInDevice screen={s.screen} w={360} rotY={14 - (A - from) * 0.05} rotX={2 * Math.sin((A - from) / 60)} /></div>
        )}
        <div style={{ position: "absolute", left: s.screen ? 760 : 240, top: 180, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 52, color: "#c9c6da" }}>Built by</div>
          {s.people.map((p, i) => {
            const t = p.at === undefined ? from + 8 + i * 12 : at(p.at, beat);
            const q = ez(A, t - 8, t + 4);
            return (
              <div key={i} style={{ padding: "26px 40px", borderRadius: 26, background: C.card, border: `2px solid ${i % 2 ? C.calm : C.accent}`, opacity: q, transform: `translateX(${(1 - q) * 60}px)` }}>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 70, color: C.ink, letterSpacing: "-0.02em" }}>{p.name}</div>
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 38, color: C.muted }}>{p.detail}{p.role ? ` · ${p.role}` : ""}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<Base & { s: EndShot }> = ({ from, s, dur }) => {
  const A = useA(from);
  const { durationInFrames } = useVideoConfig();
  const r = (a: number) => ({ opacity: ez(A, a, a + 12), transform: `translateY(${(1 - ez(A, a, a + 12)) * 18}px)` });
  // continuous push to the last frame: a static end card was flagged in every review of the worked example
  const push = interpolate(A - from, [0, Math.max(1, Math.min(dur, durationInFrames - from))], [0.96, 1.05], { extrapolateRight: "clamp" });
  const brand = FILM.brand;
  return (
    <AbsoluteFill style={{ background: "#0b0a12", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ opacity: 0.55 }}><Stage grid={false} seed={7} /></AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 50% at ${50 + 6 * Math.sin((A - from) / 50)}% ${40 + 4 * Math.sin((A - from) / 70)}%, ${C.accent}22, transparent 70%)` }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transform: `scale(${push})`, gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, ...r(from) }}>
          {brand.icon ? <Img src={staticFile(brand.icon)} style={{ width: 90, height: 90, borderRadius: 22 }} /> : <Icon name="shield" size={80} color={C.accent} />}
          <AppName size={72} />
        </div>
        <div style={r(from + 6)}><Headline size={92}>{s.headline ?? brand.tagline}</Headline></div>
        {s.subhead && <div style={r(from + 14)}><Headline size={70} color={C.accent}>{s.subhead}</Headline></div>}
        {s.notice && <div style={{ padding: "16px 38px", borderRadius: 999, background: C.cardHi, border: `2px solid ${C.line}`, fontFamily: F.display, fontWeight: 700, fontSize: 44, color: "#fff", ...r(from + 20) }}>{s.notice}</div>}
        {(s.resources ?? []).map((x, i) => <div key={i} style={{ fontFamily: F.body, fontWeight: 700, fontSize: 40, color: "#f1eef9", ...r(from + 26 + i * 4) }}>{x}</div>)}
        <div style={r(from + 34)}>
          {s.team && <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 30, color: "#c9c6da", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.team}</div>}
          <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 24, color: "#a9a5bd", letterSpacing: "0.06em", marginTop: 10 }}>{MODEL_CREDIT}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

