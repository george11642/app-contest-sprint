// Cast of skinned glTF characters (Quaternius "Animated Women/Men" packs, CharacterArmature rig, 62 joints).
// Add your own entries here. Recolor materials, set a skin and hair tone, and test them in the GltfLab composition.
// Each kit Look is mapped onto one of these models, with its materials recolored per role.
import type { Look } from "../types";

export type ModelKey = "suitF" | "casualF" | "formalF" | "casualM" | "suitM" | "hoodieM";

export type ModelDef = {
  file: string;
  /** Retargeted UAL clips baked for this rig (models/anims/*.json). */
  anims: string;
  /** Target standing height in meters. */
  height: number;
  /** Mesh-name substrings to hide (e.g. weapons). */
  hide?: string[];
};

export const MODELS: Record<ModelKey, ModelDef> = {
  suitF: { file: "models/chars/SuitFemale.glb", anims: "models/anims/SuitFemale.json", height: 1.66 },
  casualF: { file: "models/chars/CasualFemale.glb", anims: "models/anims/CasualFemale.json", height: 1.64 },
  formalF: { file: "models/chars/FormalFemale.glb", anims: "models/anims/FormalFemale.json", height: 1.66 },
  casualM: { file: "models/chars/CasualMale.glb", anims: "models/anims/CasualMale.json", height: 1.78 },
  suitM: { file: "models/chars/SuitMale.glb", anims: "models/anims/SuitMale.json", height: 1.8 },
  hoodieM: { file: "models/chars/HoodieMale.glb", anims: "models/anims/HoodieMale.json", height: 1.78 },
};

/** Material recolor: key = material name (or "mesh/material" to target one mesh), value = color. */
export type Recolor = Record<string, string>;

export type Extra = "ponytail" | "policeCap" | "badge" | "headset" | "hood" | "bun" | "bobShell" | "hairCap";

/** skinTone / hairTone (r12, opt-in): lock the rendered skin / hair to one tone under any scene lighting (see charMat). */
export type CastDef = { model: ModelKey; colors: Recolor; extras?: Extra[]; hair?: string; darkFace?: boolean; skinTone?: string; hairTone?: string; /**source materials to hide (e.g. the ribbed hair slabs under a hairCap). */ hideMats?: string[] };

/** Extra fields a Look may carry to pick a cast member explicitly. */
export type LookCast = Look & { cast?: CastKey };

export const CAST = {
  /** Lead: chestnut bob, teal jacket, tone-locked so scene lighting never makes her read as another person. */
  lead: {
    model: "suitF",
    colors: { "Suit_Body/Black": "#1d8f91", "Suit_Legs/Black": "#2c3658", White: "#ef7b9b", Hair_Blond: "#4a2c1c", Hair_Brown: "#3a2216", "Suit_Feet/Black": "#2a2030" },
    extras: ["bobShell"],
    hair: "#4a2c1c",
    skinTone: "#e2a587",
    hairTone: "#5a3424",
  },
  /** Second woman on the same rig. Keep her away from the camera: the pack shares one female face. */
  contact: {
    model: "suitF",
    colors: { "Suit_Body/Black": "#6a4c9c", "Suit_Legs/Black": "#33294a", White: "#b9a6dc", Hair_Blond: "#6e4029", Hair_Brown: "#683c26", "Suit_Feet/Black": "#2a2232" },
    extras: ["bobShell", "bun"],
    hair: "#6e4029",
    skinTone: "#e8b597",
    hairTone: "#74462c",
  },
  /** Friend: blonde, mustard top, brown boots. */
  friend: {
    model: "suitF",
    colors: { "Suit_Body/Black": "#f0b55a", "Suit_Legs/Black": "#4b3f6b", White: "#fff1d6", Hair_Blond: "#d6ad66", Hair_Brown: "#cda35c", "Suit_Feet/Black": "#4a3226" },
    hair: "#d2aa62",
    skinTone: "#f0c2a2",
    hairTone: "#d8b066",
  },
  /** Staff or operator: navy top, bun, fitted headset. */
  operator: {
    model: "suitF",
    colors: { "Suit_Body/Black": "#2b3f6a", "Suit_Legs/Black": "#1d2238", White: "#c9d4ea", Hair_Blond: "#3a2620", Hair_Brown: "#24160f", "Suit_Feet/Black": "#1f1a24" },
    extras: ["headset", "bun"],
    hair: "#3a2620",
    skinTone: "#b98263",
    hairTone: "#3a2620",
  },
  /** Young man, green tee, smooth hair cap over the pack's ribbed slabs. */
  peer: { model: "casualM", colors: { LightBrown: "#3f6a5a", LightBlue: "#2a3346", Hair: "#2a1d18" }, skinTone: "#d99c7c", extras: ["hairCap"], hideMats: ["Hair"], hair: "#2a1d18", hairTone: "#2a1d18" },
  /** Young man in a maroon jacket. */
  peer2: { model: "casualM", colors: { LightBrown: "#5a2a3a", LightBlue: "#1d1c28", Red_Dark: "#1d1c28", Hair: "#2a1d16" }, extras: ["hairCap"], hideMats: ["Hair"], hair: "#2a1d16", hairTone: "#2a1d16" },
  /** Adult in a suit. */
  adult: { model: "suitM", colors: {} },
  /** Hoodie, default colors. */
  hoodie: { model: "hoodieM", colors: {} },
  /** Neutral rim-lit silhouette, no face. Use for any figure the story must not characterize. */
  silhouette: { model: "casualM", colors: { LightBrown: "#1c1b26", LightBlue: "#16151e", Red_Dark: "#16151e", Skin: "#1a1820", Skin_Darker: "#141219", Hair: "#0d0c12", Eyebrows: "#0d0c12" }, darkFace: true },
  /** Hooded figure, face in shadow. A neutral obstacle: never staged attacking anyone. */
  hooded: { model: "hoodieM", colors: { Purple: "#1d1c2a", LightBlue: "#17161f", "Casual_Legs/Skin": "#17161f", White: "#141320", Hair: "#0e0d12", Eyebrows: "#0e0d12" }, extras: ["hood"], darkFace: true },
  /** Uniformed officer with cap and badge. */
  officer: { model: "suitM", colors: { Suit: "#1f2c4f", Black: "#141826", White: "#33467a", Tie: "#141826" }, extras: ["policeCap", "badge"] },
  /** Background crowd: dark silhouettes. */
  crowd: { model: "hoodieM", colors: { Purple: "#1c1430", LightBlue: "#140f22", "Casual_Legs/Skin": "#140f22", White: "#1c1430", Hair: "#120c18", Eyebrows: "#120c18", Skin: "#2a1c30" }, darkFace: true },
} satisfies Record<string, CastDef>;
export type CastKey = keyof typeof CAST;

/** Pick a cast member for a Look. `cast` wins; otherwise fall back on the look's flags. */
export const castFor = (look: LookCast | undefined): CastDef => {
  if (!look) return CAST.lead;
  if (look.cast) return CAST[look.cast];
  if (look.police) return CAST.officer;
  if (look.hood) return CAST.hooded;
  return look.build === "m" ? CAST.peer : CAST.lead;
};
