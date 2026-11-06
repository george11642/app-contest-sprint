// Game-like HUD pieces (reference reels: persistent "SHOTS / BAC" counters, "+25 MIN" chips).
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { OF } from "./fonts";
import { C } from "../../theme";

const glass: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(33,31,49,.82), rgba(20,19,31,.78))",
  border: "1.5px solid rgba(241,239,248,.14)",
  boxShadow: "0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)",
  backdropFilter: "blur(10px)",
};

const useU = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080;
};

/** Spring-in helper (0..1) from frame `at`. */
const useIn = (at = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, stiffness: 180, mass: 0.7 } });
};

/** Big game counter ("TAPS 0"). Bumps (scale pop) whenever `bumpAt` frames pass. */
export const Counter: React.FC<{ label: string; value: string | number; color?: string; bumpAt?: number[]; enterAt?: number; style?: React.CSSProperties; sub?: string }> = ({
  label, value, color = C.accent, bumpAt = [], enterAt = 0, style, sub,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useU();
  const k = useIn(enterAt);
  let bump = 0;
  for (const b of bumpAt) {
    const f = frame - b;
    if (f >= 0 && f < 20) bump = Math.max(bump, Math.sin((f / 20) * Math.PI) * (1 - f / 20));
  }
  return (
    <div style={{ ...glass, display: "inline-flex", flexDirection: "column", alignItems: "center", padding: `${10 * u}px ${22 * u}px`, borderRadius: 20 * u, opacity: k, transform: `scale(${(0.7 + 0.3 * k) * (1 + 0.25 * bump)})`, ...style }}>
      <span style={{ fontFamily: OF.caption, fontWeight: 900, fontSize: 20 * u, color: C.muted, letterSpacing: 3 }}>{label}</span>
      <span style={{ fontFamily: OF.caption, fontWeight: 900, fontSize: 64 * u, color, lineHeight: 1, textShadow: `0 0 ${20 * u}px ${color}88`, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {sub && <span style={{ fontFamily: OF.caption, fontWeight: 800, fontSize: 16 * u, color: C.muted, marginTop: 2 * u }}>{sub}</span>}
    </div>
  );
};

/** Small time-skip chip ("+25 MIN" style). */
export const Chip: React.FC<{ text: string; color?: string; at?: number; style?: React.CSSProperties; icon?: string }> = ({ text, color = C.calm, at = 0, style, icon = "▶▶" }) => {
  const u = useU();
  const k = useIn(at, 10);
  return (
    <div style={{ ...glass, display: "inline-flex", alignItems: "center", gap: 8 * u, padding: `${6 * u}px ${14 * u}px`, borderRadius: 999, borderColor: `${color}88`, opacity: k, transform: `scale(${0.5 + 0.5 * k})`, ...style }}>
      <span style={{ color, fontSize: 16 * u, fontWeight: 900 }}>{icon}</span>
      <span style={{ fontFamily: OF.caption, fontWeight: 900, fontSize: 24 * u, color: C.ink, letterSpacing: 1 }}>{text}</span>
    </div>
  );
};

/** Ease a value toward targets over frames: [[frame, value], ...]. Handy for RiskMeter / HelpETA drivers. */
export const useKeyed = (keys: [number, number][]) => {
  const frame = useCurrentFrame();
  return interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};
