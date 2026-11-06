// Generic 3D props: a phone insert with no hand (hands fail in close-up; a glowing phone does not), a long soft shadow,
// a contact shadow texture and a polyline helper.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Phone } from "./props";
import type { V3 } from "./math";

/** A phone floating in frame, screen facing `toward`. `tap` 0..1 shows a soft touch glow on the glass. */
export const PhoneInsert: React.FC<{ position: V3; toward: V3; screen?: string | THREE.Texture; glow?: number; flash?: number; roll?: number; tap?: number; thumbAt?: [number, number] }> = ({
  position, toward, screen, glow = 1, flash = 0, roll = 0, tap = 0, thumbAt,
}) => {
  const q = useMemo(() => {
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...toward), new THREE.Vector3(...position), new THREE.Vector3(0, 1, 0));
    const qq = new THREE.Quaternion().setFromRotationMatrix(m);
    return qq.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, roll)));
  }, [position[0], position[1], position[2], toward[0], toward[1], toward[2], roll]);
  const [tx, ty] = thumbAt ?? [0.3, 0.8];
  const tipX = -0.038 + 0.076 * tx, tipY = 0.082 - 0.164 * ty;
  return (
    <group position={position} quaternion={q}>
      <Phone screen={screen} glow={glow} flash={flash} />
      {tap > 0.01 && (
        <mesh position={[tipX, tipY, 0.011]}>
          <circleGeometry args={[0.006 + 0.008 * tap, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55 * tap} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

let _cst: THREE.CanvasTexture | null = null;
/** Radial alpha map for a cheap contact shadow under a standing figure. */
export const contactShadowTex = () => {
  if (_cst) return _cst;
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128);
  const rg = g.createRadialGradient(64, 64, 10, 64, 64, 62); rg.addColorStop(0, "#fff"); rg.addColorStop(1, "#000");
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  _cst = new THREE.CanvasTexture(c);
  return _cst;
};

/** Soft-edged long shadow of an (unseen) person, lying on the ground, head pointing +Z.
 *  `head` is where the head of the shadow lies; the feet are `length` metres behind it (-Z). Soft canvas silhouette
 *  (blurred), so it reads as a cast shadow, not a black cut-out. */
let _softShadow: THREE.CanvasTexture | null = null;
const softShadowTex = () => {
  if (_softShadow) return _softShadow;
  const W = 256, H = 768;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H); // alphaMap reads luminance: black = clear, white = shadow
  g.filter = "blur(9px)";
  g.fillStyle = "#fff";
  // canvas top = feet (far), bottom = head (near the subject). Elongated perspective silhouette.
  g.beginPath();
  g.moveTo(W * 0.42, 30); g.lineTo(W * 0.36, H * 0.3); g.lineTo(W * 0.3, H * 0.52); // left leg -> hip
  g.lineTo(W * 0.18, H * 0.6); g.lineTo(W * 0.12, H * 0.74); g.lineTo(W * 0.2, H * 0.76); // left arm
  g.lineTo(W * 0.28, H * 0.66); g.lineTo(W * 0.3, H * 0.84); g.lineTo(W * 0.4, H * 0.87); // shoulder -> neck
  g.lineTo(W * 0.6, H * 0.87); g.lineTo(W * 0.7, H * 0.84); g.lineTo(W * 0.72, H * 0.66);
  g.lineTo(W * 0.8, H * 0.76); g.lineTo(W * 0.88, H * 0.74); g.lineTo(W * 0.82, H * 0.6); // right arm
  g.lineTo(W * 0.7, H * 0.52); g.lineTo(W * 0.64, H * 0.3); g.lineTo(W * 0.58, 30); g.lineTo(W * 0.52, H * 0.28);
  g.lineTo(W * 0.48, H * 0.28); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(W * 0.5, H * 0.92, W * 0.13, H * 0.055, 0, 0, Math.PI * 2); g.fill(); // head
  _softShadow = new THREE.CanvasTexture(c);
  return _softShadow;
};
export const SoftShadow: React.FC<{ head: V3; length: number; width?: number; opacity?: number }> = ({ head, length, width = 1.0, opacity = 0.7 }) => (
  <mesh position={[head[0], head[1] + 0.02, head[2] - length / 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[width, length, 1]} renderOrder={3}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial color="#03020a" alphaMap={softShadowTex()} transparent opacity={opacity} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

/** Point at arc-length fraction `t` along a 2D polyline, plus its heading (radians, 0 = +Z). */
export const alongPath = (pts: [number, number][], t: number): [number, number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      return [ax + (bx - ax) * k, ay + (by - ay) * k, Math.atan2(bx - ax, by - ay)];
    }
    d -= seg[i];
  }
  return [pts[0][0], pts[0][1], 0];
};
