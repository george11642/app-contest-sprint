// Flatten beats.json into one cut list. A shot starts at its time reference and runs until the next shot.
import { FILM, TOTAL_FRAMES, at, bStart } from "./timing";
import type { ShotSpec } from "./types";

export type Cut = { shot: ShotSpec; beat: string; from: number; to: number };

export const CUTS: Cut[] = (() => {
  const raw = FILM.beats.flatMap((b) => (b.shots ?? []).map((shot) => ({ shot, beat: b.id, from: shot.at === undefined ? bStart(b.id) : at(shot.at, b.id) })));
  raw.sort((a, b) => a.from - b.from);
  return raw.map((c, i) => ({ ...c, to: i + 1 < raw.length ? raw[i + 1].from : TOTAL_FRAMES }));
})();

export const cutOf = (id: string) => {
  const c = CUTS.find((x) => x.shot.id === id);
  if (!c) throw new Error(`no shot "${id}"`);
  return c;
};
