// Character prop types shared by the rigged glTF cast (gltf/GltfCharacter.tsx).
import type * as THREE from "three";
import type { Clip, Pose } from "./pose";
import type { V3 } from "./math";

export type Rim = { color: string; strength: number };

export type HairStyle = "ponytail" | "short" | "bun" | "long" | "buzz" | "curly" | "none" | "bob";
export type Held = "phone" | "cup" | "none";

export type Look = {
  skin?: string;
  hair?: string;
  hairStyle?: HairStyle;
  top?: string;
  /** Optional open jacket over the top. */
  jacket?: string;
  bottom?: string;
  shoes?: string;
  /** "f" narrower shoulders / wider hips, "m" broader shoulders. */
  build?: "f" | "m";
  sleeves?: "short" | "long";
  skirt?: boolean;
  /** Hood up + face in shadow (antagonist). */
  hood?: boolean;
  /** Additive, opt-in: a loose cloth hoodie shell (soft folds, hem below the hips, a deep peaked hood) over the
   *  segmented body, so a hooded figure reads as a person in a hoodie, not a mannequin with a disc face. */
  drape?: boolean;
  /** Police cap + badge + duty belt. */
  police?: boolean;
  /** Scale (1 = ~1.75 m). */
  height?: number;
  /** Cheek blush (adds warmth to faces). */
  blush?: boolean;
  /** HD: iris color. */
  eyes?: string;
  /** HD: lash line weight (defaults to build "f"). */
  lashes?: boolean;
  /** HD: brow thickness multiplier (1 = default). */
  browWeight?: number;
  /** HD: jaw width multiplier (1 = default). */
  jaw?: number;
  /** HD: nose size multiplier. */
  nose?: number;
  /** HD: stubble shadow on the jaw. */
  stubble?: boolean;
};

export type CharacterProps = {
  look?: Look;
  /** Animation timeline. Defaults to idle. */
  clips?: Clip[];
  /** Explicit pose (bypasses clips). */
  pose?: Pose;
  /** Frame offset for clip evaluation (useful inside <Sequence>). */
  frameOffset?: number;
  /** Seed: decorrelates blinks / micro-motion between characters. */
  seed?: number;
  position?: V3;
  /** Heading in radians (0 = facing +Z / toward a default camera). */
  rotationY?: number;
  holdR?: Held;
  holdL?: Held;
  /** Image URL (staticFile) or texture shown on a held phone. */
  phoneScreen?: string | THREE.Texture;
  /** Phone screen glow 0..1 (lights her face). */
  phoneGlow?: number;
  castShadow?: boolean;
  /** Soft warm fill light parented to the face (keeps close-up faces clean). 0 = off. */
  faceFill?: number;
  /** override face channels on top of the animated pose (expression acting). */
  face?: Partial<Record<"eyesWide" | "worry" | "brow" | "smile" | "mouth" | "blink" | "eyeX" | "eyeY", number>>;
  /** Additive, opt-in: 0..1 "alive" layer: weight shift, deeper breathing, relaxed elbow bend, a waist blend
   *  that hides the chest/abdomen seam, softer close-up face limits (brows never climb into the hair, no teeth slab). */
  life?: number;
  /** HD: Fresnel rim light on the whole character (null = off). */
  rim?: Rim | null;
  /** HD: hand grip override 0 (open) .. 1 (fist). Default: holds -> 0.62, empty -> 0.3. */
  gripL?: number;
  gripR?: number;
  /** Additive, opt-in: anatomical arms (deltoid cap, elbow knob, tapered wrist, sleeve creases + cuffs),
   *  modelled sneakers (sole, toe cap, laces, heel tab) and secondary sway on the bob hair. */
  anatomy?: boolean;
  /** Additive, opt-in 0..1: idle acting on held shots (slow head glances, a chest turn, a small nod). */
  act?: number;
  /** chest-space offset added to the right / left IK hand targets (e.g. lower a held phone). */
  ikOffR?: V3;
  ikOffL?: V3;
};

