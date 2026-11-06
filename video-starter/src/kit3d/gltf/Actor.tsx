// Actor: the default way to place a character. Toon + hifi shading, idle acting, a soft contact shadow, hair normals
// softened so the pack's ribbed clumps shade as one volume.
import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GltfCharacter, type GltfCharacterProps } from "./GltfCharacter";
import { contactShadowTex } from "../props3d";
import type { V3 } from "../math";

/** The packs' hair meshes are sculpted as ribbed strand clumps, which read as corrugated plates under any
 *  key light. Bending each hair vertex normal ~70% toward the radial direction out of the head (from a point inside
 *  the skull) shades the hair as one soft rounded volume (a sculpted bob) while the silhouette keeps its clumps. */
const hairGeoCache = new Map<string, THREE.BufferGeometry>();
const softHairGeo = (g: THREE.BufferGeometry) => {
  let out = hairGeoCache.get(g.uuid);
  if (out) return out;
  out = g.clone();
  const pos = out.getAttribute("position") as THREE.BufferAttribute;
  const nor = out.getAttribute("normal") as THREE.BufferAttribute;
  out.computeBoundingBox();
  const bb = out.boundingBox!;
  const c = new THREE.Vector3(); bb.getCenter(c);
  const h = bb.max.y - bb.min.y;
  c.y -= 0.18 * h;
  const n = new THREE.Vector3(), r = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(nor, i);
    r.fromBufferAttribute(pos, i).sub(c).normalize();
    n.lerp(r, 0.7).normalize();
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  nor.needsUpdate = true;
  hairGeoCache.set(g.uuid, out);
  return out;
};
const HairSmooth: React.FC<{ target: React.RefObject<THREE.Group | null> }> = ({ target }) => {
  useFrame(() => {
    target.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.softHair) return;
      const src = String(m.userData.srcMat ?? "");
      if (!src.startsWith("Hair") || !m.geometry?.getAttribute("normal")) return;
      if (m.geometry.type === "LatheGeometry") { m.userData.softHair = true; return; }
      m.geometry = softHairGeo(m.geometry);
      m.userData.softHair = true;
    });
  });
  return null;
};

export const Actor: React.FC<GltfCharacterProps> = (p) => {
  const pos = (p.position ?? [0, 0, 0]) as V3;
  const standing = Math.abs(pos[1]) < 0.02;
  const ref = React.useRef<THREE.Group>(null);
  return (
    <>
      <group ref={ref}><GltfCharacter act={0.35} toon hifi {...p} /><HairSmooth target={ref} /></group>
      {standing && (
        <mesh position={[pos[0], 0.012, pos[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
          <planeGeometry args={[0.75, 0.75]} />
          <meshBasicMaterial color="#000" transparent opacity={0.5} depthWrite={false} alphaMap={contactShadowTex()} />
        </mesh>
      )}
    </>
  );
};
