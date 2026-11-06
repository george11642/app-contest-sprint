// The shape of content/beats.json. Check it with `npm run check`.
import type { AnimName, Clip } from "../kit3d/pose";
import type { CastKey } from "../kit3d/gltf/cast";
import type { V3 } from "../kit3d/math";

/** "start" | "end" | a word in the owning beat | seconds after the beat start | a precise reference. */
export type TimeRef = "start" | "end" | string | number | { beat?: string; word?: string; n?: number; end?: boolean; frames?: number };

export type Screen = {
  /** Path under public/, for example "screens/home.png". */
  src?: string;
  /** Path under public/, for example "footage/take1.mp4". trimBefore is in frames at 30 fps. */
  video?: { src: string; trimBefore?: number; playbackRate?: number };
  /** Placeholder screen drawn in code. Replace it with src or video from the real app. */
  sample?: { title: string; rows: string[]; status?: string };
};

export type ActorSpec = {
  cast: CastKey;
  /** Ground position [x, z]. `to` moves the actor there across the shot. */
  at: [number, number];
  to?: [number, number];
  y?: number;
  rotY?: number;
  /** Clip starts are in seconds from the shot's first frame. */
  clips?: { anim: AnimName; start?: number; fade?: number; speed?: number; mask?: Clip["mask"] }[];
  hold?: "phone" | "cup" | "none";
  phoneGlow?: number;
  face?: Partial<Record<"eyesWide" | "worry" | "brow" | "smile" | "mouth" | "blink" | "eyeX" | "eyeY", number>>;
};

export type CamSpec = { pos: V3; look: V3; fov?: number };
export type MapSpec = { pins?: { at: [number, number]; color?: string; label?: string; start?: number }[]; routes?: { points: [number, number][]; color?: string; start?: number; dur?: number }[] };

export type Vignette = {
  type: "vignette";
  set: "campus" | "dorm" | "party" | "city" | "studio" | "street";
  actors?: ActorSpec[];
  cam: { from: CamSpec; to?: CamSpec; handheld?: number };
  dim?: number;
  map?: MapSpec;
  /** Face key light as [x, y, z, intensity]. */
  faceKey?: [number, number, number, number];
};

export type ScreenShot = { type: "device"; screen: Screen; kicker?: string; headline?: string; body?: string; side?: "left" | "right"; full?: boolean };
export type BrandShot = { type: "brand" };
export type ClaimsShot = { type: "claims"; chapter?: string; title: string; items: { text: string; at?: TimeRef }[] };
export type StatShot = { type: "stat"; chapter?: string; kicker?: string; value: number; suffix?: string; label: string; citation: string; doi?: string; countAt?: TimeRef };
export type ArchShot = {
  type: "architecture";
  chapter?: string;
  zones: { label: string; color?: string; x: number; w: number }[];
  nodes: { id: string; label: string; sub?: string; x: number; y: number; w: number; color?: string; at?: TimeRef }[];
  edges: { from: string; to: string; at?: TimeRef }[];
  banner?: string;
};
export type TeamShot = { type: "team"; chapter?: string; people: { name: string; detail: string; role?: string; at?: TimeRef }[]; screen?: Screen };
export type EndShot = { type: "end"; headline?: string; subhead?: string; notice?: string; resources?: string[]; team?: string };

export type ShotSpec = (Vignette | ScreenShot | BrandShot | ClaimsShot | StatShot | ArchShot | TeamShot | EndShot) & {
  /** Unique name for this shot. */
  id: string;
  /** When the shot starts. Default: the beat's start. It runs until the next shot. */
  at?: TimeRef;
  /** Top-left label such as "Dramatization · fictional characters" or "Simulated". */
  tag?: string;
  tagColor?: string;
  letterbox?: boolean;
  /** Slow push on 2D shots so motion never stops. Default 0.05 for 2D, 0 for 3D. */
  drift?: number;
  /** Zoom-through transition in frames (4 max). */
  pushIn?: number;
  pushOut?: number;
};

export type SfxCue = { file: string; at?: TimeRef; vol?: number; dur?: number; fadeOut?: number; loop?: boolean };

export type BeatSpec = {
  id: string;
  /** Narration as displayed in captions. Empty for a beat with no VO. */
  vo?: string;
  /** What goes to ElevenLabs when it differs from `vo`, for example numbers spelled out or direction tags. */
  tts?: string;
  stability?: number;
  style?: number;
  /** Pause before this beat, seconds. */
  gapBefore?: number;
  /** Length of a beat with no VO, seconds. */
  holdSec?: number;
  /** Words colored in the captions. Separate phrases with " · ". */
  highlight?: string;
  /** Hide this beat's captions. Only use it when on-screen type repeats the whole sentence. */
  noCaption?: boolean;
  /** What the shot must prove. Notes for the human and the reviewers; not rendered. */
  note?: string;
  shots?: ShotSpec[];
  sfx?: SfxCue[];
};

export type MusicCue = { file: "tension_loop" | "tension_build" | "product_pulse_loop" | "resolve_pad"; from: TimeRef & object; to: TimeRef & object; level?: number };

export type Film = {
  title: string;
  brand: { app: string; tagline: string; accent?: string; calm?: string; captionHi?: string; icon?: string };
  voice: { id: string; model: string };
  endHoldSec: number;
  music: MusicCue[];
  beats: BeatSpec[];
};
