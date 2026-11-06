// The film: 16:9, 30 fps. Shots, VO, music and SFX all come from content/beats.json and content/timeline.json.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { CUTS, type Cut } from "./cuts";
import { FILM, TIMELINE, TOTAL_FRAMES, at, sec, voEnvelope } from "./timing";
import { Captions16, Letterbox, Shot, Tag, ez } from "./ui";
import { Vignette3D } from "./vignette";
import { Architecture, BrandSting, Claims, DeviceShot, EndCard, Stat, Team } from "./scenes2d";
import type { MusicCue, ShotSpec } from "./types";

const ShotTag: React.FC<{ text: string; color?: string; letterboxed?: boolean }> = ({ text, color = C.warn, letterboxed }) => {
  const f = useCurrentFrame();
  const p = ez(f, 2, 10);
  return (
    <div style={{ position: "absolute", left: 96, top: letterboxed ? 150 : 70, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
      <Tag color={color} size={28} bg="rgba(13,12,22,.85)">{text}</Tag>
    </div>
  );
};

const Render: React.FC<{ c: Cut }> = ({ c }) => {
  const { shot: s, beat, from, to } = c;
  const base = { from, beat, dur: to - from };
  switch (s.type) {
    case "vignette": return <Vignette3D v={s} dur={to - from} />;
    case "device": return <DeviceShot {...base} s={s} />;
    case "brand": return <BrandSting {...base} s={s} />;
    case "claims": return <Claims {...base} s={s} />;
    case "stat": return <Stat {...base} s={s} />;
    case "architecture": return <Architecture {...base} s={s} />;
    case "team": return <Team {...base} s={s} />;
    case "end": return <EndCard {...base} s={s} />;
  }
};

const driftFor = (s: ShotSpec) => s.drift ?? (s.type === "device" || s.type === "claims" ? 0.05 : 0);

/* ------------------------------------------------------------------ AUDIO */
const duck = (abs: number) => 1 - 0.34 * (voEnvelope[Math.min(voEnvelope.length - 1, Math.max(0, abs))] ?? 0);

const Music: React.FC<{ cue: MusicCue }> = ({ cue }) => {
  const owner = FILM.beats[0].id;
  const from = Math.max(0, at(cue.from, owner));
  const to = Math.min(TOTAL_FRAMES, at(cue.to, owner));
  const lvl = cue.level ?? 0.9;
  return (
    // Beds are pre-looped to full length by scripts/beds.sh. A looped <Audio> resets ffmpeg's clock each loop, so a
    // per-frame volume curve would only apply during the first loop.
    <Sequence from={from} durationInFrames={Math.max(1, to - from)} name={`music ${cue.file}`}>
      <Audio src={staticFile(`music/long/${cue.file}.mp3`)}
        volume={(f) => {
          const abs = f + from;
          const v = interpolate(abs, [from, from + 20, Math.max(from + 21, to - 24), Math.max(from + 22, to)], [0, lvl, lvl, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          // Quantized to 0.04 steps: long volume curves otherwise overflow Remotion's ffmpeg expression nesting limit.
          return Math.round(Math.max(0, v * duck(abs)) * 25) / 25;
        }} />
    </Sequence>
  );
};

const Sfx: React.FC<{ at: number; file: string; vol: number; dur: number; loop?: boolean; fadeOut: number }> = ({ at: f0, file, vol, dur, loop, fadeOut }) => (
  <Sequence from={Math.max(0, f0)} durationInFrames={dur} name={`sfx ${file}`}>
    <Audio src={staticFile(`sfx/${file}.wav`)} loop={loop}
      volume={(f) => vol * (fadeOut ? interpolate(f, [0, 4, Math.max(5, dur - fadeOut), Math.max(6, dur)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1)} />
  </Sequence>
);

const SoundTrack: React.FC = () => (
  <>
    {TIMELINE.beats.filter((b) => b.file).map((b) => (
      <Sequence key={b.id} from={sec(b.startSec)} durationInFrames={Math.ceil(b.durationSec * 30) + 12} name={`vo ${b.id}`}>
        <Audio src={staticFile(b.file!)} volume={1} />
      </Sequence>
    ))}
    {FILM.music.map((m, i) => <Music key={i} cue={m} />)}
    {FILM.beats.flatMap((b) => (b.sfx ?? []).map((s, i) => (
      <Sfx key={`${b.id}-${i}`} at={at(s.at, b.id)} file={s.file} vol={s.vol ?? 0.3} dur={s.dur ?? 60} loop={s.loop} fadeOut={s.fadeOut ?? 0} />
    )))}
  </>
);

const FadeOut: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [0, 17], [0, 1], { extrapolateRight: "clamp" }) }} />;
};

/* ------------------------------------------------------------------ COMPOSITION */
export const Hybrid: React.FC = () => {
  const hide = FILM.beats.filter((b) => b.noCaption).map((b) => b.id);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CUTS.map((c) => (
        <Shot key={c.shot.id} name={c.shot.id} from={c.from} to={c.to} kind="cut" drift={driftFor(c.shot)} zin={Math.min(4, c.shot.pushIn ?? 0)} zout={Math.min(4, c.shot.pushOut ?? 0)}>
          <Render c={c} />
          {c.shot.letterbox && <Letterbox inAt={-20} />}
          {c.shot.tag && <ShotTag text={c.shot.tag} color={c.shot.tagColor} letterboxed={c.shot.letterbox} />}
        </Shot>
      ))}
      <Sequence from={TOTAL_FRAMES - 18} durationInFrames={18}><FadeOut /></Sequence>
      <Captions16 hide={hide} cutoffs={CUTS.map((c) => c.from)} />
      <SoundTrack />
    </AbsoluteFill>
  );
};
