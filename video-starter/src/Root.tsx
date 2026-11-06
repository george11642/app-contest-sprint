import React from "react";
import { Composition } from "remotion";
import { Hybrid } from "./hybrid/Hybrid";
import { FPS, TOTAL_FRAMES } from "./hybrid/timing";
import { GltfLab } from "./kit3d/gltf/Lab";

export const Root: React.FC = () => (
  <>
    <Composition id="Hybrid" component={Hybrid} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="GltfLab" component={GltfLab} durationInFrames={300} fps={FPS} width={1920} height={1080} />
  </>
);
